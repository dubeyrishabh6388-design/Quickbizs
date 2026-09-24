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
    }
  ) {
    // Execute ACID transaction
    return prisma.$transaction(async (tx: any) => {
      // 1. Get next invoice number and increment sequence
      const sequence = await tx.invoiceSequence.findFirst({
        where: { businessId, prefix: "INV" },
      });

      if (!sequence) {
        throw new Error("Billing sequence parameters not configured.");
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

      // 9. Write Automation Logs
      await tx.automationLog.create({
        data: {
          businessId,
          ...params.automationLog,
          result: `${params.automationLog.result} (Invoice: ${invoiceNumber})`,
        },
      });

      return {
        order,
        items,
        payments,
      };
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
        include: { items: true, customer: true },
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

      // Write Automation Log
      await tx.automationLog.create({
        data: {
          businessId,
          ...params.automationLog,
        },
      });

      return updatedOrder;
    });
  }
}
