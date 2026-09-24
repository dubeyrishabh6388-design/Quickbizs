import { Router, Request, Response, NextFunction } from "express";
import { FinanceController } from "../controllers/financeController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new FinanceController();

// 1. Expense logs CRUD
router.get("/expenses", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getExpenses(req, res, next)
);

router.get("/expenses/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getExpenseById(req, res, next)
);

router.post(
  "/expenses",
  requireAuth,
  requireRoles(["Owner", "Accountant", "Cashier"]),
  (req: Request, res: Response, next: NextFunction) => controller.createExpense(req, res, next)
);

router.post(
  "/expenses/:id/approve",
  requireAuth,
  requireRoles(["Owner"]),
  (req: Request, res: Response, next: NextFunction) => controller.approveExpense(req, res, next)
);

router.delete(
  "/expenses/:id",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.deleteExpense(req, res, next)
);

// 2. Customer and Supplier Statement Ledgers
router.get("/customer-ledger", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getCustomerLedger(req, res, next)
);

router.get("/supplier-ledger", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSupplierLedger(req, res, next)
);

// 3. Cash and Bank Auditing Ledgers
router.get("/cash-ledger", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getCashLedger(req, res, next)
);

router.get("/bank-transactions", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getBankTransactions(req, res, next)
);

// 4. Daily Store Closing report
router.post(
  "/daily-closing",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.createDailyClosing(req, res, next)
);

export default router;
