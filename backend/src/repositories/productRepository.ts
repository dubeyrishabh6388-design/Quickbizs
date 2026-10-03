import { prisma } from "../config/prisma";

export class ProductRepository {
  async findMany(params: {
    businessId: string;
    search?: string;
    category?: string;
    brand?: string;
    sku?: string;
    barcode?: string;
    skip: number;
    take: number;
  }) {
    const where: any = {
      businessId: params.businessId,
      isDeleted: false,
    };

    const andConditions: any[] = [];

    if (params.search) {
      const terms = params.search.trim().split(/\s+/).filter(Boolean);
      if (terms.length > 1) {
        terms.forEach((term) => {
          andConditions.push({
            OR: [
              { name: { contains: term } },
              { barcode: { contains: term } },
              { sku: { contains: term } },
              { brand: { contains: term } },
              { supplierName: { contains: term } },
              { keywords: { contains: term } },
              { customFields: { contains: term } },
            ],
          });
        });
      } else {
        andConditions.push({
          OR: [
            { name: { contains: params.search } },
            { barcode: { contains: params.search } },
            { sku: { contains: params.search } },
            { brand: { contains: params.search } },
            { supplierName: { contains: params.search } },
            { keywords: { contains: params.search } },
            { customFields: { contains: params.search } },
          ],
        });
      }
    }

    if (params.category && params.category !== "All") {
      andConditions.push({
        OR: [
          { category: params.category },
          { categoryId: params.category },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    if (params.brand) {
      where.brand = params.brand;
    }

    if (params.sku) {
      where.sku = params.sku;
    }

    if (params.barcode) {
      where.barcode = params.barcode;
    }

    return prisma.product.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      include: { categoryRef: true },
    });
  }

  async count(params: {
    businessId: string;
    search?: string;
    category?: string;
    brand?: string;
    sku?: string;
    barcode?: string;
  }) {
    const where: any = {
      businessId: params.businessId,
      isDeleted: false,
    };

    const andConditions: any[] = [];

    if (params.search) {
      const terms = params.search.trim().split(/\s+/).filter(Boolean);
      if (terms.length > 1) {
        terms.forEach((term) => {
          andConditions.push({
            OR: [
              { name: { contains: term } },
              { barcode: { contains: term } },
              { sku: { contains: term } },
              { brand: { contains: term } },
              { supplierName: { contains: term } },
              { customFields: { contains: term } },
            ],
          });
        });
      } else {
        andConditions.push({
          OR: [
            { name: { contains: params.search } },
            { barcode: { contains: params.search } },
            { sku: { contains: params.search } },
            { brand: { contains: params.search } },
            { supplierName: { contains: params.search } },
            { customFields: { contains: params.search } },
          ],
        });
      }
    }

    if (params.category && params.category !== "All") {
      andConditions.push({
        OR: [
          { category: params.category },
          { categoryId: params.category },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    if (params.brand) {
      where.brand = params.brand;
    }

    if (params.sku) {
      where.sku = params.sku;
    }

    if (params.barcode) {
      where.barcode = params.barcode;
    }

    return prisma.product.count({ where });
  }

  async findById(businessId: string, id: string) {
    return prisma.product.findFirst({
      where: { id, businessId, isDeleted: false },
      include: { categoryRef: true },
    });
  }

  async findByBarcode(businessId: string, barcode: string) {
    return prisma.product.findFirst({
      where: { barcode, businessId, isDeleted: false },
    });
  }

  async findBySku(businessId: string, sku: string) {
    return prisma.product.findFirst({
      where: { sku, businessId, isDeleted: false },
    });
  }

  async create(businessId: string, data: any) {
    const { images, attributes, ...productData } = data;
    return prisma.product.create({
      data: {
        businessId,
        ...productData,
      },
      include: { categoryRef: true },
    });
  }

  async update(businessId: string, id: string, data: any) {
    const { images, attributes, ...productData } = data;

    await prisma.product.updateMany({
      where: { id, businessId, isDeleted: false },
      data: productData,
    });

    return prisma.product.findFirst({
      where: { id, businessId },
      include: { categoryRef: true },
    });
  }

  async delete(businessId: string, id: string) {
    return prisma.product.updateMany({
      where: { id, businessId, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(businessId: string, id: string) {
    await prisma.product.updateMany({
      where: { id, businessId, isDeleted: true },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return prisma.product.findFirst({
      where: { id, businessId },
    });
  }

  async bulkUpdate(businessId: string, ids: string[], data: any) {
    return prisma.product.updateMany({
      where: {
        id: { in: ids },
        businessId,
        isDeleted: false,
      },
      data,
    });
  }

  // --- Category Repository Operations ---
  async findCategoryById(id: string) {
    return prisma.productCategory.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
  }

  async findCategoryByName(businessId: string, name: string) {
    return prisma.productCategory.findUnique({
      where: {
        businessId_name: { businessId, name },
      },
    });
  }

  async findCategories(businessId: string) {
    return prisma.productCategory.findMany({
      where: { businessId },
      orderBy: { orderIndex: "asc" },
      include: { parent: true, children: true },
    });
  }

  async createCategory(data: {
    businessId: string;
    name: string;
    parentId?: string;
    orderIndex?: number;
  }) {
    return prisma.productCategory.create({
      data,
    });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      parentId?: string;
      orderIndex?: number;
    }
  ) {
    return prisma.productCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return prisma.productCategory.delete({
      where: { id },
    });
  }
}
