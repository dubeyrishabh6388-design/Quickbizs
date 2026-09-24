import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRouter from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

import { env } from "./config/environment";

const app = express();

// Middlewares
app.use(cors({
  origin: [env.frontendUrl, "http://localhost:5173", "https://quickbizs.com"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan Request Logging
app.use(morgan("dev"));

// Version 1 API Routes
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
