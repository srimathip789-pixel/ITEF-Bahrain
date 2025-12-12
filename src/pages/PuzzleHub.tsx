import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PuzzleService } from '../services/PuzzleService';
import PuzzleCard from '../components/puzzles/PuzzleCard';
import Leaderboard from '../components/Leaderboard';
import { PuzzleDifficulty } from '../types/PuzzleTypes';
import { Brain, Trophy, Target, Zap } from 'lucide-react';

export default function PuzzleHub() {
    const [puzzles] = useState(PuzzleService.getAllPuzzles());
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
    const [stats, setStats] = useState(PuzzleService.getUserStats());

    useEffect(() => {
        // Update stats whenever component mounts
        setStats(PuzzleService.getUserStats());
    }, []);

    const filteredPuzzles = filterDifficulty === 'all'
        ? puzzles
        : puzzles.filter(p => p.difficulty === filterDifficulty);

    return (
        <div className="puzzle-hub-container">
            {/* Hero Section */}
            <div className="puzzle-hero">
                <div className="hero-content">
                    <Brain size={48} className="hero-icon" />
                    <h1 className="hero-title">Engineer Puzzle Challenge</h1>
                    <p className="hero-subtitle">
                        Test your engineering skills across 10 different puzzle types!
                    </p>
                    <p className="hero-description">
                        ⚡ Solve correctly on your first try to join the Winners List!
                    </p>
                </div>

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <Target className="stat-icon" />
                        <div className="stat-value">{stats.totalAttempts}</div>
                        <div className="stat-label">Total Attempts</div>
                    </div>
                    <div className="stat-card">
                        <Zap className="stat-icon" />
                        <div className="stat-value">{stats.totalCompleted}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <Trophy className="stat-icon" />
                        <div className="stat-value">{stats.totalWon}</div>
                        <div className="stat-label">First-Try Wins</div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="puzzle-filters">
                <h2>Browse Puzzles</h2>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterDifficulty === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty('all')}
                    >
                        All Puzzles
                    </button>
                    <button
                        className={`filter-btn ${filterDifficulty === PuzzleDifficulty.EASY ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty(PuzzleDifficulty.EASY)}
                    >
                        Easy
                    </button>
                    <button
                        className={`filter-btn ${filterDifficulty === PuzzleDifficulty.MEDIUM ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty(PuzzleDifficulty.MEDIUM)}
                    >
                        Medium
                    </button>
                    <button
                        className={`filter-btn ${filterDifficulty === PuzzleDifficulty.HARD ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty(PuzzleDifficulty.HARD)}
                    >
                        Hard
                    </button>
                </div>
            </div>

            {/* Puzzle Grid */}
            <div className="puzzles-grid">
                {filteredPuzzles.map(puzzle => (
                    <PuzzleCard key={puzzle.id} puzzle={puzzle} />
                ))}
            </div>

            {/* Leaderboard Section with tabs */}
            <div className="winners-section">
                <Leaderboard />
                <Link to="/puzzles/winners" className="view-all-winners">
                    View All Winners →
                </Link>
            </div>
        </div>
    );
}

