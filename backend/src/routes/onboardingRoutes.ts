import { Router } from "express";
import { OnboardingController } from "../controllers/onboardingController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new OnboardingController();

// Unauthenticated: Start onboarding (step 1 basic registration details)
router.post("/onboarding/start", (req, res, next) => controller.start(req, res, next));

// Authenticated: Complete configuration / get features/ preferences
router.post("/onboarding/complete", requireAuth, (req, res, next) => controller.complete(req, res, next));
router.get("/business/template", requireAuth, (req, res, next) => controller.getTemplate(req, res, next));
router.put("/business/preferences", requireAuth, (req, res, next) => controller.updatePreferences(req, res, next));
router.get("/business/features", requireAuth, (req, res, next) => controller.getFeatures(req, res, next));

export default router;
