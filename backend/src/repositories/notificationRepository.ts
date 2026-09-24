import { prisma } from "../config/prisma";

export class NotificationRepository {
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
    return prisma.notification.create({
      data: {
        businessId: data.businessId,
        userId: data.userId || null,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        module: data.module,
        referenceType: data.referenceType || null,
        referenceId: data.referenceId || null,
        isRead: false,
      },
    });
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
    const whereClause: any = {
      businessId,
    };

    // Filter by role target or user specific room
    if (userId) {
      if (role !== "Owner" && role !== "SuperAdmin") {
        whereClause.OR = [
          { userId },
          { userId: null }, // Global/role target notifications
        ];
      }
    }

    if (filters?.status === "read") {
      whereClause.isRead = true;
    } else if (filters?.status === "unread") {
      whereClause.isRead = false;
    }

    if (filters?.module && filters.module !== "All") {
      whereClause.module = filters.module;
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search } },
            { message: { contains: search } },
            { module: { contains: search } },
          ],
        },
      ];
    }

    return prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
  }

  async getUnreadCount(businessId: string, userId: string | null, role: string) {
    const whereClause: any = {
      businessId,
      isRead: false,
    };

    if (userId && role !== "Owner" && role !== "SuperAdmin") {
      whereClause.OR = [
        { userId },
        { userId: null },
      ];
    }

    return prisma.notification.count({
      where: whereClause,
    });
  }

  async markAsRead(id: string, businessId: string) {
    return prisma.notification.updateMany({
      where: { id, businessId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(businessId: string, userId: string | null, role: string) {
    const whereClause: any = {
      businessId,
      isRead: false,
    };

    if (userId && role !== "Owner" && role !== "SuperAdmin") {
      whereClause.OR = [
        { userId },
        { userId: null },
      ];
    }

    return prisma.notification.updateMany({
      where: whereClause,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async deleteNotification(id: string, businessId: string) {
    return prisma.notification.deleteMany({
      where: { id, businessId },
    });
  }
}
