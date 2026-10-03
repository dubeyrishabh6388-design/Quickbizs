import { prisma } from "../config/prisma";
import { verticalRegistry } from "../registry";

export class DashboardService {
  async getDashboardOverview(businessId: string) {
    const [cards, health, alerts, categoryOverview] = await Promise.all([
      this.getKPIs(businessId),
      this.getBusinessHealth(businessId),
      this.getAlerts(businessId),
      this.getCategoryOverview(businessId),
    ]);

    return {
      cards,
      health,
      alerts,
      categoryOverview,
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
      purchaseSum,
      pendingPurchaseAgg,
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
      prisma.purchaseOrder.aggregate({
        where: { businessId, createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
      }),
      prisma.purchaseOrder.aggregate({
        where: { businessId, status: { in: ["Pending Approval", "Draft", "Approved", "Partially Received"] } },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
    ]);

    const sales = salesSum._sum.grandTotal || 0;
    const expenses = expenseSum._sum.amount || 0;
    const purchases = purchaseSum._sum.grandTotal || 0;
    const pendingPurchasesTotal = pendingPurchaseAgg._sum.grandTotal || 0;
    const pendingPurchasesCount = pendingPurchaseAgg._count.id || 0;
    const cashAvailable = Math.max(0, 5000 + sales - expenses);

    return {
      todaySales: sales,
      todayOrdersCount: salesCount,
      todayPurchases: purchases,
      pendingPurchasesCount,
      pendingPurchasesTotal,
      todayExpenses: expenses,
      cashAvailable,
      outstandingReceivables: receivablesSum._sum.pendingAmount || 0,
      outstandingPayables: payablesSum._sum.outstandingAmount || 0,
      totalCatalogProducts: productsCount,
    };
  }

  async getCategoryOverview(businessId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { businessType: true },
    });

    const rawType = (business?.businessType || "Custom Business").trim();
    const vertical = verticalRegistry.resolve(rawType);
    const isAuto = vertical.id === "AUTO_PARTS";
    const isElect = vertical.id === "ELECTRICAL";
    const isHardware = vertical.id === "HARDWARE";
    const categoryKey = vertical.displayName;

    const [
      salesAgg,
      purchasesAgg,
      customerDueAgg,
      supplierDueAgg,
      pendingPurchasesList,
      lowStockInventories,
      topSoldItems,
      customersWithDues,
      recentSearchesRaw,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { businessId, orderStatus: "Completed", deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      prisma.purchaseOrder.aggregate({
        where: { businessId, createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
      }),
      prisma.customer.aggregate({
        where: { businessId, isDeleted: false },
        _sum: { pendingAmount: true },
      }),
      prisma.supplier.aggregate({
        where: { businessId, isDeleted: false },
        _sum: { outstandingAmount: true },
      }),
      prisma.purchaseOrder.findMany({
        where: {
          businessId,
          status: { in: ["Pending Approval", "Draft", "Approved", "Partially Received"] },
        },
        include: { supplier: true, items: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.inventory.findMany({
        where: {
          businessId,
          deletedAt: null,
          availableQuantity: { lte: prisma.inventory.fields.minimumStock },
        },
        include: { product: true },
        take: 8,
      }),
      prisma.orderItem.findMany({
        where: { order: { businessId, deletedAt: null, orderStatus: "Completed" } },
        take: 20,
      }),
      prisma.customer.findMany({
        where: { businessId, isDeleted: false, pendingAmount: { gt: 0 } },
        select: { id: true, name: true, membershipLevel: true, pendingAmount: true, mobile: true },
        take: 10,
      }),
      prisma.searchHistory.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        distinct: ["searchText"],
        take: 6,
      }),
    ]);

    // Format Low Stock with Category-Aware Fields
    const formattedLowStock = lowStockInventories.map((inv) => {
      let custom: any = {};
      if (inv.product.customFields) {
        try {
          custom = typeof inv.product.customFields === "string" ? JSON.parse(inv.product.customFields) : inv.product.customFields;
        } catch (e) {}
      }

      return {
        id: inv.productId,
        name: inv.product.name,
        available: inv.availableQuantity,
        minStock: inv.minimumStock,
        partNumber: custom.partNumber || null,
        oemNumber: custom.oemNumber || null,
        vehicleModel: custom.vehicleModel || null,
        rack: custom.rack || custom.binLocation || null,
        bin: custom.bin || null,
        brand: custom.brand || inv.product.brand || null,
        wattage: custom.wattage || null,
        voltage: custom.voltage || null,
        size: custom.size || null,
        material: custom.material || null,
        unitPrice: inv.product.price,
      };
    });

    // Customer Dues Grouped by Customer Type dynamically from vertical configuration
    const customerDueBreakdown: Record<string, number> = {};
    for (const key of vertical.dashboard.customerDueKeys) {
      customerDueBreakdown[key] = 0;
    }

    customersWithDues.forEach((c) => {
      const type = c.membershipLevel || "Retail Customer";
      customerDueBreakdown[type] = (customerDueBreakdown[type] || 0) + c.pendingAmount;
    });

    // Fast moving items compilation
    const itemMap = new Map<string, { id: string; name: string; qty: number; revenue: number }>();
    topSoldItems.forEach((i) => {
      const existing = itemMap.get(i.productId) || { id: i.productId, name: i.productName, qty: 0, revenue: 0 };
      existing.qty += i.quantity;
      existing.revenue += i.total;
      itemMap.set(i.productId, existing);
    });
    const fastMovingItems = Array.from(itemMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 6);

    // Top brands
    const allProducts = await prisma.product.findMany({
      where: { businessId, isDeleted: false },
      select: { brand: true, customFields: true, price: true, stock: true },
      take: 100,
    });
    const brandMap: Record<string, { count: number; totalValuation: number }> = {};
    allProducts.forEach((p) => {
      let b = p.brand;
      if (!b && p.customFields) {
        try {
          const c = JSON.parse(p.customFields);
          b = c.brand;
        } catch (e) {}
      }
      if (b) {
        if (!brandMap[b]) brandMap[b] = { count: 0, totalValuation: 0 };
        brandMap[b].count += 1;
        brandMap[b].totalValuation += p.price * p.stock;
      }
    });
    const topBrands = Object.entries(brandMap)
      .map(([brand, data]) => ({ brand, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      categoryKey,
      businessType: rawType,
      isAutoParts: isAuto,
      isElectrical: isElect,
      isHardware: isHardware,
      todaySales: salesAgg._sum.grandTotal || 0,
      todayOrdersCount: salesAgg._count.id || 0,
      todayPurchases: purchasesAgg._sum.grandTotal || 0,
      customerDue: customerDueAgg._sum.pendingAmount || 0,
      supplierDue: supplierDueAgg._sum.outstandingAmount || 0,
      customerDueBreakdown,
      lowStockParts: formattedLowStock,
      fastMovingParts: fastMovingItems,
      pendingPurchases: {
        count: pendingPurchasesList.length,
        totalAmount: pendingPurchasesList.reduce((sum, po) => sum + po.grandTotal, 0),
        orders: pendingPurchasesList.map((po) => ({
          id: po.id,
          poNumber: po.poNumber,
          supplierName: po.supplier.companyName,
          status: po.status,
          grandTotal: po.grandTotal,
          itemCount: po.items.length,
        })),
      },
      recentPartSearches: recentSearchesRaw.map((r) => r.searchText),
      topBrands,
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
