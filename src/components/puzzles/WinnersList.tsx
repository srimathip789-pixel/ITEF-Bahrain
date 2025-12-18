import { useState } from 'react';
// WinnerEntry type unused
import { PuzzleService } from '../../services/PuzzleService';
import { Trophy, Clock, Award } from 'lucide-react';

interface WinnersListProps {
    puzzleId?: string; // If provided, show winners for specific puzzle
    limit?: number; // Maximum winners to show
}

export default function WinnersList({ puzzleId, limit }: WinnersListProps) {
    const [filter, setFilter] = useState<string>(puzzleId || 'all');

    const winners = (puzzleId
        ? PuzzleService.getWinnersForPuzzle(puzzleId)
        : PuzzleService.getAllWinners())
        ?.filter(w => w.userId !== 'master@example.com') || [];

    const puzzles = PuzzleService.getAllPuzzles() || [];

    const getPuzzleTitle = (id: string): string => {
        const puzzle = puzzles.find(p => p.id === id);
        return puzzle?.title || 'Unknown Puzzle';
    };

    const formatTimestamp = (timestamp: number): string => {
        if (!timestamp) return 'Unknown Time';
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Invalid Date';
        }
    };

    const formatTimeSpent = (seconds?: number): string => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    // Sort winners by score (highest first), then by timestamp (earliest first)
    const sortedWinners = [...winners].sort((a, b) => {
        // First sort by score (highest first)
        if ((b.score || 0) !== (a.score || 0)) {
            return (b.score || 0) - (a.score || 0);
        }
        // Then by timestamp (earliest first)
        return (a.timestamp || 0) - (b.timestamp || 0);
    });

    const filteredWinners = filter === 'all'
        ? sortedWinners
        : sortedWinners.filter(w => w?.puzzleId === filter);

    const displayedWinners = limit ? filteredWinners.slice(0, limit) : filteredWinners;

    if (winners.length === 0) {
        return (
            <div className="winners-list-empty">
                <Trophy size={48} className="empty-icon" />
                <h3>No Winners Yet!</h3>
                <p>Be the first to solve a puzzle correctly on the first try!</p>
            </div>
        );
    }

    return (
        <div className="winners-list-container">
            <div className="winners-header">
                <img src="/itef-logo.png" alt="ITEF Bahrain" style={{ maxWidth: '200px', marginBottom: '16px' }} />
                <Trophy size={28} className="header-icon" />
                <h2>🏆 Winners List</h2>
                <p className="subtitle">First-time solvers who scored 90% or higher!</p>
            </div>

            {!puzzleId && (
                <div className="winners-filter">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Puzzles</option>
                        {puzzles.map(puzzle => (
                            <option key={puzzle.id} value={puzzle.id}>
                                {puzzle.icon} {puzzle.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="winners-list">
                {displayedWinners.length === 0 ? (
                    <div className="no-winners">
                        <p>No winners for this puzzle yet. Be the first!</p>
                    </div>
                ) : (
                    displayedWinners.map((winner, index) => (
                        <div key={`${winner.userId}-${winner.puzzleId}`} className="winner-entry">
                            <div className="winner-rank">
                                {index === 0 && <span className="medal gold">🥇</span>}
                                {index === 1 && <span className="medal silver">🥈</span>}
                                {index === 2 && <span className="medal bronze">🥉</span>}
                                {index > 2 && <span className="rank-number">#{index + 1}</span>}
                            </div>

                            <div className="winner-info">
                                <div className="winner-name">
                                    <Award size={16} />
                                    {winner.userName}
                                </div>
                                {!puzzleId && (
                                    <div className="winner-puzzle">{getPuzzleTitle(winner.puzzleId)}</div>
                                )}
                                <div className="winner-meta">
                                    <span className="winner-timestamp">
                                        <Clock size={14} />
                                        {formatTimestamp(winner.timestamp)}
                                    </span>
                                    {winner.score !== undefined && (
                                        <span className="winner-score">Score: {winner.score}%</span>
                                    )}
                                    {winner.timeSpent && (
                                        <span className="winner-time">⏱ {formatTimeSpent(winner.timeSpent)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {limit && filteredWinners.length > limit && (
                <div className="winners-more">
                    <p>+ {filteredWinners.length - limit} more winners</p>
                </div>
            )}
        </div>
    );
}
