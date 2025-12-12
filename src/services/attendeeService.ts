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

// Get all attendees - optionally filtered by puzzle
export async function getAllAttendees(puzzleId?: string): Promise<Attendee[]> {
    try {
        const attemptsRef = collection(db, 'attempts');

        // Simple query without orderBy to avoid index requirements
        const querySnapshot = await getDocs(attemptsRef);
        const attendees: Attendee[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter by puzzleId if provided
            if (puzzleId && data.puzzleId !== puzzleId) {
                return;
            }
            attendees.push({
                userId: data.userId,
                name: data.name || 'Anonymous',
                email: data.email || 'N/A',
                puzzleId: data.puzzleId,
                attemptCount: data.attemptCount || 1,
                lastAttemptAt: data.lastAttemptAt?.toDate() || new Date(),
                firstAttemptSuccess: data.firstAttemptSuccess
            });
        });

        // Sort by attemptCount in JavaScript (descending)
        return attendees.sort((a, b) => b.attemptCount - a.attemptCount);
    } catch (error) {
        console.error('Error getting attendees:', error);
        return [];
    }
}
