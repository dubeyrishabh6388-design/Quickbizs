import { prisma } from "../config/prisma";

export class PurchaseRepository {
  async findMany(params: {
    businessId: string;
    search?: string;
    supplierId?: string;
    skip: number;
    take: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: any = {
      businessId: params.businessId,
    };

    if (params.search) {
      where.OR = [
        { poNumber: { contains: params.search } },
        { status: { contains: params.search } },
      ];
    }

    if (params.supplierId) {
      where.supplierId = params.supplierId;
    }

    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    return prisma.purchaseOrder.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
      include: {
        items: true,
        supplier: true,
        goodsReceipts: {
          include: { items: true },
        },
        payments: true,
      },
    });
  }

  async count(params: {
    businessId: string;
    search?: string;
    supplierId?: string;
  }) {
    const where: any = {
      businessId: params.businessId,
    };

    if (params.search) {
      where.OR = [
        { poNumber: { contains: params.search } },
        { status: { contains: params.search } },
      ];
    }

    if (params.supplierId) {
      where.supplierId = params.supplierId;
    }

    return prisma.purchaseOrder.count({ where });
  }

  async findById(businessId: string, id: string) {
    return prisma.purchaseOrder.findFirst({
      where: { id, businessId },
      include: {
        items: true,
        supplier: true,
        goodsReceipts: {
          include: { items: true },
        },
        returns: true,
        payments: true,
      },
    });
  }

  async createPurchaseOrderInTransaction(
    businessId: string,
    params: {
      po: any;
      items: any[];
      automationLog: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Generate unique PO number
      const count = await tx.purchaseOrder.count({
        where: { businessId },
      });
      const poNumber = `PO-${1000 + count + 1}`;

      // 2. Create PurchaseOrder
      const po = await tx.purchaseOrder.create({
        data: {
          businessId,
          ...params.po,
          poNumber,
        },
      });

      // 3. Create Items
      const items = await Promise.all(
        params.items.map((item) =>
          tx.purchaseItem.create({
            data: {
              purchaseOrderId: po.id,
              ...item,
            },
          })
        )
      );

      // 4. Write automation log
      await tx.automationLog.create({
        data: {
          businessId,
          ...params.automationLog,
          result: `${params.automationLog.result} (PO Number: ${poNumber})`,
        },
      });

      return { po, items };
    });
  }

  async approvePurchaseOrder(businessId: string, id: string, approvedBy: string) {
    return prisma.purchaseOrder.updateMany({
      where: { id, businessId, status: "Pending Approval" },
      data: {
        status: "Approved",
        approvedBy,
      },
    });
  }

  async receiveGoodsInTransaction(
    businessId: string,
    poId: string,
    params: {
      grn: any;
      receiptItems: any[];
      statusUpdate: string;
      supplierDuesIncrement: number;
      inventoryUpdates: {
        productId: string;
        inventoryId: string;
        newQty: number;
        openingQty: number;
        addedQty: number;
        batchNumber?: string;
        expiryDate?: Date;
      }[];
      itemQuantityUpdates: {
        itemId: string;
        receivedQuantity: number;
        remainingQuantity: number;
        status: string;
      }[];
      automationLog: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Generate unique GRN number
      const grnCount = await tx.goodsReceipt.count({
        where: { businessId },
      });
      const grnNumber = `GRN-${5000 + grnCount + 1}`;

      // 2. Create GoodsReceipt record
      const grn = await tx.goodsReceipt.create({
        data: {
          businessId,
          purchaseOrderId: poId,
          grnNumber,
          receivedBy: params.grn.receivedBy,
          remarks: params.grn.remarks || null,
        },
      });

      // 3. Create GoodsReceiptItems
      await Promise.all(
        params.receiptItems.map((item) =>
          tx.goodsReceiptItem.create({
            data: {
              goodsReceiptId: grn.id,
              productId: item.productId,
              receivedQty: item.receivedQty,
              damagedQty: item.damagedQty || 0,
              rejectedQty: item.rejectedQty || 0,
              missingQty: item.missingQty || 0,
              batchNumber: item.batchNumber || null,
              expiryDate: item.expiryDate || null,
            },
          })
        )
      );

      // 4. Update PurchaseItems received quantities
      for (const itemUpdate of params.itemQuantityUpdates) {
        await tx.purchaseItem.update({
          where: { id: itemUpdate.itemId },
          data: {
            receivedQuantity: itemUpdate.receivedQuantity,
            remainingQuantity: itemUpdate.remainingQuantity,
            status: itemUpdate.status,
          },
        });
      }

      // 5. Update PurchaseOrder Status
      const po = await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: params.statusUpdate },
      });

      // 6. Update Product & Inventory counts, create Stock Movements
      for (const invUpdate of params.inventoryUpdates) {
        await tx.product.updateMany({
          where: { id: invUpdate.productId, businessId },
          data: { stock: invUpdate.newQty },
        });

        await tx.inventory.update({
          where: { id: invUpdate.inventoryId },
          data: {
            availableQuantity: invUpdate.newQty,
            lastUpdated: new Date(),
          },
        });

        await tx.stockMovement.create({
          data: {
            businessId,
            productId: invUpdate.productId,
            inventoryId: invUpdate.inventoryId,
            referenceType: "Purchase",
            referenceId: grn.id,
            movementType: "IN",
            quantity: invUpdate.addedQty,
            openingStock: invUpdate.openingQty,
            closingStock: invUpdate.newQty,
            reason: `Purchase Receipt GRN checkout: ${grnNumber}`,
            createdBy: params.grn.receivedBy,
          },
        });
      }

      // 7. Update Supplier outstanding dues and last purchase date (Step 10)
      await tx.supplier.update({
        where: { id: po.supplierId },
        data: {
          outstandingAmount: { increment: params.supplierDuesIncrement },
          lastPurchaseDate: new Date(),
        },
      });

      // 8. Write Automation Logs
      await tx.automationLog.create({
        data: {
          businessId,
          ...params.automationLog,
          result: `${params.automationLog.result} (GRN: ${grnNumber})`,
        },
      });

      return { grn, po };
    });
  }

  async returnGoodsInTransaction(
    businessId: string,
    poId: string,
    params: {
      returnLogs: {
        productId: string;
        returnQty: number;
        reason: string;
        returnedBy: string;
      }[];
      inventoryUpdates: {
        productId: string;
        inventoryId: string;
        newQty: number;
        openingQty: number;
        deductedQty: number;
      }[];
      supplierDuesReduction: number;
      automationLog: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const returnCount = await tx.purchaseReturn.count({
        where: { businessId },
      });
      const returnNumber = `RET-${2000 + returnCount + 1}`;

      const po = await tx.purchaseOrder.findFirst({
        where: { id: poId, businessId },
      });

      if (!po) throw new Error("Purchase Order not found.");

      // Create return logs
      const returns = await Promise.all(
        params.returnLogs.map((log) =>
          tx.purchaseReturn.create({
            data: {
              businessId,
              purchaseOrderId: poId,
              returnNumber,
              productId: log.productId,
              returnQty: log.returnQty,
              reason: log.reason,
              returnedBy: log.returnedBy,
            },
          })
        )
      );

      // Decrement inventory stock
      for (const invUpdate of params.inventoryUpdates) {
        await tx.product.updateMany({
          where: { id: invUpdate.productId, businessId },
          data: { stock: invUpdate.newQty },
        });

        await tx.inventory.update({
          where: { id: invUpdate.inventoryId },
          data: {
            availableQuantity: invUpdate.newQty,
            lastUpdated: new Date(),
          },
        });

        await tx.stockMovement.create({
          data: {
            businessId,
            productId: invUpdate.productId,
            inventoryId: invUpdate.inventoryId,
            referenceType: "Return",
            referenceId: returnNumber,
            movementType: "OUT",
            quantity: invUpdate.deductedQty,
            openingStock: invUpdate.openingQty,
            closingStock: invUpdate.newQty,
            reason: `Supplier Return: ${returnNumber}`,
            createdBy: params.returnLogs[0].returnedBy,
          },
        });
      }

      // Reduce Supplier balance dues
      await tx.supplier.update({
        where: { id: po.supplierId },
        data: {
          outstandingAmount: { decrement: params.supplierDuesReduction },
        },
      });

      // Update PO Status to Returned
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: "Returned" },
      });

      await tx.automationLog.create({
        data: {
          businessId,
          ...params.automationLog,
          result: `${params.automationLog.result} (Return: ${returnNumber})`,
        },
      });

      return returns;
    });
  }

  async addPaymentInTransaction(
    businessId: string,
    poId: string,
    params: {
      payment: {
        paymentMethod: string;
        amount: number;
        referenceNumber?: string;
        paidBy: string;
      };
      automationLog: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id: poId, businessId },
      });

      if (!po) throw new Error("Purchase Order not found.");

      // Create Payment
      const payment = await tx.purchasePayment.create({
        data: {
          businessId,
          purchaseOrderId: poId,
          paymentMethod: params.payment.paymentMethod,
          amount: params.payment.amount,
          referenceNumber: params.payment.referenceNumber || null,
          paidBy: params.payment.paidBy,
        },
      });

      // Deduct supplier outstanding
      await tx.supplier.update({
        where: { id: po.supplierId },
        data: {
          outstandingAmount: { decrement: params.payment.amount },
        },
      });

      // Write Automation Log
      await tx.automationLog.create({
        data: {
          businessId,
          ...params.automationLog,
        },
      });

      return payment;
    });
  }
}
