import { prisma } from "../config/prisma";
import { encryptDbField, decryptDbField } from "../utils/dbEncryption";

export function decryptCustomer<T extends Record<string, any> | null | undefined>(cust: T): T {
  if (!cust) return cust;
  return {
    ...cust,
    name: cust.name ? (decryptDbField(cust.name) as string) : cust.name,
    mobile: cust.mobile ? (decryptDbField(cust.mobile) as string) : cust.mobile,
    email: cust.email ? (decryptDbField(cust.email) as string) : cust.email,
  };
}

export function decryptCustomers<T extends Record<string, any>>(list: T[]): T[] {
  return list.map(decryptCustomer);
}

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
      const encSearch = encryptDbField(params.search) || params.search;
      where.OR = [
        { name: { contains: params.search } },
        { name: encSearch },
        { mobile: { contains: params.search } },
        { mobile: encSearch },
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

    const customers = await prisma.customer.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
    });

    return decryptCustomers(customers);
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
        { name: { contains: params.search } },
        { name: encSearch },
        { mobile: { contains: params.search } },
        { mobile: encSearch },
        { customerCode: { contains: params.search } },
      ];
    }

    if (params.city) {
      where.city = params.city;
    }

    return prisma.customer.count({ where });
  }

  async findById(businessId: string, id: string) {
    const cust = await prisma.customer.findFirst({
      where: { id, businessId, isDeleted: false },
    });
    return decryptCustomer(cust);
  }

  async findByMobile(businessId: string, mobile: string) {
    const encMobile = encryptDbField(mobile) || mobile;
    const cust = await prisma.customer.findFirst({
      where: {
        businessId,
        isDeleted: false,
        OR: [{ mobile }, { mobile: encMobile }],
      },
    });
    return decryptCustomer(cust);
  }

  async findByCode(businessId: string, customerCode: string) {
    const cust = await prisma.customer.findFirst({
      where: { customerCode, businessId, isDeleted: false },
    });
    return decryptCustomer(cust);
  }

  async findLatestCustomerCode(businessId: string) {
    return prisma.customer.findFirst({
      where: { businessId },
      orderBy: { customerCode: "desc" },
    });
  }

  async findOutstanding(businessId: string) {
    const customers = await prisma.customer.findMany({
      where: {
        businessId,
        pendingAmount: { gt: 0 },
        isDeleted: false,
      },
      orderBy: { pendingAmount: "desc" },
    });
    return decryptCustomers(customers);
  }

  async findTopCustomers(businessId: string, limit: number) {
    const customers = await prisma.customer.findMany({
      where: { businessId, isDeleted: false },
      take: limit,
      orderBy: { rewardPoints: "desc" },
    });
    return decryptCustomers(customers);
  }

  async create(businessId: string, data: any) {
    const encData = {
      ...data,
      name: data.name ? encryptDbField(data.name) : data.name,
      mobile: data.mobile ? encryptDbField(data.mobile) : data.mobile,
      email: data.email ? encryptDbField(data.email) : data.email,
    };
    const created = await prisma.customer.create({
      data: {
        businessId,
        ...encData,
      },
    });
    return decryptCustomer(created);
  }

  async update(businessId: string, id: string, data: any) {
    const encData = { ...data };
    if (encData.name) encData.name = encryptDbField(encData.name);
    if (encData.mobile) encData.mobile = encryptDbField(encData.mobile);
    if (encData.email) encData.email = encryptDbField(encData.email);

    return prisma.customer.updateMany({
      where: { id, businessId, isDeleted: false },
      data: encData,
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
