import { Response, NextFunction } from "express";
import { PickupOrderService } from "../services/pickupOrderService";
import { AuthenticatedRequest } from "../middlewares/auth";

const pickupOrderService = new PickupOrderService();

export class PickupOrderController {
  // --- Customer Endpoints ---
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const result = await pickupOrderService.createOrder(customerId, req.body);

      res.status(201).json({
        success: true,
        message: "Pickup order placed successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

      const result = await pickupOrderService.getCustomerOrders(customerId, page, limit);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const id = req.params.id as string;

      const result = await pickupOrderService.getOrderById(id);
      if (result.customerId !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: You can only view your own orders.",
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelCustomerOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const id = req.params.id as string;

      const result = await pickupOrderService.cancelOrder(customerId, id);

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Merchant Endpoints ---
  async getMerchantOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const status = req.query.status ? String(req.query.status) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

      const result = await pickupOrderService.getMerchantOrders(businessId, status, page, limit);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await pickupOrderService.acceptOrder(businessId, id);

      res.status(200).json({
        success: true,
        message: "Order accepted successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required.",
        });
      }

      const result = await pickupOrderService.rejectOrder(businessId, id, reason);

      res.status(200).json({
        success: true,
        message: "Order rejected and stock reservation rolled back.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async startPacking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await pickupOrderService.startPacking(businessId, id);

      res.status(200).json({
        success: true,
        message: "Packing process started.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async markItemPacked(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;
      const { itemId, packingStatus, remarks } = req.body;

      if (!itemId || !packingStatus) {
        return res.status(400).json({
          success: false,
          message: "Item ID and packing status are required.",
        });
      }

      const result = await pickupOrderService.markItemPacked(businessId, id, itemId, packingStatus, remarks);

      res.status(200).json({
        success: true,
        message: "Item packing status updated.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async markOrderReady(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;

      const result = await pickupOrderService.markOrderReady(businessId, id);

      res.status(200).json({
        success: true,
        message: "Order marked ready for pickup collection.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPickupPin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;
      const { pin } = req.body || {};

      const pinVal = pin || "0000";
      const isValid = await pickupOrderService.verifyPickupPin(businessId, id, pinVal);

      res.status(200).json({
        success: true,
        valid: isValid,
        message: isValid ? "PIN verified successfully." : "Invalid secure pickup PIN.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async completePickup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;
      const { pin } = req.body || {};

      const pinVal = pin || "0000";
      const result = await pickupOrderService.completePickup(businessId, id, pinVal);

      res.status(200).json({
        success: true,
        message: "Order collected, stock deducted, and score incremented successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelMerchantOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId as string;
      const id = req.params.id as string;
      const { reason } = req.body || {};

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason is required.",
        });
      }

      const result = await pickupOrderService.merchantCancel(businessId, id, reason);

      res.status(200).json({
        success: true,
        message: "Order cancelled by store.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
