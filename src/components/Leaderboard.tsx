import { useState, useEffect, useCallback } from 'react';
import { getAllAttendees, type Attendee } from '../services/attendeeService';
import { getWinners, getAllAttempts, type Winner } from '../services/firebaseService';
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

    const loadData = useCallback(() => {
        // Load Winners
        setLoadingWinners(true);
        const fetchWinners = async () => {
            try {
                if (puzzleId) {
                    // Specific Puzzle Leaderboard
                    const firebaseData = await getWinners(puzzleId);
                    // Filter for > 90% and specific puzzle logic
                    const filtered = firebaseData.filter(w => w.score >= 90);
                    // Combine with local if needed, but for now relying on Firebase
                    setWinners(filtered.sort((a, b) => b.score - a.score));
                } else {
                    // Global "Grand Winner" Leaderboard
                    // Requirement: Attend ALL topics AND Average Score >= 90%

                    const allAttempts = await getAllAttempts();

                    // --- MERGE LOCAL STORAGE DATA (For Tests & Offline) ---
                    try {
                        const localStored = localStorage.getItem('puzzleProgress');
                        if (localStored) {
                            const localProgress = JSON.parse(localStored);
                            // localProgress is { [userId]: { attempts: { [puzzleId]: [attempt, ...] } } }

                            Object.values(localProgress).forEach((userProg: any) => {
                                if (userProg && userProg.attempts) {
                                    Object.keys(userProg.attempts).forEach(pId => {
                                        const attemptsList = userProg.attempts[pId];
                                        if (Array.isArray(attemptsList)) {
                                            attemptsList.forEach((att: any) => {
                                                allAttempts.push({
                                                    puzzleId: pId,
                                                    userId: userProg.userId || att.userId,
                                                    attemptCount: att.attemptNumber || 1,
                                                    firstAttemptSuccess: att.firstAttemptSuccess || false,
                                                    lastAttemptAt: new Date(att.timestamp || Date.now()),
                                                    name: userProg.userName || 'Local User',
                                                    email: userProg.email || userProg.userId, // fallback to userId (email)
                                                    score: att.score || 0,
                                                    scores: [] // Local storage might not have scores history in same format, essentially flat here
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing local storage progress", e);
                    }
                    // -----------------------------------------------------

                    const allPuzzles = PuzzleService.getAllPuzzles();
                    // Fallback to 10 if allPuzzles is empty (prevent divide by zero/empty filter)
                    const totalPuzzles = (allPuzzles && allPuzzles.length > 0) ? allPuzzles.length : 10;

                    console.log('Leaderboard Debug:', {
                        totalPuzzles,
                        attemptsCount: allAttempts.length
                    });

                    const userMap = new Map<string, {
                        name: string,
                        email: string,
                        scores: Map<string, number>, // puzzleId -> maxScore
                        lastAttemptAt: Date
                    }>();

                    allAttempts.forEach(attempt => {
                        const key = attempt.email; // Use email as unique identifier
                        if (!key || key === 'N/A') return; // Skip invalid emails

                        if (!userMap.has(key)) {
                            userMap.set(key, {
                                name: attempt.name,
                                email: attempt.email,
                                scores: new Map(),
                                lastAttemptAt: attempt.lastAttemptAt
                            });
                        }
                        const user = userMap.get(key)!;

                        // Update most recent time
                        if (attempt.lastAttemptAt > user.lastAttemptAt) {
                            user.lastAttemptAt = attempt.lastAttemptAt;
                        }

                        // Track max score for this puzzle
                        // Some legacy records might not have scores array, fallback to score or 0
                        const attemptScores = attempt.scores && attempt.scores.length > 0 ? attempt.scores : [attempt.score || 0];
                        const currentMax = Math.max(...attemptScores);

                        const recordedMax = user.scores.get(attempt.puzzleId) || 0;
                        if (currentMax > recordedMax) {
                            user.scores.set(attempt.puzzleId, currentMax);
                        }
                    });

                    const globalWinners: Winner[] = [];

                    userMap.forEach(user => {
                        // Check if attempted all puzzles
                        // We check the size of the scores map against totalPuzzles

                        // Filter user.scores keys to ensure they match valid puzzle IDs if known,
                        // OR if we rely on the hardcoded count, just check the size of UNIQUE valid puzzles.

                        let validAttemptedCount = 0;
                        if (allPuzzles && allPuzzles.length > 0) {
                            validAttemptedCount = Array.from(user.scores.keys()).filter(pid =>
                                allPuzzles.some(p => p.id === pid)
                            ).length;
                        } else {
                            // If allPuzzles missing, use raw count (risky but better than 0)
                            validAttemptedCount = user.scores.size;
                        }

                        console.log(`Checking user: ${user.name} (${user.email}) - Attempts: ${validAttemptedCount}/${totalPuzzles}`);

                        if (validAttemptedCount >= totalPuzzles) {
                            // Calculate Average of Valid Puzzles
                            let totalScore = 0;
                            // Only sum scores for valid puzzles
                            if (allPuzzles && allPuzzles.length > 0) {
                                allPuzzles.forEach(p => {
                                    totalScore += (user.scores.get(p.id) || 0);
                                });
                            } else {
                                user.scores.forEach(score => totalScore += score);
                            }

                            const avg = Math.round(totalScore / totalPuzzles);

                            if (avg >= 90) {
                                globalWinners.push({
                                    name: user.name,
                                    email: user.email,
                                    puzzleId: 'global-overall',
                                    completedAt: user.lastAttemptAt,
                                    score: avg
                                });
                            }
                        }
                    });

                    // Sort by Score (Desc), then Time (Asc - whoever finished first/earliest updates?)
                    // Usually highest score wins. If tie, maybe earliest completion?
                    // User didn't specify tie-breaker, but standard is score.
                    globalWinners.sort((a, b) => b.score - a.score);

                    setWinners(globalWinners);
                }

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
            // ... existing attendee logic matches original file ...
            // Since I'm replacing the whole loadData block, I need to include this.
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
    }, [puzzleId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
                                {winners.map((winner, index) => {
                                    return (
                                        <div
                                            key={`${winner.email}_${winner.puzzleId}`}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '15px',
                                                backgroundColor: '#0f172a',
                                                borderRadius: '8px',
                                                borderLeft: index < 3 ? '4px solid #fbbf24' : '4px solid #3b82f6'
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
                                                                color: '#000',
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
                                    );
                                })}
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
