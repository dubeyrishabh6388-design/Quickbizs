import { Router, Request, Response, NextFunction } from "express";
import { BillingController } from "../controllers/billingController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new BillingController();

// 1. Fetch sales invoice records
router.get("/recent", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getRecentOrders(req, res, next)
);

router.get("/today", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getTodayOrders(req, res, next)
);

router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getOrders(req, res, next)
);

router.get("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getOrderById(req, res, next)
);

// 2. Modify invoice status (limited to Owner and Cashier roles)
router.post(
  "/",
  requireAuth,
  requireRoles(["Owner", "Cashier"]),
  (req: Request, res: Response, next: NextFunction) => controller.createOrder(req, res, next)
);

router.post(
  "/:id/cancel",
  requireAuth,
  requireRoles(["Owner", "Cashier"]),
  (req: Request, res: Response, next: NextFunction) => controller.cancelOrder(req, res, next)
);

export default router;
