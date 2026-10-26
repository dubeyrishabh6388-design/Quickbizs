import { prisma } from "../config/prisma";

export class BillingRepository {
  async findMany(params: {
    businessId: string;
    search?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    skip: number;
    take: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: any = {
      businessId: params.businessId,
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { invoiceNumber: { contains: params.search } },
        { customerName: { contains: params.search } },
        { paymentMethod: { contains: params.search } },
      ];
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    return prisma.order.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
      include: {
        items: true,
        payments: true,
        customer: true,
      },
    });
  }

  async count(params: {
    businessId: string;
    search?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {
      businessId: params.businessId,
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { invoiceNumber: { contains: params.search } },
        { paymentMethod: { contains: params.search } },
      ];
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    return prisma.order.count({ where });
  }

  async findById(businessId: string, id: string) {
    return prisma.order.findFirst({
      where: { id, businessId, deletedAt: null },
      include: {
        items: true,
        payments: true,
        customer: true,
      },
    });
  }

  async findByInvoiceNumber(businessId: string, invoiceNumber: string) {
    return prisma.order.findFirst({
      where: { invoiceNumber, businessId, deletedAt: null },
      include: {
        items: true,
        payments: true,
      },
    });
  }

  async getInvoiceSequence(businessId: string, prefix: string = "INV") {
    return prisma.invoiceSequence.findFirst({
      where: { businessId, prefix },
    });
  }

  async createOrderInTransaction(
    businessId: string,
    params: {
      order: any;
      items: any[];
      payments: any[];
      customerUpdate?: {
        id: string;
        pendingAmount: number;
        rewardPoints: number;
        lastPurchaseAt: Date;
      };
      inventoryUpdates: {
        inventoryId: string;
        productId: string;
        newQty: number;
        openingQty: number;
        qtyDeducted: number;
      }[];
      automationLog: any;
      serialAllocations?: {
        orderItemIndex: number;
        serialId: string;
      }[];
      batchAllocations?: {
        orderItemIndex: number;
        batchId: string;
        quantity: number;
      }[];
    }
  ) {
    // Execute ACID transaction
    return prisma.$transaction(async (tx: any) => {
      // 1. Get next invoice number and increment sequence
      let sequence = await tx.invoiceSequence.findFirst({
        where: { businessId, prefix: "INV" },
      });

      if (!sequence) {
        sequence = await tx.invoiceSequence.create({
          data: {
            businessId,
            prefix: "INV",
            nextValue: 1001,
          },
        });
      }

      const invoiceNumber = `${sequence.prefix}-${sequence.nextValue}`;

      // Increment sequence
      await tx.invoiceSequence.update({
        where: { id: sequence.id },
        data: { nextValue: sequence.nextValue + 1 },
      });

      // 2. Create Order record
      const order = await tx.order.create({
        data: {
          businessId,
          ...params.order,
          invoiceNumber,
        },
      });

      // 3. Create OrderItems
      const items = await Promise.all(
        params.items.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              ...item,
            },
          })
        )
      );

      // 3a. Process Serialized Unit Allocations
      if (params.serialAllocations && params.serialAllocations.length > 0) {
        for (const alloc of params.serialAllocations) {
          const item = items[alloc.orderItemIndex];
          if (!item) continue;

          const serial = await tx.productSerial.findFirst({
            where: {
              id: alloc.serialId,
              businessId,
              status: { in: ["IN_STOCK", "RETURNED_RESTOCKED"] },
            },
          });

          if (!serial) {
            throw new Error(`Serialized unit is not available for sale or already sold.`);
          }

          // Atomically update ProductSerial status to SOLD
          await tx.productSerial.update({
            where: { id: serial.id },
            data: { status: "SOLD" },
          });

          // Create immutable 1-to-N SerialSaleHistory record
          await tx.serialSaleHistory.create({
            data: {
              businessId,
              serialId: serial.id,
              orderItemId: item.id,
              customerId: order.customerId || null,
              salePrice: item.unitPrice,
              warrantyStartDate: new Date(),
              warrantyEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year warranty
              status: "COMPLETED",
            },
          });

          // Record audit log
          await tx.serialAuditLog.create({
            data: {
              businessId,
              serialId: serial.id,
              action: "SALE",
              previousStatus: serial.status,
              newStatus: "SOLD",
              referenceType: "Order",
              referenceId: order.id,
              performedBy: order.employeeId || "Cashier",
              notes: `Sold on invoice ${invoiceNumber}`,
            },
          });
        }
      }

      // 3b. Process Multi-Batch FEFO Allocations
      if (params.batchAllocations && params.batchAllocations.length > 0) {
        for (const alloc of params.batchAllocations) {
          const item = items[alloc.orderItemIndex];
          if (!item) continue;

          const batch = await tx.productBatch.findFirst({
            where: {
              id: alloc.batchId,
              businessId,
              status: { in: ["ACTIVE", "NEAR_EXPIRY"] },
            },
          });

          if (!batch) {
            throw new Error(`Batch record not found or not active.`);
          }

          if (batch.availableQuantity < alloc.quantity) {
            throw new Error(`Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.availableQuantity}, requested: ${alloc.quantity}`);
          }

          const newBatchQty = batch.availableQuantity - alloc.quantity;

          // Update ProductBatch available stock
          await tx.productBatch.update({
            where: { id: batch.id },
            data: {
              availableQuantity: newBatchQty,
              status: newBatchQty === 0 ? "DEPLETED" : batch.status,
            },
          });

          // Insert OrderItemBatch junction
          await tx.orderItemBatch.create({
            data: {
              businessId,
              orderItemId: item.id,
              batchId: batch.id,
              quantityAllocated: alloc.quantity,
              unitPrice: item.unitPrice,
              costPrice: batch.costPrice,
            },
          });

          // Append to immutable BatchMovement ledger
          await tx.batchMovement.create({
            data: {
              businessId,
              batchId: batch.id,
              movementType: "SALE_ALLOCATION",
              quantityDelta: -alloc.quantity,
              balanceAfter: newBatchQty,
              referenceType: "Order",
              referenceId: order.id,
              performedBy: order.employeeId || "Cashier",
              notes: `Allocated to invoice ${invoiceNumber}`,
            },
          });
        }
      }

      // 4. Create Payments
      const payments = await Promise.all(
        params.payments.map((p) =>
          tx.payment.create({
            data: {
              orderId: order.id,
              ...p,
            },
          })
        )
      );

      // 5. Update Product table stock metrics
      for (const invUpdate of params.inventoryUpdates) {
        await tx.product.updateMany({
          where: { id: invUpdate.productId, businessId },
          data: { stock: invUpdate.newQty },
        });

        // 6. Update Inventory Available Quantity
        await tx.inventory.update({
          where: { id: invUpdate.inventoryId },
          data: {
            availableQuantity: invUpdate.newQty,
            lastUpdated: new Date(),
          },
        });

        // 7. Log Stock Movements
        await tx.stockMovement.create({
          data: {
            businessId,
            productId: invUpdate.productId,
            inventoryId: invUpdate.inventoryId,
            referenceType: "Sale",
            referenceId: order.id,
            movementType: "OUT",
            quantity: invUpdate.qtyDeducted,
            openingStock: invUpdate.openingQty,
            closingStock: invUpdate.newQty,
            reason: `Sales Invoice checkout: ${invoiceNumber}`,
            createdBy: order.employeeId || "Cashier",
          },
        });
      }

      // 8. Update Customer Purchase history if Member/Credit (Step 6)
      if (params.customerUpdate) {
        await tx.customer.update({
          where: { id: params.customerUpdate.id },
          data: {
            pendingAmount: params.customerUpdate.pendingAmount,
            rewardPoints: params.customerUpdate.rewardPoints,
            lastPurchaseAt: params.customerUpdate.lastPurchaseAt,
          },
        });
      }

      // 9. Write Audit Log
      try {
        await tx.auditLog.create({
          data: {
            businessId,
            action: "ORDER_CREATED",
            module: "Billing",
            status: "Success",
            reason: `${params.automationLog.result} (Invoice: ${invoiceNumber})`.slice(0, 255),
          },
        });
      } catch (logErr) {
        console.warn("Could not write audit log:", logErr);
      }

      return {
        order,
        items,
        payments,
      };
    }, {
      maxWait: 15000,
      timeout: 30000,
    });
  }

  async cancelOrderInTransaction(
    businessId: string,
    orderId: string,
    params: {
      automationLog: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, businessId, deletedAt: null },
        include: {
          items: {
            include: {
              serialSaleHistories: true,
              batchAllocations: { include: { batch: true } },
            },
          },
          customer: true,
        },
      });

      if (!order) {
        throw new Error("Invoice record not found.");
      }

      if (order.orderStatus === "Cancelled") {
        throw new Error("Invoice has already been cancelled.");
      }

      // Update Order Status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "Cancelled",
          paymentStatus: "Cancelled",
        },
      });

      // Restore stocks for each item
      for (const item of order.items) {
        // A. Restore Serialized Units
        if (item.serialSaleHistories && item.serialSaleHistories.length > 0) {
          for (const sHistory of item.serialSaleHistories) {
            if (sHistory.status === "COMPLETED") {
              await tx.serialSaleHistory.update({
                where: { id: sHistory.id },
                data: { status: "CANCELLED" },
              });

              await tx.productSerial.update({
                where: { id: sHistory.serialId },
                data: { status: "RETURNED_RESTOCKED" },
              });

              await tx.serialAuditLog.create({
                data: {
                  businessId,
                  serialId: sHistory.serialId,
                  action: "SALE_CANCELLED",
                  previousStatus: "SOLD",
                  newStatus: "RETURNED_RESTOCKED",
                  referenceType: "Order",
                  referenceId: orderId,
                  notes: `Restocked on invoice cancellation ${order.invoiceNumber}`,
                },
              });
            }
          }
        }

        // B. Restore Batches & Movement Ledger
        if (item.batchAllocations && item.batchAllocations.length > 0) {
          for (const alloc of item.batchAllocations) {
            const newBatchQty = alloc.batch.availableQuantity + alloc.quantityAllocated;

            await tx.productBatch.update({
              where: { id: alloc.batchId },
              data: {
                availableQuantity: newBatchQty,
                status: "ACTIVE",
              },
            });

            await tx.batchMovement.create({
              data: {
                businessId,
                batchId: alloc.batchId,
                movementType: "SALE_VOID",
                quantityDelta: alloc.quantityAllocated,
                balanceAfter: newBatchQty,
                referenceType: "Order",
                referenceId: orderId,
                performedBy: "Cashier",
                notes: `Voided sale on invoice cancellation ${order.invoiceNumber}`,
              },
            });
          }
        }

        const inventory = await tx.inventory.findFirst({
          where: { productId: item.productId, businessId },
        });

        if (inventory) {
          const newQty = inventory.availableQuantity + item.quantity;
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { availableQuantity: newQty, lastUpdated: new Date() },
          });

          await tx.product.updateMany({
            where: { id: item.productId, businessId },
            data: { stock: newQty },
          });

          // Log movement
          await tx.stockMovement.create({
            data: {
              businessId,
              productId: item.productId,
              inventoryId: inventory.id,
              referenceType: "Adjustment",
              referenceId: orderId,
              movementType: "IN",
              quantity: item.quantity,
              openingStock: inventory.availableQuantity,
              closingStock: newQty,
              reason: `Sales Invoice Cancellation: ${order.invoiceNumber}`,
              createdBy: "Cashier",
            },
          });
        }
      }

      // If credit purchase, restore customer balance
      if (order.paymentMethod === "Credit" && order.customerId && order.customer) {
        const newDues = Math.max(0, order.customer.pendingAmount - order.grandTotal);
        await tx.customer.update({
          where: { id: order.customerId },
          data: { pendingAmount: newDues },
        });
      }

      // Write Audit Log
      try {
        await tx.auditLog.create({
          data: {
            businessId,
            action: "ORDER_CANCELLED",
            module: "Billing",
            status: "Success",
            reason: `Sales Invoice Cancellation: ${order.invoiceNumber}`,
          },
        });
      } catch (logErr) {
        // Safe fallback
      }

      return updatedOrder;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });
  }

  async createSalesReturnInTransaction(
    businessId: string,
    params: {
      orderId: string;
      customerId?: string;
      refundAmount: number;
      refundMethod: string;
      reason?: string;
      receivedBy?: string;
      serialReturns?: {
        serialId: string;
        orderItemId: string;
        disposition: "RESTOCKED" | "DEFECTIVE";
        inspectionNotes?: string;
      }[];
      batchReturns?: {
        orderItemBatchId: string;
        returnQuantity: number;
        disposition: "RESTOCKED" | "SCRAPPED" | "QUARANTINED";
      }[];
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findFirst({
        where: { id: params.orderId, businessId },
        include: { items: true },
      });
      if (!order) throw new Error("Order not found.");

      const returnCount = await tx.salesReturn.count({ where: { businessId } });
      const returnNumber = `RET-${1000 + returnCount + 1}`;

      const salesReturn = await tx.salesReturn.create({
        data: {
          businessId,
          returnNumber,
          orderId: params.orderId,
          customerId: params.customerId || order.customerId || null,
          refundAmount: params.refundAmount,
          refundMethod: params.refundMethod,
          reason: params.reason || null,
          receivedBy: params.receivedBy || "Cashier",
        },
      });

      // Process Serial Returns
      if (params.serialReturns && params.serialReturns.length > 0) {
        for (const sRet of params.serialReturns) {
          const serial = await tx.productSerial.findFirst({
            where: { id: sRet.serialId, businessId },
          });
          if (!serial) throw new Error(`Serial unit not found: ${sRet.serialId}`);

          const newStatus = sRet.disposition === "RESTOCKED" ? "RETURNED_RESTOCKED" : "DEFECTIVE";

          await tx.productSerial.update({
            where: { id: serial.id },
            data: { status: newStatus },
          });

          const latestHistory = await tx.serialSaleHistory.findFirst({
            where: { serialId: serial.id, orderItemId: sRet.orderItemId, status: "COMPLETED" },
            orderBy: { soldAt: "desc" },
          });

          if (latestHistory) {
            await tx.serialSaleHistory.update({
              where: { id: latestHistory.id },
              data: {
                status: sRet.disposition === "RESTOCKED" ? "RETURNED_RESTOCKED" : "RETURNED_DEFECTIVE",
                returnedAt: new Date(),
                inspectionNotes: sRet.inspectionNotes || null,
              },
            });
          }

          await tx.returnItemSerial.create({
            data: {
              businessId,
              salesReturnId: salesReturn.id,
              serialId: serial.id,
              disposition: sRet.disposition,
              inspectionNotes: sRet.inspectionNotes || null,
            },
          });

          await tx.serialAuditLog.create({
            data: {
              businessId,
              serialId: serial.id,
              action: "CUSTOMER_RETURN",
              previousStatus: serial.status,
              newStatus,
              referenceType: "SalesReturn",
              referenceId: salesReturn.id,
              performedBy: params.receivedBy || "Cashier",
              notes: `Returned on credit note ${returnNumber}`,
            },
          });

          if (sRet.disposition === "RESTOCKED") {
            const inv = await tx.inventory.findFirst({
              where: { productId: serial.productId, businessId },
            });
            if (inv) {
              const newQty = inv.availableQuantity + 1;
              await tx.inventory.update({
                where: { id: inv.id },
                data: { availableQuantity: newQty, lastUpdated: new Date() },
              });
              await tx.product.updateMany({
                where: { id: serial.productId, businessId },
                data: { stock: newQty },
              });
            }
          }
        }
      }

      // Process Batch Returns
      if (params.batchReturns && params.batchReturns.length > 0) {
        for (const bRet of params.batchReturns) {
          const orderBatch = await tx.orderItemBatch.findFirst({
            where: { id: bRet.orderItemBatchId, businessId },
            include: { batch: true, orderItem: true },
          });
          if (!orderBatch) throw new Error("Order batch allocation record not found.");

          const maxReturnable = orderBatch.quantityAllocated - orderBatch.quantityReturned;
          if (bRet.returnQuantity > maxReturnable) {
            throw new Error(`Cannot return ${bRet.returnQuantity} units. Maximum returnable quantity is ${maxReturnable}.`);
          }

          await tx.orderItemBatch.update({
            where: { id: orderBatch.id },
            data: { quantityReturned: orderBatch.quantityReturned + bRet.returnQuantity },
          });

          await tx.returnItemBatch.create({
            data: {
              businessId,
              salesReturnId: salesReturn.id,
              orderItemBatchId: orderBatch.id,
              returnQuantity: bRet.returnQuantity,
              disposition: bRet.disposition,
            },
          });

          if (bRet.disposition === "RESTOCKED") {
            const newBatchQty = orderBatch.batch.availableQuantity + bRet.returnQuantity;
            await tx.productBatch.update({
              where: { id: orderBatch.batchId },
              data: { availableQuantity: newBatchQty, status: "ACTIVE" },
            });

            await tx.batchMovement.create({
              data: {
                businessId,
                batchId: orderBatch.batchId,
                movementType: "CUSTOMER_RETURN",
                quantityDelta: bRet.returnQuantity,
                balanceAfter: newBatchQty,
                referenceType: "SalesReturn",
                referenceId: salesReturn.id,
                performedBy: params.receivedBy || "Cashier",
                notes: `Customer return on ${returnNumber}`,
              },
            });

            const inv = await tx.inventory.findFirst({
              where: { productId: orderBatch.orderItem.productId, businessId },
            });
            if (inv) {
              const newQty = inv.availableQuantity + bRet.returnQuantity;
              await tx.inventory.update({
                where: { id: inv.id },
                data: { availableQuantity: newQty, lastUpdated: new Date() },
              });
              await tx.product.updateMany({
                where: { id: orderBatch.orderItem.productId, businessId },
                data: { stock: newQty },
              });
            }
          }
        }
      }

      return salesReturn;
    });
  }
}

export const billingRepository = new BillingRepository();

