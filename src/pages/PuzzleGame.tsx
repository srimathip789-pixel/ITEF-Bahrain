import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PuzzleService } from '../services/PuzzleService';
import { addWinner, trackAttempt } from '../services/firebaseService';
import type { Puzzle } from '../types/PuzzleTypes';
import { PuzzleType } from '../types/PuzzleTypes';
import ConnectDotsPuzzle from '../components/puzzles/ConnectDotsPuzzle';
import PCBPuzzle from '../components/puzzles/PCBPuzzle';
import WordlePuzzle from '../components/puzzles/WordlePuzzle';
import CrosswordPuzzle from '../components/puzzles/CrosswordPuzzle';
import MCQPuzzle from '../components/puzzles/MCQPuzzle';
import ShareButton from '../components/puzzles/ShareButton';
import WinnersList from '../components/puzzles/WinnersList';
import { ArrowLeft, Lightbulb, Trophy, X, CheckCircle } from 'lucide-react';

export default function PuzzleGame() {
    const { puzzleId } = useParams<{ puzzleId: string }>();
    // Navigate unused

    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [showHints, setShowHints] = useState(false);
    const [canSeeHints, setCanSeeHints] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [score, setScore] = useState(0);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (puzzleId) {
            const foundPuzzle = PuzzleService.getPuzzleById(puzzleId);
            setPuzzle(foundPuzzle || null);

            const attempts = PuzzleService.getAttemptCount(puzzleId);
            setAttemptCount(attempts);
            setCanSeeHints(PuzzleService.canShowHints(puzzleId));
        }
    }, [puzzleId]);

    if (!puzzle) {
        return (
            <div className="puzzle-not-found">
                <h2>Puzzle Not Found</h2>
                <Link to="/puzzles" className="back-link">← Back to Puzzles</Link>
            </div>
        );
    }

    // Trigger confetti on high score
    useEffect(() => {
        if (gameComplete && isSuccess && score >= 90) {
            import('canvas-confetti').then((confetti) => {
                const duration = 3000;
                const end = Date.now() + duration;

                const frame = () => {
                    confetti.default({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#fbbf24', '#ef4444', '#3b82f6', '#10b981']
                    });
                    confetti.default({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#fbbf24', '#ef4444', '#3b82f6', '#10b981']
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };

                frame();
            });
        }
    }, [gameComplete, isSuccess, score]);

    const handlePuzzleComplete = async (isCorrect: boolean, quizScore?: number) => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const finalScore = quizScore !== undefined ? quizScore : (isCorrect ? 100 : 0);
        const currentAttempt = PuzzleService.getAttemptCount(puzzle.id) + 1;

        setGameComplete(true);
        setIsSuccess(isCorrect);
        setScore(finalScore);

        // Record the attempt locally
        PuzzleService.recordAttempt(
            puzzle.id,
            isCorrect,
            finalScore,
            timeSpent,
            showHints
        );

        // Save attempt to Firebase for attendees tracking
        try {
            const userDetails = localStorage.getItem('itef_user_details');
            if (userDetails) {
                const user = JSON.parse(userDetails);
                await trackAttempt(
                    user.email || 'guest',
                    puzzle.id,
                    isCorrect,
                    user.name,
                    user.email
                );
            }
        } catch (error) {
            console.error('Error tracking attempt to Firebase:', error);
        }

        // Save winner to Firebase if first attempt success without hints AND score >= 90%
        if (isCorrect && currentAttempt === 1 && !showHints && finalScore >= 90) {
            try {
                const userDetails = localStorage.getItem('itef_user_details');
                if (userDetails) {
                    const user = JSON.parse(userDetails);
                    await addWinner({
                        name: user.name || 'Anonymous',
                        email: user.email || 'unknown@email.com',
                        puzzleId: puzzle.id,
                        completedAt: new Date(),
                        score: finalScore
                    });
                }
            } catch (error) {
                console.error('Error saving winner to Firebase:', error);
            }
        }

        // Update attempt count
        setAttemptCount(prev => prev + 1);
    };

    const handleMCQComplete = (quizScore: number) => {
        const isPassed = PuzzleService.isQuizPassed(quizScore, puzzle);
        handlePuzzleComplete(isPassed, quizScore);
    };

    const handleRetry = () => {
        setGameComplete(false);
        setShowHints(false);
        setCanSeeHints(true); // Now they can see hints on retry
        setScore(0);
    };

    const renderPuzzle = () => {
        if (gameComplete) {
            return (
                <div className={`puzzle-result ${isSuccess ? 'success' : 'failure'}`} data-testid="quiz-results">
                    <div className="result-icon">
                        {isSuccess ? (
                            <CheckCircle size={64} className="success-icon" />
                        ) : (
                            <X size={64} className="failure-icon" />
                        )}
                    </div>
                    {/* Snowflake congrats overlay for high scorers */}
                    {isSuccess && score >= 90 && (
                        <div className="snowflake-overlay" aria-hidden={false}>
                            <div className="snowflake-message">❄️ Snowflake Congrats! You scored {score}%</div>
                            <div className="snowflakes" aria-hidden>
                                <span className="snowflake">❄</span>
                                <span className="snowflake">❄</span>
                                <span className="snowflake">❄</span>
                                <span className="snowflake">❄</span>
                                <span className="snowflake">❄</span>
                            </div>
                        </div>
                    )}

                    <h2 className="result-title" data-testid="success-message">
                        {isSuccess ? '🎉 Congratulations!' : '😔 Not Quite Right'}
                    </h2>

                    {isSuccess && (
                        <div className="result-score">
                            <div className="score-circle-large">
                                <span className="score-value-large" data-testid="score-display">{score}%</span>
                            </div>
                        </div>
                    )}

                    <p className="result-message">
                        {isSuccess && attemptCount === 1 && score >= 90 ? (
                            <>
                                <Trophy size={20} className="inline-icon" />
                                Amazing! You scored {score}% on your first try and made it to the Winners List! 🎉
                            </>
                        ) : isSuccess && attemptCount === 1 && score < 90 ? (
                            `Great job! You scored ${score}% on your first try. Score 90% or higher to make the Winners List!`
                        ) : isSuccess ? (
                            `Great job! You scored ${score}%, but it wasn't your first attempt.`
                        ) : (
                            `Don't worry! You can try again. ${canSeeHints ? 'Hints are now available to help you!' : ''}`
                        )}
                    </p>

                    {isSuccess && attemptCount === 1 && score >= 90 && (
                        <div className="winner-callout">
                            <Trophy className="trophy-icon" />
                            <span>You're now on the Winners List!</span>
                        </div>
                    )}

                    <div className="result-actions">
                        {!isSuccess && (
                            <button className="retry-button" onClick={handleRetry}>
                                Try Again
                            </button>
                        )}
                        <Link to="/puzzles" className="back-button">
                            Back to Puzzles
                        </Link>
                        <ShareButton puzzleId={puzzle.id} />
                    </div>

                    {isSuccess && (
                        <div className="puzzle-winners">
                            <WinnersList puzzleId={puzzle.id} limit={10} />
                        </div>
                    )}
                </div>
            );
        }

        switch (puzzle.type) {
            case PuzzleType.CONNECT_DOTS:
                return puzzle.dots ? (
                    <ConnectDotsPuzzle
                        dots={puzzle.dots}
                        onComplete={handlePuzzleComplete}
                    />
                ) : null;

            case PuzzleType.PCB_ROUTING:
                return puzzle.pins && puzzle.gridSize ? (
                    <PCBPuzzle
                        gridSize={puzzle.gridSize}
                        pins={puzzle.pins}
                        onComplete={handlePuzzleComplete}
                    />
                ) : null;

            case PuzzleType.ENGINEERING_WORDLE:
                return puzzle.targetWord ? (
                    <WordlePuzzle
                        targetWord={puzzle.targetWord}
                        onComplete={handlePuzzleComplete}
                        topicHint={puzzle.hints?.[0]}
                    />
                ) : null;

            case PuzzleType.ENGINEERING_CROSSWORD:
                return puzzle.crosswordClues ? (
                    <CrosswordPuzzle
                        clues={puzzle.crosswordClues}
                        onComplete={handlePuzzleComplete}
                    />
                ) : null;

            case PuzzleType.SCIENTIFIC_MCQ:
            case PuzzleType.NATIONAL_GK:
            case PuzzleType.CIRCUIT_LOGIC:
            case PuzzleType.MATH_TEASERS:
            case PuzzleType.CODE_DEBUG:
            case PuzzleType.PHYSICS_PROBLEMS:
            case PuzzleType.PATTERN_RECOGNITION:
            case PuzzleType.UNIT_CONVERSION:
            case PuzzleType.ENGINEERING_ETHICS:
                return puzzle.questions ? (
                    <MCQPuzzle
                        questions={puzzle.questions}
                        onComplete={handleMCQComplete}
                        showHints={showHints}
                    />
                ) : null;

            default:
                return <div>Puzzle type not implemented yet</div>;
        }
    };

    return (
        <div className="puzzle-game-container">
            {/* Header */}
            <div className="puzzle-game-header">
                <Link to="/puzzles" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Puzzles
                </Link>

                <div className="puzzle-info">
                    <div className="puzzle-title-row">
                        <span className="puzzle-emoji">{puzzle.icon}</span>
                        <h1 className="puzzle-title">{puzzle.title}</h1>
                    </div>
                    <p className="puzzle-description">{puzzle.description}</p>
                    <div className="puzzle-meta">

                        <span className="attempt-badge" data-testid="attempt-number">Attempt #{attemptCount + 1}</span>
                    </div>
                </div>

                <ShareButton puzzleId={puzzle.id} />
            </div>

            {/* Hints Section */}
            {canSeeHints && !gameComplete && (
                <div className="hints-section">
                    <button
                        className={`hints-toggle ${showHints ? 'active' : ''}`}
                        onClick={() => setShowHints(!showHints)}
                    >
                        <Lightbulb size={18} />
                        {showHints ? 'Hide Hints' : 'Show Hints'}
                    </button>

                    {showHints && (
                        <div className="hints-content">
                            <h4>💡 Hints:</h4>
                            <ul>
                                {puzzle.hints.map((hint, index) => (
                                    <li key={index}>{hint}</li>
                                ))}
                            </ul>
                            <p className="hints-warning">
                                ⚠️ Using hints will exclude you from the Winners List
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Puzzle Content */}
            <div className="puzzle-content">
                {renderPuzzle()}
            </div>
        </div>
    );
}
