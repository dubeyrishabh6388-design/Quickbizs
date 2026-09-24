import { prisma } from "../config/prisma";

export class ReportsService {
  async getDashboardSummary(businessId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      salesCount,
      salesSum,
      expenseSum,
      lowStockCount,
      totalCustomers,
      recentOrders,
      lowStockItems,
      automationLogs,
    ] = await Promise.all([
      // 1. Sales count today
      prisma.order.count({
        where: { businessId, deletedAt: null, createdAt: { gte: todayStart } },
      }),
      // 2. Sales sum today
      prisma.order.aggregate({
        where: { businessId, orderStatus: "Completed", deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
      }),
      // 3. Expense sum today
      prisma.expense.aggregate({
        where: { businessId, status: "Approved", deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { amount: true },
      }),
      // 4. Low stock count
      prisma.inventory.count({
        where: {
          businessId,
          deletedAt: null,
          availableQuantity: { lte: prisma.inventory.fields.minimumStock },
        },
      }),
      // 5. Total customers
      prisma.customer.count({
        where: { businessId, isDeleted: false },
      }),
      // 6. Recent sales orders
      prisma.order.findMany({
        where: { businessId, deletedAt: null },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      // 7. Low stock items detail
      prisma.inventory.findMany({
        where: {
          businessId,
          deletedAt: null,
          availableQuantity: { lte: prisma.inventory.fields.minimumStock },
        },
        include: { product: true },
        take: 5,
      }),
      // 8. Audit logs
      prisma.auditLog.findMany({
        where: { businessId },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Sales comparison: fetch last 30 days daily sales trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesTrend = await prisma.order.findMany({
      where: {
        businessId,
        orderStatus: "Completed",
        deletedAt: null,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        grandTotal: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const dailyTrend: { [key: string]: number } = {};
    salesTrend.forEach((sale) => {
      const dateStr = sale.createdAt.toISOString().split("T")[0];
      dailyTrend[dateStr] = (dailyTrend[dateStr] || 0) + sale.grandTotal;
    });

    const trendChart = Object.keys(dailyTrend).map((date) => ({
      date,
      sales: dailyTrend[date],
    }));

    return {
      todaySales: salesSum._sum.grandTotal || 0,
      todaySalesCount: salesCount,
      todayExpenses: expenseSum._sum.amount || 0,
      lowStockCount,
      totalCustomers,
      recentOrders,
      lowStockItems,
      automationLogs,
      salesTrend: trendChart,
    };
  }

  async getSalesReports(businessId: string, filters: { startDate?: Date; endDate?: Date }) {
    const where: any = { businessId, deletedAt: null, orderStatus: "Completed" };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [orders, paymentGroup, productGroup] = await Promise.all([
      prisma.order.findMany({ where, include: { items: true } }),
      // Group by payment method
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where,
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      // Get order items to aggregate product totals
      prisma.orderItem.findMany({
        where: { order: { businessId, deletedAt: null, orderStatus: "Completed" } },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);

    const productSales: { [key: string]: { name: string; qty: number; sales: number } } = {};
    productGroup.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, qty: 0, sales: 0 };
      }
      productSales[item.productId].qty += item.quantity;
      productSales[item.productId].sales += item.total;
    });

    const topSelling = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    return {
      totalSalesCount: orders.length,
      totalRevenue,
      paymentMethodBreakdown: paymentGroup,
      topSellingProducts: topSelling,
    };
  }

  async getPurchasesReports(businessId: string, filters: { startDate?: Date; endDate?: Date }) {
    const where: any = { businessId };

    if (filters.startDate || filters.endDate) {
      where.orderDate = {};
      if (filters.startDate) where.orderDate.gte = filters.startDate;
      if (filters.endDate) where.orderDate.lte = filters.endDate;
    }

    const [pos, supplierGroup] = await Promise.all([
      prisma.purchaseOrder.findMany({ where, include: { items: true, supplier: true } }),
      prisma.purchaseOrder.groupBy({
        by: ["supplierId"],
        where,
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
    ]);

    const totalSpent = pos.reduce((sum, p) => sum + p.grandTotal, 0);

    return {
      totalPurchaseOrders: pos.length,
      totalSpent,
      supplierWisePurchases: supplierGroup,
    };
  }

  async getInventoryReports(businessId: string) {
    const inventories = await prisma.inventory.findMany({
      where: { businessId, deletedAt: null },
      include: { product: true },
    });

    const totalValuation = inventories.reduce((sum, inv) => {
      return sum + inv.availableQuantity * inv.product.costPrice;
    }, 0);

    const totalItemsCount = inventories.reduce((sum, inv) => sum + inv.availableQuantity, 0);

    const lowStock = inventories.filter((inv) => inv.availableQuantity <= inv.minimumStock);
    const outOfStock = inventories.filter((inv) => inv.availableQuantity <= 0);

    return {
      totalValuation,
      totalItemsCount,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      lowStockList: lowStock.map((inv) => ({
        id: inv.productId,
        name: inv.product.name,
        available: inv.availableQuantity,
        minimum: inv.minimumStock,
        supplier: inv.product.supplierName,
      })),
    };
  }

  async getCustomersReports(businessId: string) {
    const customers = await prisma.customer.findMany({
      where: { businessId, isDeleted: false },
      include: { orders: true },
    });

    const mapped = customers.map((c) => {
      const totalPurchases = c.orders.reduce((sum, o) => sum + o.grandTotal, 0);
      return {
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        pendingAmount: c.pendingAmount,
        rewardPoints: c.rewardPoints,
        totalPurchases,
        lastPurchase: c.lastPurchaseAt,
      };
    });

    const topCustomers = [...mapped].sort((a, b) => b.totalPurchases - a.totalPurchases).slice(0, 10);
    const outstandingCustomers = [...mapped].filter((c) => c.pendingAmount > 0);

    return {
      topCustomers,
      outstandingCustomers,
    };
  }

  async getSuppliersReports(businessId: string) {
    const suppliers = await prisma.supplier.findMany({
      where: { businessId, isDeleted: false },
    });

    const outstandingSuppliers = suppliers.filter((s) => s.outstandingAmount > 0);

    return {
      suppliersList: suppliers.map((s) => ({
        id: s.id,
        name: s.companyName,
        mobile: s.mobile,
        outstanding: s.outstandingAmount,
        lastPurchase: s.lastPurchaseDate,
      })),
      outstandingSuppliers,
    };
  }

  async getExpensesReports(businessId: string, filters: { startDate?: Date; endDate?: Date }) {
    const where: any = { businessId, deletedAt: null, status: "Approved" };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [expenses, categoryGroup] = await Promise.all([
      prisma.expense.findMany({ where }),
      prisma.expense.groupBy({
        by: ["category"],
        where,
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalExpense,
      categoryWiseExpenses: categoryGroup,
    };
  }

  async getFinancialReports(businessId: string, filters: { startDate?: Date; endDate?: Date }) {
    const salesWhere: any = { businessId, deletedAt: null, orderStatus: "Completed" };
    const expenseWhere: any = { businessId, deletedAt: null, status: "Approved" };

    if (filters.startDate || filters.endDate) {
      const range: any = {};
      if (filters.startDate) range.gte = filters.startDate;
      if (filters.endDate) range.lte = filters.endDate;
      salesWhere.createdAt = range;
      expenseWhere.createdAt = range;
    }

    const [salesSum, expenseSum, orderItems] = await Promise.all([
      prisma.order.aggregate({
        where: salesWhere,
        _sum: { grandTotal: true },
      }),
      prisma.expense.aggregate({
        where: expenseWhere,
        _sum: { amount: true },
      }),
      prisma.orderItem.findMany({
        where: { order: salesWhere },
        include: { order: true },
      }),
    ]);

    const revenue = salesSum._sum.grandTotal || 0;
    const expenses = expenseSum._sum.amount || 0;

    // Fetch product cost price records to calculate cost of goods sold (COGS)
    let cogs = 0;
    for (const item of orderItems) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, businessId },
      });
      if (product) {
        cogs += product.costPrice * item.quantity;
      }
    }

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    return {
      revenue,
      costOfGoodsSold: cogs,
      grossProfit,
      expenses,
      netProfit,
      marginPercentage: revenue ? Math.round((netProfit / revenue) * 100) : 0,
      timestamp: new Date().toISOString(),
    };
  }
}
