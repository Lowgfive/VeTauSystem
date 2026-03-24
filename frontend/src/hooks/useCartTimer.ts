import { useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import { seatService } from "../services/seat.service";

const releaseExpiredLocks = async (scheduleSeats: Array<{ scheduleId: string; seatId: string }>) => {
    await Promise.all(
        scheduleSeats.map(({ scheduleId, seatId }) =>
            seatService.unlockSeat(scheduleId, seatId).catch(() => {})
        )
    );
};

/**
 * Global cleanup for persisted cart expiration.
 * - Clears stale persisted cart data after reload
 * - Best-effort unlocks expired seats on the backend
 */
export const useCartTimer = () => {
    const expiresAt = useCartStore((state) => state.expiresAt);
    const seats = useCartStore((state) => state.seats);
    const clearCart = useCartStore((state) => state.clearCart);
    const clearExpiresAt = useCartStore((state) => state.clearExpiresAt);

    useEffect(() => {
        if (!expiresAt) return;

        const cleanup = async () => {
            await releaseExpiredLocks(
                seats
                    .filter((seat) => seat.scheduleId && seat.seatId)
                    .map((seat) => ({
                        scheduleId: seat.scheduleId,
                        seatId: seat.seatId,
                    }))
            );
            clearCart();
            clearExpiresAt();
        };

        const now = Date.now();
        if (expiresAt <= now) {
            void cleanup();
            return;
        }

        const timeoutId = setTimeout(() => {
            void cleanup();
        }, expiresAt - now);

        return () => clearTimeout(timeoutId);
    }, [expiresAt, seats, clearCart, clearExpiresAt]);
};

/** Format seconds to MM:SS display */
export const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};
