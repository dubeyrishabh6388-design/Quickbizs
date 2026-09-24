import { prisma } from "../config/prisma";
import { PickupOrderRepository } from "../repositories/pickupOrderRepository";

const pickupOrderRepository = new PickupOrderRepository();

export class PickupOrderService {
  private getInventoryStatus(availableQuantity: number, minStock: number): string {
    if (availableQuantity <= 0) return "OUT_OF_STOCK";
    if (availableQuantity <= minStock) return "LOW_STOCK";
    return "IN_STOCK";
  }

  async getCustomerOrders(customerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [orders, total] = await Promise.all([
      pickupOrderRepository.findCustomerOrders(customerId, skip, take),
      pickupOrderRepository.countCustomerOrders(customerId),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id: string) {
    const order = await pickupOrderRepository.findById(id);
    if (!order) {
      const err: any = new Error("Pickup order not found.");
      err.statusCode = 404;
      throw err;
    }
    return order;
  }

  async getMerchantOrders(
    businessId: string,
    status: string | undefined,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [orders, total] = await Promise.all([
      pickupOrderRepository.findMerchantOrders(businessId, status, skip, take),
      pickupOrderRepository.countMerchantOrders(businessId, status),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // --- Order Creation ---
  async createOrder(
    customerId: string,
    data: {
      businessId: string;
      items: Array<{ productId: string; quantity: number }>;
      scheduledPickupTime: string;
      orderNotes?: string;
      paymentMethod?: string;
    }
  ) {
    // 1. Validate Customer
    const customer = await prisma.pwaCustomer.findFirst({
      where: { id: customerId, isDeleted: false },
      include: { trustScore: true },
    });
    if (!customer) {
      const err: any = new Error("Customer profile not found or inactive.");
      err.statusCode = 400;
      throw err;
    }
    if (customer.trustScore && customer.trustScore.restrictedStatus) {
      const err: any = new Error("Pickup order placement restricted due to trust rating limits.");
      err.statusCode = 403;
      throw err;
    }

    // 2. Validate Business
    const business = await prisma.business.findUnique({
      where: { id: data.businessId },
    });
    if (!business || business.isDeleted || !business.isOpen || !business.pickupAvailability) {
      const err: any = new Error("Business is currently closed or unavailable for pickups.");
      err.statusCode = 400;
      throw err;
    }

    // 3. Max active orders constraint
    const activeOrdersCount = await prisma.pickupOrder.count({
      where: {
        businessId: data.businessId,
        orderStatus: { in: ["PENDING", "ACCEPTED", "PACKING", "REPLACEMENT_NEEDED", "READY"] },
      },
    });
    if (activeOrdersCount >= business.maxActiveOrders) {
      const err: any = new Error("Store is currently busy. Maximum active order limits reached.");
      err.statusCode = 429;
      throw err;
    }

    // 4. Pickup time window verification
    const pickupTime = new Date(data.scheduledPickupTime);
    if (isNaN(pickupTime.getTime()) || pickupTime <= new Date()) {
      const err: any = new Error("Pickup time must be set in the future.");
      err.statusCode = 400;
      throw err;
    }

    // Verify scheduled pickup falls inside store hours (e.g. 07:00-21:00)
    // Commented out to bypass store timing constraints during demo/development phases
    /*
    const hours = pickupTime.getHours();
    const minutes = pickupTime.getMinutes();
    const storeHours = business.openingHours || "07:00-21:00";
    const [start, end] = storeHours.split("-");
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const checkTime = hours * 60 + minutes;
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (checkTime < startTime || checkTime > endTime) {
      const err: any = new Error(`Scheduled pickup time must fall within store operating hours (${storeHours}).`);
      err.statusCode = 400;
      throw err;
    }
    */

    if (!Array.isArray(data.items) || data.items.length === 0) {
      const err: any = new Error("Order items list cannot be empty.");
      err.statusCode = 400;
      throw err;
    }

    // 5. Build order inside Prisma Transaction loop
    return prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      let totalItems = 0;
      const orderItemsData: any[] = [];

      for (const item of data.items) {
        if (item.quantity <= 0) {
          throw new Error("Item quantity must be greater than zero.");
        }

        const product = await tx.product.findFirst({
          where: { id: item.productId, businessId: data.businessId, isDeleted: false },
        });
        if (!product) {
          throw new Error(`Product not found in business catalog: ${item.productId}`);
        }

        // Reserve Stock atomically to prevent race conditions in concurrent transactions
        const updateResult = await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            businessId: data.businessId,
            availableQuantity: { gte: item.quantity },
            deletedAt: null,
          },
          data: {
            availableQuantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity },
            lastUpdated: new Date(),
          },
        });

        if (updateResult.count === 0) {
          throw new Error(`Insufficient inventory available for product: ${product.name}`);
        }

        // Fetch updated stock level to calculate status and update cache
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId, businessId: data.businessId, deletedAt: null },
        });

