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
            const data = doc.data();
            attendeesMap.set(data.email, {
                userId: data.email,
                name: data.name || 'Anonymous',
                email: data.email || 'N/A',
                puzzleId: 'registered',
                attemptCount: data.attemptCount || 0,
                lastAttemptAt: data.registeredAt?.toDate() || new Date(),
                firstAttemptSuccess: false
            });
        });

        // Then, fetch all attempts and update the map
        const attemptsRef = collection(db, 'attempts');
        const attemptsSnapshot = await getDocs(attemptsRef);

        attemptsSnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter by puzzleId if provided
            if (puzzleId && data.puzzleId !== puzzleId) {
                return;
            }

            const email = data.email || data.userId;
            const existing = attendeesMap.get(email);

            // Update or add the attendee with attempt info
            if (existing) {
                existing.attemptCount = Math.max(existing.attemptCount, data.attemptCount || 1);
                existing.puzzleId = data.puzzleId || existing.puzzleId;
                existing.firstAttemptSuccess = existing.firstAttemptSuccess || data.firstAttemptSuccess;
            } else {
                attendeesMap.set(email, {
                    userId: data.userId,
                    name: data.name || 'Anonymous',
                    email: data.email || 'N/A',
                    puzzleId: data.puzzleId,
                    attemptCount: data.attemptCount || 1,
                    lastAttemptAt: data.lastAttemptAt?.toDate() || new Date(),
                    firstAttemptSuccess: data.firstAttemptSuccess
                });
            }
        });

        // Convert map to array and sort by attemptCount descending
        const attendees = Array.from(attendeesMap.values());
        return attendees.sort((a, b) => b.attemptCount - a.attemptCount);
    } catch (error) {
        console.error('Error getting attendees:', error);
        return [];
    }
}
