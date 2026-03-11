import express from "express";
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

const app = express();

// ─── Global Middlewares ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
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
app.use("/api/trains", routerTrain);
app.use("/api/tickets", routerTicket);

// 404 Fallback 
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler 
app.use(errorHandler);

export default app;
