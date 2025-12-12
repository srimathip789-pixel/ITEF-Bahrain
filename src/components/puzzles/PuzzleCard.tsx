import { Link } from 'react-router-dom';
import type { Puzzle } from '../../types/PuzzleTypes';
import { PuzzleStatus } from '../../types/PuzzleTypes';
import { CheckCircle, Trophy, Play } from 'lucide-react';
import { PuzzleService } from '../../services/PuzzleService';

interface PuzzleCardProps {
    puzzle: Puzzle;
}

export default function PuzzleCard({ puzzle }: PuzzleCardProps) {
    console.log('Rendering PuzzleCard:', puzzle.id);
    const status = PuzzleService.getPuzzleStatus(puzzle.id);
    const attemptCount = PuzzleService.getAttemptCount(puzzle.id);

    const getStatusIcon = () => {
        switch (status) {
            case PuzzleStatus.WON:
                return <Trophy className="status-icon won" size={24} />;
            case PuzzleStatus.COMPLETED:
                return <CheckCircle className="status-icon completed" size={24} />;
            case PuzzleStatus.IN_PROGRESS:
                return <Play className="status-icon in-progress" size={24} />;
            default:
                return null;
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case PuzzleStatus.WON:
                return <span className="status-badge won">🏆 Winner!</span>;
            case PuzzleStatus.COMPLETED:
                return <span className="status-badge completed">✓ Completed</span>;
            case PuzzleStatus.IN_PROGRESS:
                return <span className="status-badge in-progress">In Progress</span>;
            default:
                return <span className="status-badge not-started">Not Started</span>;
        }
    };



    return (
        <Link to={`/puzzles/${puzzle.id}`} className="puzzle-card-link">
            <div className={`puzzle-card ${status}`}>
                <div className="puzzle-card-header">
                    <div className="puzzle-icon">{puzzle.icon}</div>
                    {getStatusIcon()}
                </div>

                <div className="puzzle-card-body">
                    <h3 className="puzzle-title">{puzzle.title}</h3>
                    <p className="puzzle-description">{puzzle.description}</p>
                </div>

                <div className="puzzle-card-footer">
                    <div className="puzzle-metadata">

                        {getStatusBadge()}
                    </div>

                    {attemptCount > 0 && (
                        <div className="attempt-count">
                            Attempts: {attemptCount}
                        </div>
                    )}
                </div>

                <div className="puzzle-card-overlay">
                    <span className="play-text">Start Puzzle →</span>
                </div>
            </div>
        </Link>
    );
}
