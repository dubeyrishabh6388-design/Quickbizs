import { Router } from "express";
import { AIController } from "../controllers/aiController";

const router = Router();

// POST /api/ai/chat
router.post("/chat", AIController.chat);

// POST /api/ai/forecast
router.post("/forecast", AIController.forecast);

export default router;
