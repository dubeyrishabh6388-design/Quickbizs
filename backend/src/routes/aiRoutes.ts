import { Router } from "express";
import { AIController } from "../controllers/aiController";
import { requireAuth } from "../middlewares/auth";
import { aiRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

// POST /api/v1/ai/chat — Authenticated and rate-limited
router.post("/chat", requireAuth, aiRateLimiter, AIController.chat);

// POST /api/v1/ai/forecast — Authenticated and rate-limited
router.post("/forecast", requireAuth, aiRateLimiter, AIController.forecast);

export default router;
