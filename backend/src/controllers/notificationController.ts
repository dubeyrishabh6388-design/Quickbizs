import { Response, NextFunction } from "express";
import { NotificationService } from "../services/notificationService";
import { AuthenticatedRequest } from "../middlewares/auth";

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || null;
      const role = req.user!.role;
      const { status, module, search } = req.query;

      const filters: any = {};
      if (status === "read" || status === "unread") {
        filters.status = status;
      }
      if (module) {
        filters.module = String(module);
      }

      const results = await notificationService.getNotifications(
        businessId,
        userId,
        role,
        filters,
        search ? String(search) : undefined
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || null;
      const role = req.user!.role;

      const results = await notificationService.getNotifications(
        businessId,
        userId,
        role,
        { status: "unread" }
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || null;
      const role = req.user!.role;

      const count = await notificationService.getUnreadCount(businessId, userId, role);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || null;
      const { id } = req.params;

      await notificationService.markAsRead(id as string, businessId, userId);

      res.json({
        success: true,
        message: "Notification marked as read.",
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || null;
      const role = req.user!.role;

      await notificationService.markAllAsRead(businessId, userId, role);

      res.json({
        success: true,
        message: "All notifications marked as read.",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || null;
      const { id } = req.params;

      await notificationService.deleteNotification(id as string, businessId, userId);

      res.json({
        success: true,
        message: "Notification deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}
