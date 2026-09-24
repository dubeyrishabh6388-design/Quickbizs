import { prisma } from "../config/prisma";

// In-memory queue storage fallback for high-speed cart holds
const inMemoryQueue = new Map<string, Array<{ cartName: string; items: any[]; updatedAt: Date }>>();

export class InstantCheckoutService {
  async getPreferences(businessId: string) {
    return {
      preferences: {
        businessId,
        defaultPayment: "Mixed",
        enableSounds: true,
      },
      shortcuts: [50, 100, 200, 500],
    };
  }

  async getRecentOrders(businessId: string) {
    const orders = await prisma.order.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    });

    return orders.map((o) => ({
      id: o.id,
      businessId: o.businessId,
      itemsSummary: o.items.map((i) => i.productName).join(" + "),
      items: JSON.stringify(
        o.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.unitPrice,
          name: i.productName,
        }))
      ),
      totalAmount: o.grandTotal,
      createdAt: o.createdAt,
    }));
  }

  async completeCheckout(
    businessId: string,
    paymentMethod: "Cash" | "UPI" | "Card",
    totalAmount: number,
    items: Array<{ productId: string; quantity: number; price: number; name: string }>,
    offlineId?: string
  ) {
    // 1. Get next invoice number from invoiceSequence
    let sequence = await prisma.invoiceSequence.findFirst({
      where: { businessId, prefix: "INV" },
    });

    if (!sequence) {
      sequence = await prisma.invoiceSequence.create({
        data: {
          businessId,
          prefix: "INV",
          nextValue: 1001,
        },
      });
    }

    const invoiceNumber = `${sequence.prefix}-${sequence.nextValue}`;

    await prisma.invoiceSequence.update({
      where: { id: sequence.id },
      data: { nextValue: sequence.nextValue + 1 },
    });

    // 2. Create standard Order & decrement inventory
    const subtotal = totalAmount / 1.18;
    const gstAmount = totalAmount - subtotal;
    const order = await prisma.order.create({
      data: {
        businessId,
        invoiceNumber,
        subtotal,
        discount: 0,
        gstAmount,
        taxableAmount: subtotal,
        roundOff: 0,
        grandTotal: totalAmount,
        paymentStatus: "Paid",
        paymentMethod,
        orderStatus: "Completed",
        notes: "Generated via Instant Checkout Engine.",
      },
    });

    // 3. Create standard Payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod,
        amount: totalAmount,
        status: "Success",
        referenceNumber: `IC-${order.id.substring(0, 8)}`,
      },
    });

    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: 0,
          gst: 18,
          total: item.price * item.quantity,
        },
      });

      const prod = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (prod) {
        await prisma.product.updateMany({
          where: { id: item.productId, businessId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Sync with Inventory availableQuantity
        const inventory = await prisma.inventory.findFirst({
          where: { businessId, productId: item.productId, deletedAt: null },
        });

        if (inventory) {
          const newQty = Math.max(0, inventory.availableQuantity - item.quantity);
          await prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              availableQuantity: newQty,
              lastUpdated: new Date(),
            },
          });

          // Log Stock Movement
          await prisma.stockMovement.create({
            data: {
              businessId,
              productId: item.productId,
              inventoryId: inventory.id,
              referenceType: "Sale",
              referenceId: order.id,
              movementType: "OUT",
              quantity: item.quantity,
              openingStock: inventory.availableQuantity,
              closingStock: newQty,
              reason: "Instant Checkout sale decrement",
            },
          });
        }
      }
    }

    return {
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      businessId,
      paymentMethod,
      totalAmount,
      items: JSON.stringify(items),
      offlineId,
    };
  }

  async repeatOrder(businessId: string, recentOrderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: recentOrderId, businessId },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    const items = order.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.unitPrice,
      name: i.productName,
    }));

    return this.completeCheckout(businessId, "Cash", order.grandTotal, items);
  }

  async updateQueue(
    businessId: string,
    cartName: string,
    items: Array<{ productId: string; quantity: number; price: number; name: string }>
  ) {
    let queues = inMemoryQueue.get(businessId) || [];
    if (items.length === 0) {
      queues = queues.filter((q) => q.cartName !== cartName);
    } else {
      const idx = queues.findIndex((q) => q.cartName === cartName);
      if (idx >= 0) {
        queues[idx] = { cartName, items, updatedAt: new Date() };
      } else {
        queues.push({ cartName, items, updatedAt: new Date() });
      }
    }
    inMemoryQueue.set(businessId, queues);
    return queues;
  }

  async getQueue(businessId: string) {
    return inMemoryQueue.get(businessId) || [];
  }
}
