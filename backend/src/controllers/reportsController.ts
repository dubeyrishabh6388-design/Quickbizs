import { Response, NextFunction } from "express";
import { ReportsService } from "../services/reportsService";
import { AuthenticatedRequest } from "../middlewares/auth";

const reportsService = new ReportsService();

export class ReportsController {
  async getDashboardSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await reportsService.getDashboardSummary(businessId);

      res.json({
        success: true,
        message: "Dashboard summary stats compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { startDate, endDate } = req.query;

      const result = await reportsService.getSalesReports(businessId, {
        startDate: startDate ? new Date(String(startDate)) : undefined,
        endDate: endDate ? new Date(String(endDate)) : undefined,
      });

      res.json({
        success: true,
        message: "Sales analytics reports compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchasesReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { startDate, endDate } = req.query;

      const result = await reportsService.getPurchasesReports(businessId, {
        startDate: startDate ? new Date(String(startDate)) : undefined,
        endDate: endDate ? new Date(String(endDate)) : undefined,
      });

      res.json({
        success: true,
        message: "Purchases analytics reports compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await reportsService.getInventoryReports(businessId);

      res.json({
        success: true,
        message: "Inventory stock analytics reports compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomersReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await reportsService.getCustomersReports(businessId);

      res.json({
        success: true,
        message: "Customer relations analytics compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getSuppliersReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await reportsService.getSuppliersReports(businessId);

      res.json({
        success: true,
        message: "Supplier accounts reports compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpensesReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { startDate, endDate } = req.query;

      const result = await reportsService.getExpensesReports(businessId, {
        startDate: startDate ? new Date(String(startDate)) : undefined,
        endDate: endDate ? new Date(String(endDate)) : undefined,
      });

      res.json({
        success: true,
        message: "Expenses analysis compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getFinancialReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { startDate, endDate } = req.query;

      const result = await reportsService.getFinancialReports(businessId, {
        startDate: startDate ? new Date(String(startDate)) : undefined,
        endDate: endDate ? new Date(String(endDate)) : undefined,
      });

      res.json({
        success: true,
        message: "Profit & Loss ledger report compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