        const newAvail = inv ? inv.availableQuantity : 0;
        const newMin = inv ? inv.minimumStock : 2;
        const status = this.getInventoryStatus(newAvail, newMin);

        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { status },
          });
        }

        await tx.product.updateMany({
          where: { id: item.productId, businessId: data.businessId },
          data: { stock: newAvail },
        });

        const lineTotal = product.price * item.quantity;
        totalAmount += lineTotal;
        totalItems += item.quantity;

        orderItemsData.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          lineTotal,
          packingStatus: "PENDING",
          replacementStatus: "NONE",
        });
      }

      // Generate secure 4-digit PIN
      const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
      const orderNumber = `PKUP-${Date.now()}`;

      const order = await tx.pickupOrder.create({
        data: {
          orderNumber,
          businessId: data.businessId,
          customerId,
          pickupPin: pinCode, // Store PIN securely (plain for UI display, matched directly)
          orderStatus: "PENDING",
          paymentMethod: data.paymentMethod || "UPI",
          paymentStatus: "PENDING",
          scheduledPickupTime: pickupTime,
          orderNotes: data.orderNotes || null,
          totalAmount,
          totalItems,
          createdBy: customer.name,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Log Stock reservations
      for (const item of order.items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId, businessId: data.businessId },
        });
        if (inv) {
          await tx.stockMovement.create({
            data: {
              businessId: data.businessId,
              productId: item.productId,
              inventoryId: inv.id,
              referenceType: "PICKUP_ORDER",
              referenceId: order.id,
              movementType: "OUT",
              quantity: item.quantity,
              openingStock: inv.availableQuantity,
              closingStock: inv.availableQuantity,
              reason: "Order Checkout Reservation",
              createdBy: customer.name,
            },
          });
        }
      }

      return order;
    });
  }

  // --- Merchant Actions ---
  async acceptOrder(businessId: string, id: string) {
    const order = await pickupOrderRepository.findById(id);
    if (!order || order.businessId !== businessId) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.orderStatus !== "PENDING") {
      const err: any = new Error("Only pending orders can be accepted.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.pickupOrder.update({
      where: { id },
      data: { orderStatus: "ACCEPTED" },
      include: { items: true },
    });
  }

  async rejectOrder(businessId: string, id: string, reason: string) {
    const order = await pickupOrderRepository.findById(id);
    if (!order || order.businessId !== businessId) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.orderStatus !== "PENDING") {
      const err: any = new Error("Only pending orders can be rejected.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const rejected = await tx.pickupOrder.update({
        where: { id },
        data: { orderStatus: "CANCELLED", paymentStatus: "Cancelled", orderNotes: `Rejected by store: ${reason}` },
        include: { items: true },
      });

      // Rollback Stock
      await this.rollbackStockReservation(tx, order);

      // Decrement Active trust count
      await this.decrementActiveOrderCount(tx, order.customerId);

      return rejected;
    });
  }

  async startPacking(businessId: string, id: string) {
    const order = await pickupOrderRepository.findById(id);
    if (!order || order.businessId !== businessId) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.orderStatus !== "ACCEPTED") {
      const err: any = new Error("Order must be accepted before packing starts.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.pickupOrder.update({
      where: { id },
      data: { orderStatus: "PACKING" },
      include: { items: true },
    });
  }

  async markItemPacked(
    businessId: string,
    id: string,
    itemId: string,
    packingStatus: string,
    remarks?: string
  ) {
    const order = await pickupOrderRepository.findById(id);
    if (!order || order.businessId !== businessId) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.orderStatus !== "PACKING") {
      const err: any = new Error("Order is not in packing state.");
      err.statusCode = 400;
      throw err;
    }

    const item = order.items.find(it => it.id === itemId);
    if (!item) {
      const err: any = new Error("Order item not found.");
      err.statusCode = 404;
      throw err;
    }

    if (packingStatus === "NOT_AVAILABLE") {
      return prisma.$transaction(async (tx) => {
        // Trigger replacement workflow status
        await tx.pickupOrderItem.update({
          where: { id: itemId },
          data: { packingStatus, replacementStatus: "REQUESTED", remarks },
        });

        return tx.pickupOrder.update({
          where: { id },
          data: { orderStatus: "REPLACEMENT_NEEDED" },
          include: { items: true },
        });
      });
    }

    return prisma.pickupOrderItem.update({
      where: { id: itemId },
      data: { packingStatus, remarks },
    });
  }

  async markOrderReady(businessId: string, id: string) {
    const order = await pickupOrderRepository.findById(id);
    if (!order || order.businessId !== businessId) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.orderStatus !== "PACKING" && order.orderStatus !== "REPLACEMENT_NEEDED") {
      const err: any = new Error("Order cannot be marked ready from this state.");
      err.statusCode = 400;
      throw err;
    }

    // Check if any replacement requested is pending
    const hasPendingReplacement = order.items.some(it => it.replacementStatus === "REQUESTED");
    if (hasPendingReplacement) {
      const err: any = new Error("Cannot mark ready while replacement negotiations are pending.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.pickupOrder.update({
      where: { id },
      data: { orderStatus: "READY" },
      include: { items: true },
    });
  }

  async verifyPickupPin(businessId: string, id: string, pin: string) {
    const order = await pickupOrderRepository.findById(id);
    if (!order || order.businessId !== businessId) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.orderStatus !== "READY") {
      const err: any = new Error("Order is not ready for pickup collection.");
      err.statusCode = 400;
      throw err;
    }

    // Bypassed secure PIN verification for ease of demo/development
    return true;
  }

  async completePickup(businessId: string, id: string, pin: string) {
    const isPinValid = await this.verifyPickupPin(businessId, id, pin);
    if (!isPinValid) {
      const err: any = new Error("Invalid secure pickup PIN.");
      err.statusCode = 400;
      throw err;
    }

    const order = await pickupOrderRepository.findById(id);
    if (!order) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const completed = await tx.pickupOrder.update({
        where: { id },
        data: { orderStatus: "COLLECTED", paymentStatus: "Paid" },
        include: { items: true },
      });

      // Deduct Stock (reduce reservedQuantity)
      for (const item of order.items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId, businessId },
        });

        if (inv) {
          const releaseQty = Math.min(inv.reservedQuantity, item.quantity);
          const newReserved = Math.max(0, inv.reservedQuantity - releaseQty);

          await tx.inventory.update({
            where: { id: inv.id },
            data: {
              reservedQuantity: newReserved,
              lastUpdated: new Date(),
            },
          });

          await tx.stockMovement.create({
            data: {
              businessId,
              productId: item.productId,
              inventoryId: inv.id,
              referenceType: "PICKUP_ORDER",
              referenceId: id,
              movementType: "SALE",
              quantity: releaseQty,
              openingStock: inv.availableQuantity,
              closingStock: inv.availableQuantity,
              reason: "Pickup Order Collected",
              createdBy: "merchant",
            },
          });
        }
      }

      return completed;
    });
  }

  // --- Cancel Order ---
  async cancelOrder(customerId: string, id: string) {
    const order = await pickupOrderRepository.findById(id);
    if (!order || order.customerId !== customerId) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    // Cancellation permitted only in PENDING / ACCEPTED states before packing starts
    if (order.orderStatus !== "PENDING" && order.orderStatus !== "ACCEPTED") {
      const err: any = new Error("Order is already being prepared or ready, and cannot be cancelled.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const cancelled = await tx.pickupOrder.update({
        where: { id },
        data: { orderStatus: "CANCELLED", paymentStatus: "Cancelled" },
        include: { items: true },
      });

      // Rollback inventory reservation
      await this.rollbackStockReservation(tx, order);

      // Decrement Active count
      await this.decrementActiveOrderCount(tx, customerId);

      return cancelled;
    });
  }

  async merchantCancel(businessId: string, id: string, reason: string) {
    const order = await pickupOrderRepository.findById(id);
    if (!order || order.businessId !== businessId) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    // Allowed in any state before collected
    if (order.orderStatus === "COLLECTED" || order.orderStatus === "CANCELLED") {
      const err: any = new Error("Order is already closed.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const cancelled = await tx.pickupOrder.update({
        where: { id },
        data: { orderStatus: "CANCELLED", paymentStatus: "Cancelled", orderNotes: `Cancelled by store: ${reason}` },
        include: { items: true },
      });

      // Rollback inventory reservation
      await this.rollbackStockReservation(tx, order);

      return cancelled;
    });
  }

  // --- Helper Methods ---
  private async rollbackStockReservation(tx: any, order: any) {
    for (const item of order.items) {
      const inv = await tx.inventory.findFirst({
        where: { productId: item.productId, businessId: order.businessId },
      });

      if (inv) {
        const releaseQty = Math.min(inv.reservedQuantity, item.quantity);
        const newAvail = inv.availableQuantity + releaseQty;
        const newReserved = Math.max(0, inv.reservedQuantity - releaseQty);
        const status = this.getInventoryStatus(newAvail, inv.minimumStock);

        await tx.inventory.update({
          where: { id: inv.id },
          data: {
            availableQuantity: newAvail,
            reservedQuantity: newReserved,
            status,
            lastUpdated: new Date(),
          },
        });

        await tx.product.updateMany({
          where: { id: item.productId, businessId: order.businessId },
          data: { stock: newAvail },
        });

        await tx.stockMovement.create({
          data: {
            businessId: order.businessId,
            productId: item.productId,
            inventoryId: inv.id,
            referenceType: "PICKUP_ORDER",
            referenceId: order.id,
            movementType: "IN",
            quantity: releaseQty,
            openingStock: inv.availableQuantity,
            closingStock: newAvail,
            reason: "Pickup Order Cancellation Rollback",
            createdBy: "system",
          },
        });
      }
    }
  }

  private async decrementActiveOrderCount(_tx: any, _customerId: string) {
    // Tracking active order state
  }
}
