import { Response, NextFunction } from "express";
import { SettingsService } from "../services/settingsService";
import { AuthenticatedRequest } from "../middlewares/auth";

const settingsService = new SettingsService();

export class SettingsController {
  async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await settingsService.getSettings(businessId);

      res.json({
        success: true,
        message: "Business settings retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await settingsService.updateSettings(businessId, req.body);

      res.json({
        success: true,
        message: "Business configuration settings updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
