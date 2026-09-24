import { Router } from "express";
import { PickupOrderController } from "../controllers/pickupOrderController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new PickupOrderController();

// --- Merchant Paths (Precedence over wildcard :id) ---
router.get(
  "/merchant/orders",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.getMerchantOrders(req, res, next)
);

router.post(
  "/merchant/orders/:id/accept",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.acceptOrder(req, res, next)
);

router.post(
  "/merchant/orders/:id/reject",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.rejectOrder(req, res, next)
);

router.post(
  "/merchant/orders/:id/start-packing",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.startPacking(req, res, next)
);

router.post(
  "/merchant/orders/:id/mark-packed",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.markItemPacked(req, res, next)
);

router.post(
  "/merchant/orders/:id/ready",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.markOrderReady(req, res, next)
);

router.post(
  "/merchant/orders/:id/verify-pin",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.verifyPickupPin(req, res, next)
);

router.post(
  "/merchant/orders/:id/complete",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.completePickup(req, res, next)
);

router.post(
  "/merchant/orders/:id/cancel",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Warehouse"]),
  (req: any, res: any, next: any) => controller.cancelMerchantOrder(req, res, next)
);

// --- Customer Paths ---
router.post("/", requireAuth, (req: any, res: any, next: any) => controller.createOrder(req, res, next));
router.get("/", requireAuth, (req: any, res: any, next: any) => controller.getCustomerOrders(req, res, next));
router.get("/:id", requireAuth, (req: any, res: any, next: any) => controller.getCustomerOrderById(req, res, next));
router.delete("/:id", requireAuth, (req: any, res: any, next: any) => controller.cancelCustomerOrder(req, res, next));

export default router;
