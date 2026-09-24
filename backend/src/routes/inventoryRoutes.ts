import { Router, Request, Response, NextFunction } from "express";
import { InventoryController } from "../controllers/inventoryController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new InventoryController();

// 1. Stock indicators and valuation reports
router.get("/low-stock", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getLowStock(req, res, next)
);

router.get("/out-of-stock", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getOutOfStock(req, res, next)
);

router.get(
  "/valuation",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.getValuation(req, res, next)
);

// 2. Stock movements ledger logs
router.get("/stock-movement", requireAuth, (req: any, res: any, next: any) =>
  controller.getStockMovements(req, res, next)
);

// 3. Transactions List log
router.get("/transactions", requireAuth, (req: any, res: any, next: any) =>
  controller.getTransactions(req, res, next)
);

// 4. Retrieve inventory items
router.get("/", requireAuth, (req: any, res: any, next: any) =>
  controller.getInventory(req, res, next)
);

router.get("/:id", requireAuth, (req: any, res: any, next: any) =>
  controller.getInventoryById(req, res, next)
);

// 5. Stock modification actions (restricted to Owner and Warehouse roles)
router.post(
  "/",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.createInventory(req, res, next)
);

router.post(
  "/add",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.addStock(req, res, next)
);

router.post(
  "/reduce",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.reduceStock(req, res, next)
);

router.post(
  "/adjust",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.adjustStock(req, res, next)
);

router.post(
  "/opening-stock",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.setOpeningStock(req, res, next)
);

router.post(
  "/transfer",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.transferStock(req, res, next)
);

router.post(
  "/reserve",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.reserveStock(req, res, next)
);

router.post(
  "/release",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.releaseStock(req, res, next)
);

export default router;
