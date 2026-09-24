import { prisma } from "../config/prisma";

export class CustomerLedgerRepository {
  async getProfile(businessId: string, customerId: string) {
    return prisma.customer.findFirst({
      where: { id: customerId, businessId, isDeleted: false },
      include: {
        reminders: { orderBy: { dueAt: "asc" } },
      },
    });
  }

  async getLedger(businessId: string, customerId: string) {
    return prisma.customerLedger.findMany({
      where: { customerId, businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getTransactions(businessId: string, customerId: string) {
    return prisma.customerLedger.findMany({
      where: { customerId, businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReminders(businessId: string, customerId: string) {
    return prisma.customerReminder.findMany({
      where: { customerId, businessId },
      orderBy: { dueAt: "asc" },
    });
  }

  async createReminder(businessId: string, customerId: string, data: {
    dueAt: Date;
    type: string;
    message: string;
    createdBy?: string;
  }) {
    return prisma.customerReminder.create({
      data: {
        businessId,
        customerId,
        dueAt: data.dueAt,
        type: data.type,
        message: data.message,
        createdBy: data.createdBy || "System",
      },
    });
  }

  async getCreditHistory(businessId: string, customerId: string) {
    return prisma.customerLedger.findMany({
      where: { customerId, businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async writeCreditScore(businessId: string, customerId: string, data: {
    score: number;
    riskLevel: string;
    limit: number;
    reason?: string;
  }) {
    return { success: true };
  }

  async logPayment(businessId: string, customerId: string, data: {
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    remarks?: string;
    receivedBy?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Log actual Payment entry
      const pay = await tx.customerPayment.create({
        data: {
          businessId,
          customerId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          referenceNo: data.referenceNo || null,
          remarks: data.remarks || null,
          receivedBy: data.receivedBy || "System",
        },
      });

      // 2. Fetch current customer
      const cust = await tx.customer.findFirst({
        where: { id: customerId, businessId },
      });
      if (!cust) throw new Error("Customer record not registered.");

      const newPending = Math.max(0, cust.pendingAmount - data.amount);

      // 3. Update customer outstanding balance
      await tx.customer.update({
        where: { id: customerId },
        data: { pendingAmount: newPending },
      });

      // 4. Create Ledger transaction entry
      await tx.customerLedger.create({
        data: {
          businessId,
          customerId,
          transactionType: "Payment",
          referenceNumber: pay.id,
          amount: data.amount,
          runningBalance: newPending,
          description: `Credit Payment via ${data.paymentMethod}. ${data.remarks || ""}`,
        },
      });

      return pay;
    });
  }

  async updateCreditLimit(businessId: string, customerId: string, limit: number) {
    return prisma.customer.updateMany({
      where: { id: customerId, businessId },
      data: { creditLimit: limit },
    });
  }

  async createNote(businessId: string, customerId: string, noteText: string, author: string) {
    return { id: "note-" + Date.now(), noteText, author };
  }

  async createTag(businessId: string, customerId: string, tagName: string) {
    return { id: "tag-" + Date.now(), tagName };
  }
}
export const customerLedgerRepository = new CustomerLedgerRepository();
