import { prisma } from "../config/prisma";
import { InstantCheckoutService } from "./instantCheckoutService";

export class QueueService {
  async getQueues(businessId: string) {
    // 1. Run automatic cleanup scheduler task inline to keep queries optimized
    await this.runAutoCleanup(businessId);

    return prisma.queueSession.findMany({
      where: { businessId },
      include: { items: true },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "asc" },
      ],
    });
  }

  async getQueueById(businessId: string, id: string) {
    return prisma.queueSession.findFirst({
      where: { id, businessId },
      include: { items: true },
    });
  }

  async createQueue(
    businessId: string,
    customerName?: string,
    mobile?: string,
    items?: Array<{ productId: string; productName: string; quantity: number; price: number }>
  ) {
    // Determine next queue number
    const countToday = await prisma.queueSession.count({
      where: {
        businessId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const nextNumber = countToday + 1;

    const queue = await prisma.queueSession.create({
      data: {
        businessId,
        queueNumber: nextNumber,
        customerName: customerName || `Queue #${nextNumber}`,
        mobile,
        status: "Waiting",
      },
    });

    if (items && items.length > 0) {
      for (const item of items) {
        await prisma.queueItem.create({
          data: {
            queueSessionId: queue.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
    }

    return this.getQueueById(businessId, queue.id);
  }

  async completeQueue(businessId: string, id: string, paymentMethod: "Cash" | "UPI" | "Card") {
    const queue = await prisma.queueSession.findFirst({
      where: { id, businessId },
      include: { items: true },
    });

    if (!queue) throw new Error("Queue not found.");

    const total = queue.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // 1. Save Queue Session as Completed
    await prisma.queueSession.update({
      where: { id },
      data: { status: "Completed" },
    });

    // 2. Add to Audit Log
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "QUEUE_COMPLETED",
        module: "Queue",
        status: "Success",
        reason: `Completed queue ${id} with total ₹${total}`,
      },
    });

    // 3. Delegate standard counter checkout order, payments, inventory, and stock movements logging
    const checkoutService = new InstantCheckoutService();
    const counterSale = await checkoutService.completeCheckout(
      businessId,
      paymentMethod,
      total,
      queue.items.map((i) => ({
        productId: i.productId,
        name: i.productName,
        price: i.price,
        quantity: i.quantity,
      }))
    );

    return counterSale;
  }

  async cancelQueue(businessId: string, id: string) {
    const queue = await prisma.queueSession.findFirst({
      where: { id, businessId },
      include: { items: true },
    });
    if (!queue) throw new Error("Queue not found.");

    const total = queue.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    await prisma.queueSession.update({
      where: { id },
      data: { status: "Cancelled" },
    });

    await prisma.auditLog.create({
      data: {
        businessId,
        action: "QUEUE_CANCELLED",
        module: "Queue",
        status: "Cancelled",
        reason: `Cancelled queue ${id} with total ₹${total}`,
      },
    });

    return { success: true };
  }

  async mergeQueues(businessId: string, sourceId: string, targetId: string) {
    const source = await prisma.queueSession.findFirst({
      where: { id: sourceId, businessId },
      include: { items: true },
    });
    const target = await prisma.queueSession.findFirst({
      where: { id: targetId, businessId },
      include: { items: true },
    });

    if (!source || !target) throw new Error("Source or target queue cart not found.");

    // Copy items from source to target
    for (const sItem of source.items) {
      const existing = target.items.find((ti) => ti.productId === sItem.productId);
      if (existing) {
        await prisma.queueItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + sItem.quantity },
        });
      } else {
        await prisma.queueItem.create({
          data: {
            queueSessionId: targetId,
            productId: sItem.productId,
            productName: sItem.productName,
            quantity: sItem.quantity,
            price: sItem.price,
          },
        });
      }
    }

    // Cancel source queue
    await this.cancelQueue(businessId, sourceId);

    return this.getQueueById(businessId, targetId);
  }

  async duplicateQueue(businessId: string, id: string) {
    const queue = await prisma.queueSession.findFirst({
      where: { id, businessId },
      include: { items: true },
    });

    if (!queue) throw new Error("Queue not found.");

    const newQueue = await this.createQueue(
      businessId,
      `${queue.customerName} (Copy)`,
      queue.mobile || undefined,
      queue.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
      }))
    );

    return newQueue;
  }

  async pinQueue(businessId: string, id: string, isPinned: boolean) {
    return prisma.queueSession.update({
      where: { id },
      data: { isPinned },
    });
  }

  async updateQueueItems(
    businessId: string,
    id: string,
    items: Array<{ productId: string; productName: string; quantity: number; price: number }>
  ) {
    await prisma.queueItem.deleteMany({
      where: { queueSessionId: id },
    });

    for (const item of items) {
      await prisma.queueItem.create({
        data: {
          queueSessionId: id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }

    return this.getQueueById(businessId, id);
  }

  async runAutoCleanup(businessId: string) {
    const cleanupThresholdMin = 30;
    const thresholdDate = new Date();
    thresholdDate.setMinutes(thresholdDate.getMinutes() - cleanupThresholdMin);

    // Delete Completed/Cancelled queues older than threshold minutes
    await prisma.queueSession.deleteMany({
      where: {
        businessId,
        status: { in: ["Completed", "Cancelled"] },
        updatedAt: { lte: thresholdDate },
      },
    });
  }
}
