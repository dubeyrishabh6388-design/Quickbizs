import { Response, NextFunction } from "express";
import { RecoveryService } from "../services/recoveryService";
import { AuthenticatedRequest } from "../middlewares/auth";

const recoveryService = new RecoveryService();

export class RecoveryController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await recoveryService.getRecoveryDashboard(businessId);
      res.json({
        success: true,
        message: "Recovery Center dashboard stats compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async performAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id);
      const { actionType, notes } = req.body;
      const result = await recoveryService.performAction(id, businessId, actionType, notes);
      res.json({
        success: true,
        message: "Recovery action logged and task updated.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async resolveTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id);
      const result = await recoveryService.resolveTask(id, businessId);
      res.json({
        success: true,
        message: "Recovery task resolved and ledger balance adjusted.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
