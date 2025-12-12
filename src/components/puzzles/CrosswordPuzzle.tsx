import { useState, useEffect } from 'react';

interface CrosswordCell {
    letter: string;
    isBlack: boolean;
    number?: number;
    clueAcross?: number;
    clueDown?: number;
}

interface Clue {
    number: number;
    text: string;
    answer: string;
    row: number;
    col: number;
    direction: 'across' | 'down';
}

interface CrosswordPuzzleProps {
    clues: Clue[];
    onComplete: (isCorrect: boolean) => void;
}

export default function CrosswordPuzzle({ clues, onComplete }: CrosswordPuzzleProps) {
    const GRID_SIZE = 7;
    const [grid, setGrid] = useState<CrosswordCell[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
    const [direction, setDirection] = useState<'across' | 'down'>('across');

    // Initialize grid
    useEffect(() => {
        const newGrid: CrosswordCell[][] = Array(GRID_SIZE).fill(null).map(() =>
            Array(GRID_SIZE).fill(null).map(() => ({ letter: '', isBlack: true }))
        );

        // Mark cells from clues as white
        clues.forEach(clue => {
            const row = clue.row;
            const col = clue.col;
            const length = clue.answer.length;

            for (let i = 0; i < length; i++) {
                if (clue.direction === 'across') {
                    newGrid[row][col + i] = { letter: '', isBlack: false };
                    if (i === 0) newGrid[row][col + i].number = clue.number;
                } else {
                    newGrid[row + i][col] = { letter: '', isBlack: false };
                    if (i === 0) newGrid[row + i][col].number = clue.number;
                }
            }
        });

        setGrid(newGrid);
    }, [clues]);

    const handleCellClick = (row: number, col: number) => {
        if (grid[row][col].isBlack) return;

        // Toggle direction if clicking the same cell
        if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
            setDirection(prev => prev === 'across' ? 'down' : 'across');
        } else {
            setSelectedCell({ row, col });
        }

        // Find the clue for this cell
        const clue = findClueForCell(row, col, direction);
        setSelectedClue(clue);
    };

    const findClueForCell = (row: number, col: number, dir: 'across' | 'down'): Clue | null => {
        return clues.find(clue => {
            if (clue.direction !== dir) return false;

            if (dir === 'across') {
                return clue.row === row && col >= clue.col && col < clue.col + clue.answer.length;
            } else {
                return clue.col === col && row >= clue.row && row < clue.row + clue.answer.length;
            }
        }) || null;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (!selectedCell) return;

        const { row, col } = selectedCell;

        if (e.key === 'Backspace') {
            // Clear current cell and move back
            const newGrid = [...grid];
            newGrid[row][col] = { ...newGrid[row][col], letter: '' };
            setGrid(newGrid);
            moveToNextCell(row, col, direction, true);
        } else if (e.key === 'ArrowRight') {
            moveToNextCell(row, col, 'across', false);
        } else if (e.key === 'ArrowLeft') {
            moveToNextCell(row, col, 'across', true);
        } else if (e.key === 'ArrowDown') {
            moveToNextCell(row, col, 'down', false);
        } else if (e.key === 'ArrowUp') {
            moveToNextCell(row, col, 'down', true);
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            // Enter letter and move to next cell - DEEP CLONE
            const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
            newGrid[row][col] = { ...newGrid[row][col], letter: e.key.toUpperCase() };
            setGrid(newGrid);
            moveToNextCell(row, col, direction, false);

            // Check completion
            checkCompletion(newGrid);
        }
    };

    const moveToNextCell = (row: number, col: number, dir: 'across' | 'down', backwards: boolean) => {
        let nextRow = row;
        let nextCol = col;

        if (dir === 'across') {
            nextCol = backwards ? col - 1 : col + 1;
        } else {
            nextRow = backwards ? row - 1 : row + 1;
        }

        // Check boundaries
        if (nextRow >= 0 && nextRow < GRID_SIZE && nextCol >= 0 && nextCol < GRID_SIZE) {
            if (!grid[nextRow][nextCol].isBlack) {
                setSelectedCell({ row: nextRow, col: nextCol });
                const nextClue = findClueForCell(nextRow, nextCol, dir);
                setSelectedClue(nextClue);
            }
        }
    };

    const checkCompletion = (currentGrid: CrosswordCell[][]) => {
        const allCorrect = clues.every(clue => {
            const { row, col, answer, direction } = clue;
            for (let i = 0; i < answer.length; i++) {
                const cellRow = direction === 'across' ? row : row + i;
                const cellCol = direction === 'across' ? col + i : col;
                if (currentGrid[cellRow][cellCol].letter !== answer[i]) {
                    return false;
                }
            }
            return true;
        });

        if (allCorrect) {
            setTimeout(() => onComplete(true), 500);
        }
    };

    return (
        <div className="crossword-puzzle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Grid */}
                <div
                    className="crossword-grid"
                    style={{ flex: '0 0 auto' }}
                    onKeyDown={handleKeyPress}
                    tabIndex={0}
                >
                    {grid.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: 'flex' }}>
                            {row.map((cell, colIndex) => {
                                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                                const isInSelectedClue = selectedClue && isInClue(rowIndex, colIndex, selectedClue);

                                return (
                                    <div
                                        key={colIndex}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            border: '1px solid #334155',
                                            backgroundColor: cell.isBlack ? '#0f172a' : isSelected ? '#3b82f6' : isInSelectedClue ? '#1e40af' : '#1e293b',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            cursor: cell.isBlack ? 'default' : 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem'
                                        }}
                                    >
                                        {cell.number && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '2px',
                                                left: '2px',
                                                fontSize: '0.6rem',
                                                color: '#94a3b8'
                                            }}>
                                                {cell.number}
                                            </span>
                                        )}
                                        {cell.letter}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Clues */}
                <div className="crossword-clues" style={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '10px' }}>Across</h3>
                        {clues
                            .filter(c => c.direction === 'across')
                            .map(clue => (
                                <div
                                    key={clue.number}
                                    onClick={() => {
                                        setSelectedCell({ row: clue.row, col: clue.col });
                                        setSelectedClue(clue);
                                        setDirection('across');
                                    }}
                                    style={{
                                        padding: '8px',
                                        marginBottom: '5px',
                                        backgroundColor: selectedClue?.number === clue.number && selectedClue?.direction === 'across' ? '#1e40af' : '#1e293b',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: 'white',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <strong>{clue.number}.</strong> {clue.text}
                                </div>
                            ))}
                    </div>

                    <div>
                        <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '10px' }}>Down</h3>
                        {clues
                            .filter(c => c.direction === 'down')
                            .map(clue => (
                                <div
                                    key={clue.number}
                                    onClick={() => {
                                        setSelectedCell({ row: clue.row, col: clue.col });
                                        setSelectedClue(clue);
                                        setDirection('down');
                                    }}
                                    style={{
                                        padding: '8px',
                                        marginBottom: '5px',
                                        backgroundColor: selectedClue?.number === clue.number && selectedClue?.direction === 'down' ? '#1e40af' : '#1e293b',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: 'white',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <strong>{clue.number}.</strong> {clue.text}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );

    function isInClue(row: number, col: number, clue: Clue): boolean {
        if (clue.direction === 'across') {
            return clue.row === row && col >= clue.col && col < clue.col + clue.answer.length;
        } else {
            return clue.col === col && row >= clue.row && row < clue.row + clue.answer.length;
        }
    }
}
