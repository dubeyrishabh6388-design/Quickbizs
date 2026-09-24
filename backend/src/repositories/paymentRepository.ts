import { prisma } from "../config/prisma";

export class PaymentRepository {
  async createPaymentOrder(data: {
    businessId: string;
    userId: string;
    amount: number;
    currency: string;
    gatewayOrderId: string;
  }) {
    return prisma.paymentOrder.create({
      data: {
        businessId: data.businessId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        gatewayOrderId: data.gatewayOrderId,
        status: "Pending",
      },
    });
  }

  async updatePaymentOrderStatus(gatewayOrderId: string, status: string) {
    return prisma.paymentOrder.updateMany({
      where: { gatewayOrderId },
      data: { status },
    });
  }

  async createTransaction(data: {
    businessId: string;
    userId?: string;
    customerId?: string;
    supplierId?: string;
    invoiceId?: string;
    purchaseId?: string;
    subscriptionId?: string;
    gateway: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
    gatewaySignature?: string;
    amount: number;
    currency?: string;
    status: string;
    paymentMethod: string;
    remarks?: string;
  }) {
    return prisma.paymentTransaction.create({
      data: {
        businessId: data.businessId,
        userId: data.userId || null,
        customerId: data.customerId || null,
        supplierId: data.supplierId || null,
        invoiceId: data.invoiceId || null,
        purchaseId: data.purchaseId || null,
        subscriptionId: data.subscriptionId || null,
        gateway: data.gateway,
        gatewayOrderId: data.gatewayOrderId || null,
        gatewayPaymentId: data.gatewayPaymentId || null,
        gatewaySignature: data.gatewaySignature || null,
        amount: data.amount,
        currency: data.currency || "INR",
        status: data.status,
        paymentMethod: data.paymentMethod,
        remarks: data.remarks || null,
      },
    });
  }

  async getTransaction(id: string) {
    return prisma.paymentTransaction.findUnique({
      where: { id },
    });
  }

  async getTransactionByOrderId(gatewayOrderId: string) {
    return prisma.paymentTransaction.findFirst({
      where: { gatewayOrderId },
    });
  }

  async updateTransactionStatus(data: {
    id: string;
    status: string;
    gatewayPaymentId?: string;
    gatewaySignature?: string;
    remarks?: string;
  }) {
    return prisma.paymentTransaction.update({
      where: { id: data.id },
      data: {
        status: data.status,
        gatewayPaymentId: data.gatewayPaymentId || undefined,
        gatewaySignature: data.gatewaySignature || undefined,
        remarks: data.remarks || undefined,
      },
    });
  }

  async isWebhookProcessed(eventId: string): Promise<boolean> {
    const hook = await prisma.paymentWebhook.findUnique({
      where: { eventId },
    });
    return hook ? hook.processed : false;
  }

  async logWebhook(businessId: string, eventId: string, gateway: string, payload: any) {
    return prisma.paymentWebhook.create({
      data: {
        businessId,
        eventId,
        gateway,
        payload: JSON.stringify(payload),
        processed: true,
      },
    });
  }

  async createPaymentLink(data: {
    businessId: string;
    customerId: string;
    amount: number;
    linkType: string;
    url: string;
  }) {
    return prisma.paymentLink.create({
      data: {
        businessId: data.businessId,
        customerId: data.customerId,
        amount: data.amount,
        linkType: data.linkType,
        url: data.url,
        status: "Pending",
      },
    });
  }

  async getPaymentLink(id: string) {
    return prisma.paymentLink.findUnique({
      where: { id },
    });
  }

  async updatePaymentLinkStatus(id: string, status: string) {
    return prisma.paymentLink.update({
      where: { id },
      data: { status },
    });
  }

  async createRefund(data: {
    businessId: string;
    transactionId: string;
    refundId: string;
    amount: number;
    status: string;
  }) {
    return prisma.paymentRefund.create({
      data: {
        businessId: data.businessId,
        transactionId: data.transactionId,
        refundId: data.refundId,
        amount: data.amount,
        status: data.status,
      },
    });
  }

  async logPaymentEvent(businessId: string, transactionId: string | null, level: string, message: string) {
    return prisma.paymentLog.create({
      data: {
        businessId,
        transactionId,
        level,
        message,
      },
    });
  }

  async getPaymentsHistory(businessId: string) {
    return prisma.paymentTransaction.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPaymentsAnalytics(businessId: string) {
    const txs = await prisma.paymentTransaction.findMany({
      where: { businessId },
    });

    const successTxs = txs.filter(t => t.status === "Success");
    const failedTxs = txs.filter(t => t.status === "Failed");

    const totalPaid = successTxs.reduce((sum, t) => sum + t.amount, 0);
    const totalTxs = txs.length;

    const collectionRate = totalTxs > 0 ? (successTxs.length / totalTxs) * 100 : 100;
    const upiCount = successTxs.filter(t => t.paymentMethod.toUpperCase() === "UPI").length;
    const upiRatio = successTxs.length > 0 ? (upiCount / successTxs.length) * 100 : 0;

    return {
      collectionRate: parseFloat(collectionRate.toFixed(1)),
      onlinePercentage: 92.4,
      upiVsCashRatio: `${Math.round(upiRatio)}% UPI / ${Math.round(100 - upiRatio)}% Cash`,
      failedPaymentRate: totalTxs > 0 ? parseFloat(((failedTxs.length / totalTxs) * 100).toFixed(1)) : 0,
      monthlyCollections: totalPaid,
    };
  }

  async getCustomerPaymentsSummary(businessId: string, customerId: string) {
    const txs = await prisma.paymentTransaction.findMany({
      where: { customerId, businessId },
    });
    const successTxs = txs.filter(t => t.status === "Success");
    
    const totalPaid = successTxs.reduce((sum, t) => sum + t.amount, 0);
    const lastPayment = successTxs.length > 0 ? successTxs[0] : null;

    const totalTxs = txs.length;
    const successRate = totalTxs > 0 ? (successTxs.length / totalTxs) * 100 : 100;

    const pendingLinks = await prisma.paymentLink.findMany({
      where: { customerId, businessId, status: "Pending" },
    });

    const refunds = await prisma.paymentRefund.findMany({
      where: { businessId },
    });

    return {
      totalPaid,
      lastPaymentAmount: lastPayment ? lastPayment.amount : 0,
      lastPaymentMethod: lastPayment ? lastPayment.paymentMethod : "N/A",
      successRate: parseFloat(successRate.toFixed(1)),
      pendingLinksCount: pendingLinks.length,
      refundsHistory: refunds,
    };
  }
}
export const paymentRepository = new PaymentRepository();
