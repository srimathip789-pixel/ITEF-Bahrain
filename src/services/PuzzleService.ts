import type { Puzzle, PuzzleAttempt, WinnerEntry, UserProgress } from '../types/PuzzleTypes';
import { PuzzleStatus } from '../types/PuzzleTypes';
import { allPuzzles } from '../data/puzzleData';
import { addWinner as fbAddWinner, trackAttempt as fbTrackAttempt } from './firebaseService';

const STORAGE_KEY_PROGRESS = 'puzzleProgress';
const STORAGE_KEY_WINNERS = 'puzzleWinners';

export class PuzzleService {

    // Get all puzzles
    static getAllPuzzles(): Puzzle[] {
        return allPuzzles;
    }

    // Get puzzle by ID
    static getPuzzleById(id: string): Puzzle | undefined {
        return allPuzzles.find(puzzle => puzzle.id === id);
    }

    // Get current user info from registration
    static getCurrentUser(): { id: string; name: string; email: string } {
        try {
            const stored = localStorage.getItem('itef_user_details');
            if (stored) {
                const details = JSON.parse(stored);
                // Use email as ID since it's unique for this event
                return {
                    id: details.email || 'guest',
                    name: details.name || 'Guest',
                    email: details.email || ''
                };
            }
        } catch (e) {
            console.error('Error parsing user details:', e);
        }
        // Fallback (should be prevented by UserRegistration component)
        return { id: 'guest', name: 'Guest User', email: '' };
    }

    // Set current user (Deprecated/Unused with new registration flow)
    static setCurrentUser(): void {
        // No-op, managed by UserRegistration
    }

    // Get user progress
    static getUserProgress(): UserProgress {
        const currentUser = this.getCurrentUser();
        try {
            const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);

            if (stored) {
                const allProgress = JSON.parse(stored);
                return allProgress[currentUser.id] || {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    attempts: {},
                    completedPuzzles: [],
                    wonPuzzles: []
                };
            }
        } catch (e) {
            console.error('Error parsing user progress:', e);
        }

