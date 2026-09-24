import { Router, Request, Response, NextFunction } from "express";
import { ReportsController } from "../controllers/reportsController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new ReportsController();

// 1. Core dashboard numbers
router.get("/dashboard", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getDashboardSummary(req, res, next)
);

// 2. Sales and Inventory aggregations
router.get("/sales", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSalesReports(req, res, next)
);

router.get("/inventory", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getInventoryReports(req, res, next)
);

router.get("/customers", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getCustomersReports(req, res, next)
);

// 3. Purchase ledger summaries
router.get(
  "/purchases",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.getPurchasesReports(req, res, next)
);

router.get(
  "/suppliers",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.getSuppliersReports(req, res, next)
);

// 4. Financial margins auditing (Owner/Accountant)
router.get(
  "/expenses",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.getExpensesReports(req, res, next)
);

router.get(
  "/financial",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.getFinancialReports(req, res, next)
);

export default router;
