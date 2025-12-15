import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Attendee {
    userId: string;
    name: string;
    email: string;
    puzzleId: string;
    attemptCount: number;
    lastAttemptAt: Date;
    firstAttemptSuccess: boolean;
}

// Get all attendees - from registrations and attempts
export async function getAllAttendees(puzzleId?: string): Promise<Attendee[]> {
    try {
        const attendeesMap = new Map<string, Attendee>();

        // First, fetch all registered users
        const registrationsRef = collection(db, 'registrations');
        const registrationsSnapshot = await getDocs(registrationsRef);

        registrationsSnapshot.forEach((doc) => {
            try {
                const data = doc.data();

                let registeredAt = new Date();
                if (data.registeredAt && typeof data.registeredAt.toDate === 'function') {
                    registeredAt = data.registeredAt.toDate();
                }

                attendeesMap.set(data.email, {
                    userId: data.email,
                    name: data.name || 'Anonymous',
                    email: data.email || 'N/A',
                    puzzleId: 'registered',
                    attemptCount: data.attemptCount || 0,
                    lastAttemptAt: registeredAt,
                    firstAttemptSuccess: false
                });
            } catch (err) {
                console.error('Error processing registration doc:', doc.id, err);
            }
        });

        // Then, fetch all attempts and update the map
        const attemptsRef = collection(db, 'attempts');
        const attemptsSnapshot = await getDocs(attemptsRef);

        attemptsSnapshot.forEach((doc) => {
            try {
                const data = doc.data();
                // Filter by puzzleId if provided
                if (puzzleId && data.puzzleId !== puzzleId) {
                    return;
                }

                const email = data.email || data.userId;
                const existing = attendeesMap.get(email);

                let lastAttemptAt = new Date();
                if (data.lastAttemptAt && typeof data.lastAttemptAt.toDate === 'function') {
                    lastAttemptAt = data.lastAttemptAt.toDate();
                }

                // Update or add the attendee with attempt info
                if (existing) {
                    existing.attemptCount = Math.max(existing.attemptCount, data.attemptCount || 1);
                    existing.puzzleId = data.puzzleId || existing.puzzleId;
                    existing.lastAttemptAt = lastAttemptAt;
                    existing.firstAttemptSuccess = existing.firstAttemptSuccess || data.firstAttemptSuccess;
                } else {
                    attendeesMap.set(email, {
                        userId: data.userId,
                        name: data.name || 'Anonymous',
                        email: data.email || 'N/A',
                        puzzleId: data.puzzleId,
                        attemptCount: data.attemptCount || 1,
                        lastAttemptAt: lastAttemptAt,
                        firstAttemptSuccess: data.firstAttemptSuccess
                    });
                }
            } catch (err) {
                console.error('Error processing attempt doc:', doc.id, err);
            }
        });

        // Convert map to array and sort by attemptCount descending
        const attendees = Array.from(attendeesMap.values());
        return attendees.sort((a, b) => b.lastAttemptAt.getTime() - a.lastAttemptAt.getTime());
    } catch (error) {
        console.error('Error getting attendees:', error);
        return [];
    }
}
