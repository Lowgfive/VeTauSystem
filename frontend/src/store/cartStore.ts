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
    expiresAt: number | null;

    addSeat: (seat: CartSeat) => void;
    removeSeat: (seatId: string) => void;
    clearCart: () => void;
    setExpiresAt: (timestamp: number) => void;
    clearExpiresAt: () => void;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            seats: [],
            expiresAt: null,

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

            clearCart: () => set({ seats: [], expiresAt: null }),

            setExpiresAt: (timestamp) => set({ expiresAt: timestamp }),

            clearExpiresAt: () => set({ expiresAt: null }),

            getTotalPrice: () =>
                get().seats.reduce((sum, seat) => sum + seat.price, 0),
        }),
        {
            name: "vetau-cart", // persisted key in localStorage
            partialize: (state) => ({ seats: state.seats, expiresAt: state.expiresAt }),
        }
    )
);