        return {
            userId: currentUser.id,
            userName: currentUser.name,
            attempts: {},
            completedPuzzles: [],
            wonPuzzles: []
        };
    }

    // Save user progress
    static saveUserProgress(progress: UserProgress): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
            const allProgress = stored ? JSON.parse(stored) : {};
            allProgress[progress.userId] = progress;
            localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(allProgress));
        } catch (e) {
            console.error('Error saving user progress:', e);
        }
    }

    // Get attempt count for a puzzle
    static getAttemptCount(puzzleId: string): number {
        const progress = this.getUserProgress();
        const attempts = progress.attempts?.[puzzleId] || []; // Optional chaining safety
        return attempts.length;
    }

    // Get puzzle status
    static getPuzzleStatus(puzzleId: string): PuzzleStatus {
        const progress = this.getUserProgress();

        if (progress.wonPuzzles?.includes(puzzleId)) {
            return PuzzleStatus.WON;
        }

        if (progress.completedPuzzles?.includes(puzzleId)) {
            return PuzzleStatus.COMPLETED;
        }

        const attempts = progress.attempts?.[puzzleId];
        if (attempts && attempts.length > 0) {
            return PuzzleStatus.IN_PROGRESS;
        }

        return PuzzleStatus.NOT_STARTED;
    }

    // Record an attempt
    static recordAttempt(puzzleId: string, isCorrect: boolean, score?: number, timeSpent?: number, usedHints: boolean = false): void {
        const progress = this.getUserProgress();
        const currentUser = this.getCurrentUser();

        // Ensure arrays exist
        if (!progress.attempts) progress.attempts = {};
        if (!progress.completedPuzzles) progress.completedPuzzles = [];
        if (!progress.wonPuzzles) progress.wonPuzzles = [];

        const attempt: PuzzleAttempt = {
            puzzleId,
            userId: currentUser.id,
            attemptNumber: this.getAttemptCount(puzzleId) + 1,
            timestamp: Date.now(),
            isCorrect,
            score,
            timeSpent,
            usedHints
        };

        if (!progress.attempts[puzzleId]) {
            progress.attempts[puzzleId] = [];
        }
        progress.attempts[puzzleId].push(attempt);

        // Mark as completed if correct
        if (isCorrect && !progress.completedPuzzles.includes(puzzleId)) {
            progress.completedPuzzles.push(puzzleId);
        }

        // Add to winners list ONLY if first attempt and correct and no hints used AND score >= 90%
        const scoreThreshold = 90;
        if (isCorrect && attempt.attemptNumber === 1 && !usedHints && (score === undefined || score >= scoreThreshold)) {
            if (!progress.wonPuzzles.includes(puzzleId)) {
                progress.wonPuzzles.push(puzzleId);
                this.addWinner(puzzleId, currentUser.id, currentUser.name, score, timeSpent);
            }
        }

        this.saveUserProgress(progress);

        // Sync to Firebase (Fire and forget)
        if (currentUser.email) {
            fbTrackAttempt(
                currentUser.id,
                puzzleId,
                isCorrect,
                currentUser.name,
                currentUser.email,
                score
            ).catch(err => console.error("Failed to sync attempt to Firebase", err));
        }

        // Check for Global Winner (Average Score >= 90%)
        const averageScore = this.getAverageScore();
        if (averageScore >= 90) {
            const winners = this.getAllWinners();
            const isGlobalWinner = winners.some(w => w.puzzleId === 'global-overall' && w.userId === currentUser.id);

            if (!isGlobalWinner) {
                this.addWinner('global-overall', currentUser.id, currentUser.name, averageScore, 0);
            } else {
                // Optional: Update score if it improved? 
                // For now, valid to just leave the first entry or update it. 
                // Let's checking if we should update the existing entry could be complex with the current array structure,
                // but for a winner list, usually the first entry is fine, or we can just re-add/update.
                // Given the requirement "add if they get score above 90%", one entry is sufficient.
            }
        }
    }

    // Get all winners
    static getAllWinners(): WinnerEntry[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_WINNERS);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error parsing winners:', e);
            return [];
        }
    }

    // Get winners for specific puzzle
    static getWinnersForPuzzle(puzzleId: string): WinnerEntry[] {
        const allWinners = this.getAllWinners();
        if (!Array.isArray(allWinners)) return [];

        return allWinners.filter(winner => winner.puzzleId === puzzleId)
            .sort((a, b) => a.timestamp - b.timestamp); // Sort by earliest first
    }

    // Add a winner
    static addWinner(puzzleId: string, userId: string, userName: string, score?: number, timeSpent?: number): void {
        const winners = this.getAllWinners();

        // Check if already exists
        const exists = winners.some(w => w.puzzleId === puzzleId && w.userId === userId);
        if (exists) return;

        const winnerEntry: WinnerEntry = {
            puzzleId,
            userId,
            userName,
            timestamp: Date.now(),
            score,
            timeSpent
        };

        winners.push(winnerEntry);
        localStorage.setItem(STORAGE_KEY_WINNERS, JSON.stringify(winners));

        // Sync to Firebase
        const currentUser = this.getCurrentUser();
        if (currentUser.email) {
            fbAddWinner({
                name: userName,
                email: currentUser.email,
                puzzleId,
                completedAt: new Date(),
                score: score || 0
            }).catch(err => console.error("Failed to sync winner to Firebase", err));
        }
    }

    // Check if user can see hints
    static canShowHints(puzzleId: string): boolean {
        const attemptCount = this.getAttemptCount(puzzleId);
        return attemptCount > 0; // Show hints after first failed attempt
    }

    // Generate shareable WhatsApp link
    static generateWhatsAppLink(puzzleId: string): string {
        const puzzle = this.getPuzzleById(puzzleId);
        if (!puzzle) return '';

        const baseUrl = window.location.origin;
        const puzzleUrl = `${baseUrl}/puzzles/${puzzleId}`;

        const message = `🧩 Challenge yourself with "${puzzle.title}"!\n\n${puzzle.description}\n\nCan you solve it on your first try and get on the Winners List? 🏆\n\nTry it now: ${puzzleUrl}`;

        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/?text=${encodedMessage}`;
    }

    // Get puzzle URL for sharing
    static getPuzzleUrl(puzzleId: string): string {
        const baseUrl = window.location.origin;
        return `${baseUrl}/puzzles/${puzzleId}`;
    }

    // Copy link to clipboard
    static async copyLinkToClipboard(puzzleId: string): Promise<boolean> {
        try {
            const url = this.getPuzzleUrl(puzzleId);
            await navigator.clipboard.writeText(url);
            return true;
        } catch (error) {
            console.error('Failed to copy link:', error);
            return false;
        }
    }

    // Calculate quiz score
    static calculateQuizScore(selectedAnswers: { [questionId: string]: string }, puzzle: Puzzle): number {
        if (!puzzle.questions) return 0;

        let correctCount = 0;
        puzzle.questions.forEach(question => {
            const selectedChoiceId = selectedAnswers[question.id];
            const correctChoice = question.choices.find(c => c.isCorrect);
            if (correctChoice && selectedChoiceId === correctChoice.id) {
                correctCount++;
            }
        });

        return Math.round((correctCount / puzzle.questions.length) * 100);
    }

    // Check if quiz passed
    static isQuizPassed(score: number, puzzle: Puzzle): boolean {
        const passingScore = puzzle.passingScore || 70;
        return score >= passingScore;
    }

    // Reset progress (for testing)
    static resetProgress(): void {
        localStorage.removeItem(STORAGE_KEY_PROGRESS);
        localStorage.removeItem(STORAGE_KEY_WINNERS);
    }

    // Get user statistics
    static getUserStats(): {
        totalAttempts: number;
        totalCompleted: number;
        totalWon: number;
        successRate: number;
        averageScore: number;
    } {
        const progress = this.getUserProgress();
        const totalAttempts = Object.values(progress.attempts).reduce((sum, attempts) => sum + attempts.length, 0);
        const totalCompleted = progress.completedPuzzles.length;
        const totalWon = progress.wonPuzzles.length;
        const totalAverage = this.getAverageScore();
        // Success rate based on ATTMEPTED puzzles, not total puzzles in system
        const activePuzzlesCount = Object.keys(progress.attempts).length;
        const successRate = activePuzzlesCount > 0 ? (totalWon / activePuzzlesCount) * 100 : 0;

        return {
            totalAttempts,
            totalCompleted,
            totalWon,
            successRate: Math.round(successRate),
            averageScore: totalAverage
        };
    }

    // Calculate average score across all attempted puzzles
    static getAverageScore(): number {
        const progress = this.getUserProgress();
        const attemptedPuzzleIds = Object.keys(progress.attempts);

        if (attemptedPuzzleIds.length === 0) return 0;

        let totalMaxScore = 0;

        attemptedPuzzleIds.forEach(pid => {
            const attempts = progress.attempts[pid];
            // Get the highest score achieved for this puzzle
            const maxScore = Math.max(...attempts.map(a => a.score || 0));
            totalMaxScore += maxScore;
        });

        return Math.round(totalMaxScore / attemptedPuzzleIds.length);
    }
}
