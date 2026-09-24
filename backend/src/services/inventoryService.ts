import { InventoryRepository } from "../repositories/inventoryRepository";
import { prisma } from "../config/prisma";

const inventoryRepository = new InventoryRepository();

export class InventoryService {
  async getInventory(params: {
    businessId: string;
    search?: string;
    warehouseId?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [items, total] = await Promise.all([
      inventoryRepository.findMany({
        businessId: params.businessId,
        search: params.search,
        warehouseId: params.warehouseId,
        skip,
        take,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }),
      inventoryRepository.count({
        businessId: params.businessId,
        search: params.search,
        warehouseId: params.warehouseId,
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getInventoryById(businessId: string, id: string) {
    const item = await inventoryRepository.findById(businessId, id);
    if (!item) {
      const err: any = new Error("Inventory record not found.");
      err.statusCode = 404;
      throw err;
    }
    return item;
  }

  async getStockMovements(params: {
    businessId: string;
    productId?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [movements, total] = await Promise.all([
      inventoryRepository.findStockMovements({
        businessId: params.businessId,
        productId: params.productId,
        skip,
        take,
      }),
      inventoryRepository.countStockMovements({
        businessId: params.businessId,
        productId: params.productId,
      }),
    ]);

    return {
      movements,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  private getInventoryStatus(availableQuantity: number, minStock: number): string {
    if (availableQuantity <= 0) return "OUT_OF_STOCK";
    if (availableQuantity <= minStock) return "LOW_STOCK";
    return "IN_STOCK";
  }

  async createInventory(
    businessId: string,
    data: {
      productId: string;
      availableQuantity?: number;
      minimumStock?: number;
      maximumStock?: number;
      reorderLevel?: number;
      warehouseId?: string;
      batchNumber?: string;
      expiryDate?: Date;
    }
  ) {
    const existing = await inventoryRepository.findByProductId(businessId, data.productId);
    if (existing) {
      const err: any = new Error("Inventory record already exists for this product.");
      err.statusCode = 400;
      throw err;
    }

    const avail = data.availableQuantity || 0;
    const min = data.minimumStock || 10;
    const status = this.getInventoryStatus(avail, min);

    const inventory = await inventoryRepository.create(businessId, {
      ...data,
      availableQuantity: avail,
      minimumStock: min,
      status,
    });

    // Create Initial Transaction
    await inventoryRepository.createTransaction({
      businessId,
      productId: data.productId,
      inventoryId: inventory.id,
      transactionType: "STOCK_IN",
      quantity: avail,
      balanceAfter: avail,
      reason: "Initial inventory setup",
      createdBy: "system",
    });

    return inventory;
  }

  async addStock(
    businessId: string,
    data: {
      productId: string;
      quantity: number;
      reason: string;
      createdBy: string;
      batchNumber?: string;
      expiryDate?: Date;
    }
  ) {
    if (data.quantity <= 0) {
      const err: any = new Error("Quantity must be greater than zero.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findFirst({
        where: { productId: data.productId, businessId, deletedAt: null },
      });

      if (!inv) {
        throw new Error("Product inventory card not found.");
      }

      const newAvail = inv.availableQuantity + data.quantity;
      const status = this.getInventoryStatus(newAvail, inv.minimumStock);

      const updated = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          availableQuantity: newAvail,
          status,
          batchNumber: data.batchNumber ?? inv.batchNumber,
          expiryDate: data.expiryDate ?? inv.expiryDate,
          lastUpdated: new Date(),
        },
      });

      await tx.product.updateMany({
        where: { id: data.productId, businessId },
        data: { stock: newAvail },
      });

      await tx.stockMovement.create({
        data: {
          businessId,
          productId: data.productId,
          inventoryId: inv.id,
          referenceType: "STOCK_IN",
          movementType: "IN",
          quantity: data.quantity,
          openingStock: inv.availableQuantity,
          closingStock: newAvail,
          reason: data.reason,
          createdBy: data.createdBy,
        },
      });

      return updated;
    });
  }

  async reduceStock(
    businessId: string,
    data: {
      productId: string;
      quantity: number;
      reason: string;
      createdBy: string;
    }
  ) {
    if (data.quantity <= 0) {
      const err: any = new Error("Quantity must be greater than zero.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findFirst({
        where: { productId: data.productId, businessId, deletedAt: null },
      });

      if (!inv) {
        throw new Error("Product inventory card not found.");
      }

      const newAvail = inv.availableQuantity - data.quantity;
      if (newAvail < 0) {
        throw new Error(`Insufficient inventory to deduct. Current: ${inv.availableQuantity}`);
      }

      const status = this.getInventoryStatus(newAvail, inv.minimumStock);

      const updated = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          availableQuantity: newAvail,
          status,
          lastUpdated: new Date(),
        },
      });

      await tx.product.updateMany({
        where: { id: data.productId, businessId },
        data: { stock: newAvail },
      });

      await tx.stockMovement.create({
        data: {
          businessId,
          productId: data.productId,
          inventoryId: inv.id,
          referenceType: "STOCK_OUT",
          movementType: "OUT",
          quantity: data.quantity,
          openingStock: inv.availableQuantity,
          closingStock: newAvail,
          reason: data.reason,
          createdBy: data.createdBy,
        },
      });

      return updated;
    });
  }

  async adjustStock(
    businessId: string,
    data: {
      productId: string;
      adjustedQty: number; // e.g. -5 or +10
      reason: string;
      adjustedBy: string;
    }
  ) {
    if (!data.productId || data.adjustedQty === 0 || !data.reason) {
      const err: any = new Error("Product ID, non-zero adjusted quantity, and adjustment reason are mandatory.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findFirst({
        where: { productId: data.productId, businessId, deletedAt: null },
        include: { product: true },
      });

      if (!inventory) {
        throw new Error("Product inventory card does not exist.");
      }

      const currentQty = inventory.availableQuantity;
      const newQty = currentQty + data.adjustedQty;

      if (newQty < 0) {
        throw new Error(`Stock adjustment rejected. Insufficient shelf inventory (Current: ${currentQty}, Request: ${data.adjustedQty}).`);
      }

      const status = this.getInventoryStatus(newQty, inventory.minimumStock);

      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          availableQuantity: newQty,
          status,
          lastUpdated: new Date(),
        },
      });

      await tx.product.updateMany({
        where: { id: data.productId, businessId },
        data: { stock: newQty },
      });

      // Record unified Stock Movement
      const movement = await tx.stockMovement.create({
        data: {
          businessId,
          productId: data.productId,
          inventoryId: inventory.id,
          referenceType: "ADJUSTMENT",
          movementType: data.adjustedQty > 0 ? "IN" : "OUT",
          quantity: Math.abs(data.adjustedQty),
          openingStock: currentQty,
          closingStock: newQty,
          reason: data.reason,
          createdBy: data.adjustedBy,
        },
      });

      return movement;
    });
  }

  async reserveStock(
    businessId: string,
    data: {
      productId: string;
      quantity: number;
      referenceId: string;
    }
  ) {
    if (data.quantity <= 0) {
      const err: any = new Error("Reservation quantity must be greater than zero.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findFirst({
        where: { productId: data.productId, businessId, deletedAt: null },
      });

      if (!inv) {
        throw new Error("Product inventory card not found.");
      }

      if (inv.availableQuantity < data.quantity) {
        throw new Error(`Insufficient stock available to reserve. Requested: ${data.quantity}, Available: ${inv.availableQuantity}`);
      }

      const newAvail = inv.availableQuantity - data.quantity;
      const newReserved = inv.reservedQuantity + data.quantity;
      const status = this.getInventoryStatus(newAvail, inv.minimumStock);

      const updated = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          availableQuantity: newAvail,
          reservedQuantity: newReserved,
          status,
          lastUpdated: new Date(),
        },
      });

      await tx.product.updateMany({
        where: { id: data.productId, businessId },
        data: { stock: newAvail },
      });

      await tx.stockMovement.create({
        data: {
          businessId,
          productId: data.productId,
          inventoryId: inv.id,
          referenceType: "PICKUP_ORDER",
          referenceId: data.referenceId,
          movementType: "OUT",
          quantity: data.quantity,
          openingStock: inv.availableQuantity,
          closingStock: newAvail,
          reason: "Reserved for pickup order",
          createdBy: "system",
        },
      });

      return updated;
    });
  }

  async releaseReservedStock(
    businessId: string,
    data: {
      productId: string;
      quantity: number;
      referenceId: string;
    }
  ) {
    if (data.quantity <= 0) {
      const err: any = new Error("Release quantity must be greater than zero.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findFirst({
        where: { productId: data.productId, businessId, deletedAt: null },
      });

      if (!inv) {
        throw new Error("Product inventory card not found.");
      }

      const releaseQty = Math.min(inv.reservedQuantity, data.quantity);
      const newAvail = inv.availableQuantity + releaseQty;
      const newReserved = inv.reservedQuantity - releaseQty;
      const status = this.getInventoryStatus(newAvail, inv.minimumStock);

      const updated = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          availableQuantity: newAvail,
          reservedQuantity: newReserved,
          status,
          lastUpdated: new Date(),
        },
      });

      await tx.product.updateMany({
        where: { id: data.productId, businessId },
        data: { stock: newAvail },
      });

      await tx.stockMovement.create({
        data: {
          businessId,
          productId: data.productId,
          inventoryId: inv.id,
          referenceType: "PICKUP_ORDER",
          referenceId: data.referenceId,
          movementType: "IN",
          quantity: releaseQty,
          openingStock: inv.availableQuantity,
          closingStock: newAvail,
          reason: "Rollback reserved stock from cancelled order",
          createdBy: "system",
        },
      });

      return updated;
    });
  }

  async completePickup(
    businessId: string,
    data: {
      productId: string;
      quantity: number;
      referenceId: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findFirst({
        where: { productId: data.productId, businessId, deletedAt: null },
      });

      if (!inv) {
        throw new Error("Product inventory card not found.");
      }

      const releaseQty = Math.min(inv.reservedQuantity, data.quantity);
      const newReserved = inv.reservedQuantity - releaseQty;

      const updated = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          reservedQuantity: newReserved,
          lastUpdated: new Date(),
        },
      });

      await tx.stockMovement.create({
        data: {
          businessId,
          productId: data.productId,
          inventoryId: inv.id,
          referenceType: "PICKUP_ORDER",
          referenceId: data.referenceId,
          movementType: "OUT",
          quantity: releaseQty,
          openingStock: inv.availableQuantity,
          closingStock: inv.availableQuantity,
          reason: "Pickup completed & collected by customer",
          createdBy: "system",
        },
      });

      return updated;
    });
  }

  async getTransactions(params: {
    businessId: string;
    productId?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [transactions, total] = await Promise.all([
      inventoryRepository.findTransactions({
        businessId: params.businessId,
        productId: params.productId,
        skip,
        take,
      }),
      inventoryRepository.countTransactions({
        businessId: params.businessId,
        productId: params.productId,
      }),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async setOpeningStock(
    businessId: string,
    data: {
      productId: string;
      qty: number;
      createdBy: string;
    }
  ) {
    if (data.qty < 0) {
      const err: any = new Error("Opening stock level cannot be negative.");
      err.statusCode = 400;
      throw err;
    }

    const inventory = await inventoryRepository.findByProductId(businessId, data.productId);
    if (!inventory) {
      const err: any = new Error("Product inventory card not found.");
      err.statusCode = 404;
      throw err;
    }

    const existingMovements = await prisma.stockMovement.findFirst({
      where: {
        businessId,
        inventoryId: inventory.id,
        referenceType: "Opening Stock",
      },
    });

    if (existingMovements) {
      const err: any = new Error("Opening stock has already been set for this product.");
      err.statusCode = 400;
      throw err;
    }

    const status = this.getInventoryStatus(data.qty, inventory.minimumStock);

    await inventoryRepository.update(businessId, inventory.id, {
      availableQuantity: data.qty,
      status,
      lastUpdated: new Date(),
    });

    await prisma.product.updateMany({
      where: { id: data.productId, businessId },
      data: { stock: data.qty },
    });

    await inventoryRepository.createStockMovement(businessId, {
      productId: data.productId,
      inventoryId: inventory.id,
      referenceType: "Opening Stock",
      movementType: "IN",
      quantity: data.qty,
      openingStock: 0,
      closingStock: data.qty,
      reason: "Configured opening stock level",
      createdBy: data.createdBy,
    });

    return inventory;
  }

  async transferStock(
    businessId: string,
    data: {
      productId: string;
      fromLocation: string;
      toLocation: string;
      qty: number;
      transferredBy: string;
    }
  ) {
    if (data.qty <= 0) {
      const err: any = new Error("Transferred quantity must be greater than zero.");
      err.statusCode = 400;
      throw err;
    }

    const inventory = await inventoryRepository.findByProductId(businessId, data.productId);
    if (!inventory) {
      const err: any = new Error("Product inventory card not found.");
      err.statusCode = 404;
      throw err;
    }

    if (inventory.availableQuantity < data.qty) {
      const err: any = new Error("Insufficient stock available to transfer.");
      err.statusCode = 400;
      throw err;
    }

    const newQty = inventory.availableQuantity - data.qty;
    const status = this.getInventoryStatus(newQty, inventory.minimumStock);

    await inventoryRepository.update(businessId, inventory.id, {
      availableQuantity: newQty,
      status,
      lastUpdated: new Date(),
    });

    await prisma.product.updateMany({
      where: { id: data.productId, businessId },
      data: { stock: newQty },
    });

    const transfer = await inventoryRepository.createStockTransfer(businessId, {
      productId: data.productId,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      transferredQty: data.qty,
      transferredBy: data.transferredBy,
    });

    await inventoryRepository.createStockMovement(businessId, {
      productId: data.productId,
      inventoryId: inventory.id,
      referenceType: "Transfer",
      movementType: "OUT",
      quantity: data.qty,
      openingStock: inventory.availableQuantity,
      closingStock: newQty,
      reason: `Transferred stock from ${data.fromLocation} to ${data.toLocation}`,
      createdBy: data.transferredBy,
    });

    return transfer;
  }

  async getLowStock(businessId: string) {
    return inventoryRepository.findLowStock(businessId);
  }

  async getOutOfStock(businessId: string) {
    return inventoryRepository.findOutOfStock(businessId);
  }

  async getValuation(businessId: string) {
    const inventories = await prisma.inventory.findMany({
      where: { businessId, deletedAt: null },
      include: { product: true },
    });

    const totalValuation = inventories.reduce((acc, item) => {
      return acc + item.availableQuantity * item.product.costPrice;
    }, 0);

    const totalItems = inventories.reduce((acc, item) => acc + item.availableQuantity, 0);

    return {
      totalValuation,
      totalItems,
      timestamp: new Date().toISOString(),
    };
  }
}
