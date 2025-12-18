import { useState, useEffect, useCallback } from 'react';
import { getAllAttempts, type Winner } from '../services/firebaseService';
import { PuzzleService } from '../services/PuzzleService';

interface LeaderboardProps {
    puzzleId?: string;
}

interface AttendeeStats {
    userId: string;
    name: string;
    email: string;
    totalAttempts: number;
    topicsAttended: number;
    attemptsPerPuzzle: Map<string, number>; // puzzleId -> count
    lastAttemptAt: Date;
    firstAttemptSuccess: boolean;
}

export default function Leaderboard({ puzzleId }: LeaderboardProps) {
    const [activeTab, setActiveTab] = useState<'winners' | 'attendees'>('winners');
    const [winners, setWinners] = useState<Winner[]>([]);
    const [attendees, setAttendees] = useState<AttendeeStats[]>([]);
    const [loadingWinners, setLoadingWinners] = useState(true);
    const [loadingAttendees, setLoadingAttendees] = useState(true);

    const loadData = useCallback(() => {
        // Load Data (Consolidated)
        setLoadingWinners(true);
        setLoadingAttendees(true);

        const fetchData = async () => {
            try {
                // Fetch Global Data
                const allAttemptsRaw = await getAllAttempts();
                // Filter out test users
                const allAttempts = allAttemptsRaw.filter(a => a.email !== 'master@example.com');

                // --- MERGE LOCAL STORAGE DATA (For Tests & Offline) ---
                try {
                    const localStored = localStorage.getItem('puzzleProgress');
                    if (localStored) {
                        const localProgress = JSON.parse(localStored);
                        Object.values(localProgress).forEach((userProg: any) => {
                            if (userProg.email === 'master@example.com') return;

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
                                                email: userProg.email || userProg.userId,
                                                score: att.score || 0,
                                                scores: []
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
                const totalPuzzles = (allPuzzles && allPuzzles.length > 0) ? allPuzzles.length : 10;

                // --- Process Winners AND Attendees from same data source ---
                const userMap = new Map<string, {
                    name: string,
                    email: string,
                    scores: Map<string, number>, // puzzleId -> maxScore
                    attemptsPerPuzzle: Map<string, number>, // puzzleId -> count
                    lastAttemptAt: Date
                }>();

                allAttempts.forEach(attempt => {
                    const key = attempt.email;
                    if (!key || key === 'N/A') return;

                    if (!userMap.has(key)) {
                        userMap.set(key, {
                            name: attempt.name,
                            email: attempt.email,
                            scores: new Map(),
                            attemptsPerPuzzle: new Map(),
                            lastAttemptAt: attempt.lastAttemptAt
                        });
                    }
                    const user = userMap.get(key)!;

                    // Update most recent time
                    if (attempt.lastAttemptAt > user.lastAttemptAt) {
                        user.lastAttemptAt = attempt.lastAttemptAt;
                    }

                    // Track max score
                    const attemptScores = attempt.scores && attempt.scores.length > 0 ? attempt.scores : [attempt.score || 0];
                    const currentMax = Math.max(...attemptScores);
                    const recordedMax = user.scores.get(attempt.puzzleId) || 0;
                    if (currentMax > recordedMax) {
                        user.scores.set(attempt.puzzleId, currentMax);
                    }

                    // Track attempt counts per puzzle
                    // If 'attemptCount' is available in data, use it, otherwise count instances if data was flat (but getAllAttempts returns latest summary mostly)
                    // The getAllAttempts logic actually returns (hopefully) ONE doc per puzzle per user if using the consolidated structure, 
                    // BUT in our `allAttempts.push` from local storage we might be pushing multiple attempts.
                    // Let's refine:
                    // We only want to count *attempts*. 
                    // If the data source provides `attemptCount`, we take the MAX of that for a puzzle.
                    const existingCount = user.attemptsPerPuzzle.get(attempt.puzzleId) || 0;
                    const thisCount = attempt.attemptCount || 1;
                    // Since we iterate ALL records, and some might be duplicate updates, we should probably take the MAX for a given puzzleId?
                    // Or if these are distinct attempts? 
                    // `getAllAttempts` returns distinct docs from Firestore 'attempts' collection. The 'attempts' collection usually has ONE doc per user per puzzle (updated).
                    // So taking the value is correct.
                    // Local storage push also pushes unique attempt events? No, local storage merge creates flattened list.
                    // Let's just create a Set of attempt IDs? No, simple logic:
                    // If we see multiple entries for same user+puzzle, take the one with highest attemptCount.

                    if (thisCount > existingCount) {
                        user.attemptsPerPuzzle.set(attempt.puzzleId, thisCount);
                    }
                });

                const globalWinners: Winner[] = [];
                const detailedAttendees: AttendeeStats[] = [];

                userMap.forEach(user => {
                    // --- Winner Logic ---
                    let validAttemptedCount = 0;
                    if (allPuzzles && allPuzzles.length > 0) {
                        validAttemptedCount = Array.from(user.scores.keys()).filter(pid =>
                            allPuzzles.some(p => p.id === pid)
                        ).length;
                    } else {
                        validAttemptedCount = user.scores.size;
                    }

                    if (validAttemptedCount >= totalPuzzles) {
                        let totalScore = 0;
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

                    // --- Attendee Stats Logic ---
                    let totalAttempts = 0;
                    user.attemptsPerPuzzle.forEach(count => totalAttempts += count);

                    detailedAttendees.push({
                        userId: user.email,
                        name: user.name,
                        email: user.email,
                        totalAttempts: totalAttempts,
                        topicsAttended: user.attemptsPerPuzzle.size,
                        attemptsPerPuzzle: user.attemptsPerPuzzle,
                        lastAttemptAt: user.lastAttemptAt,
                        firstAttemptSuccess: false
                    });
                });

                // Sort Winners
                globalWinners.sort((a, b) => b.score - a.score);
                setWinners(globalWinners);

                // Sort Attendees (Most topics first, then most attempts)
                detailedAttendees.sort((a, b) => {
                    if (b.topicsAttended !== a.topicsAttended) {
                        return b.topicsAttended - a.topicsAttended;
                    }
                    return b.totalAttempts - a.totalAttempts;
                });
                setAttendees(detailedAttendees);

            } catch (error) {
                console.error('Error loading leaderboard data:', error);
                setWinners([]);
                setAttendees([]);
            } finally {
                setLoadingWinners(false);
                setLoadingAttendees(false);
            }
        };

        fetchData();
    }, [puzzleId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getPuzzleTitle = (id: string) => {
        const p = PuzzleService.getPuzzleById(id);
        return p ? p.title : id;
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

            {/* Attendees Tab (New Table Layout) */}
            {activeTab === 'attendees' && (
                loadingAttendees ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }} data-testid="loading-attendees">
                        Loading Attendees...
                    </div>
                ) : (
                    <div className="attendees-list" data-testid="attendees-list">
                        <h3 style={{ color: '#94a3b8', marginBottom: '15px' }}>
                            All Participants & Attempt Breakdown
                        </h3>
                        {attendees.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                                No attendees yet.
                            </p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                    <thead style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>
                                        <tr>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Participant</th>
                                            <th style={{ padding: '12px', textAlign: 'center' }}>Topics Attended</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Attempt Breakdown</th>
                                            <th style={{ padding: '12px', textAlign: 'center' }}>Total Tries</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendees.map((attendee, index) => (
                                            <tr key={attendee.email} style={{ borderBottom: '1px solid #334155' }}>
                                                <td style={{ padding: '12px', color: '#64748b', fontWeight: 'bold' }}>{index + 1}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{attendee.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{attendee.email}</div>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#fbbf24' }}>
                                                    {attendee.topicsAttended}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {Array.from(attendee.attemptsPerPuzzle.entries()).map(([pid, count]) => (
                                                            <span key={pid} style={{
                                                                backgroundColor: '#334155',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {getPuzzleTitle(pid)}: <strong style={{ color: '#3b82f6' }}>{count}</strong>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {attendee.totalAttempts}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
