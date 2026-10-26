import { businessCategoryService } from "../services/businessCategoryService";
import { Response, NextFunction } from "express";
import { SaasService } from "../services/saasService";
import { AuthenticatedRequest } from "../middlewares/auth";

const saasService = new SaasService();

export class SaasController {
  async getTenants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const result = await saasService.getTenants();
      res.json({
        success: true,
        message: "Tenants list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTenantStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const { status } = req.body;

      const result = await saasService.updateTenantStatus(id as string, status);
      res.json({
        success: true,
        message: `Tenant status changed to ${status}.`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const result = await saasService.getSubscriptions();
      res.json({
        success: true,
        message: "Active subscriptions list retrieved.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const result = await saasService.updateSubscription(id as string, req.body);

      res.json({
        success: true,
        message: "Subscription parameters updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { search, role, status } = req.query;
      const users = await saasService.getAllUsers({
        search: search as string,
        role: role as string,
        status: status as string,
      });

      res.json({
        success: true,
        message: "Cross-tenant users retrieved successfully.",
        data: users,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const { isActive } = req.body;

      const user = await saasService.updateUserStatus(id as string, Boolean(isActive));
      res.json({
        success: true,
        message: `User status changed to ${isActive ? "Active" : "Suspended"}.`,
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ success: false, message: "Role parameter is required." });
      }

      const result = await saasService.updateUserRole(id as string, role as string);
      res.json({
        success: true,
        message: `User role updated to ${role}.`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const { newPassword } = req.body;

      const result = await saasService.resetUserPassword(id as string, newPassword);
      res.json({
        success: true,
        message: "User password reset successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const result = await saasService.deleteUser(id as string);
      res.json({
        success: true,
        message: "User deleted successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
  async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { search, businessType, businessId } = req.query;
      const categories = await saasService.getAllCategories({
        search: search as string,
        businessType: (businessType || businessId) as string,
      });

      res.json({
        success: true,
        message: "Categories list retrieved successfully.",
        data: categories,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { name, businessType, businessId, isGlobal } = req.body;
      const result = await saasService.createAdminCategory({
        name,
        businessType: businessType || businessId,
        isGlobal: Boolean(isGlobal),
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const { name } = req.body;

      const result = await saasService.updateAdminCategory(id as string, name as string);
      res.json({
        success: true,
        message: "Category updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const result = await saasService.deleteAdminCategory(id as string);

      res.json({
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async changeAdminPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      const result = await saasService.changeAdminPassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
  async getBusinessCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { search } = req.query;
      const result = await businessCategoryService.getAllCategories(search as string);

      res.json({
        success: true,
        message: "Business categories retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async addBusinessCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { label, desc, icon, defaultCategories } = req.body;
      const result = await businessCategoryService.addCategory({
        label,
        desc,
        icon,
        defaultCategories,
      });

      res.status(201).json({
        success: true,
        message: `Business Category "${result.label}" added successfully.`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBusinessCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const result = await businessCategoryService.updateCategory(id as string, req.body);

      res.json({
        success: true,
        message: `Business Category "${result.label}" updated successfully.`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBusinessCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== "SuperAdmin") {
        return res.status(403).json({ success: false, message: "Super Admin privileges required." });
      }

      const { id } = req.params;
      const result = await businessCategoryService.deleteCategory(id as string);

      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
