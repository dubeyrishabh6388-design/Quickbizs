import { prisma } from "../config/prisma";

export class FinanceRepository {
  async findExpenses(params: {
    businessId: string;
    search?: string;
    category?: string;
    skip: number;
    take: number;
  }) {
    const where: any = {
      businessId: params.businessId,
      deletedAt: null,
    };

    if (params.search) {
      where.description = { contains: params.search };
    }

    if (params.category) {
      where.category = params.category;
    }

    return prisma.expense.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
    });
  }

  async countExpenses(params: {
    businessId: string;
    search?: string;
    category?: string;
  }) {
    const where: any = {
      businessId: params.businessId,
      deletedAt: null,
    };

    if (params.search) {
      where.description = { contains: params.search };
    }

    if (params.category) {
      where.category = params.category;
    }

    return prisma.expense.count({ where });
  }

  async findExpenseById(businessId: string, id: string) {
    return prisma.expense.findFirst({
      where: { id, businessId, deletedAt: null },
    });
  }

  async createExpense(businessId: string, data: any) {
    return prisma.expense.create({
      data: {
        businessId,
        ...data,
      },
    });
  }

  async updateExpense(businessId: string, id: string, data: any) {
    return prisma.expense.updateMany({
      where: { id, businessId, deletedAt: null },
      data,
    });
  }

  async deleteExpense(businessId: string, id: string) {
    return prisma.expense.updateMany({
      where: { id, businessId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async findCustomerLedger(businessId: string, customerId: string) {
    return prisma.customerLedger.findMany({
      where: { businessId, customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findSupplierLedger(businessId: string, supplierId: string) {
    return prisma.purchaseOrder.findMany({
      where: { businessId, supplierId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findCashLedgers(businessId: string) {
    return prisma.dailyClosing.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findBankTransactions(businessId: string, _bankAccountId?: string) {
    return prisma.payment.findMany({
      where: {
        order: { businessId },
        paymentMethod: { in: ["UPI", "Card"] },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createDailyClosing(businessId: string, data: any) {
    return prisma.dailyClosing.create({
      data: {
        businessId,
        ...data,
      },
    });
  }
}
