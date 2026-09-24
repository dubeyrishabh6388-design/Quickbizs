import { prisma } from "../config/prisma";
import { notificationService } from "../services/notificationService";
import { logger } from "../utils/logger";

export class NotificationScheduler {
  static start() {
    logger.info("Initializing Notification Engine Scheduler...");

    // Run scans every 15 minutes
    setInterval(async () => {
      try {
        await this.scanLowStock();
        await this.scanPendingDailyClosings();
        await this.scanSubscriptionExpiry();
      } catch (err) {
        logger.error("Error running NotificationScheduler sweeps:", err);
      }
    }, 15 * 60 * 1000);
  }

  private static async scanLowStock() {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        stock: { lte: prisma.product.fields.minStock },
      },
    });

    for (const prod of lowStockProducts) {
      // Check if a low stock warning is already unread
      const existing = await prisma.notification.findFirst({
        where: {
          businessId: prod.businessId,
          module: "Inventory",
          referenceType: "Product",
          referenceId: prod.id,
          isRead: false,
        },
      });

      if (!existing) {
        await notificationService.createNotification({
          businessId: prod.businessId,
          title: `Low Stock: ${prod.name}`,
          message: `${prod.name} has dropped below the minimum threshold (Stock: ${prod.stock} / Min: ${prod.minStock}).`,
          type: prod.stock === 0 ? "Critical" : "Warning",
          priority: prod.stock === 0 ? "Critical" : "High",
          module: "Inventory",
          referenceType: "Product",
          referenceId: prod.id,
        });
      }
    }
  }

  private static async scanPendingDailyClosings() {
    const today = new Date();
    // Only warn if past 8 PM (20:00)
    if (today.getHours() < 20) return;

    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const businesses = await prisma.business.findMany({ where: { status: "Active" } });

    for (const biz of businesses) {
      const closing = await prisma.dailyClosing.findFirst({
        where: {
          businessId: biz.id,
          closingDate: { gte: startOfToday },
        },
      });

      if (!closing) {
        // Send a reminder notification if one hasn't been generated in the last 4 hours
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
        const existing = await prisma.notification.findFirst({
          where: {
            businessId: biz.id,
            module: "Finance",
            title: "Daily Closing Pending",
            createdAt: { gte: fourHoursAgo },
          },
        });

        if (!existing) {
          await notificationService.createNotification({
            businessId: biz.id,
            title: "Daily Closing Pending",
            message: "Today's daily billing ledger register closing is outstanding. Please reconcile cash box drawer.",
            type: "Reminder",
            priority: "High",
            module: "Finance",
          });
        }
      }
    }
  }

  private static async scanSubscriptionExpiry() {
    const warningPeriod = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const expiringBusinesses = await prisma.business.findMany({
      where: {
        status: "Active",
        subscriptionExpiresAt: {
          lte: warningPeriod,
          gte: new Date(),
        },
      },
    });

    for (const biz of expiringBusinesses) {
      const existing = await prisma.notification.findFirst({
        where: {
          businessId: biz.id,
          module: "System",
          title: "Subscription Expiring Soon",
          isRead: false,
        },
      });

      if (!existing) {
        await notificationService.createNotification({
          businessId: biz.id,
          title: "Subscription Expiring Soon",
          message: `Your QuickBizs SaaS plan subscription expires on ${biz.subscriptionExpiresAt?.toLocaleDateString()}. Please renew to avoid service disruption.`,
          type: "Warning",
          priority: "High",
          module: "System",
        });
      }
    }
  }
}
