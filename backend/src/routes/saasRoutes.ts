import { Router, Request, Response, NextFunction } from "express";
import { SaasController } from "../controllers/saasController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new SaasController();

router.get("/tenants", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getTenants(req, res, next)
);

router.put("/tenants/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateTenantStatus(req, res, next)
);

router.get("/subscriptions", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSubscriptions(req, res, next)
);

router.put("/subscriptions/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateSubscription(req, res, next)
);

export default router;
