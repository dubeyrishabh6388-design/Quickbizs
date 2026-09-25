import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRouter from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { env, getAllowedOrigins } from "./config/environment";
import { prisma } from "./config/prisma";

const app = express();

// CORS configuration supporting local dev, Render previews, and production domains
const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (server-to-server, Render health checks, Postman)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((pattern) => {
        if (typeof pattern === "string") return pattern === origin;
        if (pattern instanceof RegExp) return pattern.test(origin);
        return false;
      });

      if (isAllowed || env.nodeEnv === "development") {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan Request Logging
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// Top-level root endpoint for Render web service status & pingers
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "quickbiz-backend",
    version: "1.0.0",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Top-level health check endpoint for Render Web Service
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error?.message || "Database ping failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// Version 1 API Routes
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
