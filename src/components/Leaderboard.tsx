import { useState, useEffect } from 'react';
import { getAllAttendees, type Attendee } from '../services/attendeeService';
import { getWinners, getAllWinners, type Winner } from '../services/firebaseService';
import { PuzzleService } from '../services/PuzzleService';

interface LeaderboardProps {
    puzzleId?: string;
}

export default function Leaderboard({ puzzleId }: LeaderboardProps) {
    const [activeTab, setActiveTab] = useState<'winners' | 'attendees'>('winners');
    const [winners, setWinners] = useState<Winner[]>([]);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loadingWinners, setLoadingWinners] = useState(true);
    const [loadingAttendees, setLoadingAttendees] = useState(true);

    useEffect(() => {
        loadData();
    }, [puzzleId]);

    const loadData = () => {
        // Load Winners
        setLoadingWinners(true);
        const fetchWinners = async () => {
            try {
                const fbWinners = puzzleId ? await getWinners(puzzleId) : await getAllWinners();
                const localWinners = puzzleId ? PuzzleService.getWinnersForPuzzle(puzzleId) : PuzzleService.getAllWinners();

                // Convert local winners to Firebase format and merge
                const allWinners = [...(fbWinners || [])];

                // Add local winners if not already present
                localWinners.forEach(lw => {
                    const isPresent = allWinners.some(fw =>
                        fw.email === (PuzzleService.getCurrentUser().email) &&
                        fw.puzzleId === lw.puzzleId
                    );

                    if (!isPresent) {
                        allWinners.push({
                            name: lw.userName,
                            email: PuzzleService.getCurrentUser().email || 'local@user',
                            puzzleId: lw.puzzleId,
                            completedAt: new Date(lw.timestamp),
                            score: lw.score || 0
                        });
                    }
                });

                // Filter winners: only show 90%+ scores and deduplicate
                const uniqueWinners = new Map<string, Winner>();
                allWinners.forEach(winner => {
                    const key = `${winner.email}_${winner.puzzleId}`;
                    // Only add if score >= 90% and not already added (or if higher score)
                    if (winner.score >= 90) {
                        if (!uniqueWinners.has(key) || (uniqueWinners.get(key)?.score || 0) < winner.score) {
                            uniqueWinners.set(key, winner);
                        }
                    }
                });

                // Sort by score (highest first)
                const sortedWinners = Array.from(uniqueWinners.values())
                    .sort((a, b) => b.score - a.score);

                setWinners(sortedWinners);
            } catch (error) {
                console.error('Error loading winners:', error);
                setWinners([]);
            } finally {
                setLoadingWinners(false);
            }
        };

        // Load Attendees
        setLoadingAttendees(true);
        const fetchAttendees = async () => {
            try {
                const data = puzzleId ? await getAllAttendees(puzzleId) : await getAllAttendees();
                setAttendees(data || []);
            } catch (error) {
                console.error('Error loading attendees:', error);
                setAttendees([]);
            } finally {
                setLoadingAttendees(false);
            }
        };

        fetchWinners();
        fetchAttendees();
    };

    return (
        <div className="leaderboard-container" style={{
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '20px'
        }}>
            {/* Tab Headers */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #334155' }}>
                <button
                    onClick={() => setActiveTab('winners')}
                    data-testid="winners-tab"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'winners' ? '#3b82f6' : 'transparent',
                        color: 'white',
                        border: 'none',
                        borderBottom: activeTab === 'winners' ? '3px solid #3b82f6' : 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: activeTab === 'winners' ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                    }}
                >
                    🏆 Winners ({winners.length})
                </button>
                <button
                    onClick={() => setActiveTab('attendees')}
                    data-testid="attendees-tab"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'attendees' ? '#3b82f6' : 'transparent',
                        color: 'white',
                        border: 'none',
                        borderBottom: activeTab === 'attendees' ? '3px solid #3b82f6' : 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: activeTab === 'attendees' ? 'bold' : 'normal',
                        transition: 'all 0.3s'
                    }}
                >
                    👥 All Attendees ({attendees.length})
                </button>
            </div>

            {/* Winners Tab */}
            {activeTab === 'winners' && (
                loadingWinners ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }} data-testid="loading-winners">
                        Loading Winners...
                    </div>
                ) : (
                    <div className="winners-list" data-testid="winners-list">
                        <h3 style={{ color: '#94a3b8', marginBottom: '15px' }}>
                            First-Time Winners (90%+ Score)
                        </h3>
                        {winners.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }} data-testid="no-winners-message">
                                No winners yet. Be the first! 🎯
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {winners.map((winner, index) => (
                                    <div
                                        key={`${winner.email}_${winner.puzzleId}`}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            borderLeft: index < 3 ? '4px solid #fbbf24' : '4px solid #3b82f6',
                                            border: winner.puzzleId === 'global-overall' ? '2px solid #fbbf24' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#64748b'
                                            }}>
                                                #{index + 1}
                                            </span>
                                            <div>
                                                <div style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {winner.name}
                                                    {winner.puzzleId === 'global-overall' && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            backgroundColor: '#fbbf24',
                                                            color: 'black',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            GLOBAL CHAMPION
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                                    {winner.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                                                {winner.score}%
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                {new Date(winner.completedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            )}

            {/* Attendees Tab */}
            {activeTab === 'attendees' && (
                loadingAttendees ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }} data-testid="loading-attendees">
                        Loading Attendees...
                    </div>
                ) : (
                    <div className="attendees-list" data-testid="attendees-list">
                        <h3 style={{ color: '#94a3b8', marginBottom: '15px' }}>
                            All Participants & Attempt Counts
                        </h3>
                        {attendees.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                                No attendees yet.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {attendees.map((attendee, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '15px',
                                            backgroundColor: '#0f172a',
                                            borderRadius: '8px',
                                            borderLeft: attendee.firstAttemptSuccess ? '4px solid #10b981' : '4px solid #ef4444'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                                            <span style={{
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                color: '#64748b',
                                                minWidth: '40px'
                                            }}>
                                                #{index + 1}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'white', fontWeight: 'bold' }}>
                                                    {attendee.name}
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                                    {attendee.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                                    {attendee.attemptCount}
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                    {attendee.attemptCount === 1 ? 'attempt' : 'attempts'}
                                                </div>
                                            </div>
                                            <div>
                                                {attendee.firstAttemptSuccess ? (
                                                    <span style={{
                                                        backgroundColor: '#10b981',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        ✓ 1st Try
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        backgroundColor: '#64748b',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        Retried
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
