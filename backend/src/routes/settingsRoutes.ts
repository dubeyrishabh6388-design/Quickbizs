import { Router, Request, Response, NextFunction } from "express";
import { SettingsController } from "../controllers/settingsController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new SettingsController();

// Expose standard settings configurations
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSettings(req, res, next)
);

router.put("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateSettings(req, res, next)
);

router.get("/company", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSettings(req, res, next)
);

router.put("/company", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateSettings(req, res, next)
);

router.get("/invoice-settings", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSettings(req, res, next)
);

router.put("/invoice-settings", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateSettings(req, res, next)
);

router.get("/tax-settings", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSettings(req, res, next)
);

router.put("/tax-settings", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateSettings(req, res, next)
);

export default router;
