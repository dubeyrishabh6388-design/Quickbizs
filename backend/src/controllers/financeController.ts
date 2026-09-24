import { Response, NextFunction } from "express";
import { FinanceService } from "../services/financeService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { notificationService } from "../services/notificationService";

const financeService = new FinanceService();

export class FinanceController {
  async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { search, category, page, limit } = req.query;

      const result = await financeService.getExpenses({
        businessId,
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50,
      });

      res.json({
        success: true,
        message: "Expenses ledger records retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpenseById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await financeService.getExpenseById(businessId, id as string);

      res.json({
        success: true,
        message: "Expense record details retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { description, amount, category, notes } = req.body;

      if (!description || amount === undefined || !category) {
        const err: any = new Error("Description, amount, and category are mandatory.");
        err.statusCode = 400;
        throw err;
      }

      const result = await financeService.createExpense(businessId, {
        description,
        amount: parseFloat(amount),
        category,
        loggedBy: req.user!.email || "Owner",
        notes,
      });

      // Trigger "Expense Added" Notification
      await notificationService.createNotification({
        businessId,
        title: "Expense Added",
        message: `New expense log entered: ₹${parseFloat(amount).toLocaleString()} for ${category}. Status: Pending Approval.`,
        type: "Information",
        priority: "Low",
        module: "Finance",
        referenceType: "Expense",
        referenceId: result.id,
      });

      res.status(201).json({
        success: true,
        message: "Expense record logged successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async approveExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await financeService.approveExpense(businessId, id as string, req.user!.email || "Owner");

      // Trigger "Expense Approved" Notification
      await notificationService.createNotification({
        businessId,
        title: "Expense Approved",
        message: `Expense log of ₹${result.amount.toLocaleString()} has been approved.`,
        type: "Approval",
        priority: "Low",
        module: "Finance",
        referenceType: "Expense",
        referenceId: id as string,
      });

      res.json({
        success: true,
        message: "Expense approved and cash balance processed.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      await financeService.deleteExpense(businessId, id as string);

      res.json({
        success: true,
        message: "Expense soft-deleted successfully and cash flow adjusted.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerLedger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { customerId } = req.query;

      if (!customerId) {
        const err: any = new Error("Customer ID is required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await financeService.getCustomerLedger(businessId, String(customerId));

      res.json({
        success: true,
        message: "Customer ledger statements compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getSupplierLedger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { supplierId } = req.query;

      if (!supplierId) {
        const err: any = new Error("Supplier ID is required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await financeService.getSupplierLedger(businessId, String(supplierId));

      res.json({
        success: true,
        message: "Supplier ledger statements compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCashLedger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await financeService.getCashLedger(businessId);

      res.json({
        success: true,
        message: "Cash ledger records retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getBankTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await financeService.getBankTransactions(businessId);

      res.json({
        success: true,
        message: "Bank transactions log retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createDailyClosing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { actualCash, remarks } = req.body;

      if (actualCash === undefined) {
        const err: any = new Error("Actual closing cash amount is required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await financeService.createDailyClosing(businessId, {
        actualCash: parseFloat(actualCash),
        confirmedBy: req.user!.email || "Owner",
        remarks,
      });

      // Trigger "Daily Reconciled" Notification
      await notificationService.createNotification({
        businessId,
        title: "Daily Reconciled",
        message: `Daily register closing reconciled. Actual Cash: ₹${result.actualCash.toLocaleString()} | Difference: ₹${result.difference.toLocaleString()}.`,
        type: result.difference !== 0 ? "Warning" : "Success",
        priority: result.difference !== 0 ? "High" : "Low",
        module: "Finance",
        referenceType: "DailyClosing",
        referenceId: result.id,
      });

      res.status(201).json({
        success: true,
        message: "Daily store closing completed and locked.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
