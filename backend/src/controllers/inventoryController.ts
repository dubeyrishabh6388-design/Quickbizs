import { Response, NextFunction } from "express";
import { InventoryService } from "../services/inventoryService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { notificationService } from "../services/notificationService";
import { prisma } from "../config/prisma";

const inventoryService = new InventoryService();

export class InventoryController {
  async getInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { search, warehouseId, page, limit, sortBy, sortOrder } = req.query;

      const result = await inventoryService.getInventory({
        businessId,
        search: search ? String(search) : undefined,
        warehouseId: warehouseId ? String(warehouseId) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50,
        sortBy: sortBy ? String(sortBy) : undefined,
        sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
      });

      res.json({
        success: true,
        message: "Inventory stock details retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await inventoryService.getInventoryById(businessId, id);

      res.json({
        success: true,
        message: "Inventory record details retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, page, limit } = req.query;

      const result = await inventoryService.getStockMovements({
        businessId,
        productId: productId ? String(productId) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50,
      });

      res.json({
        success: true,
        message: "Stock movement ledger logs retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, availableQuantity, minimumStock, maximumStock, reorderLevel, warehouseId, batchNumber, expiryDate } = req.body;

      if (!productId) {
        const err: any = new Error("Product ID is required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await inventoryService.createInventory(businessId, {
        productId,
        availableQuantity: availableQuantity !== undefined ? parseInt(availableQuantity, 10) : undefined,
        minimumStock: minimumStock !== undefined ? parseInt(minimumStock, 10) : undefined,
        maximumStock: maximumStock !== undefined ? parseInt(maximumStock, 10) : undefined,
        reorderLevel: reorderLevel !== undefined ? parseInt(reorderLevel, 10) : undefined,
        warehouseId,
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });

      res.status(201).json({
        success: true,
        message: "Inventory record created successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async addStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, quantity, reason, batchNumber, expiryDate } = req.body;

      if (!productId || quantity === undefined || !reason) {
        const err: any = new Error("Product ID, quantity, and reason are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await inventoryService.addStock(businessId, {
        productId,
        quantity: parseInt(quantity, 10),
        reason,
        createdBy: req.user!.email || "System",
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });

      res.json({
        success: true,
        message: "Stock added successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async reduceStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, quantity, reason } = req.body;

      if (!productId || quantity === undefined || !reason) {
        const err: any = new Error("Product ID, quantity, and reason are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await inventoryService.reduceStock(businessId, {
        productId,
        quantity: parseInt(quantity, 10),
        reason,
        createdBy: req.user!.email || "System",
      });

      res.json({
        success: true,
        message: "Stock reduced successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, adjustedQty, reason } = req.body;
      const role = req.user!.role;

      if (!productId || adjustedQty === undefined || !reason) {
        const err: any = new Error("Product ID, adjusted quantity, and adjustment reason are mandatory.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Mandatory fields: productId, adjustedQty, and reason.";
        err.solution = "Please select a product and enter the adjustment amount.";
        throw err;
      }

      const parsedQty = parseInt(adjustedQty, 10);

      const result = await inventoryService.adjustStock(businessId, {
        productId,
        adjustedQty: parsedQty,
        reason,
        adjustedBy: req.user!.email || "System",
      });

      // Trigger "Stock Adjustment" Notification
      await notificationService.createNotification({
        businessId,
        title: "Stock Adjustment",
        message: `Inventory stock level for Product adjusted by ${parsedQty} units. Reason: ${reason}.`,
        type: "Warning",
        priority: "Medium",
        module: "Inventory",
        referenceType: "Product",
        referenceId: productId,
      });

      res.json({
        success: true,
        message: "Inventory stock level adjusted successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async reserveStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, quantity, referenceId } = req.body;

      if (!productId || quantity === undefined || !referenceId) {
        const err: any = new Error("Product ID, quantity, and referenceId (order ID) are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await inventoryService.reserveStock(businessId, {
        productId,
        quantity: parseInt(quantity, 10),
        referenceId,
      });

      res.json({
        success: true,
        message: "Stock reserved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async releaseStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, quantity, referenceId } = req.body;

      if (!productId || quantity === undefined || !referenceId) {
        const err: any = new Error("Product ID, quantity, and referenceId (order ID) are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await inventoryService.releaseReservedStock(businessId, {
        productId,
        quantity: parseInt(quantity, 10),
        referenceId,
      });

      res.json({
        success: true,
        message: "Reserved stock released successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, page, limit } = req.query;

      const result = await inventoryService.getTransactions({
        businessId,
        productId: productId ? String(productId) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50,
      });

      res.json({
        success: true,
        message: "Inventory transactions list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async setOpeningStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, qty } = req.body;

      if (!productId || qty === undefined) {
        const err: any = new Error("Product ID and opening quantity are mandatory.");
        err.statusCode = 400;
        throw err;
      }

      const result = await inventoryService.setOpeningStock(businessId, {
        productId,
        qty: parseInt(qty, 10),
        createdBy: req.user!.email || "System",
      });

      // Trigger "Stock Updated" Notification
      await notificationService.createNotification({
        businessId,
        title: "Stock Updated",
        message: `Opening stock configured for Product at ${qty} units.`,
        type: "Information",
        priority: "Low",
        module: "Inventory",
        referenceType: "Product",
        referenceId: productId,
      });


      res.json({
        success: true,
        message: "Opening stock level configured successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async transferStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const { productId, fromLocation, toLocation, qty } = req.body;

      if (!productId || !fromLocation || !toLocation || qty === undefined) {
        const err: any = new Error("Product ID, origin location, destination location, and transfer quantity are mandatory.");
        err.statusCode = 400;
        throw err;
      }

      const result = await inventoryService.transferStock(businessId, {
        productId,
        fromLocation,
        toLocation,
        qty: parseInt(qty, 10),
        transferredBy: req.user!.email || "System",
      });

      // Trigger "Stock Updated" Notification
      await notificationService.createNotification({
        businessId,
        title: "Stock Updated",
        message: `Transferred ${qty} units of Product from ${fromLocation} to ${toLocation}.`,
        type: "Information",
        priority: "Low",
        module: "Inventory",
        referenceType: "Product",
        referenceId: productId,
      });

      res.json({
        success: true,
        message: "Stock items transferred successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const result = await inventoryService.getLowStock(businessId);

      res.json({
        success: true,
        message: "Low stock levels list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getOutOfStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const result = await inventoryService.getOutOfStock(businessId);

      res.json({
        success: true,
        message: "Out of stock list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getValuation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const result = await inventoryService.getValuation(businessId);

      res.json({
        success: true,
        message: "Stock valuation report compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
