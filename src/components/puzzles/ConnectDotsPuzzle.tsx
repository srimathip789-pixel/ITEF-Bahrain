import { useState, useRef, useEffect, useCallback } from 'react';
import type { DotCoordinate } from '../../types/PuzzleTypes';

interface ConnectDotsPuzzleProps {
    dots: DotCoordinate[];
    onComplete: (isCorrect: boolean) => void;
}

export default function ConnectDotsPuzzle({ dots, onComplete, revealImage }: ConnectDotsPuzzleProps & { revealImage?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [connectedDots, setConnectedDots] = useState<number[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [showReveal, setShowReveal] = useState(false);

    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 350;
    const DOT_RADIUS = 6;



    useEffect(() => {
        if (isComplete && revealImage) {
            const timer = setTimeout(() => setShowReveal(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isComplete, revealImage]);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw reveal image if complete
        if (showReveal && revealImage) {
            const img = new Image();
            img.src = revealImage;
            // We can't easily wait for load here in draw loop, so we assume it's cached or handle it simply
            // Better approach: load image in useEffect
            // For now, let's just draw lines and dots on top
        }

        // Draw connections
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed lines for blueprint look

        for (let i = 0; i < connectedDots.length - 1; i++) {
            const currentDot = dots.find(d => d.id === connectedDots[i]);
            const nextDot = dots.find(d => d.id === connectedDots[i + 1]);

            if (currentDot && nextDot) {
                ctx.beginPath();
                ctx.moveTo(currentDot.x, currentDot.y);
                ctx.lineTo(nextDot.x, nextDot.y);
                ctx.stroke();
            }
        }

        // Connect last to first if complete to close the loop (optional, but good for shapes)
        if (isComplete && connectedDots.length > 2) {
            const lastDot = dots.find(d => d.id === connectedDots[connectedDots.length - 1]);
            const firstDot = dots.find(d => d.id === connectedDots[0]);
            if (lastDot && firstDot) {
                ctx.beginPath();
                ctx.moveTo(lastDot.x, lastDot.y);
                ctx.lineTo(firstDot.x, firstDot.y);
                ctx.stroke();
            }
        }

        ctx.setLineDash([]); // Reset dash

        // Draw dots
        dots.forEach(dot => {
            const isConnected = connectedDots.includes(dot.id);

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = isConnected ? '#10b981' : '#1e293b'; // Darker dots
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw number
            if (!isComplete) {
                ctx.fillStyle = '#fff'; // White text
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dot.id.toString(), dot.x, dot.y);
            }

        });
    }, [connectedDots, showReveal, dots, revealImage, isComplete]);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isComplete) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find clicked dot
        const clickedDot = dots.find(dot => {
            const distance = Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
            return distance <= DOT_RADIUS + 10; // Larger hit area
        });

        if (clickedDot) {
            const expectedNextId = connectedDots.length + 1;

            if (clickedDot.id === expectedNextId) {
                const newConnectedDots = [...connectedDots, clickedDot.id];
                setConnectedDots(newConnectedDots);

                // Check if puzzle is complete
                if (newConnectedDots.length === dots.length) {
                    setIsComplete(true);
                    const isCorrect = checkSolution(newConnectedDots);
                    // Delay completion callback to show reveal
                    setTimeout(() => onComplete(isCorrect), 2000);
                }
            } else {
                // Wrong dot clicked - reset
                setConnectedDots([]);
            }
        }
    };

    const checkSolution = (connected: number[]): boolean => {
        // Check if all dots are connected in correct numerical order
        for (let i = 0; i < connected.length; i++) {
            if (connected[i] !== i + 1) {
                return false;
            }
        }
        return true;
    };

    const handleReset = () => {
        setConnectedDots([]);
        setIsComplete(false);
        setShowReveal(false);
    };

    return (
        <div className="connect-dots-puzzle">
            <div className="puzzle-instructions">
                <p>Connect the dots in order to reveal the component.</p>
                <p className="hint-text">Sequence resets on error.</p>
            </div>

            <div className="canvas-container" style={{ position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT, margin: '0 auto' }}>
                {showReveal && revealImage && (
                    <img
                        src={revealImage}
                        alt="Revealed Component"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            opacity: 0,
                            animation: 'fadeIn 1s forwards',
                            zIndex: 0
                        }}
                    />
                )}
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onClick={handleCanvasClick}
                    style={{
                        border: '2px solid #334155',
                        borderRadius: '4px',
                        cursor: isComplete ? 'default' : 'crosshair',
                        backgroundColor: '#0f172a', // Blueprint blue-ish dark
                        position: 'relative',
                        zIndex: 1,
                        opacity: showReveal ? 0.3 : 1, // Fade out canvas to show image
                        transition: 'opacity 1s ease'
                    }}
                />
            </div>

            <div className="puzzle-controls">
                <div className="progress-text">
                    Progress: {Math.round((connectedDots.length / dots.length) * 100)}%
                </div>
                <button className="reset-button" onClick={handleReset} disabled={connectedDots.length === 0 || isComplete}>
                    Reset
                </button>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
