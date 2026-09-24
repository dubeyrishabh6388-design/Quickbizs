import { Response, NextFunction } from "express";
import { CounterService } from "../services/counterService";
import { AuthenticatedRequest } from "../middlewares/auth";

const counterService = new CounterService();

export class CounterController {
  async getHome(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await counterService.getCounterHome(businessId);
      res.json({
        success: true,
        message: "Counter Mode home screen data compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopular(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await counterService.getPopularProducts(businessId);
      res.json({
        success: true,
        message: "Popular products retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await counterService.getRecentSales(businessId);
      res.json({
        success: true,
        message: "Recent counter sales retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCombos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await counterService.getCombos(businessId);
      res.json({
        success: true,
        message: "Popular combinations retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async recordSale(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { paymentMethod, totalAmount, items, offlineId } = req.body;
      const result = await counterService.recordSale(
        businessId,
        paymentMethod,
        totalAmount,
        items,
        offlineId
      );
      res.json({
        success: true,
        message: "Counter sale recorded and synced successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleRushMode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { rushMode } = req.body;
      const result = await counterService.toggleRushMode(businessId, rushMode);
      res.json({
        success: true,
        message: "Rush mode preference toggled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async saveSellingMode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { sellingMode } = req.body;
      const result = await counterService.saveSellingMode(businessId, sellingMode);
      res.json({
        success: true,
        message: "Selling experience mode preference updated.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
