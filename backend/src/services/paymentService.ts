import { prisma } from "../config/prisma";
import { razorpayService } from "./razorpayService";
import { paymentRepository } from "../repositories/paymentRepository";
import { notificationService } from "./notificationService";
import { logger } from "../utils/logger";

export class PaymentService {
  async createOrder(businessId: string, userId: string, data: {
    customerId?: string;
    supplierId?: string;
    invoiceId?: string;
    purchaseId?: string;
    subscriptionId?: string;
    amount: number;
    paymentMethod: string;
    remarks?: string;
  }) {
    logger.info(`[PaymentService] Creating payment order. Amount: ${data.amount}`);
    
    // 1. Create order on Razorpay gateway abstraction
    const orderData = await razorpayService.createOrder(data.amount, "INR", `rec_${Date.now()}`);

    // 2. Save PaymentOrder entry
    await paymentRepository.createPaymentOrder({
      businessId,
      userId,
      amount: data.amount,
      currency: "INR",
      gatewayOrderId: orderData.id,
    });

    // 3. Log Pending PaymentTransaction
    const tx = await paymentRepository.createTransaction({
      businessId,
      userId,
      customerId: data.customerId,
      supplierId: data.supplierId,
      invoiceId: data.invoiceId,
      purchaseId: data.purchaseId,
      subscriptionId: data.subscriptionId,
      gateway: "Razorpay",
      gatewayOrderId: orderData.id,
      amount: data.amount,
      status: "Pending",
      paymentMethod: data.paymentMethod,
      remarks: data.remarks,
    });

    // 4. Log event history
    await paymentRepository.logPaymentEvent(businessId, tx.id, "Info", `Generated pending payment order ${orderData.id}`);

    return {
      transactionId: tx.id,
      gatewayOrderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
    };
  }

  async verifyPayment(businessId: string, data: {
    transactionId: string;
    gatewayPaymentId: string;
    gatewayOrderId: string;
    signature: string;
  }) {
    const tx = await paymentRepository.getTransaction(data.transactionId);
    if (!tx) throw new Error("Transaction record not found.");

    if (tx.status === "Success") return tx;

    // Verify signature using Razorpay abstraction rules
    const verified = razorpayService.verifySignature(data.gatewayOrderId, data.gatewayPaymentId, data.signature);
    if (!verified) {
      await paymentRepository.updateTransactionStatus({
        id: tx.id,
        status: "Failed",
        remarks: "Signature verification failed.",
      });
      throw new Error("Invalid payment signature.");
    }

    // Process successful capture routine
    return this.completePayment(businessId, tx.id, data.gatewayPaymentId, data.signature);
  }

  async completePayment(businessId: string, transactionId: string, gatewayPaymentId: string, signature: string) {
    return prisma.$transaction(async (db) => {
      const transaction = await db.paymentTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) throw new Error("Transaction entry missing.");
      if (transaction.status === "Success") return transaction;

      // 1. Mark transaction Success
      const updatedTx = await db.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: "Success",
          gatewayPaymentId,
          gatewaySignature: signature,
        },
      });

      // 2. Settle Customer Dues & Ledger
      if (transaction.customerId) {
        const customer = await db.customer.findFirst({
          where: { id: transaction.customerId, businessId },
        });

        if (customer) {
          const newDues = Math.max(0, customer.pendingAmount - transaction.amount);
          await db.customer.update({
            where: { id: customer.id },
            data: {
              pendingAmount: newDues,
              rewardPoints: customer.rewardPoints + Math.floor(transaction.amount / 100),
            },
          });

          await db.customerLedger.create({
            data: {
              businessId,
              customerId: customer.id,
              transactionType: "Payment",
              referenceNumber: updatedTx.id,
              amount: transaction.amount,
              runningBalance: newDues,
              description: "Razorpay payment completed successfully.",
            },
          });
        }
      }

      // 3. Settle Supplier Payments
      if (transaction.supplierId) {
        const supplier = await db.supplier.findFirst({
          where: { id: transaction.supplierId, businessId },
        });

        if (supplier) {
          const newOutstanding = Math.max(0, supplier.outstandingAmount - transaction.amount);
          await db.supplier.update({
            where: { id: supplier.id },
            data: { outstandingAmount: newOutstanding },
          });

          if (transaction.purchaseId) {
            await db.purchasePayment.create({
              data: {
                businessId,
                purchaseOrderId: transaction.purchaseId,
                paymentMethod: transaction.paymentMethod,
                amount: transaction.amount,
                referenceNumber: updatedTx.id,
                paidBy: "Razorpay Engine",
              },
            });
          }
        }
      }

      // 4. Update Invoice Status
      if (transaction.invoiceId) {
        const order = await db.order.findFirst({
          where: { id: transaction.invoiceId, businessId },
        });
        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: { paymentStatus: "Paid" },
          });
        }
      }

      // 5. Update Subscriptions details
      if (transaction.subscriptionId) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 1-month plan extensions

        await db.business.update({
          where: { id: businessId },
          data: {
            plan: "Premium",
            status: "Active",
            subscriptionExpiresAt: expiresAt,
          },
        });
      }

      // 6. Log timeline & reports event logs
      await db.paymentLog.create({
        data: {
          businessId,
          transactionId: updatedTx.id,
          level: "Info",
          message: `Captured transaction ₹${transaction.amount} successfully. Payment ID: ${gatewayPaymentId}`,
        },
      });

      // 7. Fire notification
      await notificationService.createNotification({
        businessId,
        title: "Payment Received",
        message: `Universal payment of ₹${transaction.amount.toLocaleString()} received via ${transaction.paymentMethod}.`,
        type: "Success",
        priority: "High",
        module: "Finance",
        referenceType: "Payment",
        referenceId: updatedTx.id,
      });

      return updatedTx;
    });
  }

  async createPaymentLink(businessId: string, data: {
    customerId: string;
    amount: number;
    linkType: string;
  }) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, businessId },
    });
    if (!customer) throw new Error("Customer profile not registered.");

    const link = await razorpayService.createPaymentLink(data.amount, "INR", customer.name, customer.email || undefined, customer.mobile);
    
    const dbLink = await paymentRepository.createPaymentLink({
      businessId,
      customerId: data.customerId,
      amount: data.amount,
      linkType: data.linkType,
      url: link.short_url,
    });

    return dbLink;
  }

  async initiateRefund(businessId: string, data: {
    transactionId: string;
    amount: number;
  }) {
    const tx = await paymentRepository.getTransaction(data.transactionId);
    if (!tx || tx.status !== "Success") throw new Error("Only completed transactions are refundable.");

    const refund = await razorpayService.initiateRefund(tx.gatewayPaymentId || "", data.amount);

    await paymentRepository.createRefund({
      businessId,
      transactionId: data.transactionId,
      refundId: refund.id,
      amount: data.amount,
      status: "Completed",
    });

    await paymentRepository.updateTransactionStatus({
      id: tx.id,
      status: "Refunded",
      remarks: `Refunded amount ₹${data.amount}`,
    });

    // Re-adjust customer ledger limits
    if (tx.customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: tx.customerId, businessId },
      });
      if (customer) {
        const newDues = customer.pendingAmount + data.amount;
        await prisma.customer.update({
          where: { id: customer.id },
          data: { pendingAmount: newDues },
        });

        await prisma.customerLedger.create({
          data: {
            businessId,
            customerId: customer.id,
            transactionType: "Refund",
            referenceNumber: refund.id,
            amount: data.amount,
            runningBalance: newDues,
            description: "Razorpay refund processed.",
          },
        });
      }
    }

    return refund;
  }
}
export const paymentService = new PaymentService();
