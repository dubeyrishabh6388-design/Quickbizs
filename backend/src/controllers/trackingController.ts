import { Request, Response, NextFunction } from "express";
import { trackingService } from "../services/trackingService";
import { billingRepository } from "../repositories/billingRepository";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    businessId: string;
    email: string;
  };
}

export class TrackingController {
  async lookupSerial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.businessId;
      const { identifier } = req.params;

      if (!identifier) {
        return res.status(400).json({ success: false, message: "Identifier is required" });
      }

      const serial = await trackingService.lookupSerial(businessId, identifier as string);
      if (!serial) {
        return res.status(404).json({ success: false, message: "Serial number or IMEI not found." });
      }

      return res.status(200).json({ success: true, serial });
    } catch (err) {
      next(err);
    }
  }

  async getBatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.businessId;
      const { productId } = req.params;

      const batches = await trackingService.getFEFOBatches(businessId, productId as string);
      return res.status(200).json({ success: true, batches });
    } catch (err) {
      next(err);
    }
  }

  async reconcileOpeningStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.businessId;
      const { productId, newTrackingMode, serials, batches } = req.body;

      if (!productId || !newTrackingMode) {
        return res.status(400).json({ success: false, message: "productId and newTrackingMode are required." });
      }

      const result = await trackingService.reconcileOpeningStock(businessId, {
        productId,
        newTrackingMode,
        serials,
        batches,
        performedBy: req.user!.email,
      });

      return res.status(200).json({ success: true, result });
    } catch (err) {
      next(err);
    }
  }

  async createSalesReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.businessId;
      const { orderId, customerId, refundAmount, refundMethod, reason, serialReturns, batchReturns } = req.body;

      if (!orderId || refundAmount === undefined || !refundMethod) {
        return res.status(400).json({ success: false, message: "orderId, refundAmount, and refundMethod are required." });
      }

      const returnDoc = await billingRepository.createSalesReturnInTransaction(businessId, {
        orderId,
        customerId,
        refundAmount: Number(refundAmount),
        refundMethod,
        reason,
        receivedBy: req.user!.email,
        serialReturns,
        batchReturns,
      });

      return res.status(201).json({ success: true, salesReturn: returnDoc });
    } catch (err) {
      next(err);
    }
  }
}

export const trackingController = new TrackingController();
