
// Utility to track seat locks locally in the session to avoid selecting them again
// This is used as a fallback or complementary to the backend-driven locks

const MY_LOCKS_KEY = 'my_seat_locks';
export const SEAT_HOLD_TTL_MS = 5 * 60 * 1000;

interface SeatLock {
    scheduleId: string;
    seatId: string;
    timestamp: number;
}

export const addMyLock = (scheduleId: string, seatId: string) => {
    try {
        const locks = getMyLocks();
        locks.push({ scheduleId, seatId, timestamp: Date.now() });
        sessionStorage.setItem(MY_LOCKS_KEY, JSON.stringify(locks));
    } catch (e) {
        console.error('Error adding local lock:', e);
    }
};

export const removeMyLock = (scheduleId: string, seatId: string) => {
    try {
        const locks = getMyLocks();
        const updated = locks.filter(l => !(l.scheduleId === scheduleId && l.seatId === seatId));
        sessionStorage.setItem(MY_LOCKS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('Error removing local lock:', e);
    }
};

export const isMyLock = (scheduleId: string, seatId: string): boolean => {
    const locks = getMyLocks();
    const now = Date.now();
    return locks.some(l => 
        l.scheduleId === scheduleId && 
        l.seatId === seatId && 
        (now - l.timestamp < SEAT_HOLD_TTL_MS)
    );
};

export const getMyLocks = (): SeatLock[] => {
    try {
        const saved = sessionStorage.getItem(MY_LOCKS_KEY);
        if (!saved) return [];
        return JSON.parse(saved);
    } catch (e) {
        return [];
    }
};

export const clearMyLocks = () => {
    sessionStorage.removeItem(MY_LOCKS_KEY);
};
