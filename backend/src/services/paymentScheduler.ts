import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";

export class PaymentScheduler {
  static initialize() {
    logger.info("Initializing Payment Engine Scheduler via Intervals...");

    // Check every hour for expired subscriptions
    setInterval(async () => {
      logger.info("[Scheduler] Checking expired subscriptions...");
      const now = new Date();

      try {
        const expiredBusinesses = await prisma.business.findMany({
          where: {
            subscriptionExpiresAt: { lt: now },
            status: "Active",
          },
        });

        for (const biz of expiredBusinesses) {
          logger.info(`[Scheduler] Suspending business subscription ${biz.id}`);
          await prisma.business.update({
            where: { id: biz.id },
            data: { status: "Suspended" },
          });
        }
      } catch (err) {
        logger.error("[Scheduler] Error during expired subscriptions check", err);
      }
    }, 60 * 60 * 1000);

    // Check every hour for expired payment links
    setInterval(async () => {
      logger.info("[Scheduler] Checking expired payment links...");
      const now = new Date();

      try {
        await prisma.paymentLink.updateMany({
          where: {
            expiresAt: { lt: now },
            status: "Pending",
          },
          data: { status: "Expired" },
        });
      } catch (err) {
        logger.error("[Scheduler] Error checking expired payment links", err);
      }
    }, 60 * 60 * 1000);
  }
}
