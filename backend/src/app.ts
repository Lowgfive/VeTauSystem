import express from "express";
import "./models"; // Register all models

import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/error.middleware";
import { swaggerSpec } from "./config/swagger";
import routerAuth from "./routes/auth.route";
import routerRoute from "./routes/route.route";
import routerStation from "./routes/station.route";
import routerSearch from "./routes/search.route";
import routerTrain from "./routes/train.route";
import routerTicket from "./routes/ticket.route";
import routerBooking from "./routes/booking.route";
import routerSchedule from "./routes/schedule.route";
import routerTemplate from "./routes/template.route";

const app = express();

// ─── Global Middlewares ──────────────────────────────────────────────────────
const allowedOrigins = [
  ...(process.env.CLIENT_URL || "").split(",").map((o) => o.trim()).filter(Boolean),
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4173",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, curl, mobile)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// ─── Root & Health Check ───────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Welcome to VéTàu System API. Docs are at /api/docs" });
});

app.get("/api/v1", (_req, res) => {
  res.status(200).json({ message: "VéTàu System API v1 is running🚀" });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger API Docs 
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Metro Hà Nội - API Docs",
  })
);

// API Routes (v1)
app.use("/api/v1/auth", routerAuth);
app.use("/api/v1/routes", routerRoute);
app.use("/api/v1/stations", routerStation);
app.use("/api/v1/schedules", routerSearch);
app.use("/api/v1/schedules", routerSchedule);
app.use("/api/v1/trains", routerTrain);
app.use("/api/v1/tickets", routerTicket);
app.use("/api/v1/bookings", routerBooking);
app.use("/api/v1/templates", routerTemplate);

// 404 Fallback 
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler 
app.use(errorHandler);

export default app;
