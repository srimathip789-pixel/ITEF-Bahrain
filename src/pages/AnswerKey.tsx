import { allPuzzles } from '../data/puzzleData';
import './AnswerKey.css';

export default function AnswerKey() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="answer-key-container">
            <div className="no-print print-controls">
                <button onClick={handlePrint} className="print-button">
                    🖨️ Print Answer Key to PDF
                </button>
                <p>Use "Save as PDF" in the print dialog to create a file to share.</p>
            </div>

            <header className="answer-key-header">
                <h1>ITEF Bahrain - Event Answer Key</h1>
                <p className="generated-date">Generated on: {new Date().toLocaleDateString()}</p>
            </header>

            <div className="puzzles-list">
                {allPuzzles.map((puzzle, index) => (
                    <div key={puzzle.id} className="puzzle-item">
                        <div className="puzzle-header">
                            <h2>{index + 1}. {puzzle.title}</h2>
                            <span className="puzzle-type">{puzzle.type}</span>
                        </div>

                        <div className="puzzle-content">
                            {puzzle.questions ? (
                                <div className="mcq-list">
                                    {puzzle.questions.map((q, qIndex) => (
                                        <div key={q.id} className="mcq-item">
                                            <p className="question-text">
                                                <strong>Q{qIndex + 1}:</strong> {q.question}
                                            </p>
                                            <ul className="options-list">
                                                {q.choices.map((choice) => (
                                                    <li
                                                        key={choice.id}
                                                        className={`option-item ${choice.isCorrect ? 'correct-answer' : ''}`}
                                                    >
                                                        <span className="option-marker">
                                                            {choice.isCorrect ? '✅' : '⚪'}
                                                        </span>
                                                        {choice.text}
                                                    </li>
                                                ))}
                                            </ul>
                                            {q.explanation && (
                                                <p className="explanation">💡 {q.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="non-mcq-content">
                                    <p><strong>Description:</strong> {puzzle.description}</p>
                                    {puzzle.dots ? (
                                        <p><strong>Solution:</strong> Connect dots {puzzle.dots.map(d => d.id).join(' → ')} sequentially.</p>
                                    ) : (
                                        <p>Refer to specific puzzle instructions.</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <hr className="puzzle-divider" />
                    </div>
                ))}
            </div>

            <footer className="answer-key-footer">
                <p>ITEF Bahrain Event 2025</p>
            </footer>
        </div>
    );
}
