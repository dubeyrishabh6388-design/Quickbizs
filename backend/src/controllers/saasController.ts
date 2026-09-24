import { Response, NextFunction } from "express";
import { SaasService } from "../services/saasService";
import { AuthenticatedRequest } from "../middlewares/auth";

const saasService = new SaasService();

export class SaasController {
  async getTenants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const result = await saasService.getTenants();
      res.json({
        success: true,
        message: "Tenants list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTenantStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const { status } = req.body;

      const result = await saasService.updateTenantStatus(id as string, status);
      res.json({
        success: true,
        message: `Tenant status changed to ${status}.`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const result = await saasService.getSubscriptions();
      res.json({
        success: true,
        message: "Active subscriptions list retrieved.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const result = await saasService.updateSubscription(id as string, req.body);

      res.json({
        success: true,
        message: "Subscription parameters updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
