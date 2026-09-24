import { Router, Request, Response, NextFunction } from "express";
import { PurchaseController } from "../controllers/purchaseController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new PurchaseController();

// 1. Summaries and Payables Ledgers
router.get("/outstanding", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getOutstanding(req, res, next)
);

// 2. Fetch Purchase Orders
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getPurchases(req, res, next)
);

router.get("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getPurchaseById(req, res, next)
);

// 3. Purchase Requisitions and Orders Management (Restricted to Owner/Warehouse)
router.post(
  "/",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: Request, res: Response, next: NextFunction) => controller.createPurchaseOrder(req, res, next)
);

router.post(
  "/:id/approve",
  requireAuth,
  requireRoles(["Owner"]),
  (req: Request, res: Response, next: NextFunction) => controller.approvePurchaseOrder(req, res, next)
);

// 4. Goods Receiving (GRN) processing (Owner/Warehouse)
router.post(
  "/:id/receive",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: Request, res: Response, next: NextFunction) => controller.receiveGoods(req, res, next)
);

// 5. Purchase Returns processing (Owner/Warehouse)
router.post(
  "/:id/return",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: Request, res: Response, next: NextFunction) => controller.returnGoods(req, res, next)
);

// 6. Log Supplier Payments (Owner/Accountant)
router.post(
  "/:id/payment",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.addPayment(req, res, next)
);

export default router;
