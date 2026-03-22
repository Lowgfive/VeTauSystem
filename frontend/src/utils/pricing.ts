export const getSeatTypeMultiplier = (seatType: string): number => {
    switch (seatType) {
        case "hard_seat": return 0.8;
        case "soft_seat": return 1.0;
        case "sleeper_6": return 1.5;
        case "sleeper_4": return 1.8;
        case "vip_sleeper_2": return 2.5;
        default: return 1.0;
    }
};

export const calculateSeatPrice = (basePrice: number, seatType: string): number => {
    return Math.round(basePrice * getSeatTypeMultiplier(seatType));
};
