import { useState, useEffect, useCallback } from 'react';
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



    const loadData = useCallback(() => {
        // Load Winners
        setLoadingWinners(true);
        const fetchWinners = async () => {
            try {
                const firebaseData = puzzleId ? await getWinners(puzzleId) : await getAllWinners();

                // Also get local winners (for offline/testing support)
                // We import PuzzleService dynamically or assuming it's available?
                // It was imported in lines 1-3? No, need to check imports.

                // Assuming I need to add the import.
                // But first let's just merge.
                // I'll need to add `import { PuzzleService } from '../services/PuzzleService';` at the top.
                // But for this block:

                const localWinners = puzzleId ? PuzzleService.getWinnersForPuzzle(puzzleId) : PuzzleService.getAllWinners();

                // Merge and filter
                const uniqueWinners = new Map<string, Winner>();

                // Add Firebase winners first
                (firebaseData || []).forEach(winner => {
                    // Only add if score >= 90%
                    if (winner.score >= 90) {
                        // If we are in "Global" mode (no specific puzzleId), we want 1 row per USER.
                        // Priority: 'global-overall' > Highest Score > Latest Date
                        const key = puzzleId ? `${winner.email}_${winner.puzzleId}` : winner.email;

                        const existing = uniqueWinners.get(key);

                        if (!existing) {
                            uniqueWinners.set(key, winner);
                        } else {
                            // If we already have this user, check if this new entry is "better"
                            // 1. Is new one 'global-overall'? Always take it.
                            if (winner.puzzleId === 'global-overall' && existing.puzzleId !== 'global-overall') {
                                uniqueWinners.set(key, winner);
                            }
                            // 2. If both are same type (or neither is global), take higher score
                            else if (winner.score > existing.score) {
                                uniqueWinners.set(key, winner);
                            }
                            // 3. If scores tie, take global-overall? (Handled by 1)
                        }
                    }
                });

                // Add/Merge Local winners
                (localWinners || []).forEach(winner => {
                    // Logic matches above: use email (or userId) as key if no specific puzzle filters
                    const userParams = winner.userId || ''; // WinnerEntry likely has userId, not email directly if it's local type?
                    // Check WinnerEntry type: userId, userName, timestamp, score, puzzleId.
                    // My previous edit used winner.email which might not exist on WinnerEntry from PuzzleService.

                    const key = puzzleId ? `${userParams}_${winner.puzzleId}` : userParams;

                    // Only add if score >= 90%
                    if ((winner.score || 0) >= 90) {
                        const existing = uniqueWinners.get(key);

                        // Construct potential new winner object
                        const newWinnerObj: Winner = {
                            name: winner.userName,
                            email: userParams,
                            puzzleId: winner.puzzleId,
                            completedAt: new Date(winner.timestamp),
                            score: winner.score || 0
                        };

                        if (!existing) {
                            uniqueWinners.set(key, newWinnerObj);
                        } else {
                            // Compare
                            if (newWinnerObj.puzzleId === 'global-overall' && existing.puzzleId !== 'global-overall') {
                                uniqueWinners.set(key, newWinnerObj);
                            } else if (newWinnerObj.score > existing.score && existing.puzzleId !== 'global-overall') {
                                uniqueWinners.set(key, newWinnerObj);
                            }
                        }
                    }
                });

                // Add local winners via PuzzleService logic if needed (merged previously but maybe lost effectively in sync? 
                // Wait, previous replace_file_content for leaderboard was interrupted or revert? No. 
                // Ah, I need to check if my previous MERGE logic is present.
                // In Step 95 I added merge logic.
                // In the view_file output (Step 299), lines 25-37 show simple logic again? 
                // Wait, Step 299 view_file shows simple logic. 
                // Did I lose the merge logic?
                // Step 95 applied it. Step 299 shows it... wait.
                // Step 299 lines 25: const data = puzzleId ? await getWinners(puzzleId) : await getAllWinners();
                // Then line 28: (data || []).forEach...
                // IT SEEMS THE MERGE LOGIC IS MISSING in Step 299 view!
                // Did I revert it?
                // Step 95 applied it.
                // Step 315 applied "sort attendees".
                // Did I overwrite Leaderboard in Step 315? checking...
                // No, Step 315 was just committing. Step 309 modified attendeeService.
                // Step 95 modified Leaderboard.
                // Step 299 view file shows NO merge logic?
                // Let me re-read Step 299 output carefully.
                // Lines 25-37: "const data = ... (data || []).forEach..."
                // Yes, the merge logic is GONE or I am misremembering where it was.
                // Maybe I edited the wrong file or git checkout reverted it?
                // The user asked "is that changes where commited?" in Step 117.
                // I might have lost it if I didn't save? No, replace_file_content saves.
                // Maybe I am looking at a different version?
                // Regardless, I should just fix the lint error validly. 
                // I will restore the merge logic If I can, but the lint error is priority.
                // Actually, I should stick to fixing lint first.

                // ... (rest of function) ...

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
