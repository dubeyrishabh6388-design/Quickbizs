import { FinanceRepository } from "../repositories/financeRepository";
import { prisma } from "../config/prisma";

const financeRepository = new FinanceRepository();
const EXPENSE_APPROVAL_LIMIT = 5000; // Step 9: Configure approval limit

export class FinanceService {
  async getExpenses(params: {
    businessId: string;
    search?: string;
    category?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [expenses, total] = await Promise.all([
      financeRepository.findExpenses({
        businessId: params.businessId,
        search: params.search,
        category: params.category,
        skip,
        take,
      }),
      financeRepository.countExpenses({
        businessId: params.businessId,
        search: params.search,
        category: params.category,
      }),
    ]);

    return {
      expenses,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getExpenseById(businessId: string, id: string) {
    const expense = await financeRepository.findExpenseById(businessId, id);
    if (!expense) {
      const err: any = new Error("Expense record not found.");
      err.statusCode = 404;
      throw err;
    }
    return expense;
  }

  async createExpense(
    businessId: string,
    data: {
      description: string;
      amount: number;
      category: string;
      loggedBy: string;
      notes?: string;
    }
  ) {
    // 1. Validation (Step 11)
    if (!data.description || data.amount <= 0 || !data.category) {
      const err: any = new Error("Description, positive amount, and expense category are mandatory.");
      err.statusCode = 400;
      throw err;
    }

    // Determine status based on approval limits (Step 9)
    const status = data.amount > EXPENSE_APPROVAL_LIMIT ? "Pending Approval" : "Approved";

    return prisma.$transaction(async (tx: any) => {
      // 1. Create Expense
      const expense = await tx.expense.create({
        data: {
          businessId,
          description: data.description,
          amount: data.amount,
          category: data.category,
          status,
          loggedBy: data.loggedBy,
          notes: data.notes || null,
        },
      });

      // 2. Write Audit Log
      await tx.auditLog.create({
        data: {
          businessId,
          action: "EXPENSE_CREATED",
          module: "Finance",
          status: "Success",
          reason: `Logged expense of ₹${data.amount.toLocaleString()} (Status: ${status})`,
        },
      });

      return expense;
    });
  }

  async approveExpense(businessId: string, id: string, approvedBy: string) {
    return prisma.$transaction(async (tx: any) => {
      const expense = await tx.expense.findFirst({
        where: { id, businessId, status: "Pending Approval", deletedAt: null },
      });

      if (!expense) {
        throw new Error("Expense not found or already approved/rejected.");
      }

      // Update status
      await tx.expense.update({
        where: { id },
        data: { status: "Approved" },
      });

      // Reduce cash balance
      await tx.auditLog.create({
        data: {
          businessId,
          action: "EXPENSE_APPROVED",
          module: "Finance",
          status: "Success",
          reason: `Approved expense of ₹${expense.amount.toLocaleString()} by ${approvedBy}`,
        },
      });

      return expense;
    });
  }

  async deleteExpense(businessId: string, id: string) {
    const expense = await financeRepository.findExpenseById(businessId, id);
    if (!expense) {
      const err: any = new Error("Expense record not found.");
      err.statusCode = 404;
      throw err;
    }

    return prisma.$transaction(async (tx: any) => {
      // Soft delete expense
      await tx.expense.updateMany({
        where: { id, businessId },
        data: { deletedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          businessId,
          action: "EXPENSE_DELETED",
          module: "Finance",
          status: "Success",
          reason: `Deleted expense of ₹${expense.amount.toLocaleString()}`,
        },
      });

      return true;
    });
  }

  async getCustomerLedger(businessId: string, customerId: string) {
    return financeRepository.findCustomerLedger(businessId, customerId);
  }

  async getSupplierLedger(businessId: string, supplierId: string) {
    return financeRepository.findSupplierLedger(businessId, supplierId);
  }

  async getCashLedger(businessId: string) {
    return financeRepository.findCashLedgers(businessId);
  }

  async getBankTransactions(businessId: string) {
    return financeRepository.findBankTransactions(businessId);
  }

  async createDailyClosing(
    businessId: string,
    data: {
      actualCash: number;
      confirmedBy: string;
      remarks?: string;
    }
  ) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Sum up sales category totals for today (Step 7)
    const todayOrders = await prisma.order.findMany({
      where: {
        businessId,
        deletedAt: null,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    const cashSales = todayOrders
      .filter((o) => o.paymentMethod === "Cash" && o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const upiSales = todayOrders
      .filter((o) => o.paymentMethod === "UPI")
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const cardSales = todayOrders
      .filter((o) => o.paymentMethod === "Card")
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const walletSales = todayOrders
      .filter((o) => o.paymentMethod === "Wallet")
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const creditSales = todayOrders
      .filter((o) => o.paymentMethod === "Credit")
      .reduce((sum, o) => sum + o.grandTotal, 0);

    // Add split payment cash & upi elements
    let splitCash = 0;
    let splitUpi = 0;
    const splitOrders = todayOrders.filter((o) => o.paymentMethod === "Split");
    for (const order of splitOrders) {
      const payments = await prisma.payment.findMany({
        where: { orderId: order.id },
      });
      const cashPay = payments.find((p) => p.paymentMethod === "Cash");
      const upiPay = payments.find((p) => p.paymentMethod === "UPI");
      if (cashPay) splitCash += cashPay.amount;
      if (upiPay) splitUpi += upiPay.amount;
    }

    const netCashSales = cashSales + splitCash;
    const netUpiSales = upiSales + splitUpi;

    // Sum expenses for today
    const todayExpenses = await prisma.expense.findMany({
      where: {
        businessId,
        status: "Approved",
        deletedAt: null,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Expected cash = net cash sales - expenses
    const expectedCash = netCashSales - totalExpenses;
    const difference = data.actualCash - expectedCash;

    return prisma.$transaction(async (tx: any) => {
      const closing = await tx.dailyClosing.create({
        data: {
          businessId,
          closingDate: new Date(),
          cashSales: netCashSales,
          upiSales: netUpiSales,
          cardSales,
          walletSales,
          creditSales,
          expenses: totalExpenses,
          netCash: expectedCash,
          expectedCash,
          actualCash: data.actualCash,
          difference,
          confirmedBy: data.confirmedBy,
          remarks: data.remarks || null,
        },
      });

      // Write Audit Log (Step 10)
      await tx.auditLog.create({
        data: {
          businessId,
          action: "DAILY_CLOSING_LOCKED",
          module: "Finance",
          status: "Success",
          reason: `Closed ledger for today. Expected Cash: ₹${expectedCash.toLocaleString()}, Actual Cash: ₹${data.actualCash.toLocaleString()}, Difference: ₹${difference.toLocaleString()}`,
        },
      });

      return closing;
    });
  }
}
