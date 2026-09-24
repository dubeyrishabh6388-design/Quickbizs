import { Response, NextFunction } from "express";
import { paymentService } from "../services/paymentService";
import { paymentRepository } from "../repositories/paymentRepository";
import { webhookService } from "../services/webhookService";
import { AuthenticatedRequest } from "../middlewares/auth";

export class PaymentController {
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const userId = req.user!.employeeId || "unknown_user";
      const { customerId, supplierId, invoiceId, purchaseId, subscriptionId, amount, paymentMethod, remarks } = req.body;

      if (!amount || !paymentMethod) {
        const err: any = new Error("amount and paymentMethod are required parameters.");
        err.statusCode = 400;
        throw err;
      }

      const result = await paymentService.createOrder(businessId, userId, {
        customerId,
        supplierId,
        invoiceId,
        purchaseId,
        subscriptionId,
        amount: parseFloat(amount),
        paymentMethod,
        remarks,
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { transactionId, gatewayPaymentId, gatewayOrderId, signature } = req.body;

      if (!transactionId || !gatewayPaymentId || !gatewayOrderId || !signature) {
        const err: any = new Error("transactionId, gatewayPaymentId, gatewayOrderId, and signature are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await paymentService.verifyPayment(businessId, {
        transactionId,
        gatewayPaymentId,
        gatewayOrderId,
        signature,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async webhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { eventId, event, payload } = req.body;

      if (!eventId || !event || !payload) {
        const err: any = new Error("eventId, event, and payload are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await webhookService.handleWebhook(businessId, {
        eventId,
        event,
        payload,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async refund(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { transactionId, amount } = req.body;

      if (!transactionId || !amount) {
        const err: any = new Error("transactionId and amount are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await paymentService.initiateRefund(businessId, {
        transactionId,
        amount: parseFloat(amount),
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await paymentRepository.getPaymentsHistory(businessId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await paymentRepository.getPaymentsAnalytics(businessId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { customerId, amount, linkType } = req.body;

      if (!customerId || !amount || !linkType) {
        const err: any = new Error("customerId, amount, and linkType are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await paymentService.createPaymentLink(businessId, {
        customerId,
        amount: parseFloat(amount),
        linkType,
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getCustomerSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const customerId = req.params.customerId as string;
      const result = await paymentRepository.getCustomerPaymentsSummary(businessId, customerId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
export const paymentController = new PaymentController();
