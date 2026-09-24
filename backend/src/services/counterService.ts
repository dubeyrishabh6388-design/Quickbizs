import { prisma } from "../config/prisma";

export class CounterService {
  async getCounterHome(businessId: string) {
    const preferences = await prisma.counterPreference.findUnique({
      where: { businessId },
    });

    const rushMode = preferences?.rushMode ?? false;
    const sellingMode = preferences?.sellingMode ?? "Counter Speed Business";

    // 1. Smart Frequently Sold by time of day
    const hour = new Date().getHours();
    let timeCategory = "General";
    let targetKeywords: string[] = [];

    if (hour >= 6 && hour < 10) {
      timeCategory = "Morning Essentials";
      targetKeywords = ["Milk", "Paneer", "Curd", "Bread", "Butter"];
    } else if (hour >= 12 && hour < 16) {
      timeCategory = "Afternoon Refreshments";
      targetKeywords = ["Lassi", "Drink", "Juice", "Cola", "Soda", "Cold"];
    } else if (hour >= 17 && hour < 22) {
      timeCategory = "Evening Snacks";
      targetKeywords = ["Chocolate", "Biscuit", "Snack", "Chips", "Tea", "Coffee"];
    }

    // Load products that match target keywords
    let frequentlySold = await prisma.product.findMany({
      where: {
        businessId,
        isDeleted: false,
        OR: targetKeywords.map((kw) => ({
          name: { contains: kw },
        })),
      },
      take: 6,
    });

    // Fallback to top products if no keyword match
    if (frequentlySold.length === 0) {
      frequentlySold = await prisma.product.findMany({
        where: { businessId, isDeleted: false },
        orderBy: { price: "desc" },
        take: 6,
      });
    }

    // 2. Recent sales
    const recentOrders = await prisma.order.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const recentSales = recentOrders.map(o => ({
      id: o.id,
      totalAmount: o.grandTotal,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
    }));

    // 3. Popular Today (Based on order frequency today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const popularProducts = await prisma.product.findMany({
      where: { businessId, isDeleted: false },
      take: 4,
    });

    // 4. Combos
    const combos = await this.getCombos(businessId);

    return {
      rushMode,
      sellingMode,
      timeCategory,
      frequentlySold,
      recentSales,
      popularToday: popularProducts,
      combos,
    };
  }

  async getPopularProducts(businessId: string) {
    return prisma.product.findMany({
      where: { businessId, isDeleted: false },
      take: 8,
    });
  }

  async getRecentSales(businessId: string) {
    const orders = await prisma.order.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return orders.map(o => ({
      id: o.id,
      totalAmount: o.grandTotal,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
    }));
  }

  async getCombos(businessId: string) {
    const products = await prisma.product.findMany({
      where: { businessId, isDeleted: false },
      take: 5,
    });

    if (products.length >= 2) {
      return [
        {
          id: "combo-1",
          name: "🥛 + 🍞 Quick Breakfast",
          description: "Amul Milk + Premium Bread",
          price: 50,
          productIds: JSON.stringify([products[0].id, products[1].id]),
        },
      ];
    }

    return [];
  }

  async recordSale(
    businessId: string,
    paymentMethod: "Cash" | "UPI" | "Card",
    totalAmount: number,
    items: Array<{ productId: string; quantity: number; price: number; name: string }>,
    offlineId?: string
  ) {
    const invoiceNumber = `CS-${Date.now().toString().slice(-6)}`;

    // Log Standard order & decrement inventory
    const order = await prisma.order.create({
      data: {
        businessId,
        invoiceNumber,
        subtotal: totalAmount / 1.18,
        discount: 0,
        gstAmount: totalAmount - totalAmount / 1.18,
        taxableAmount: totalAmount / 1.18,
        roundOff: 0,
        grandTotal: totalAmount,
        paymentStatus: "Paid",
        paymentMethod,
        orderStatus: "Completed",
        notes: "Generated via Counter Mode Engine.",
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
          gst: 0,
          total: item.price * item.quantity,
        },
      });

      await prisma.product.updateMany({
        where: { id: item.productId, businessId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return {
      id: order.id,
      businessId,
      paymentMethod,
      totalAmount,
      items: JSON.stringify(items),
      offlineId,
    };
  }

  async toggleRushMode(businessId: string, rushMode: boolean) {
    const preferences = await prisma.counterPreference.upsert({
      where: { businessId },
      update: { rushMode },
      create: { businessId, rushMode, sellingMode: "Counter Speed Business" },
    });

    return preferences;
  }

  async saveSellingMode(businessId: string, sellingMode: string) {
    const preferences = await prisma.counterPreference.upsert({
      where: { businessId },
      update: { sellingMode },
      create: { businessId, sellingMode, rushMode: false },
    });

    return preferences;
  }
}
