import { prisma } from "../config/prisma";
import { normalizeIdentifier } from "../utils/identifierUtils";

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
        purchasePayments: true,
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
        purchasePayments: true,
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

      // 4. Write audit log
      try {
        await tx.auditLog.create({
          data: {
            businessId,
            action: "PO_CREATED",
            module: "Purchases",
            status: "Success",
            reason: `Created purchase order (PO Number: ${poNumber})`,
          },
        });
      } catch (e) {}

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
      serialReceipts?: {
        purchaseItemId: string;
        productId: string;
        serials: { serialNumber: string; imei1?: string; imei2?: string; costPrice?: number }[];
      }[];
      batchReceipts?: {
        purchaseItemId: string;
        productId: string;
        batchNumber: string;
        expiryDate?: Date;
        quantity: number;
        costPrice: number;
        salePrice: number;
        mrp?: number;
      }[];
      automationLog: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Generate unique GRN reference number
      const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;
      const grn = {
        id: grnNumber,
        grnNumber,
        receivedBy: params.grn.receivedBy,
        remarks: params.grn.remarks || null,
      };

      // 2. Ingest Serialized Units if provided
      if (params.serialReceipts && params.serialReceipts.length > 0) {
        for (const receipt of params.serialReceipts) {
          for (const s of receipt.serials) {
            const normSerial = normalizeIdentifier(s.serialNumber);
            const normImei1 = s.imei1 ? normalizeIdentifier(s.imei1) : null;
            const normImei2 = s.imei2 ? normalizeIdentifier(s.imei2) : null;

            const serial = await tx.productSerial.create({
              data: {
                businessId,
                productId: receipt.productId,
                purchaseItemId: receipt.purchaseItemId,
                serialNumber: normSerial,
                imei1: normImei1,
                imei2: normImei2,
                status: "IN_STOCK",
                costPrice: s.costPrice || 0,
              },
            });

            await tx.deviceIdentifier.create({
              data: {
                businessId,
                serialId: serial.id,
                identifierType: "SERIAL_NUMBER",
                identifierValue: normSerial,
              },
            });

            if (normImei1) {
              await tx.deviceIdentifier.create({
                data: {
                  businessId,
                  serialId: serial.id,
                  identifierType: "IMEI1",
                  identifierValue: normImei1,
                },
              });
            }

            if (normImei2) {
              await tx.deviceIdentifier.create({
                data: {
                  businessId,
                  serialId: serial.id,
                  identifierType: "IMEI2",
                  identifierValue: normImei2,
                },
              });
            }

            await tx.serialAuditLog.create({
              data: {
                businessId,
                serialId: serial.id,
                action: "GOODS_RECEIVED",
                newStatus: "IN_STOCK",
                referenceType: "PurchaseOrder",
                referenceId: poId,
                performedBy: params.grn.receivedBy || "Purchasing",
                notes: `Received on GRN ${grnNumber}`,
              },
            });
          }
        }
      }

      // 3. Ingest Multi-Batch Lots if provided
      if (params.batchReceipts && params.batchReceipts.length > 0) {
        for (const b of params.batchReceipts) {
          const normBatchNumber = b.batchNumber.trim().toUpperCase();

          const existingBatch = await tx.productBatch.findUnique({
            where: {
              businessId_productId_batchNumber: {
                businessId,
                productId: b.productId,
                batchNumber: normBatchNumber,
              },
            },
          });

          let batchId = "";
          let balanceAfter = 0;

          if (existingBatch) {
            balanceAfter = existingBatch.availableQuantity + b.quantity;
            await tx.productBatch.update({
              where: { id: existingBatch.id },
              data: {
                availableQuantity: balanceAfter,
                status: "ACTIVE",
              },
            });
            batchId = existingBatch.id;
          } else {
            balanceAfter = b.quantity;
            const newBatch = await tx.productBatch.create({
              data: {
                businessId,
                productId: b.productId,
                purchaseItemId: b.purchaseItemId,
                batchNumber: normBatchNumber,
                expiryDate: b.expiryDate ? new Date(b.expiryDate) : null,
                initialQuantity: b.quantity,
                availableQuantity: b.quantity,
                costPrice: b.costPrice,
                salePrice: b.salePrice,
                mrp: b.mrp || b.salePrice,
                status: "ACTIVE",
              },
            });
            batchId = newBatch.id;
          }

          await tx.batchMovement.create({
            data: {
              businessId,
              batchId,
              movementType: "PURCHASE_RECEIPT",
              quantityDelta: b.quantity,
              balanceAfter,
              referenceType: "PurchaseOrder",
              referenceId: poId,
              performedBy: params.grn.receivedBy || "Purchasing",
              notes: `Received on GRN ${grnNumber}`,
            },
          });
        }
      }

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

      // 8. Write audit log
      try {
        await tx.auditLog.create({
          data: {
            businessId,
            action: "GOODS_RECEIVED",
            module: "Purchases",
            status: "Success",
            reason: `Goods Received (GRN: ${grnNumber})`,
          },
        });
      } catch (e) {}

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

      try {
        await tx.auditLog.create({
          data: {
            businessId,
            action: "PURCHASE_RETURN",
            module: "Purchases",
            status: "Success",
            reason: `Purchase Return (Return: ${returnNumber})`,
          },
        });
      } catch (e) {}

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

      // Write Audit Log
      try {
        await tx.auditLog.create({
          data: {
            businessId,
            action: "SUPPLIER_PAYMENT",
            module: "Purchases",
            status: "Success",
            reason: `Supplier Payment of ₹${params.payment.amount} recorded`,
          },
        });
      } catch (e) {}

      return payment;
    });
  }
}
