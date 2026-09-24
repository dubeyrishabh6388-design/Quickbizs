import { Request, Response, NextFunction } from "express";
import { BusinessService } from "../services/businessService";
import { AuthenticatedRequest } from "../middlewares/auth";

const businessService = new BusinessService();

export class BusinessController {
  async getNearby(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng) {
        const err: any = new Error("Latitude and longitude coordinates are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await businessService.getNearbyShops(
        parseFloat(String(lat)),
        parseFloat(String(lng)),
        radius ? parseInt(String(radius), 10) : undefined
      );

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        phone,
        email,
        ownerName,
        gstNumber,
        address,
        latitude,
        longitude,
        businessType,
        openingHours,
        logo,
      } = req.body;

      const business = await businessService.createBusiness({
        name,
        phone,
        email,
        ownerName,
        gstNumber,
        address,
        latitude,
        longitude,
        businessType,
        openingHours,
        logo,
      });

      res.status(201).json({
        success: true,
        message: "Business registered successfully.",
        data: business,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const business = await businessService.getBusinessById(id);

      res.status(200).json({
        success: true,
        data: business,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!req.user) {
        const err: any = new Error("Unauthenticated.");
        err.statusCode = 401;
        throw err;
      }

      const {
        name,
        phone,
        email,
        ownerName,
        gstNumber,
        address,
        latitude,
        longitude,
        businessType,
        openingHours,
        logo,
      } = req.body;

      const business = await businessService.updateBusiness(
        id,
        { tenantId: req.user.tenantId as string, role: req.user.role as string },
        {
          name,
          phone,
          email,
          ownerName,
          gstNumber,
          address,
          latitude,
          longitude,
          businessType,
          openingHours,
          logo,
        }
      );

      res.status(200).json({
        success: true,
        message: "Business profile updated successfully.",
        data: business,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!req.user) {
        const err: any = new Error("Unauthenticated.");
        err.statusCode = 401;
        throw err;
      }

      await businessService.deleteBusiness(id, {
        tenantId: req.user.tenantId as string,
        role: req.user.role as string,
      });

      res.status(200).json({
        success: true,
        message: "Business profile deleted successfully (soft delete).",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!req.user) {
        const err: any = new Error("Unauthenticated.");
        err.statusCode = 401;
        throw err;
      }

      const {
        pickupAvailability,
        isOpen,
        pickupEnabled,
        pickupTimeSlots,
        maxActiveOrders,
        orderPrepTime,
        notificationPreferences,
      } = req.body;

      const business = await businessService.updateBusiness(
        id,
        { tenantId: req.user.tenantId as string, role: req.user.role as string },
        {
          pickupAvailability,
          isOpen,
          pickupEnabled,
          pickupTimeSlots,
          maxActiveOrders,
          orderPrepTime,
          notificationPreferences,
        }
      );

      res.status(200).json({
        success: true,
        message: "Business settings updated successfully.",
        data: business,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!req.user) {
        const err: any = new Error("Unauthenticated.");
        err.statusCode = 401;
        throw err;
      }

      const { isOpen, pickupAvailability } = req.body;

      const business = await businessService.updateBusiness(
        id,
        { tenantId: req.user.tenantId as string, role: req.user.role as string },
        {
          isOpen,
          pickupAvailability,
        }
      );

      res.status(200).json({
        success: true,
        message: "Business open/close status updated successfully.",
        data: business,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
