import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartSeat {
    seatId: string;
    seatNumber: string;
    carriageNumber: string;
    seatType: string;
    price: number;
    scheduleId: string;
    sessionId: string;
}

interface CartState {
    seats: CartSeat[];
    timeLeft: number; // seconds remaining (starts at 600 = 10 min)
    isTimerRunning: boolean;

    addSeat: (seat: CartSeat) => void;
    removeSeat: (seatId: string) => void;
    clearCart: () => void;
    startTimer: () => void;
    stopTimer: () => void;
    tickTimer: () => void;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            seats: [],
            timeLeft: 600,
            isTimerRunning: false,

            addSeat: (seat) => {
                const exists = get().seats.some((s) => s.seatId === seat.seatId);
                if (!exists && get().seats.length < 4) {
                    set((state) => ({ seats: [...state.seats, seat] }));
                }
            },

            removeSeat: (seatId) =>
                set((state) => ({
                    seats: state.seats.filter((s) => s.seatId !== seatId),
                })),

            clearCart: () => set({ seats: [], timeLeft: 600, isTimerRunning: false }),

            startTimer: () => set({ isTimerRunning: true, timeLeft: 600 }),

            stopTimer: () => set({ isTimerRunning: false }),

            tickTimer: () => {
                const { timeLeft, clearCart } = get();
                if (timeLeft <= 1) {
                    clearCart(); // auto-clear when timer hits 0
                } else {
                    set({ timeLeft: timeLeft - 1 });
                }
            },

            getTotalPrice: () =>
                get().seats.reduce((sum, seat) => sum + seat.price, 0),
        }),
        {
            name: "vetau-cart", // persisted key in localStorage
            partialize: (state) => ({ seats: state.seats, timeLeft: state.timeLeft }),
        }
    )
);
