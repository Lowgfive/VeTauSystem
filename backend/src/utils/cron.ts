import { Seat } from "../models/seat.model";

export const startCronJobs = () => {
    console.log("⏰ Starting background cron jobs...");
    // Run every 30 seconds for faster cleanup of legacy DB locks.
    setInterval(async () => {
        try {
            const now = new Date();
            const result = await Seat.updateMany(
                {
                    status: "locked",
                    expired_at: { $lt: now }
                },
                {
                    $set: { status: "available" },
                    $unset: { locked_at: 1, expired_at: 1, locked_by: 1 }
                }
            );
            if (result.modifiedCount > 0) {
                console.log(`[Cron] Automatically released ${result.modifiedCount} expired seat locks.`);
            }
        } catch (error) {
            console.error("[Cron] Error releasing expired seats:", error);
        }
    }, 30 * 1000);
};
