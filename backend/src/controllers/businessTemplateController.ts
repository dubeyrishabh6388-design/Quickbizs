import { Response, NextFunction } from "express";
import { BusinessTemplateService } from "../services/businessTemplateService";
import { AuthenticatedRequest } from "../middlewares/auth";

const service = new BusinessTemplateService();

export class BusinessTemplateController {
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await service.getTemplates();
      res.json({
        success: true,
        message: "Onboarding templates catalog fetched.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const type = String(req.params.businessType);
      const result = await service.getTemplate(type);
      res.json({
        success: true,
        message: `Template configuration for ${type} fetched.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async applyTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { businessType, sellingStyle, shopSize } = req.body;
      if (!businessType || !sellingStyle || !shopSize) {
        throw new Error("Missing parameters for onboarding setup.");
      }

      const result = await service.applyTemplate(businessId, businessType, sellingStyle, shopSize);
      res.json({
        success: true,
        message: "Shop type configuration applied successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async customizeTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { categories, widgets } = req.body;
      const result = await service.customizeTemplate(businessId, { categories, widgets });
      res.json({
        success: true,
        message: "Owner customizations saved successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
