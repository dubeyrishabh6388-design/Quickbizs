import { PurchaseRepository } from "../repositories/purchaseRepository";
import { prisma } from "../config/prisma";

const purchaseRepository = new PurchaseRepository();

export class PurchaseService {
  async getPurchases(params: {
    businessId: string;
    search?: string;
    supplierId?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [purchases, total] = await Promise.all([
      purchaseRepository.findMany({
        businessId: params.businessId,
        search: params.search,
        supplierId: params.supplierId,
        skip,
        take,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }),
      purchaseRepository.count({
        businessId: params.businessId,
        search: params.search,
        supplierId: params.supplierId,
      }),
    ]);

    return {
      purchases,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getPurchaseById(businessId: string, id: string) {
    const purchase = await purchaseRepository.findById(businessId, id);
    if (!purchase) {
      const err: any = new Error("Purchase Order record not found.");
      err.statusCode = 404;
      throw err;
    }
    return purchase;
  }

  async createPurchaseOrder(
    businessId: string,
    data: {
      supplierId: string;
      expectedDelivery?: Date;
      items: {
        productId: string;
        orderedQuantity: number;
        purchasePrice: number;
        gst: number;
        discount: number;
      }[];
      remarks?: string;
      createdBy: string;
    }
  ) {
    // 1. Validation (Step 11)
    if (!data.supplierId || !data.items || data.items.length === 0) {
      const err: any = new Error("Supplier ID and purchase items list are mandatory.");
      err.statusCode = 400;
      throw err;
    }

    const supplier = await prisma.supplier.findFirst({
      where: { id: data.supplierId, businessId, isDeleted: false },
    });
    if (!supplier) {
      const err: any = new Error("Supplier profile not registered.");
      err.statusCode = 400;
      throw err;
    }

    let subtotal = 0;
    let discount = 0;
    let gstAmount = 0;
    const compiledItems: any[] = [];

    for (const item of data.items) {
      if (item.orderedQuantity <= 0 || item.purchasePrice <= 0) {
        const err: any = new Error("Ordered quantity and purchase unit price must be positive numbers.");
        err.statusCode = 400;
        throw err;
      }

      const product = await prisma.product.findFirst({
        where: { id: item.productId, businessId, isDeleted: false },
      });

      if (!product) {
        const err: any = new Error("Product profile does not exist in store catalog.");
        err.statusCode = 400;
        throw err;
      }

      const itemSubtotal = item.purchasePrice * item.orderedQuantity;
      const itemGst = itemSubtotal * (item.gst / 100);

      subtotal += itemSubtotal;
      discount += item.discount;
      gstAmount += itemGst;

      compiledItems.push({
        productId: item.productId,
        orderedQuantity: item.orderedQuantity,
        remainingQuantity: item.orderedQuantity,
        purchasePrice: item.purchasePrice,
        gst: item.gst,
        discount: item.discount,
        status: "Pending",
      });
    }

    const grandTotal = subtotal - discount + gstAmount;

    const automationLog = {
      trigger: "PO Requisition",
      action: "Create Supplier Purchase Order Ledger",
      result: `Created purchase order of grand total ₹${grandTotal.toLocaleString()}`,
      status: "Success",
      duration: "3ms",
    };

    return purchaseRepository.createPurchaseOrderInTransaction(businessId, {
      po: {
        supplierId: data.supplierId,
        status: "Pending Approval",
        orderDate: new Date(),
        expectedDelivery: data.expectedDelivery || null,
        subtotal,
        discount,
        gst: gstAmount,
        grandTotal,
        remarks: data.remarks || null,
        createdBy: data.createdBy,
      },
      items: compiledItems,
      automationLog,
    });
  }

  async approvePurchaseOrder(businessId: string, id: string, approvedBy: string) {
    const affected = await purchaseRepository.approvePurchaseOrder(businessId, id, approvedBy);
    if (affected.count === 0) {
      const err: any = new Error("Purchase Order not found or not in Pending Approval status.");
      err.statusCode = 400;
      throw err;
    }
    return true;
  }

  async receiveGoods(
    businessId: string,
    id: string,
    data: {
      receivedItems: {
        productId: string;
        receivedQty: number;
        damagedQty?: number;
        rejectedQty?: number;
        missingQty?: number;
        batchNumber?: string;
        expiryDate?: Date;
      }[];
      remarks?: string;
      receivedBy: string;
    }
  ) {
    const po = await purchaseRepository.findById(businessId, id);
    if (!po) {
      const err: any = new Error("Purchase Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (po.status === "Fully Received" || po.status === "Cancelled") {
      const err: any = new Error("Goods receipt cannot be processed. Purchase order status restricts receiving.");
      err.statusCode = 400;
      throw err;
    }

    const receiptItems: any[] = [];
    const inventoryUpdates: any[] = [];
    const itemQuantityUpdates: any[] = [];
    let supplierDuesIncrement = 0;

    for (const recItem of data.receivedItems) {
      const poItem = po.items.find((item) => item.productId === recItem.productId);
      if (!poItem) {
        const err: any = new Error(`Item ${recItem.productId} is not part of this Purchase Order.`);
        err.statusCode = 400;
        throw err;
      }

      if (recItem.receivedQty <= 0) {
        const err: any = new Error("Received quantity must be greater than zero.");
        err.statusCode = 400;
        throw err;
      }

      const maxReceivable = poItem.remainingQuantity;
      if (recItem.receivedQty > maxReceivable) {
        const err: any = new Error(
          `Receiving count exceeds ordered remaining levels (Requested: ${recItem.receivedQty}, Remaining: ${maxReceivable}).`
        );
        err.statusCode = 400;
        throw err;
      }

      const totalReceived = poItem.receivedQuantity + recItem.receivedQty;
      const remaining = poItem.orderedQuantity - totalReceived;
      const itemStatus = remaining === 0 ? "Fully Received" : "Partially Received";

      itemQuantityUpdates.push({
        itemId: poItem.id,
        receivedQuantity: totalReceived,
        remainingQuantity: remaining,
        status: itemStatus,
      });

      // Calculate cost of items received (Step 7)
      const lineCost = poItem.purchasePrice * recItem.receivedQty;
      const lineGst = lineCost * (poItem.gst / 100);
      supplierDuesIncrement += lineCost - poItem.discount + lineGst;

      receiptItems.push({
        productId: recItem.productId,
        receivedQty: recItem.receivedQty,
        damagedQty: recItem.damagedQty || 0,
        rejectedQty: recItem.rejectedQty || 0,
        missingQty: recItem.missingQty || 0,
        batchNumber: recItem.batchNumber || undefined,
        expiryDate: recItem.expiryDate ? new Date(recItem.expiryDate) : undefined,
      });

      // Fetch current shelf stock to update inventory counts
      const inventory = await prisma.inventory.findFirst({
        where: { productId: recItem.productId, businessId },
      });

      if (inventory) {
        // Exclude damaged/rejected quantities from available quantities count (Step 5)
        const netAddedQty = recItem.receivedQty - (recItem.damagedQty || 0) - (recItem.rejectedQty || 0);
        inventoryUpdates.push({
          productId: recItem.productId,
          inventoryId: inventory.id,
          newQty: inventory.availableQuantity + netAddedQty,
          openingQty: inventory.availableQuantity,
          addedQty: netAddedQty,
        });
      }
    }

    // Determine new status
    const allItemsReceived = po.items.every((item) => {
      const update = itemQuantityUpdates.find((u) => u.itemId === item.id);
      const remaining = update ? update.remainingQuantity : item.remainingQuantity;
      return remaining === 0;
    });

    const statusUpdate = allItemsReceived ? "Fully Received" : "Partially Received";

    const automationLog = {
      trigger: "Goods Received (GRN)",
      action: "Process GRN Receiving Entry",
      result: `Processed Goods Receipt. Status: ${statusUpdate}`,
      status: "Success",
      duration: "5ms",
    };

    return purchaseRepository.receiveGoodsInTransaction(businessId, id, {
      grn: {
        receivedBy: data.receivedBy,
        remarks: data.remarks,
      },
      receiptItems,
      statusUpdate,
      supplierDuesIncrement,
      inventoryUpdates,
      itemQuantityUpdates,
      automationLog,
    });
  }

  async returnGoods(
    businessId: string,
    id: string,
    data: {
      items: {
        productId: string;
        returnQty: number;
        reason: string;
      }[];
      returnedBy: string;
    }
  ) {
    const po = await purchaseRepository.findById(businessId, id);
    if (!po) {
      const err: any = new Error("Purchase Order not found.");
      err.statusCode = 404;
      throw err;
    }

    const returnLogs: any[] = [];
    const inventoryUpdates: any[] = [];
    let supplierDuesReduction = 0;

    for (const rItem of data.items) {
      const poItem = po.items.find((item) => item.productId === rItem.productId);
      if (!poItem) {
        const err: any = new Error(`Item ${rItem.productId} is not part of this Purchase Order.`);
        err.statusCode = 400;
        throw err;
      }

      if (rItem.returnQty <= 0) {
        const err: any = new Error("Returned quantity must be greater than zero.");
        err.statusCode = 400;
        throw err;
      }

      if (poItem.receivedQuantity < rItem.returnQty) {
        const err: any = new Error("Returned quantity cannot exceed received quantity levels.");
        err.statusCode = 400;
        throw err;
      }

      const lineCost = poItem.purchasePrice * rItem.returnQty;
      const lineGst = lineCost * (poItem.gst / 100);
      supplierDuesReduction += lineCost - poItem.discount + lineGst;

      returnLogs.push({
        productId: rItem.productId,
        returnQty: rItem.returnQty,
        reason: rItem.reason,
        returnedBy: data.returnedBy,
      });

      const inventory = await prisma.inventory.findFirst({
        where: { productId: rItem.productId, businessId },
      });

      if (inventory) {
        if (inventory.availableQuantity < rItem.returnQty) {
          const err: any = new Error(`Insufficient shelf inventory to return product.`);
          err.statusCode = 400;
          throw err;
        }

        inventoryUpdates.push({
          productId: rItem.productId,
          inventoryId: inventory.id,
          newQty: inventory.availableQuantity - rItem.returnQty,
          openingQty: inventory.availableQuantity,
          deductedQty: rItem.returnQty,
        });
      }
    }

    const automationLog = {
      trigger: "Goods Returned",
      action: "Process Return to Supplier Ledger",
      result: `Processed purchase return. Deducted ₹${supplierDuesReduction.toLocaleString()} dues.`,
      status: "Success",
      duration: "4ms",
    };

    return purchaseRepository.returnGoodsInTransaction(businessId, id, {
      returnLogs,
      inventoryUpdates,
      supplierDuesReduction,
      automationLog,
    });
  }

  async addPayment(
    businessId: string,
    id: string,
    data: {
      paymentMethod: string;
      amount: number;
      referenceNumber?: string;
      paidBy: string;
    }
  ) {
    if (data.amount <= 0) {
      const err: any = new Error("Payment amount must be positive.");
      err.statusCode = 400;
      throw err;
    }

    const automationLog = {
      trigger: "Purchase Payment",
      action: "Settle Supplier Accounts Ledger",
      result: `Paid ₹${data.amount.toLocaleString()} via ${data.paymentMethod}`,
      status: "Success",
      duration: "3ms",
    };

    return purchaseRepository.addPaymentInTransaction(businessId, id, {
      payment: data,
      automationLog,
    });
  }

  async getOutstanding(businessId: string) {
    const suppliers = await prisma.supplier.findMany({
      where: { businessId, outstandingAmount: { gt: 0 }, isDeleted: false },
      orderBy: { outstandingAmount: "desc" },
    });

    const totalOutstanding = suppliers.reduce((acc, s) => acc + s.outstandingAmount, 0);

    return {
      suppliers,
      totalOutstanding,
      timestamp: new Date().toISOString(),
    };
  }
}
