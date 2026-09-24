import { Response, NextFunction } from "express";
import { InstantCheckoutService } from "../services/instantCheckoutService";
import { AuthenticatedRequest } from "../middlewares/auth";

const service = new InstantCheckoutService();

export class InstantCheckoutController {
  async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await service.getPreferences(businessId);
      res.json({
        success: true,
        message: "Checkout preferences compiled.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await service.getRecentOrders(businessId);
      res.json({
        success: true,
        message: "Recent orders templates compiled.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { paymentMethod, totalAmount, items, offlineId } = req.body;
      const result = await service.completeCheckout(
        businessId,
        paymentMethod,
        totalAmount,
        items,
        offlineId
      );
      res.json({
        success: true,
        message: "Instant checkout complete.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async repeatOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { recentOrderId } = req.body;
      const result = await service.repeatOrder(businessId, recentOrderId);
      res.json({
        success: true,
        message: "Repeat order billed successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { cartName, items } = req.body;
      const result = await service.updateQueue(businessId, cartName, items);
      res.json({
        success: true,
        message: "Cart queue updated.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await service.getQueue(businessId);
      res.json({
        success: true,
        message: "Active cart queues retrieved.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
