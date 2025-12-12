import { useState } from 'react';
import type { MCQQuestion } from '../../types/PuzzleTypes';

interface MCQPuzzleProps {
    questions: MCQQuestion[];
    onComplete: (score: number, answers: { [questionId: string]: string }) => void;
    showHints?: boolean;
}

export default function MCQPuzzle({ questions, onComplete, showHints = false }: MCQPuzzleProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const handleChoiceSelect = (choiceId: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: choiceId
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        const score = calculateScore();
        // Immediately complete the quiz without showing intermediate results
        onComplete(score, selectedAnswers); // Pass answers just in case
    };

    const calculateScore = (): number => {
        let correctCount = 0;
        questions.forEach(question => {
            const selectedChoiceId = selectedAnswers[question.id];
            const correctChoice = question.choices.find(c => c.isCorrect);
            if (correctChoice && selectedChoiceId === correctChoice.id) {
                correctCount++;
            }
        });
        return Math.round((correctCount / questions.length) * 100);
    };

    const getAnsweredCount = (): number => {
        return Object.keys(selectedAnswers).length;
    };

    const isCurrentQuestionAnswered = (): boolean => {
        return !!selectedAnswers[currentQuestion.id];
    };

    return (
        <div className="mcq-puzzle">
            <div className="quiz-header">
                <div className="question-progress">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                </div>
                <div className="answered-count">
                    Answered: {getAnsweredCount()} / {totalQuestions}
                </div>
            </div>

            <div className="question-card">
                <h3 className="question-text">{currentQuestion.question}</h3>

                <div className="choices-container">
                    {currentQuestion.choices.map(choice => (
                        <button
                            key={choice.id}
                            className={`choice-button ${selectedAnswers[currentQuestion.id] === choice.id ? 'selected' : ''
                                }`}
                            onClick={() => handleChoiceSelect(choice.id)}
                        >
                            <span className="choice-label">{choice.id.toUpperCase()}</span>
                            <span className="choice-text">{choice.text}</span>
                        </button>
                    ))}
                </div>

                {showHints && currentQuestion.explanation && (
                    <div className="hint-box">
                        <strong>💡 Hint:</strong> {currentQuestion.explanation}
                    </div>
                )}
            </div>

            <div className="quiz-navigation">
                <button
                    className="nav-button"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    ← Previous
                </button>

                {currentQuestionIndex === totalQuestions - 1 ? (
                    <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={!isCurrentQuestionAnswered()}
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button
                        className="nav-button"
                        onClick={handleNext}
                        disabled={!isCurrentQuestionAnswered()}
                    >
                        Next →
                    </button>
                )}
            </div>
        </div>
    );
}
