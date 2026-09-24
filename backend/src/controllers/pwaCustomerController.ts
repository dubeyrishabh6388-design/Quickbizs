import { Response, NextFunction } from "express";
import { PwaCustomerService } from "../services/pwaCustomerService";
import { AuthenticatedRequest } from "../middlewares/auth";

const pwaCustomerService = new PwaCustomerService();

export class PwaCustomerController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const result = await pwaCustomerService.getProfile(customerId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const result = await pwaCustomerService.updateProfile(customerId, req.body);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      await pwaCustomerService.deleteProfile(customerId);

      res.status(200).json({
        success: true,
        message: "Profile soft-deleted successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Addresses ---
  async getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const result = await pwaCustomerService.getAddresses(customerId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const result = await pwaCustomerService.createAddress(customerId, req.body);

      res.status(201).json({
        success: true,
        message: "Address added successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const addressId = req.params.id as string;
      const result = await pwaCustomerService.updateAddress(customerId, addressId, req.body);

      res.status(200).json({
        success: true,
        message: "Address updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const addressId = req.params.id as string;
      await pwaCustomerService.deleteAddress(customerId, addressId);

      res.status(200).json({
        success: true,
        message: "Address deleted successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async setDefaultAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const addressId = req.params.id as string;
      const result = await pwaCustomerService.setDefaultAddress(customerId, addressId);

      res.status(200).json({
        success: true,
        message: "Default address set successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Favourite Shops ---
  async getFavouriteShops(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const result = await pwaCustomerService.getFavouriteShops(customerId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async addFavouriteShop(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const { businessId } = req.body;

      if (!businessId) {
        const err: any = new Error("Business ID is required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await pwaCustomerService.addFavouriteShop(customerId, businessId);

      res.status(201).json({
        success: true,
        message: "Shop added to favourites.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFavouriteShop(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const businessId = req.params.businessId as string;

      await pwaCustomerService.removeFavouriteShop(customerId, businessId);

      res.status(200).json({
        success: true,
        message: "Shop removed from favourites.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Order History ---
  async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

      const result = await pwaCustomerService.getOrders(customerId, page, limit);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const orderId = req.params.id as string;

      const result = await pwaCustomerService.getOrderDetails(customerId, orderId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async repeatOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const orderId = req.params.id as string;

      const result = await pwaCustomerService.repeatOrder(customerId, orderId);

      res.status(201).json({
        success: true,
        message: "Order repeated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const orderId = req.params.id as string;

      const result = await pwaCustomerService.cancelOrder(customerId, orderId);

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

  // --- Trust Score ---
  async getTrustScore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id as string;
      const result = await pwaCustomerService.getTrustScore(customerId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
