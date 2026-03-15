// Load .env FIRST — isolated loader đảm bảo env được load trước mọi import khác
import "./config/env";

import http from "http";
import app from "./app";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { connectRedis } from "./config/redis";
import { initSocket } from "./config/socket";

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost");

async function start() {
  try {
    // ─── Validate Required Env Variables ─────────────────────────────────────
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI environment variable is required");
      process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET environment variable is required");
      process.exit(1);
    }

    // ─── Connect Database ─────────────────────────────────────────────────────
    await connectDatabase();
    console.log("✅ Database connected successfully");

    // ─── Connect Redis ────────────────────────────────────────────────────────
    await connectRedis();

    // ─── Create HTTP Server ───────────────────────────────────────────────────
    const httpServer = http.createServer(app);

    // ─── Initialize Socket.io ─────────────────────────────────────────────────
    try {
      initSocket(httpServer);
      console.log("🔌 Socket.io ready");
    } catch (socketError) {
      console.error("⚠️ Failed to initialize Socket.io:", socketError);
      // Không exit — Socket.io không critical cho API
    }

    // ─── Start Listening ──────────────────────────────────────────────────────
    httpServer.listen(Number(PORT), HOST, () => {
      const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
      const serverUrl = `http://${displayHost}:${PORT}`;

      if (process.env.NODE_ENV !== "production") {
        console.log("\n🚀 ========================================");
        console.log(`✅ Server running at: ${serverUrl}`);
        console.log(`📡 API Base:          ${serverUrl}/api/v1`);
        console.log(`❤️  Health check:      ${serverUrl}/api/health`);
        console.log("🚀 ========================================\n");
      } else {
        console.log(`✅ Server listening on ${HOST}:${PORT}`);
      }
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = (signal: string) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      httpServer.close(async () => {
        await disconnectDatabase();
        console.log("👋 Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (error) {
    console.error("❌ Failed to start server:", (error as Error).message);
    process.exit(1);
  }
}

start();
