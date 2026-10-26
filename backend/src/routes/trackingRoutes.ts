import { Router, Request, Response, NextFunction } from "express";
import { trackingController } from "../controllers/trackingController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();

// 1. O(1) Serial / IMEI scan lookup across store inventory
router.get("/serial/:identifier", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  trackingController.lookupSerial(req, res, next)
);

// 2. Fetch FEFO-ordered active batches for a product
router.get("/batches/:productId", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  trackingController.getBatches(req, res, next)
);

// 3. Guided opening stock reconciliation for serial/batch onboarding (Owner role)
router.post(
  "/reconcile",
  requireAuth,
  requireRoles(["Owner", "Cashier"]),
  (req: Request, res: Response, next: NextFunction) => trackingController.reconcileOpeningStock(req, res, next)
);

// 4. Issue Sales Return (Credit Note) with serial/batch disposition
router.post(
  "/returns",
  requireAuth,
  requireRoles(["Owner", "Cashier"]),
  (req: Request, res: Response, next: NextFunction) => trackingController.createSalesReturn(req, res, next)
);

export default router;
