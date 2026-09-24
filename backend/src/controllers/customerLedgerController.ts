import { Response, NextFunction } from "express";
import { customerLedgerService } from "../services/customerLedgerService";
import { customerLedgerRepository } from "../repositories/customerLedgerRepository";
import { AuthenticatedRequest } from "../middlewares/auth";

export class CustomerLedgerController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const result = await customerLedgerService.getProfileDetails(businessId, id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getLedger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const result = await customerLedgerRepository.getLedger(businessId, id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const result = await customerLedgerService.getTimelineEvents(businessId, id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await customerLedgerService.getAnalytics(businessId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getReminders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const result = await customerLedgerRepository.getReminders(businessId, id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createReminder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const { dueAt, type, message } = req.body;

      if (!dueAt || !type || !message) {
        const err: any = new Error("dueAt, type, and message are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await customerLedgerRepository.createReminder(businessId, id, {
        dueAt: new Date(dueAt),
        type,
        message,
        createdBy: req.user!.email || "System",
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async postPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const { amount, paymentMethod, referenceNo, remarks } = req.body;

      if (!amount || !paymentMethod) {
        const err: any = new Error("amount and paymentMethod are required parameters.");
        err.statusCode = 400;
        throw err;
      }

      const result = await customerLedgerRepository.logPayment(businessId, id, {
        amount: parseFloat(amount),
        paymentMethod,
        referenceNo,
        remarks,
        receivedBy: req.user!.email || "Owner",
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateCreditLimit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const { creditLimit } = req.body;

      if (creditLimit === undefined) {
        const err: any = new Error("creditLimit is required.");
        err.statusCode = 400;
        throw err;
      }

      await customerLedgerRepository.updateCreditLimit(businessId, id, parseFloat(creditLimit));
      res.json({ success: true, message: "Customer credit limit updated successfully." });
    } catch (err) {
      next(err);
    }
  }

  async createNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const { noteText } = req.body;

      if (!noteText) {
        const err: any = new Error("noteText is required.");
        err.statusCode = 400;
        throw err;
      }

      const note = await customerLedgerRepository.createNote(
        businessId,
        id,
        noteText,
        req.user!.email || "System"
      );
      res.status(201).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  }

  async createTag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = req.params.id as string;
      const { tagName } = req.body;

      if (!tagName) {
        const err: any = new Error("tagName is required.");
        err.statusCode = 400;
        throw err;
      }

      const tag = await customerLedgerRepository.createTag(businessId, id, tagName);
      res.status(201).json({ success: true, data: tag });
    } catch (err) {
      next(err);
    }
  }
}
export const customerLedgerController = new CustomerLedgerController();
