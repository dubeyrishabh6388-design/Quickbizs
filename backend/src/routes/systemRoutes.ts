import { Router, Request, Response, NextFunction } from "express";
import { SystemController } from "../controllers/systemController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new SystemController();

router.get("/health", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getHealth(req, res, next)
);

router.get("/audit", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getAuditLogs(req, res, next)
);

router.get("/backups", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getBackups(req, res, next)
);

router.post("/backups", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.createBackup(req, res, next)
);

router.post("/restore", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.restoreBackup(req, res, next)
);

export default router;
