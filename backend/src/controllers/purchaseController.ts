import { Response, NextFunction } from "express";
import { PurchaseService } from "../services/purchaseService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { notificationService } from "../services/notificationService";
import { prisma } from "../config/prisma";

const purchaseService = new PurchaseService();

export class PurchaseController {
  async getPurchases(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { search, supplierId, page, limit, sortBy, sortOrder } = req.query;

      const result = await purchaseService.getPurchases({
        businessId,
        search: search ? String(search) : undefined,
        supplierId: supplierId ? String(supplierId) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50,
        sortBy: sortBy ? String(sortBy) : undefined,
        sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
      });

      res.json({
        success: true,
        message: "Purchase orders list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await purchaseService.getPurchaseById(businessId, id as string);

      res.json({
        success: true,
        message: "Purchase order details retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createPurchaseOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { supplierId, expectedDelivery, items, remarks } = req.body;

      if (!supplierId || !items || items.length === 0) {
        const err: any = new Error("Supplier ID and purchase items are mandatory.");
        err.statusCode = 400;
        throw err;
      }

      const result = await purchaseService.createPurchaseOrder(businessId, {
        supplierId,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : undefined,
        items,
        remarks,
        createdBy: req.user!.email || "System",
      });

      // Trigger "Purchase Created" Notification
      await notificationService.createNotification({
        businessId,
        title: "Purchase Created",
        message: `New Purchase Order PO #${result.po.poNumber} created for supplier.`,
        type: "Information",
        priority: "Medium",
        module: "Purchase",
        referenceType: "PurchaseOrder",
        referenceId: result.po.id,
      });

      res.status(201).json({
        success: true,
        message: "Purchase order created successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async approvePurchaseOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      await purchaseService.approvePurchaseOrder(businessId, id as string, req.user!.email || "System");

      // Trigger "Purchase Approved" Notification
      await notificationService.createNotification({
        businessId,
        title: "Purchase Approved",
        message: `Purchase Order approved and ready to receive.`,
        type: "Approval",
        priority: "Medium",
        module: "Purchase",
        referenceType: "PurchaseOrder",
        referenceId: id as string,
      });

      res.json({
        success: true,
        message: "Purchase order approved successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async receiveGoods(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;
      const { receivedItems, remarks } = req.body;

      if (!receivedItems || receivedItems.length === 0) {
        const err: any = new Error("Received items list is mandatory.");
        err.statusCode = 400;
        throw err;
      }

      const result = await purchaseService.receiveGoods(businessId, id as string, {
        receivedItems,
        remarks,
        receivedBy: req.user!.email || "System",
      });

      // Trigger "Goods Received" Notification
      await notificationService.createNotification({
        businessId,
        title: "Goods Received",
        message: `Goods received (GRN processed successfully). Stocks updated.`,
        type: "Success",
        priority: "Medium",
        module: "Purchase",
        referenceType: "PurchaseOrder",
        referenceId: id as string,
      });

      res.json({
        success: true,
        message: "Goods Received (GRN) processed successfully. Stocks updated.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async returnGoods(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;
      const { items } = req.body;

      if (!items || items.length === 0) {
        const err: any = new Error("Return items list is mandatory.");
        err.statusCode = 400;
        throw err;
      }

      const result = await purchaseService.returnGoods(businessId, id as string, {
        items,
        returnedBy: req.user!.email || "System",
      });

      // Trigger "Purchase Returned" Notification
      await notificationService.createNotification({
        businessId,
        title: "Purchase Returned",
        message: `Purchase return processed against PO.`,
        type: "Warning",
        priority: "Medium",
        module: "Purchase",
        referenceType: "PurchaseOrder",
        referenceId: id as string,
      });

      res.json({
        success: true,
        message: "Purchase goods return processed successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async addPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;
      const { paymentMethod, amount, referenceNumber } = req.body;

      if (!paymentMethod || amount === undefined) {
        const err: any = new Error("Payment method and amount are mandatory.");
        err.statusCode = 400;
        throw err;
      }

      const result = await purchaseService.addPayment(businessId, id as string, {
        paymentMethod,
        amount: parseFloat(amount),
        referenceNumber,
        paidBy: req.user!.email || "System",
      });

      // Trigger "Supplier Payment Received" Notification
      await notificationService.createNotification({
        businessId,
        title: "Supplier Payment Made",
        message: `Payment of ₹${parseFloat(amount).toLocaleString()} logged for purchase order.`,
        type: "Success",
        priority: "Low",
        module: "Suppliers",
        referenceType: "PurchaseOrder",
        referenceId: id as string,
      });

      res.json({
        success: true,
        message: "Purchase payment logged successfully. Supplier outstanding adjusted.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getOutstanding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await purchaseService.getOutstanding(businessId);

      res.json({
        success: true,
        message: "Outstanding purchase payables ledger retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
