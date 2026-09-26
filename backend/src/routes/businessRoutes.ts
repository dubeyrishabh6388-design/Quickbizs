import { Router } from "express";
import { BusinessController } from "../controllers/businessController";
import { requireAuth } from "../middlewares/auth";

import { OnboardingController } from "../controllers/onboardingController";

const router = Router();
const controller = new BusinessController();
const onboardingController = new OnboardingController();

router.get("/nearby", (req, res, next) => controller.getNearby(req, res, next));
router.get("/features", requireAuth as any, (req: any, res: any, next: any) =>
  onboardingController.getFeatures(req, res, next)
);
router.post("/", (req, res, next) => controller.create(req, res, next));
router.get("/:id", (req, res, next) => controller.get(req, res, next));
router.put("/:id", requireAuth as any, (req: any, res: any, next: any) => controller.update(req, res, next));
router.delete("/:id", requireAuth as any, (req: any, res: any, next: any) => controller.delete(req, res, next));
router.put("/:id/settings", requireAuth as any, (req: any, res: any, next: any) => controller.updateSettings(req, res, next));
router.put("/:id/status", requireAuth as any, (req: any, res: any, next: any) => controller.updateStatus(req, res, next));

export default router;
