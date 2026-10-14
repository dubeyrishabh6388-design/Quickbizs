import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";
import { customerCreditEngine } from "./customerCreditEngine";

export interface ComputedBusinessContext {
  storeName: string;
  businessType: string;
  summaryDateRange: string;
  // Sales & Revenue
  todaySales: number;
  todayOrdersCount: number;
  yesterdaySales: number;
  yesterdayOrdersCount: number;
  last7DaysSales: number;
  last7DaysOrdersCount: number;
  thisMonthSales: number;
  thisMonthOrdersCount: number;
  lastMonthSales: number;
  lastMonthOrdersCount: number;
  monthOverMonthGrowthPct: number | null;
  avgOrderValueThisMonth: number;
  estimatedGrossMarginPercent: number;
  paymentSplitThisMonth: { cash: number; upi: number; credit: number; card: number };
  topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
  // Inventory
  totalActiveProducts: number;
  totalInventoryValuationCost: number;
  totalInventoryValuationRetail: number;
  outOfStockCount: number;
  lowStockItems: Array<{ name: string; currentStock: number; minStock: number; unitPrice: number; supplier?: string }>;
  deadStockItems: Array<{ name: string; currentStock: number; unitPrice: number }>;
  // Customer Credit / Udhaar
  totalOutstandingUdhaar: number;
  customersWithDuesCount: number;
  topDebtors: Array<{ name: string; phone?: string; pendingAmount: number; creditLimit: number; riskLevel?: string }>;
  // Expenses
  todayExpenses: number;
  thisMonthExpenses: number;
  expenseCategoriesBreakdown: Array<{ category: string; amount: number }>;
  // Suppliers & Payables
  totalPayableSupplierDues: number;
  pendingPurchaseOrdersCount: number;
  // Staff
  staffSummary?: { total: number; present: number; absent: string[] };
}

