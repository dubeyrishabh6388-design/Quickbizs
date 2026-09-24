import { prisma } from "../config/prisma";

export class PickupOrderRepository {
  async findById(id: string) {
    return prisma.pickupOrder.findUnique({
      where: { id },
      include: {
        items: true,
        business: true,
        customer: true,
      },
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return prisma.pickupOrder.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
  }

  async findCustomerOrders(customerId: string, skip: number, take: number) {
    return prisma.pickupOrder.findMany({
      where: { customerId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { items: true, business: true },
    });
  }

  async countCustomerOrders(customerId: string) {
    return prisma.pickupOrder.count({
      where: { customerId },
    });
  }

  async findMerchantOrders(
    businessId: string,
    status: string | undefined,
    skip: number,
    take: number
  ) {
    const where: any = { businessId };
    if (status) {
      where.orderStatus = status;
    }
    return prisma.pickupOrder.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { items: true, customer: true },
    });
  }

  async countMerchantOrders(businessId: string, status: string | undefined) {
    const where: any = { businessId };
    if (status) {
      where.orderStatus = status;
    }
    return prisma.pickupOrder.count({ where });
  }

  async updateItemPacking(itemId: string, packingStatus: string, remarks?: string) {
    return prisma.pickupOrderItem.update({
      where: { id: itemId },
      data: { packingStatus, remarks },
    });
  }

  async updateItemReplacement(itemId: string, replacementStatus: string) {
    return prisma.pickupOrderItem.update({
      where: { id: itemId },
      data: { replacementStatus },
    });
  }
}
