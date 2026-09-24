import { BillingRepository } from "../repositories/billingRepository";
import { prisma } from "../config/prisma";

const billingRepository = new BillingRepository();

export class BillingService {
  async getOrders(params: {
    businessId: string;
    search?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [orders, total] = await Promise.all([
      billingRepository.findMany({
        businessId: params.businessId,
        search: params.search,
        customerId: params.customerId,
        startDate: params.startDate,
        endDate: params.endDate,
        skip,
        take,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }),
      billingRepository.count({
        businessId: params.businessId,
        search: params.search,
        customerId: params.customerId,
        startDate: params.startDate,
        endDate: params.endDate,
      }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getOrderById(businessId: string, id: string) {
    const order = await billingRepository.findById(businessId, id);
    if (!order) {
      const err: any = new Error("Sales invoice record not found.");
      err.statusCode = 404;
      throw err;
    }
    return order;
  }

  async getRecentOrders(businessId: string, limit: number = 10) {
    return prisma.order.findMany({
      where: { businessId, deletedAt: null },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async getTodayOrders(businessId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return prisma.order.findMany({
      where: {
        businessId,
        deletedAt: null,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createOrder(
    businessId: string,
    data: {
      customerId?: string;
      customerName: string;
      customerType: "Retail" | "Member" | "Wholesale";
      employeeId?: string;
      items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        gst: number;
      }[];
      paymentMethod: "Cash" | "UPI" | "Card" | "Wallet" | "Credit" | "Split";
      splitDetails?: { cash: number; upi: number };
      notes?: string;
    }
  ) {
    // 1. Validations (Step 9)
    if (!data.items || data.items.length === 0) {
      const err: any = new Error("Sales invoice must contain at least one item.");
      err.statusCode = 400;
      throw err;
    }

    // Validate quantities
    for (const item of data.items) {
      if (item.quantity <= 0) {
        const err: any = new Error("Product purchase quantity must be positive.");
        err.statusCode = 400;
        throw err;
      }
    }

    // Validate customer if provided
    let customerObj = null;
    if (data.customerId) {
      customerObj = await prisma.customer.findFirst({
        where: { id: data.customerId, businessId, isDeleted: false },
      });
      if (!customerObj) {
        const err: any = new Error("Customer profile does not exist in ledger.");
        err.statusCode = 400;
        throw err;
      }
    }

    // 2. Pricing totals compiling
    let subtotal = 0;
    let discount = 0;
    let gstAmount = 0;
    const compiledItems: any[] = [];
    const inventoryUpdates: any[] = [];

    for (const item of data.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, businessId, isDeleted: false },
        include: { inventories: true },
      });

      if (!product) {
        const err: any = new Error("Product card does not exist.");
        err.statusCode = 400;
        throw err;
      }

      // Check stock availability (Step 9)
      const inventory = product.inventories.find((inv) => inv.businessId === businessId);
      if (!inventory || inventory.availableQuantity < item.quantity) {
        const err: any = new Error(
          `Insufficient stock available for product "${product.name}" (Requested: ${item.quantity}, Available: ${inventory?.availableQuantity || 0}).`
        );
        err.statusCode = 400;
        err.problem = "Stock limits validation failed.";
        err.reason = "Quantity requested exceeds shelf stock levels.";
        err.solution = "Please reduce quantities or create a restock PO.";
        throw err;
      }

      const itemSubtotal = item.unitPrice * item.quantity;
      const itemGst = itemSubtotal * (item.gst / 100);
      const itemTotal = itemSubtotal - item.discount + itemGst;

      subtotal += itemSubtotal;
      discount += item.discount;
      gstAmount += itemGst;

      compiledItems.push({
        productId: item.productId,
        productName: product.name,
        barcode: product.barcode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        gst: item.gst,
        total: itemTotal,
      });

      inventoryUpdates.push({
        inventoryId: inventory.id,
        productId: item.productId,
        newQty: inventory.availableQuantity - item.quantity,
        openingQty: inventory.availableQuantity,
        qtyDeducted: item.quantity,
      });
    }

    const taxableAmount = subtotal - discount;
    const totalBeforeRoundOff = taxableAmount + gstAmount;
    const grandTotal = Math.round(totalBeforeRoundOff);
    const roundOff = grandTotal - totalBeforeRoundOff;

    if (grandTotal < 0) {
      const err: any = new Error("Grand total cannot be a negative value.");
      err.statusCode = 400;
      throw err;
    }

    // 3. Payments compilations
    const paymentsToSeed: any[] = [];
    if (data.paymentMethod === "Split" && data.splitDetails) {
      paymentsToSeed.push({
        paymentMethod: "Cash",
        amount: data.splitDetails.cash,
        status: "Success",
      });
      paymentsToSeed.push({
        paymentMethod: "UPI",
        amount: data.splitDetails.upi,
        status: "Success",
      });
    } else {
      paymentsToSeed.push({
        paymentMethod: data.paymentMethod,
        amount: grandTotal,
        status: data.paymentMethod === "Credit" ? "Pending" : "Success",
      });
    }

    // 4. Customer balance & points updates (Step 6)
    let customerUpdateData = undefined;
    if (customerObj) {
      const addedPoints = Math.floor(grandTotal / 100);
      const newPending = data.paymentMethod === "Credit" ? customerObj.pendingAmount + grandTotal : customerObj.pendingAmount;

      // Credit limit checking (Step 9)
      if (data.paymentMethod === "Credit" && newPending > customerObj.creditLimit) {
        const err: any = new Error(
          `Credit limit exceeded. Credit checkout denied (Limit: ₹${customerObj.creditLimit.toLocaleString()}, Pending Dues with this purchase: ₹${newPending.toLocaleString()}).`
        );
        err.statusCode = 400;
        throw err;
      }

      customerUpdateData = {
        id: customerObj.id,
        pendingAmount: newPending,
        rewardPoints: customerObj.rewardPoints + addedPoints,
        lastPurchaseAt: new Date(),
      };
    }

    // 5. Automation logger trigger (Step 6)
    const automationLog = {
      trigger: "Invoice Generation",
      action: "Create POS Checkout Transaction Ledger",
      result: `Created sales invoice of ₹${grandTotal.toLocaleString()}`,
      status: "Success",
      duration: "4ms",
    };

    // 6. Execute atomic transaction in repo
    const result = await billingRepository.createOrderInTransaction(businessId, {
      order: {
        customerId: data.customerId || null,
        employeeId: data.employeeId || null,
        subtotal,
        discount,
        gstAmount,
        taxableAmount,
        roundOff,
        grandTotal,
        paymentStatus: data.paymentMethod === "Credit" ? "Pending" : "Paid",
        paymentMethod: data.paymentMethod,
        orderStatus: "Completed",
        notes: data.notes || null,
      },
      items: compiledItems,
      payments: paymentsToSeed,
      customerUpdate: customerUpdateData,
      inventoryUpdates,
      automationLog,
    });

    return result;
  }

  async cancelOrder(businessId: string, id: string) {
    const automationLog = {
      trigger: "Invoice Cancellation",
      action: "Cancel Order Transaction Ledger",
      result: `Cancelled invoice ID: ${id}`,
      status: "Success",
      duration: "6ms",
    };

    return billingRepository.cancelOrderInTransaction(businessId, id, {
      automationLog,
    });
  }
}
