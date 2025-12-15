import { db } from '../config/firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

export interface Winner {
    name: string;
    email: string;
    puzzleId: string;
    completedAt: Date;
    score: number;
}

export interface UserAttempt {
    puzzleId: string;
    userId: string;
    attemptCount: number;
    firstAttemptSuccess: boolean;
    lastAttemptAt: Date;
}

// Add a winner (only if first attempt was successful)
export async function addWinner(winner: Winner): Promise<boolean> {
    try {
        const winnersRef = collection(db, 'winners');
        const winnerDoc = doc(winnersRef, `${winner.email}_${winner.puzzleId}`);

        await setDoc(winnerDoc, {
            ...winner,
            completedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error adding winner:', error);
        return false;
    }
}

// Register an attendee when they sign up
export async function registerAttendee(name: string, email: string, mobile: string): Promise<boolean> {
    try {
        const attendeesRef = collection(db, 'registrations');
        const attendeeDoc = doc(attendeesRef, email);

        await setDoc(attendeeDoc, {
            name,
            email,
            mobile,
            registeredAt: serverTimestamp(),
            attemptCount: 0
        }, { merge: true }); // merge: true prevents overwriting if user already exists

        return true;
    } catch (error) {
        console.error('Error registering attendee:', error);
        return false;
    }
}

// Get winners for a specific puzzle
export async function getWinners(puzzleId: string, limitCount: number = 50): Promise<Winner[]> {
    try {
        const winnersRef = collection(db, 'winners');
        const q = query(
            winnersRef,
            orderBy('completedAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const winners: Winner[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.puzzleId === puzzleId) {
                winners.push({
                    name: data.name,
                    email: data.email,
                    puzzleId: data.puzzleId,
                    completedAt: data.completedAt?.toDate() || new Date(),
                    score: data.score
                });
            }
        });

        return winners;
    } catch (error) {
        console.error('Error getting winners:', error);
        return [];
    }
}

// Get all winners across all puzzles
export async function getAllWinners(limitCount: number = 100): Promise<Winner[]> {
    try {
        const winnersRef = collection(db, 'winners');
        const q = query(
            winnersRef,
            orderBy('completedAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const winners: Winner[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            winners.push({
                name: data.name,
                email: data.email,
                puzzleId: data.puzzleId,
                completedAt: data.completedAt?.toDate() || new Date(),
                score: data.score
            });
        });

        return winners;
    } catch (error) {
        console.error('Error getting all winners:', error);
        return [];
    }
}

// Track user attempt
export async function trackAttempt(
    userId: string,
    puzzleId: string,
    isSuccess: boolean,
    name?: string,
    email?: string,
    score?: number // Added score parameter
): Promise<UserAttempt> {
    try {
        const attemptRef = doc(db, 'attempts', `${userId}_${puzzleId}`);
        const attemptDoc = await getDoc(attemptRef);

        const currentScore = score !== undefined ? score : 0;

        if (attemptDoc.exists()) {
            // User has attempted before
            const data = attemptDoc.data();

            // Append new score to existing scores array (or create it if missing)
            const scores = data.scores || [];
            scores.push(currentScore);

            await updateDoc(attemptRef, {
                attemptCount: increment(1),
                lastAttemptAt: serverTimestamp(),
                scores: scores,
                lastScore: currentScore
            });

            return {
                puzzleId,
                userId,
                attemptCount: data.attemptCount + 1,
                firstAttemptSuccess: data.firstAttemptSuccess,
                lastAttemptAt: new Date()
            };
        } else {
            // First attempt
            const newAttempt: UserAttempt = {
                puzzleId,
                userId,
                attemptCount: 1,
                firstAttemptSuccess: isSuccess,
                lastAttemptAt: new Date()
            };

            await setDoc(attemptRef, {
                ...newAttempt,
                name: name || 'Anonymous',
                email: email || 'N/A',
                lastAttemptAt: serverTimestamp(),
                scores: [currentScore],
                lastScore: currentScore
            });

            return newAttempt;
        }
    } catch (error) {
        console.error('Error tracking attempt:', error);
        throw error;
    }
}

// Check if user is eligible for winner list (first attempt success)
export async function isEligibleForWinnerList(userId: string, puzzleId: string): Promise<boolean> {
    try {
        const attemptRef = doc(db, 'attempts', `${userId}_${puzzleId}`);
        const attemptDoc = await getDoc(attemptRef);

        if (!attemptDoc.exists()) {
            // No previous attempts - eligible!
            return true;
        }

        // Check if first attempt was successful
        const data = attemptDoc.data();
        return data.firstAttemptSuccess === true && data.attemptCount === 1;
    } catch (error) {
        console.error('Error checking eligibility:', error);
        return false;
    }
}

// Get user's attempt count for a puzzle
export async function getUserAttemptCount(userId: string, puzzleId: string): Promise<number> {
    try {
        const attemptRef = doc(db, 'attempts', `${userId}_${puzzleId}`);
        const attemptDoc = await getDoc(attemptRef);

        if (attemptDoc.exists()) {
            return attemptDoc.data().attemptCount;
        }

        return 0;
    } catch (error) {
        console.error('Error getting attempt count:', error);
        return 0;
    }
}
