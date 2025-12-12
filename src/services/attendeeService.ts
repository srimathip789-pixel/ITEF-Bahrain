import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

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
        const q = puzzleId
            ? query(
                attemptsRef,
                where('puzzleId', '==', puzzleId),
                orderBy('attemptCount', 'desc')
            )
            : query(
                attemptsRef,
                orderBy('attemptCount', 'desc')
            );

        const querySnapshot = await getDocs(q);
        const attendees: Attendee[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            attendees.push({
                userId: data.userId,
                name: data.name || 'Anonymous',
                email: data.email || 'N/A',
                puzzleId: data.puzzleId,
                attemptCount: data.attemptCount,
                lastAttemptAt: data.lastAttemptAt?.toDate() || new Date(),
                firstAttemptSuccess: data.firstAttemptSuccess
            });
        });

        return attendees;
    } catch (error) {
        console.error('Error getting attendees:', error);
        return [];
    }
}
