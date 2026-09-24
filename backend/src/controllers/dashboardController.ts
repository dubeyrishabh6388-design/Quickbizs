import { Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboardService";
import { AuthenticatedRequest } from "../middlewares/auth";

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboardOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await dashboardService.getDashboardOverview(businessId);

      res.json({
        success: true,
        message: "Dashboard summary aggregates retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getBusinessHealth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await dashboardService.getBusinessHealth(businessId);

      res.json({
        success: true,
        message: "Business health scoring compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getKPIs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await dashboardService.getKPIs(businessId);

      res.json({
        success: true,
        message: "Dashboard cards KPIs compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCharts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await dashboardService.getCharts(businessId);

      res.json({
        success: true,
        message: "Sales trend comparison graph compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await dashboardService.getAlerts(businessId);

      res.json({
        success: true,
        message: "Active operations alerts queue retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await dashboardService.getTopProducts(businessId);

      res.json({
        success: true,
        message: "Top selling product list compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await dashboardService.getTopCustomers(businessId);

      res.json({
        success: true,
        message: "Top spending customer profiles compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopSuppliers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await dashboardService.getTopSuppliers(businessId);

      res.json({
        success: true,
        message: "Top suppliers payables ledger profiles compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
