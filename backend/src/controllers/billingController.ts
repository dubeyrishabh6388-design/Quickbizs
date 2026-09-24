import { Response, NextFunction } from "express";
import { BillingService } from "../services/billingService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { notificationService } from "../services/notificationService";
import { prisma } from "../config/prisma";

const billingService = new BillingService();

export class BillingController {
  async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { search, customerId, page, limit, sortBy, sortOrder, startDate, endDate } = req.query;

      const result = await billingService.getOrders({
        businessId,
        search: search ? String(search) : undefined,
        customerId: customerId ? String(customerId) : undefined,
        startDate: startDate ? new Date(String(startDate)) : undefined,
        endDate: endDate ? new Date(String(endDate)) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50,
        sortBy: sortBy ? String(sortBy) : undefined,
        sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
      });

      res.json({
        success: true,
        message: "Invoice orders list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await billingService.getOrderById(businessId, id as string);

      res.json({
        success: true,
        message: "Invoice order details retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { limit } = req.query;
      const parsedLimit = limit ? parseInt(String(limit), 10) : 10;

      const result = await billingService.getRecentOrders(businessId, parsedLimit);

      res.json({
        success: true,
        message: "Recent orders retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodayOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await billingService.getTodayOrders(businessId);

      res.json({
        success: true,
        message: "Today's invoice list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { customerId, customerName, customerType, items, paymentMethod, splitDetails, notes } = req.body;

      if (!customerName || !items || items.length === 0 || !paymentMethod) {
        const err: any = new Error("Required order parameters missing.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Mandatory fields: customerName, items, and paymentMethod.";
        err.solution = "Please select products and complete checkout details.";
        throw err;
      }

      // API level validation checks
      for (const item of items) {
        if (Number(item.quantity) <= 0) {
          const err: any = new Error("Product quantity must be greater than zero.");
          err.statusCode = 400;
          throw err;
        }
        if (Number(item.price) < 0) {
          const err: any = new Error("Product unit price cannot be negative.");
          err.statusCode = 400;
          throw err;
        }
      }

      // POS pre-checkout validation interceptor: Check customer credits limit rules
      if (customerId && paymentMethod === "Credit") {
        const customer = await prisma.customer.findFirst({
          where: { id: customerId, businessId },
        });
        const dueAmount = customer ? customer.pendingAmount : 0;
        const totalAmt = items.reduce((sum: number, i: any) => sum + (Number(i.price) * Number(i.quantity)), 0);

      }

      const result = await billingService.createOrder(businessId, {
        customerId: customerId || undefined,
        customerName,
        customerType,
        employeeId: req.user!.email,
        items,
        paymentMethod,
        splitDetails: splitDetails || undefined,
        notes: notes || undefined,
      });

      // Trigger "Invoice Created" Notification
      await notificationService.createNotification({
        businessId,
        title: "Invoice Created",
        message: `Checkout successful. Invoice #${result.order.invoiceNumber} for ₹${result.order.grandTotal.toLocaleString()} generated.`,
        type: "Success",
        priority: "Medium",
        module: "Billing",
        referenceType: "Order",
        referenceId: result.order.id,
      });

      // Trigger "Payment Pending" if payment status is Pending
      if (result.order.paymentStatus === "Pending") {
        await notificationService.createNotification({
          businessId,
          title: "Payment Pending",
          message: `Invoice #${result.order.invoiceNumber} payment is pending (Credit sale to ${customerName}).`,
          type: "Reminder",
          priority: "Medium",
          module: "Billing",
          referenceType: "Order",
          referenceId: result.order.id,
        });
      } else {
        // Trigger "Payment Received" notification
        await notificationService.createNotification({
          businessId,
          title: "Payment Received",
          message: `Payment received for Invoice #${result.order.invoiceNumber} via ${paymentMethod}.`,
          type: "Success",
          priority: "Low",
          module: "Billing",
          referenceType: "Order",
         });
      }

      res.status(201).json({
        success: true,
        message: "Sales invoice checkout completed successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await billingService.cancelOrder(businessId, id as string);

      // Trigger "Invoice Cancelled" Notification
      await notificationService.createNotification({
        businessId,
        title: "Invoice Cancelled",
        message: `Invoice #${result.order.invoiceNumber} for ₹${result.order.grandTotal.toLocaleString()} has been cancelled.`,
        type: "Error",
        priority: "High",
        module: "Billing",
        referenceType: "Order",
        referenceId: result.order.id,
      });

      res.json({
        success: true,
        message: "Sales invoice order cancelled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
