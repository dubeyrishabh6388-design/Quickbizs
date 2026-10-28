import { prisma } from "../config/prisma";
import { encryptDbField, decryptDbField } from "../utils/dbEncryption";

export function decryptSupplier<T extends Record<string, any> | null | undefined>(supp: T): T {
  if (!supp) return supp;
  return {
    ...supp,
    contactPerson: supp.contactPerson ? (decryptDbField(supp.contactPerson) as string) : supp.contactPerson,
    mobile: supp.mobile ? (decryptDbField(supp.mobile) as string) : supp.mobile,
    email: supp.email ? (decryptDbField(supp.email) as string) : supp.email,
  };
}

export function decryptSuppliers<T extends Record<string, any>>(list: T[]): T[] {
  return list.map(decryptSupplier);
}

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
      const encSearch = encryptDbField(params.search) || params.search;
      where.OR = [
        { companyName: { contains: params.search } },
        { contactPerson: { contains: params.search } },
        { contactPerson: encSearch },
        { mobile: { contains: params.search } },
        { mobile: encSearch },
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

    const list = await prisma.supplier.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
    });
    return decryptSuppliers(list);
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
      const encSearch = encryptDbField(params.search) || params.search;
      where.OR = [
        { companyName: { contains: params.search } },
        { contactPerson: { contains: params.search } },
        { contactPerson: encSearch },
        { mobile: { contains: params.search } },
        { mobile: encSearch },
        { supplierCode: { contains: params.search } },
      ];
    }

    if (params.city) {
      where.city = params.city;
    }

    return prisma.supplier.count({ where });
  }

  async findById(businessId: string, id: string) {
    const supp = await prisma.supplier.findFirst({
      where: { id, businessId, isDeleted: false },
    });
    return decryptSupplier(supp);
  }

  async findByMobile(businessId: string, mobile: string) {
    const encMobile = encryptDbField(mobile) || mobile;
    const supp = await prisma.supplier.findFirst({
      where: {
        businessId,
        isDeleted: false,
        OR: [{ mobile }, { mobile: encMobile }],
      },
    });
    return decryptSupplier(supp);
  }

  async findByCode(businessId: string, supplierCode: string) {
    const supp = await prisma.supplier.findFirst({
      where: { supplierCode, businessId, isDeleted: false },
    });
    return decryptSupplier(supp);
  }

  async findByGst(businessId: string, gstNumber: string) {
    const supp = await prisma.supplier.findFirst({
      where: { gstNumber, businessId, isDeleted: false },
    });
    return decryptSupplier(supp);
  }

  async findLatestSupplierCode(businessId: string) {
    return prisma.supplier.findFirst({
      where: { businessId },
      orderBy: { supplierCode: "desc" },
    });
  }

  async findOutstanding(businessId: string) {
    const list = await prisma.supplier.findMany({
      where: {
        businessId,
        outstandingAmount: { gt: 0 },
        isDeleted: false,
      },
      orderBy: { outstandingAmount: "desc" },
    });
    return decryptSuppliers(list);
  }

  async findTopSuppliers(businessId: string, limit: number) {
    const list = await prisma.supplier.findMany({
      where: { businessId, isDeleted: false },
      take: limit,
      orderBy: { outstandingAmount: "desc" },
    });
    return decryptSuppliers(list);
  }

  async create(businessId: string, data: any) {
    const encData = {
      ...data,
      contactPerson: data.contactPerson ? encryptDbField(data.contactPerson) : data.contactPerson,
      mobile: data.mobile ? encryptDbField(data.mobile) : data.mobile,
      email: data.email ? encryptDbField(data.email) : data.email,
    };
    const created = await prisma.supplier.create({
      data: {
        businessId,
        ...encData,
      },
    });
    return decryptSupplier(created);
  }

  async update(businessId: string, id: string, data: any) {
    const encData = { ...data };
    if (encData.contactPerson) encData.contactPerson = encryptDbField(encData.contactPerson);
    if (encData.mobile) encData.mobile = encryptDbField(encData.mobile);
    if (encData.email) encData.email = encryptDbField(encData.email);

    return prisma.supplier.updateMany({
      where: { id, businessId, isDeleted: false },
      data: encData,
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
