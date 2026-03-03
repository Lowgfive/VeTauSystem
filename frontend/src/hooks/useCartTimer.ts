import { useEffect, useRef } from "react";
import { useCartStore } from "../store/cartStore";

/**
 * Countdown timer for seat hold (10 minutes).
 * Ticks every second and auto-clears the cart when time runs out.
 */
export const useCartTimer = () => {
    const { isTimerRunning, tickTimer } = useCartStore();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isTimerRunning) {
            intervalRef.current = setInterval(() => {
                tickTimer();
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isTimerRunning, tickTimer]);
};

/** Format seconds to MM:SS display */
export const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};
