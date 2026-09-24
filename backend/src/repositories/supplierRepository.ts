import { prisma } from "../config/prisma";

export class SupplierRepository {
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
        { companyName: { contains: params.search } },
        { contactPerson: { contains: params.search } },
        { mobile: { contains: params.search } },
        { supplierCode: { contains: params.search } },
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

    return prisma.supplier.findMany({
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
        { companyName: { contains: params.search } },
        { contactPerson: { contains: params.search } },
        { mobile: { contains: params.search } },
        { supplierCode: { contains: params.search } },
      ];
    }

    if (params.city) {
      where.city = params.city;
    }

    return prisma.supplier.count({ where });
  }

  async findById(businessId: string, id: string) {
    return prisma.supplier.findFirst({
      where: { id, businessId, isDeleted: false },
    });
  }

  async findByMobile(businessId: string, mobile: string) {
    return prisma.supplier.findFirst({
      where: { mobile, businessId, isDeleted: false },
    });
  }

  async findByCode(businessId: string, supplierCode: string) {
    return prisma.supplier.findFirst({
      where: { supplierCode, businessId, isDeleted: false },
    });
  }

  async findByGst(businessId: string, gstNumber: string) {
    return prisma.supplier.findFirst({
      where: { gstNumber, businessId, isDeleted: false },
    });
  }

  async findLatestSupplierCode(businessId: string) {
    return prisma.supplier.findFirst({
      where: { businessId },
      orderBy: { supplierCode: "desc" },
    });
  }

  async findOutstanding(businessId: string) {
    return prisma.supplier.findMany({
      where: {
        businessId,
        outstandingAmount: { gt: 0 },
        isDeleted: false,
      },
      orderBy: { outstandingAmount: "desc" },
    });
  }

  async findTopSuppliers(businessId: string, limit: number) {
    return prisma.supplier.findMany({
      where: { businessId, isDeleted: false },
      take: limit,
      orderBy: { outstandingAmount: "desc" }, // Order by outstanding volume
    });
  }

  async create(businessId: string, data: any) {
    return prisma.supplier.create({
      data: {
        businessId,
        ...data,
      },
    });
  }

  async update(businessId: string, id: string, data: any) {
    return prisma.supplier.updateMany({
      where: { id, businessId, isDeleted: false },
      data,
    });
  }

  async delete(businessId: string, id: string) {
    return prisma.supplier.updateMany({
      where: { id, businessId, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
