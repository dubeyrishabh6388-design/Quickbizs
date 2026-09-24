import { prisma } from "../config/prisma";

export class InventoryRepository {
  async findMany(params: {
    businessId: string;
    search?: string;
    warehouseId?: string;
    skip: number;
    take: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const where: any = {
      businessId: params.businessId,
      deletedAt: null,
    };

    if (params.search) {
      where.product = {
        OR: [
          { name: { contains: params.search } },
          { category: { contains: params.search } },
          { barcode: { contains: params.search } },
        ],
      };
    }

    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }

    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    return prisma.inventory.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
      include: {
        product: true,
      },
    });
  }

  async count(params: {
    businessId: string;
    search?: string;
    warehouseId?: string;
  }) {
    const where: any = {
      businessId: params.businessId,
      deletedAt: null,
    };

    if (params.search) {
      where.product = {
        OR: [
          { name: { contains: params.search } },
          { category: { contains: params.search } },
          { barcode: { contains: params.search } },
        ],
      };
    }

    return prisma.inventory.count({ where });
  }

  async findById(businessId: string, id: string) {
    return prisma.inventory.findFirst({
      where: { id, businessId, deletedAt: null },
      include: {
        product: true,
      },
    });
  }

  async findByProductId(businessId: string, productId: string) {
    return prisma.inventory.findFirst({
      where: { productId, businessId, deletedAt: null },
      include: {
        product: true,
      },
    });
  }

  async findLowStock(businessId: string) {
    return prisma.inventory.findMany({
      where: {
        businessId,
        deletedAt: null,
        availableQuantity: { lte: 10 },
      },
      include: {
        product: true,
      },
    });
  }

  async findOutOfStock(businessId: string) {
    return prisma.inventory.findMany({
      where: {
        businessId,
        deletedAt: null,
        availableQuantity: { lte: 0 },
      },
      include: {
        product: true,
      },
    });
  }

  async findStockMovements(params: {
    businessId: string;
    productId?: string;
    skip: number;
    take: number;
  }) {
    const where: any = {
      businessId: params.businessId,
    };

    if (params.productId) {
      where.productId = params.productId;
    }

    return prisma.stockMovement.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
    });
  }

  async countStockMovements(params: {
    businessId: string;
    productId?: string;
  }) {
    const where: any = {
      businessId: params.businessId,
    };

    if (params.productId) {
      where.productId = params.productId;
    }

    return prisma.stockMovement.count({ where });
  }

  async create(businessId: string, data: any) {
    return prisma.inventory.create({
      data: {
        businessId,
        ...data,
      },
    });
  }

  async update(businessId: string, id: string, data: any) {
    return prisma.inventory.updateMany({
      where: { id, businessId, deletedAt: null },
      data,
    });
  }

  async createStockMovement(businessId: string, data: any) {
    return prisma.stockMovement.create({
      data: {
        businessId,
        ...data,
      },
    });
  }

  async createStockAdjustment(businessId: string, data: any) {
    return prisma.stockMovement.create({
      data: {
        businessId,
        productId: data.productId,
        inventoryId: data.inventoryId,
        referenceType: "ADJUSTMENT",
        movementType: data.adjustmentType || "ADJUSTMENT",
        quantity: data.quantity,
        openingStock: data.previousStock || 0,
        closingStock: data.newStock || 0,
        reason: data.reason || "Manual Stock Adjustment",
      },
    });
  }

  async createStockTransfer(businessId: string, data: any) {
    return prisma.stockMovement.create({
      data: {
        businessId,
        productId: data.productId,
        inventoryId: data.inventoryId || data.sourceInventoryId,
        referenceType: "TRANSFER",
        movementType: "TRANSFER",
        quantity: data.quantity,
        openingStock: 0,
        closingStock: 0,
        reason: data.reason || "Warehouse Transfer",
      },
    });
  }

  async findWarehouseByCode(_businessId: string, _code: string) {
    return null;
  }

  async createWarehouse(_businessId: string, _data: any) {
    return { id: "default", name: "Main Store" };
  }

  // --- StockMovement Transaction Repository Operations ---
  async createTransaction(data: {
    businessId: string;
    productId: string;
    inventoryId: string;
    transactionType: string;
    quantity: number;
    balanceAfter: number;
    referenceId?: string;
    reason?: string;
    createdBy?: string;
  }) {
    return prisma.stockMovement.create({
      data: {
        businessId: data.businessId,
        productId: data.productId,
        inventoryId: data.inventoryId,
        referenceType: data.transactionType,
        referenceId: data.referenceId || null,
        movementType: data.transactionType,
        quantity: data.quantity,
        openingStock: data.balanceAfter,
        closingStock: data.balanceAfter,
        reason: data.reason || "Inventory Transaction",
        createdBy: data.createdBy || null,
      },
    });
  }

  async findTransactions(params: {
    businessId: string;
    productId?: string;
    skip: number;
    take: number;
  }) {
    const where: any = {
      businessId: params.businessId,
    };

    if (params.productId) {
      where.productId = params.productId;
    }

    return prisma.stockMovement.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
    });
  }

  async countTransactions(params: {
    businessId: string;
    productId?: string;
  }) {
    const where: any = {
      businessId: params.businessId,
    };

    if (params.productId) {
      where.productId = params.productId;
    }

    return prisma.stockMovement.count({ where });
  }
}
