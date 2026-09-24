import { NotificationRepository } from "../repositories/notificationRepository";
import { NotificationGateway } from "../gateways/notificationGateway";
import { logger } from "../utils/logger";

const notificationRepository = new NotificationRepository();

export class NotificationService {
  async createNotification(data: {
    businessId: string;
    userId?: string | null;
    title: string;
    message: string;
    type: string;
    priority: string;
    module: string;
    referenceType?: string | null;
    referenceId?: string | null;
  }) {
    try {
      const created = await notificationRepository.createNotification(data);

      // Determine role target based on module to broadcast properly
      let roleTarget: string | null = null;
      if (data.module === "Billing") {
        roleTarget = "Cashier";
      } else if (data.module === "Inventory") {
        roleTarget = "Warehouse";
      }

      // Emit new notification event in real-time
      NotificationGateway.emitNewNotification(
        data.businessId,
        data.userId || null,
        roleTarget,
        created
      );

      return created;
    } catch (err) {
      logger.error("Failed to create and broadcast notification:", err);
      throw err;
    }
  }

  async getNotifications(
    businessId: string,
    userId: string | null,
    role: string,
    filters?: {
      status?: "read" | "unread";
      module?: string;
    },
    search?: string
  ) {
    return notificationRepository.getNotifications(businessId, userId, role, filters, search);
  }

  async getUnreadCount(businessId: string, userId: string | null, role: string) {
    return notificationRepository.getUnreadCount(businessId, userId, role);
  }

  async markAsRead(id: string, businessId: string, userId: string | null) {
    const result = await notificationRepository.markAsRead(id, businessId);
    NotificationGateway.emitUpdateNotification(businessId, userId, { id, isRead: true });
    return result;
  }

  async markAllAsRead(businessId: string, userId: string | null, role: string) {
    const result = await notificationRepository.markAllAsRead(businessId, userId, role);
    NotificationGateway.emitUpdateNotification(businessId, userId, { allRead: true });
    return result;
  }

  async deleteNotification(id: string, businessId: string, userId: string | null) {
    const result = await notificationRepository.deleteNotification(id, businessId);
    NotificationGateway.emitDeleteNotification(businessId, userId, id);
    return result;
  }
}
export const notificationService = new NotificationService();
