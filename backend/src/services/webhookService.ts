import { paymentRepository } from "../repositories/paymentRepository";
import { paymentService } from "./paymentService";
import { notificationService } from "./notificationService";
import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";

export class WebhookService {
  async handleWebhook(businessId: string, data: {
    eventId: string;
    event: string;
    payload: any;
  }) {
    const isProcessed = await paymentRepository.isWebhookProcessed(data.eventId);
    if (isProcessed) {
      logger.info(`[WebhookService] Event ${data.eventId} already processed.`);
      return { success: true, message: "Webhook skipped (duplicate)" };
    }

    logger.info(`[WebhookService] Processing event ${data.event} - ${data.eventId}`);

    switch (data.event) {
      case "payment.captured": {
        const orderId = data.payload.payment.entity.order_id;
        const paymentId = data.payload.payment.entity.id;
        const tx = await paymentRepository.getTransactionByOrderId(orderId);
        if (tx) {
          await paymentService.completePayment(businessId, tx.id, paymentId, "Captured via Hook");
        }
        break;
      }
      case "payment.failed": {
        const orderId = data.payload.payment.entity.order_id;
        const paymentId = data.payload.payment.entity.id;
        const tx = await paymentRepository.getTransactionByOrderId(orderId);
        if (tx) {
          await paymentRepository.updateTransactionStatus({
            id: tx.id,
            status: "Failed",
            gatewayPaymentId: paymentId,
            remarks: "Payment failed at gateway checkout.",
          });

          await notificationService.createNotification({
            businessId,
            title: "Razorpay Checkout Failed",
            message: `Checkout failed for transaction ₹${tx.amount.toLocaleString()}`,
            type: "Error",
            priority: "High",
            module: "Finance",
          });
        }
        break;
      }
      case "refund.processed": {
        const paymentId = data.payload.refund.entity.payment_id;
        const refundId = data.payload.refund.entity.id;
        const amount = data.payload.refund.entity.amount / 100;
        
        const tx = await prisma.paymentTransaction.findFirst({
          where: { gatewayPaymentId: paymentId, businessId },
        });

        if (tx) {
          await paymentService.initiateRefund(businessId, {
            transactionId: tx.id,
            amount,
          });
        }
        break;
      }
      case "subscription.charged": {
        const subId = data.payload.subscription.entity.id;
        const business = await prisma.business.findFirst({
          where: { id: businessId },
        });

        if (business) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1); // extend 1 month
          await prisma.business.update({
            where: { id: business.id },
            data: {
              plan: "Premium",
              status: "Active",
              subscriptionExpiresAt: expiresAt,
            },
          });
        }
        break;
      }
      case "subscription.cancelled": {
        const subId = data.payload.subscription.entity.id;
        const business = await prisma.business.findFirst({
          where: { id: businessId },
        });

        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: {
              plan: "Basic",
              status: "Suspended",
              subscriptionExpiresAt: new Date(),
            },
          });
        }
        break;
      }
      default:
        logger.info(`[WebhookService] Unhandled event category ${data.event}`);
    }

    // Save webhook log to avoid duplicate processing
    await paymentRepository.logWebhook(businessId, data.eventId, "Razorpay", data.payload);
    return { success: true };
  }
}
export const webhookService = new WebhookService();
