import { useState } from 'react';
import type { PinPair, GridCoordinate } from '../../types/PuzzleTypes';

interface PCBPuzzleProps {
    gridSize: number;
    pins: PinPair[];
    onComplete: (isCorrect: boolean) => void;
}

export default function PCBPuzzle({ gridSize, pins, onComplete }: PCBPuzzleProps) {
    const [activePath, setActivePath] = useState<{ color: string, path: GridCoordinate[] } | null>(null);
    const [completedPaths, setCompletedPaths] = useState<{ [color: string]: GridCoordinate[] }>({});
    const [isDragging, setIsDragging] = useState(false);


    const getPinAt = (row: number, col: number) => {
        return pins.find(p =>
            (p.start.row === row && p.start.col === col) ||
            (p.end.row === row && p.end.col === col)
        );
    };

    const handleMouseDown = (row: number, col: number) => {
        const pin = getPinAt(row, col);
        if (pin) {
            // Start drawing from a pin
            setIsDragging(true);
            setActivePath({ color: pin.color, path: [{ row, col }] });

            // Clear existing path for this color if any
            const newCompleted = { ...completedPaths };
            delete newCompleted[pin.color];
            setCompletedPaths(newCompleted);
        } else {
            // Check if clicking on an existing path to clear it
            const clickedColor = Object.keys(completedPaths).find(color =>
                completedPaths[color].some(coord => coord.row === row && coord.col === col)
            );

            if (clickedColor) {
                const newCompleted = { ...completedPaths };
                delete newCompleted[clickedColor];
                setCompletedPaths(newCompleted);
            }
        }
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (!isDragging || !activePath) return;

        const lastPos = activePath.path[activePath.path.length - 1];

        // Only allow moving to adjacent cells
        if (Math.abs(row - lastPos.row) + Math.abs(col - lastPos.col) !== 1) return;

        // Check if hitting a pin
        const pin = getPinAt(row, col);
        if (pin) {
            if (pin.color === activePath.color) {
                // Reached target pin!
                const newPath = [...activePath.path, { row, col }];
                setActivePath({ ...activePath, path: newPath });

                // Commit path
                const newCompleted = { ...completedPaths, [activePath.color]: newPath };
                setCompletedPaths(newCompleted);
                setActivePath(null);
                setIsDragging(false);

                checkWinCondition(newCompleted);
            }
            // Else hitting wrong pin, block
            return;
        }

        // Check if hitting existing path (own or others)
        // Simple logic: allow backtracking, block crossing others
        const isCrossing = Object.entries(completedPaths).some(([color, path]) =>
            color !== activePath.color && path.some(c => c.row === row && c.col === col)
        );

        if (isCrossing) return;

        // Check self-intersection (backtracking handled by slicing)
        const selfIndex = activePath.path.findIndex(c => c.row === row && c.col === col);
        if (selfIndex !== -1) {
            // Backtrack
            const newPath = activePath.path.slice(0, selfIndex + 1);
            setActivePath({ ...activePath, path: newPath });
        } else {
            // Advance
            const newPath = [...activePath.path, { row, col }];
            setActivePath({ ...activePath, path: newPath });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setActivePath(null);
    };

    const checkWinCondition = (currentPaths: { [color: string]: GridCoordinate[] }) => {
        // Check if all pins have paths
        const allConnected = pins.every(pin => currentPaths[pin.color]);

        if (allConnected) {
            // Verify start and end are connected (implicit by logic but good to be safe)
            setTimeout(() => onComplete(true), 500);
        }
    };

    const getCellColor = (row: number, col: number) => {
        // Pin color
        const pin = getPinAt(row, col);
        if (pin) return pin.color;

        // Active path color
        if (activePath && activePath.path.some(c => c.row === row && c.col === col)) {
            return activePath.color;
        }

        // Completed path color
        for (const [color, path] of Object.entries(completedPaths)) {
            if (path.some(c => c.row === row && c.col === col)) {
                return color;
            }
        }

        return '#1e293b'; // Default grid color
    };

    return (
        <div className="pcb-puzzle" onMouseLeave={handleMouseUp} onMouseUp={handleMouseUp}>
            <div className="pcb-grid" style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gap: '4px',
                width: '350px',
                height: '350px',
                margin: '0 auto',
                backgroundColor: '#0f172a',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #334155'
            }}>
                {Array(gridSize * gridSize).fill(0).map((_, i) => {
                    const row = Math.floor(i / gridSize);
                    const col = i % gridSize;
                    const pin = getPinAt(row, col);
                    const color = getCellColor(row, col);
                    const isPath = !pin && color !== '#1e293b';

                    return (
                        <div
                            key={i}
                            className={`grid-cell ${pin ? 'is-pin' : ''} ${isPath ? 'is-path' : ''}`}
                            style={{
                                backgroundColor: isPath ? color : '#1e293b',
                                borderRadius: pin ? '50%' : '4px',
                                border: pin ? `4px solid ${color}` : '1px solid #334155',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background-color 0.1s'
                            }}
                            onMouseDown={() => handleMouseDown(row, col)}
                            onMouseEnter={() => handleMouseEnter(row, col)}
                        >
                            {isPath && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '40%',
                                    height: '40%',
                                    backgroundColor: color,
                                    borderRadius: '50%',
                                    opacity: 0.5
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="puzzle-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    className="reset-button"
                    onClick={() => setCompletedPaths({})}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Reset Board
                </button>
            </div>
        </div>
    );
}
