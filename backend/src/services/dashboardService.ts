import { prisma } from "../config/prisma";

export class DashboardService {
  async getDashboardOverview(businessId: string) {
    const cards = await this.getKPIs(businessId);
    const health = await this.getBusinessHealth(businessId);
    const alerts = await this.getAlerts(businessId);

    return {
      cards,
      health,
      alerts,
    };
  }

  async getBusinessHealth(businessId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      salesSum,
      expenseSum,
      lowStockCount,
      outOfStockCount,
      receivablesSum,
      payablesSum,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { businessId, orderStatus: "Completed", deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
      }),
      prisma.expense.aggregate({
        where: { businessId, status: "Approved", deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { amount: true },
      }),
      prisma.inventory.count({
        where: {
          businessId,
          deletedAt: null,
          availableQuantity: { lte: prisma.inventory.fields.minimumStock },
        },
      }),
      prisma.inventory.count({
        where: {
          businessId,
          deletedAt: null,
          availableQuantity: { lte: 0 },
        },
      }),
      prisma.customer.aggregate({
        where: { businessId, isDeleted: false },
        _sum: { pendingAmount: true },
      }),
      prisma.supplier.aggregate({
        where: { businessId, isDeleted: false },
        _sum: { outstandingAmount: true },
      }),
    ]);

    const sales = salesSum._sum.grandTotal || 0;
    const expenses = expenseSum._sum.amount || 0;
    const receivables = receivablesSum._sum.pendingAmount || 0;
    const payables = payablesSum._sum.outstandingAmount || 0;

    let score = 100;

    // Deduct for stock warnings
    score -= lowStockCount * 3;
    score -= outOfStockCount * 8;

    // Deduct for payables/receivables limits
    if (payables > 20000) score -= 10;
    if (receivables > 15000) score -= 5;

    // Deduct for high expenses ratio
    if (sales > 0 && expenses / sales > 0.3) {
      score -= 15;
    }

    // Bound score
    score = Math.max(0, Math.min(100, score));

    let status = "Excellent";
    if (score < 30) status = "Critical";
    else if (score < 50) status = "Needs Attention";
    else if (score < 75) status = "Average";
    else if (score < 90) status = "Good";

    return {
      score,
      status,
      metrics: {
        lowStockCount,
        outOfStockCount,
        receivables,
        payables,
        todaySales: sales,
        todayExpenses: expenses,
      },
    };
  }

  async getKPIs(businessId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      salesCount,
      salesSum,
      expenseSum,
      receivablesSum,
      payablesSum,
      productsCount,
    ] = await Promise.all([
      prisma.order.count({
        where: { businessId, deletedAt: null, createdAt: { gte: todayStart } },
      }),
      prisma.order.aggregate({
        where: { businessId, orderStatus: "Completed", deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
      }),
      prisma.expense.aggregate({
        where: { businessId, status: "Approved", deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { amount: true },
      }),
      prisma.customer.aggregate({
        where: { businessId, isDeleted: false },
        _sum: { pendingAmount: true },
      }),
      prisma.supplier.aggregate({
        where: { businessId, isDeleted: false },
        _sum: { outstandingAmount: true },
      }),
      prisma.product.count({
        where: { businessId, isDeleted: false },
      }),
    ]);

    const sales = salesSum._sum.grandTotal || 0;
    const expenses = expenseSum._sum.amount || 0;
    const cashAvailable = Math.max(0, 5000 + sales - expenses);

    return {
      todaySales: sales,
      todayOrdersCount: salesCount,
      todayExpenses: expenses,
      cashAvailable,
      outstandingReceivables: receivablesSum._sum.pendingAmount || 0,
      outstandingPayables: payablesSum._sum.outstandingAmount || 0,
      totalCatalogProducts: productsCount,
    };
  }

  async getCharts(businessId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [sales, expenses] = await Promise.all([
      prisma.order.findMany({
        where: { businessId, orderStatus: "Completed", deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, grandTotal: true },
      }),
      prisma.expense.findMany({
        where: { businessId, status: "Approved", deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const chartData: { [key: string]: { date: string; sales: number; expenses: number } } = {};

    sales.forEach((s) => {
      const dateStr = s.createdAt.toISOString().split("T")[0];
      if (!chartData[dateStr]) {
        chartData[dateStr] = { date: dateStr, sales: 0, expenses: 0 };
      }
      chartData[dateStr].sales += s.grandTotal;
    });

    expenses.forEach((e) => {
      const dateStr = e.createdAt.toISOString().split("T")[0];
      if (!chartData[dateStr]) {
        chartData[dateStr] = { date: dateStr, sales: 0, expenses: 0 };
      }
      chartData[dateStr].expenses += e.amount;
    });

    return Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getAlerts(businessId: string) {
    const alerts: any[] = [];

    const [lowStock, pendingCustomers, pendingSuppliers] = await Promise.all([
      prisma.inventory.findMany({
        where: { businessId, deletedAt: null, availableQuantity: { lte: prisma.inventory.fields.minimumStock } },
        include: { product: true },
        take: 3,
      }),
      prisma.customer.findMany({
        where: { businessId, isDeleted: false, pendingAmount: { gt: 0 } },
        take: 3,
      }),
      prisma.supplier.findMany({
        where: { businessId, isDeleted: false, outstandingAmount: { gt: 0 } },
        take: 3,
      }),
    ]);

    lowStock.forEach((inv) => {
      alerts.push({
        id: `stock-${inv.productId}`,
        type: "stock",
        message: `Low Stock Alert: ${inv.product.name}`,
        details: `Available: ${inv.availableQuantity} units (Threshold: ${inv.minimumStock})`,
        actionLabel: "Restock Now",
      });
    });

    pendingCustomers.forEach((cust) => {
      alerts.push({
        id: `pay-${cust.id}`,
        type: "payment",
        message: `Outstanding payment from ${cust.name}`,
        details: `Balance: ₹${cust.pendingAmount.toLocaleString()}`,
        actionLabel: "Send Reminder",
      });
    });

    pendingSuppliers.forEach((supp) => {
      alerts.push({
        id: `pay-supp-${supp.id}`,
        type: "supplier",
        message: `Pending dues to ${supp.companyName}`,
        details: `Outstanding: ₹${supp.outstandingAmount.toLocaleString()}`,
        actionLabel: "Pay Supplier",
      });
    });

    return alerts;
  }

  async getTopProducts(businessId: string) {
    const items = await prisma.orderItem.findMany({
      where: { order: { businessId, deletedAt: null, orderStatus: "Completed" } },
    });

    const productSales: { [key: string]: { name: string; qty: number; sales: number } } = {};
    items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, qty: 0, sales: 0 };
      }
      productSales[item.productId].qty += item.quantity;
      productSales[item.productId].sales += item.total;
    });

    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }

  async getTopCustomers(businessId: string) {
    const customers = await prisma.customer.findMany({
      where: { businessId, isDeleted: false },
      include: { orders: true },
    });

    return customers
      .map((c) => {
        const sales = c.orders.reduce((sum, o) => sum + o.grandTotal, 0);
        return {
          id: c.id,
          name: c.name,
          mobile: c.mobile,
          sales,
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }

  async getTopSuppliers(businessId: string) {
    const suppliers = await prisma.supplier.findMany({
      where: { businessId, isDeleted: false },
    });

    return suppliers
      .map((s) => ({
        id: s.id,
        name: s.companyName,
        outstanding: s.outstandingAmount,
      }))
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 5);
  }
}