export class AIContextService {
  /**
   * Builds an authenticated, deterministic business intelligence context snapshot
   * by querying MySQL via Prisma scoped strictly by businessId.
   */
  public static async getStoreContext(businessId: string, userQuery?: string): Promise<{
    computed: ComputedBusinessContext;
    formattedPromptContext: string;
  }> {
    const now = new Date();

    // 1. Calculate precise date boundaries
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    const last7DaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 2. Fetch business meta
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true, businessType: true, phone: true }
    });

    const storeName = business?.name || "QuickBizs Store";
    const businessType = business?.businessType || "Retail Store";

    // 3. Parallel database aggregations scoped strictly by businessId
    const [
      todayOrdersAgg,
      yesterdayOrdersAgg,
      last7DaysOrdersAgg,
      thisMonthOrdersAgg,
      lastMonthOrdersAgg,
      thisMonthOrdersList,
      lowStockInventories,
      outOfStockCount,
      allProductsCount,
      allInventoriesWithProducts,
      udhaarCustomers,
      todayExpensesAgg,
      thisMonthExpensesAgg,
      thisMonthExpensesList,
      supplierDuesAgg,
      pendingPOsCount,
      staffMembers,
      todayAttendances
    ] = await Promise.all([
      // Today orders aggregate
      prisma.order.aggregate({
        where: { businessId, deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
        _count: { id: true }
      }),
      // Yesterday orders aggregate
      prisma.order.aggregate({
        where: { businessId, deletedAt: null, createdAt: { gte: yesterdayStart, lte: yesterdayEnd } },
        _sum: { grandTotal: true },
        _count: { id: true }
      }),
      // Last 7 days orders aggregate
      prisma.order.aggregate({
        where: { businessId, deletedAt: null, createdAt: { gte: last7DaysStart } },
        _sum: { grandTotal: true },
        _count: { id: true }
      }),
      // This month orders aggregate
      prisma.order.aggregate({
        where: { businessId, deletedAt: null, createdAt: { gte: thisMonthStart } },
        _sum: { grandTotal: true },
        _count: { id: true }
      }),
      // Last month orders aggregate
      prisma.order.aggregate({
        where: { businessId, deletedAt: null, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { grandTotal: true },
        _count: { id: true }
      }),
      // This month individual orders for payment breakdown and line items
      prisma.order.findMany({
        where: { businessId, deletedAt: null, createdAt: { gte: thisMonthStart } },
        select: {
          grandTotal: true,
          paymentMethod: true,
          items: {
            select: { productName: true, quantity: true, total: true }
          }
        },
        take: 300
      }),
      // Low stock / reorder items
      prisma.inventory.findMany({
        where: {
          businessId,
          deletedAt: null,
          availableQuantity: { lte: prisma.inventory.fields.minimumStock }
        },
        include: {
          product: {
            select: { name: true, price: true, supplierName: true }
          }
        },
        take: 12,
        orderBy: { availableQuantity: "asc" }
      }),
      // Out of stock count
      prisma.inventory.count({
        where: { businessId, deletedAt: null, availableQuantity: { lte: 0 } }
      }),
      // Total active products count
      prisma.product.count({
        where: { businessId, isDeleted: false }
      }),
      // All inventories for inventory asset valuation
      prisma.inventory.findMany({
        where: { businessId, deletedAt: null },
        include: {
          product: { select: { name: true, costPrice: true, price: true } }
        },
        take: 1000
      }),
      // Customers with outstanding dues
      prisma.customer.findMany({
        where: { businessId, isDeleted: false, pendingAmount: { gt: 0 } },
        orderBy: { pendingAmount: "desc" },
        take: 10,
        select: { id: true, name: true, mobile: true, pendingAmount: true, creditLimit: true }
      }),
      // Today expenses
      prisma.expense.aggregate({
        where: { businessId, status: "Approved", deletedAt: null, createdAt: { gte: todayStart } },
        _sum: { amount: true }
      }),
      // This month expenses aggregate
      prisma.expense.aggregate({
        where: { businessId, status: "Approved", deletedAt: null, createdAt: { gte: thisMonthStart } },
        _sum: { amount: true }
      }),
      // This month expenses list by category
      prisma.expense.findMany({
        where: { businessId, status: "Approved", deletedAt: null, createdAt: { gte: thisMonthStart } },
        select: { category: true, amount: true }
      }),
      // Supplier outstanding dues
      prisma.supplier.aggregate({
        where: { businessId, isDeleted: false },
        _sum: { outstandingAmount: true }
      }),
      // Pending purchase orders
      prisma.purchaseOrder.count({
        where: {
          businessId,
          status: { in: ["Draft", "Pending Approval", "Approved", "Partially Received"] }
        }
      }),
      // Staff members
      prisma.employee.findMany({
        where: { businessId, status: "Active", deletedAt: null },
        select: { id: true, firstName: true, lastName: true, designation: true }
      }),
      // Today attendances
      prisma.attendance.findMany({
        where: { businessId, date: { gte: todayStart } },
        select: { employeeId: true, status: true }
      })
    ]);

    // 4. Deterministic Financial Calculations
    const todaySales = Math.round(todayOrdersAgg._sum.grandTotal || 0);
    const todayOrdersCount = todayOrdersAgg._count.id || 0;
    const yesterdaySales = Math.round(yesterdayOrdersAgg._sum.grandTotal || 0);
    const yesterdayOrdersCount = yesterdayOrdersAgg._count.id || 0;
    const last7DaysSales = Math.round(last7DaysOrdersAgg._sum.grandTotal || 0);
    const last7DaysOrdersCount = last7DaysOrdersAgg._count.id || 0;
    const thisMonthSales = Math.round(thisMonthOrdersAgg._sum.grandTotal || 0);
    const thisMonthOrdersCount = thisMonthOrdersAgg._count.id || 0;
    const lastMonthSales = Math.round(lastMonthOrdersAgg._sum.grandTotal || 0);
    const lastMonthOrdersCount = lastMonthOrdersAgg._count.id || 0;

    let monthOverMonthGrowthPct: number | null = null;
    if (lastMonthSales > 0) {
      monthOverMonthGrowthPct = Math.round(((thisMonthSales - lastMonthSales) / lastMonthSales) * 100);
    }

    const avgOrderValueThisMonth =
      thisMonthOrdersCount > 0 ? Math.round(thisMonthSales / thisMonthOrdersCount) : 0;

    // Payment split & product sales aggregation
    const paymentSplitThisMonth = { cash: 0, upi: 0, credit: 0, card: 0 };
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    thisMonthOrdersList.forEach((order) => {
      const p = (order.paymentMethod || "").toUpperCase();
      const val = order.grandTotal || 0;
      if (p.includes("UPI")) paymentSplitThisMonth.upi += val;
      else if (p.includes("CREDIT") || p.includes("UDHAAR")) paymentSplitThisMonth.credit += val;
      else if (p.includes("CARD")) paymentSplitThisMonth.card += val;
      else paymentSplitThisMonth.cash += val;

      if (order.items) {
        order.items.forEach((item) => {
          if (!productSalesMap[item.productName]) {
            productSalesMap[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
          }
          productSalesMap[item.productName].quantity += item.quantity || 1;
          productSalesMap[item.productName].revenue += item.total || 0;
        });
      }
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Inventory valuations & dead stock calculation
    let totalInventoryValuationCost = 0;
    let totalInventoryValuationRetail = 0;
    allInventoriesWithProducts.forEach((inv) => {
      const q = inv.availableQuantity || 0;
      totalInventoryValuationCost += q * (inv.product?.costPrice || 0);
      totalInventoryValuationRetail += q * (inv.product?.price || 0);
    });

    let estimatedGrossMarginPercent = 28;
    if (totalInventoryValuationRetail > 0 && totalInventoryValuationCost > 0) {
      estimatedGrossMarginPercent = Math.round(
        ((totalInventoryValuationRetail - totalInventoryValuationCost) / totalInventoryValuationRetail) * 100
      );
    }

    const activeSoldNames = new Set(Object.keys(productSalesMap));
    const deadStockItems = allInventoriesWithProducts
      .filter((inv) => (inv.availableQuantity || 0) > 0 && inv.product && !activeSoldNames.has(inv.product.name))
      .slice(0, 5)
      .map((inv) => ({
        name: inv.product?.name || "Item",
        currentStock: inv.availableQuantity,
        unitPrice: inv.product?.price || 0
      }));

    const lowStockItems = lowStockInventories.map((i) => ({
      name: i.product?.name || "Item",
      currentStock: i.availableQuantity,
      minStock: i.minimumStock,
      unitPrice: i.product?.price || 0,
      supplier: i.product?.supplierName || undefined
    }));

    // Customer Udhaar & credit risk
    const totalOutstandingUdhaar = Math.round(
      udhaarCustomers.reduce((acc, c) => acc + (c.pendingAmount || 0), 0)
    );

    const topDebtors = await Promise.all(
      udhaarCustomers.map(async (c) => {
        let riskLevel = "Average";
        try {
          const scoreResult = await customerCreditEngine.calculateHealthScore(businessId, c.id);
          riskLevel = scoreResult.riskLevel;
        } catch {
          // Fallback if scoring fails
        }
        return {
          name: c.name,
          phone: c.mobile || undefined,
          pendingAmount: Math.round(c.pendingAmount),
          creditLimit: Math.round(c.creditLimit),
          riskLevel
        };
      })
    );

    // Expenses breakdown
    const todayExpenses = Math.round(todayExpensesAgg._sum.amount || 0);
    const thisMonthExpenses = Math.round(thisMonthExpensesAgg._sum.amount || 0);

    const expCategoryMap: Record<string, number> = {};
    thisMonthExpensesList.forEach((e) => {
      const cat = e.category || "General";
      expCategoryMap[cat] = (expCategoryMap[cat] || 0) + (e.amount || 0);
    });

    const expenseCategoriesBreakdown = Object.entries(expCategoryMap).map(([category, amount]) => ({
      category,
      amount: Math.round(amount)
    }));

    // Staff attendance
    const attendanceMap = new Map(todayAttendances.map((a) => [a.employeeId, a.status]));
    const absentStaffNames: string[] = [];
    staffMembers.forEach((emp) => {
      const status = attendanceMap.get(emp.id);
      if (status === "Absent") {
        absentStaffNames.push(`${emp.firstName} ${emp.lastName}`.trim());
      }
    });

    const staffSummary = {
      total: staffMembers.length,
      present: staffMembers.length - absentStaffNames.length,
      absent: absentStaffNames
    };

    const totalPayableSupplierDues = Math.round(supplierDuesAgg._sum.outstandingAmount || 0);

    const computed: ComputedBusinessContext = {
      storeName,
      businessType,
      summaryDateRange: `${thisMonthStart.toLocaleDateString("en-IN")} to ${now.toLocaleDateString("en-IN")}`,
      todaySales,
      todayOrdersCount,
      yesterdaySales,
      yesterdayOrdersCount,
      last7DaysSales,
      last7DaysOrdersCount,
      thisMonthSales,
      thisMonthOrdersCount,
      lastMonthSales,
      lastMonthOrdersCount,
      monthOverMonthGrowthPct,
      avgOrderValueThisMonth,
      estimatedGrossMarginPercent,
      paymentSplitThisMonth: {
        cash: Math.round(paymentSplitThisMonth.cash),
        upi: Math.round(paymentSplitThisMonth.upi),
        credit: Math.round(paymentSplitThisMonth.credit),
        card: Math.round(paymentSplitThisMonth.card)
      },
      topSellingProducts,
      totalActiveProducts: allProductsCount,
      totalInventoryValuationCost: Math.round(totalInventoryValuationCost),
      totalInventoryValuationRetail: Math.round(totalInventoryValuationRetail),
      outOfStockCount,
      lowStockItems,
      deadStockItems,
      totalOutstandingUdhaar,
      customersWithDuesCount: udhaarCustomers.length,
      topDebtors,
      todayExpenses,
      thisMonthExpenses,
      expenseCategoriesBreakdown,
      totalPayableSupplierDues,
      pendingPurchaseOrdersCount: pendingPOsCount,
      staffSummary
    };

    // 5. Build structured 360-degree store intelligence prompt context
    const formattedPromptContext = `
================ VERIFIED QUICKBIZS STORE DATABASE ================
Store Name: ${computed.storeName}
Category / Vertical: ${computed.businessType}
Live Evaluation Window: ${computed.summaryDateRange}

--- SALES & CASH DRAWER REVENUE ---
- Today's Sales: ₹${computed.todaySales.toLocaleString("en-IN")} across ${computed.todayOrdersCount} orders
- Yesterday's Sales: ₹${computed.yesterdaySales.toLocaleString("en-IN")} across ${computed.yesterdayOrdersCount} orders
- Last 7 Days Sales: ₹${computed.last7DaysSales.toLocaleString("en-IN")} across ${computed.last7DaysOrdersCount} orders
- This Month (MTD): ₹${computed.thisMonthSales.toLocaleString("en-IN")} across ${computed.thisMonthOrdersCount} orders
- Last Month's Benchmark: ₹${computed.lastMonthSales.toLocaleString("en-IN")} across ${computed.lastMonthOrdersCount} orders
- Month-over-Month Growth: ${computed.monthOverMonthGrowthPct !== null ? `${computed.monthOverMonthGrowthPct}%` : "No prior month comparative record"}
- Average Order Value (AOV): ₹${computed.avgOrderValueThisMonth.toLocaleString("en-IN")}
- Est. Catalog Gross Margin: ${computed.estimatedGrossMarginPercent}%
- Payment Split (MTD):
    * Cash (Rokad/Galla): ₹${computed.paymentSplitThisMonth.cash.toLocaleString("en-IN")}
    * UPI (Digital / QR): ₹${computed.paymentSplitThisMonth.upi.toLocaleString("en-IN")}
    * Credit (Khata / Udhaar): ₹${computed.paymentSplitThisMonth.credit.toLocaleString("en-IN")}
    * Card / POS: ₹${computed.paymentSplitThisMonth.card.toLocaleString("en-IN")}
- Top Selling Products (MTD): ${
      computed.topSellingProducts.length > 0
        ? computed.topSellingProducts.map((p) => `${p.name} (${p.quantity} units sold, revenue ₹${p.revenue.toLocaleString("en-IN")})`).join(", ")
        : "None recorded this month"
    }

--- INVENTORY VALUATION & STOCK MOVEMENTS ---
- Total Active Catalog Products: ${computed.totalActiveProducts}
- Inventory Asset Value: Purchase Cost: ₹${computed.totalInventoryValuationCost.toLocaleString("en-IN")} | Retail Potential: ₹${computed.totalInventoryValuationRetail.toLocaleString("en-IN")}
- Out of Stock Shelves (0 quantity): ${computed.outOfStockCount} items
- Urgent Low-Stock Alerts (${computed.lowStockItems.length} items below minimum safety threshold):
${
  computed.lowStockItems.length > 0
    ? computed.lowStockItems
        .map(
          (i, idx) =>
            `  ${idx + 1}. ${i.name} (In Stock: ${i.currentStock}, Safety Level: ${i.minStock}, Price: ₹${i.unitPrice}${i.supplier ? `, Supplier: ${i.supplier}` : ""})`
        )
        .join("\n")
    : "  All active inventory is stocked above safe thresholds."
}
- Slow-Moving / Dead Stock (In stock, but 0 sales this month):
${
  computed.deadStockItems.length > 0
    ? computed.deadStockItems
        .map((d, idx) => `  ${idx + 1}. ${d.name} (${d.currentStock} units on shelf, unit price ₹${d.unitPrice})`)
        .join("\n")
    : "  No dead stock identified."
}

--- KHATA LEDGER & CUSTOMER RECEIVABLES (UDHAAR) ---
- Total Uncollected Customer Udhaar: ₹${computed.totalOutstandingUdhaar.toLocaleString("en-IN")}
- Active Customers with Overdue Dues: ${computed.customersWithDuesCount}
- Top Debtor Accounts (Collection Priority):
${
  computed.topDebtors.length > 0
    ? computed.topDebtors
        .map(
          (d, idx) =>
            `  ${idx + 1}. ${d.name}: Dues ₹${d.pendingAmount.toLocaleString("en-IN")} (Credit Limit: ₹${d.creditLimit.toLocaleString("en-IN")}, Health Risk: ${d.riskLevel || "Average"}${d.phone ? `, Contact: ${d.phone}` : ""})`
        )
        .join("\n")
    : "  No outstanding customer credit balances recorded."
}

--- EXPENSES & SUPPLIER PAYABLES ---
- Today's Store Operating Expenses: ₹${computed.todayExpenses.toLocaleString("en-IN")}
- This Month's Total Expenses: ₹${computed.thisMonthExpenses.toLocaleString("en-IN")}
- Expense Categories (MTD): ${
      computed.expenseCategoriesBreakdown.length > 0
        ? computed.expenseCategoriesBreakdown.map((e) => `${e.category}: ₹${e.amount.toLocaleString("en-IN")}`).join(", ")
        : "No expenses recorded this month"
    }
- Outstanding Supplier Payables: ₹${computed.totalPayableSupplierDues.toLocaleString("en-IN")}
- Pending Purchase Orders: ${computed.pendingPurchaseOrdersCount}

--- STAFF ROSTER & SHIFT ATTENDANCE ---
- Total Registered Staff: ${computed.staffSummary?.total || 0}
- Present on Shift Today: ${computed.staffSummary?.present || 0}
- Absent Today: ${computed.staffSummary?.absent && computed.staffSummary.absent.length > 0 ? computed.staffSummary.absent.join(", ") : "None (100% staff present)"}
===================================================================
`;

    return { computed, formattedPromptContext };
  }
}
