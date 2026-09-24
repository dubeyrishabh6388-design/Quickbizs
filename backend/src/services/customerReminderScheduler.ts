import { prisma } from "../config/prisma";
import { notificationService } from "./notificationService";
import { logger } from "../utils/logger";

export class CustomerReminderScheduler {
  static start() {
    logger.info("Initializing Customer Credit Reminder Scheduler...");
    
    // Poll every 5 minutes
    setInterval(async () => {
      try {
        const now = new Date();
        const pendingReminders = await prisma.customerReminder.findMany({
          where: {
            dueAt: { lte: now },
            status: "Pending",
          },
          include: { customer: true },
        });

        for (const reminder of pendingReminders) {
          // Trigger Notification
          await notificationService.createNotification({
            businessId: reminder.businessId,
            title: `Reminder: ${reminder.type}`,
            message: `Follow up with customer ${reminder.customer.name} (${reminder.customer.mobile}). Msg: ${reminder.message}`,
            type: "Warning",
            priority: "Medium",
            module: "Customers",
            referenceType: "Customer",
            referenceId: reminder.customerId,
          });

          // Mark reminder as Completed
          await prisma.customerReminder.update({
            where: { id: reminder.id },
            data: { status: "Completed" },
          });
        }
      } catch (err) {
        logger.error("Error in CustomerReminderScheduler poll iteration:", err);
      }
    }, 1000 * 60 * 5);
  }
}
