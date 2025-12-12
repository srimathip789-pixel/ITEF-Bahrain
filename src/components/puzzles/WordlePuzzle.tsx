import { useState, useEffect } from 'react';

interface WordlePuzzleProps {
    targetWord: string;
    onComplete: (isCorrect: boolean) => void;
}

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export default function WordlePuzzle({ targetWord, onComplete }: WordlePuzzleProps) {
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [shakeRow, setShakeRow] = useState<number | null>(null);

    const MAX_GUESSES = 6;
    const WORD_LENGTH = 5;
    const TARGET = targetWord.toUpperCase();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameStatus !== 'playing') return;

            if (e.key === 'Enter') {
                submitGuess();
            } else if (e.key === 'Backspace') {
                setCurrentGuess(prev => prev.slice(0, -1));
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                if (currentGuess.length < WORD_LENGTH) {
                    setCurrentGuess(prev => prev + e.key.toUpperCase());
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, gameStatus]);

    const submitGuess = () => {
        if (currentGuess.length !== WORD_LENGTH) {
            // Shake animation
            setShakeRow(guesses.length);
            setTimeout(() => setShakeRow(null), 500);
            return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess('');

        if (currentGuess === TARGET) {
            setGameStatus('won');
            setTimeout(() => onComplete(true), 1500);
        } else if (newGuesses.length >= MAX_GUESSES) {
            setGameStatus('lost');
            // Allow retry? For now, just fail.
            // Actually, let's give them a "Try Again" button in the parent, 
            // but here we just report false after a delay
            setTimeout(() => onComplete(false), 1500);
        }
    };

    const getLetterStatus = (_letter: string, index: number, word: string): LetterStatus => {
        if (!word) return 'empty';
        const letterAtPos = word[index];

        if (letterAtPos === TARGET[index]) return 'correct';
        if (TARGET.includes(letterAtPos)) return 'present';
        return 'absent';
    };

    const renderRow = (word: string, rowIndex: number, isCurrent: boolean) => {
        const letters = isCurrent
            ? word.padEnd(WORD_LENGTH, ' ').split('')
            : word.split('');

        return (
            <div
                key={rowIndex}
                className={`wordle-row ${shakeRow === rowIndex ? 'shake' : ''}`}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${WORD_LENGTH}, 1fr)`,
                    gap: '5px',
                    marginBottom: '5px'
                }}
            >
                {Array(WORD_LENGTH).fill(0).map((_, i) => {
                    const letter = letters[i]?.trim() || '';
                    let status: LetterStatus = 'empty';
                    let backgroundColor = '#1e293b';
                    let borderColor = '#334155';

                    if (!isCurrent && word) {
                        status = getLetterStatus(letter, i, word);
                        if (status === 'correct') {
                            backgroundColor = '#10b981'; // Green
                            borderColor = '#10b981';
                        } else if (status === 'present') {
                            backgroundColor = '#f59e0b'; // Yellow
                            borderColor = '#f59e0b';
                        } else if (status === 'absent') {
                            backgroundColor = '#475569'; // Gray
                            borderColor = '#475569';
                        }
                    } else if (letter) {
                        borderColor = '#94a3b8'; // Active input border
                    }

                    return (
                        <div
                            key={i}
                            className="wordle-cell"
                            style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundColor,
                                border: `2px solid ${borderColor}`,
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {letter}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="wordle-puzzle" style={{ maxWidth: '350px', margin: '0 auto' }}>
            <div className="wordle-grid">
                {guesses.map((guess, i) => renderRow(guess, i, false))}
                {gameStatus === 'playing' && guesses.length < MAX_GUESSES && (
                    renderRow(currentGuess, guesses.length, true)
                )}
                {Array(Math.max(0, MAX_GUESSES - 1 - guesses.length)).fill('').map((_, i) => (
                    renderRow('', guesses.length + 1 + i, false)
                ))}
            </div>

            <div className="virtual-keyboard" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px' }}>
                {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, rowIndex) => (
                    <div key={rowIndex} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {row.split('').map(key => {
                            // Determine key status
                            let bg = '#475569';
                            for (const guess of guesses) {
                                const idx = guess.indexOf(key);
                                if (idx !== -1) {
                                    if (guess[idx] === TARGET[idx]) bg = '#10b981';
                                    else if (TARGET.includes(key) && bg !== '#10b981') bg = '#f59e0b';
                                    else if (bg === '#475569') bg = '#1e293b'; // Darker for absent
                                }
                            }

                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        if (currentGuess.length < WORD_LENGTH) setCurrentGuess(prev => prev + key);
                                    }}
                                    style={{
                                        padding: '10px 6px',
                                        minWidth: '30px',
                                        backgroundColor: bg,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {key}
                                </button>
                            );
                        })}
                        {rowIndex === 2 && (
                            <button
                                onClick={() => setCurrentGuess(prev => prev.slice(0, -1))}
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#475569',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                ⌫
                            </button>
                        )}
                        {rowIndex === 2 && (
                            <button
                                onClick={submitGuess}
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#475569',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                ↵
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                .shake {
                    animation: shake 0.5s;
                }
                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
