import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { AuthTokenPayload } from "../utils/jwt";

let io: Server;

/**
 * Initialize Socket.io server với JWT Auth middleware
 */
export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman...)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
          process.env.CLIENT_URL || "http://localhost:5173",
          "http://localhost:5173",
          "http://localhost:5174",
        ];

        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, true); // allow all in dev
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // ─── JWT Auth Middleware ─────────────────────────────────────────────────────
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        // Allow unauthenticated connections for public seat-status rooms
        (socket as any).userId = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;
      (socket as any).userId = decoded.userId;
      (socket as any).role = decoded.role;
      next();
    } catch {
      // Invalid token — allow as guest
      (socket as any).userId = null;
      next();
    }
  });

  // ─── Connection Events ────────────────────────────────────────────────────────
  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join a train room for realtime seat status across overlapping segments
    socket.on("join-train", (trainId: string) => {
      socket.join(`train:${trainId}`);
    });

    socket.on("leave-train", (trainId: string) => {
      socket.leave(`train:${trainId}`);
    });

    socket.on("disconnect", () => {
      // cleanup handled automatically by socket.io
    });
  });

  return io;
};

/**
 * Get io instance — throws if not initialized
 */
export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket() first.");
  return io;
};

// ─── Emit Helpers ─────────────────────────────────────────────────────────────

/** Emit seat status update to everyone viewing a schedule */
export const emitSeatUpdate = (
  trainId: string,
  data: { seatId: string; status: "EMPTY" | "LOCKED" | "SOLD" }
) => {
  getIO().to(`train:${trainId}`).emit("seat-updated", data);
};

/** Emit booking confirmation to a specific user */
export const emitBookingConfirmed = (userId: string, bookingCode: string) => {
  getIO().to(`user:${userId}`).emit("booking-confirmed", { bookingCode });
};
