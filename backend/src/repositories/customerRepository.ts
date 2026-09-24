import { prisma } from "../config/prisma";

export class CustomerRepository {
  async findMany(params: {
    businessId: string;
    search?: string;
    city?: string;
    skip: number;
    take: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: any = {
      businessId: params.businessId,
      isDeleted: false,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { mobile: { contains: params.search } },
        { customerCode: { contains: params.search } },
      ];
    }

    if (params.city) {
      where.city = params.city;
    }

    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    return prisma.customer.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
    });
  }

  async count(params: {
    businessId: string;
    search?: string;
    city?: string;
  }) {
    const where: any = {
      businessId: params.businessId,
      isDeleted: false,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { mobile: { contains: params.search } },
        { customerCode: { contains: params.search } },
      ];
    }

    if (params.city) {
      where.city = params.city;
    }

    return prisma.customer.count({ where });
  }

  async findById(businessId: string, id: string) {
    return prisma.customer.findFirst({
      where: { id, businessId, isDeleted: false },
    });
  }

  async findByMobile(businessId: string, mobile: string) {
    return prisma.customer.findFirst({
      where: { mobile, businessId, isDeleted: false },
    });
  }

  async findByCode(businessId: string, customerCode: string) {
    return prisma.customer.findFirst({
      where: { customerCode, businessId, isDeleted: false },
    });
  }

  async findLatestCustomerCode(businessId: string) {
    return prisma.customer.findFirst({
      where: { businessId },
      orderBy: { customerCode: "desc" },
    });
  }

  async findOutstanding(businessId: string) {
    return prisma.customer.findMany({
      where: {
        businessId,
        pendingAmount: { gt: 0 },
        isDeleted: false,
      },
      orderBy: { pendingAmount: "desc" },
    });
  }

  async findTopCustomers(businessId: string, limit: number) {
    return prisma.customer.findMany({
      where: { businessId, isDeleted: false },
      take: limit,
      orderBy: { rewardPoints: "desc" },
    });
  }

  async create(businessId: string, data: any) {
    return prisma.customer.create({
      data: {
        businessId,
        ...data,
      },
    });
  }

  async update(businessId: string, id: string, data: any) {
    return prisma.customer.updateMany({
      where: { id, businessId, isDeleted: false },
      data,
    });
  }

  async delete(businessId: string, id: string) {
    return prisma.customer.updateMany({
      where: { id, businessId, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
