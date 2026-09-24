import { Response, NextFunction } from "express";
import { SystemService } from "../services/systemService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { notificationService } from "../services/notificationService";

const systemService = new SystemService();

export class SystemController {
  async getHealth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.getHealth();
      res.json({
        success: true,
        message: "System health check diagnostics completed.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await systemService.getAuditLogs(businessId);

      res.json({
        success: true,
        message: "Audit logs history retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getBackups(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await systemService.getBackups(businessId);

      res.json({
        success: true,
        message: "Database backups history retrieved.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createBackup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const businessId = req.user!.tenantId;
    try {
      const result = await systemService.createBackup(businessId);

      // Trigger "Backup Completed" Notification
      await notificationService.createNotification({
        businessId,
        title: "Backup Completed",
        message: `Database backup snapshot ${result.filename} created successfully.`,
        type: "Success",
        priority: "Low",
        module: "System",
      });

      res.status(201).json({
        success: true,
        message: "Manual database snapshot created successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Trigger "Backup Failed" Notification
      try {
        await notificationService.createNotification({
          businessId,
          title: "Backup Failed",
          message: "Failed to create database backup snapshot. Error details logged.",
          type: "Error",
          priority: "Critical",
          module: "System",
        });
      } catch (err) {
        // Suppress notification creation failures to prevent hiding root error
      }
      next(error);
    }
  }

  async restoreBackup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.body;

      await systemService.restoreBackup(businessId, id as string);

      // Trigger "Backup Restored" Notification
      await notificationService.createNotification({
        businessId,
        title: "Backup Restored",
        message: "Database restored successfully from snapshot.",
        type: "Warning",
        priority: "High",
        module: "System",
      });

      res.json({
        success: true,
        message: "Database restored successfully. Cash registers synced.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
