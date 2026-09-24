import { Response, NextFunction } from "express";
import { globalSearchService } from "../services/globalSearchService";
import { AuthenticatedRequest } from "../middlewares/auth";

export class GlobalSearchController {
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || "System";
      const role = req.user!.role;
      const { q } = req.query;

      if (!q) {
        res.json({ success: true, data: {} });
        return;
      }

      const result = await globalSearchService.executeSearch(businessId, userId, role, String(q));
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || "System";

      const result = await globalSearchService.getRecentSearches(businessId, userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || "System";

      const result = await globalSearchService.getFavorites(businessId, userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || "System";
      const { targetModule, targetId, title, subtitle } = req.body;

      if (!targetModule || !targetId || !title) {
        const err: any = new Error("targetModule, targetId, and title are required parameters.");
        err.statusCode = 400;
        throw err;
      }

      const result = await globalSearchService.addFavorite(businessId, userId, {
        targetModule,
        targetId,
        title,
        subtitle,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || "System";
      const { id } = req.params;

      await globalSearchService.removeFavorite(businessId, userId, id as string);

      res.json({
        success: true,
        message: "Search favorite item removed successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}
export const globalSearchController = new GlobalSearchController();
