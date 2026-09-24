import { Response, NextFunction } from "express";
import { CustomerService } from "../services/customerService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { notificationService } from "../services/notificationService";

const customerService = new CustomerService();

export class CustomerController {
  async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { search, city, page, limit, sortBy, sortOrder } = req.query;

      const result = await customerService.getCustomers({
        businessId,
        search: search ? String(search) : undefined,
        city: city ? String(city) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50,
        sortBy: sortBy ? String(sortBy) : undefined,
        sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
      });

      res.json({
        success: true,
        message: "Customer records ledger retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await customerService.getCustomerById(businessId, id as string);

      res.json({
        success: true,
        message: "Customer profile details retrieved successfully.",
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
      const result = await customerService.getOutstanding(businessId);

      res.json({
        success: true,
        message: "Outstanding dues ledger retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { limit } = req.query;
      const parsedLimit = limit ? parseInt(String(limit), 10) : 5;

      const result = await customerService.getTopCustomers(businessId, parsedLimit);

      res.json({
        success: true,
        message: "Top rewards customer ledger retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { name, mobile, email, address, city, state, pinCode, gstNumber, creditLimit, pendingAmount } = req.body;

      if (!name || !mobile) {
        const err: any = new Error("Required customer parameters missing.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Customer name and mobile phone are mandatory parameters.";
        err.solution = "Please fill in the name and phone fields.";
        throw err;
      }

      const parsedCreditLimit = creditLimit !== undefined ? parseFloat(creditLimit) : 10000;
      if (parsedCreditLimit < 0) {
        const err: any = new Error("Credit limit cannot be a negative value.");
        err.statusCode = 400;
        throw err;
      }

      const result = await customerService.createCustomer(businessId, {
        name,
        mobile,
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pinCode: pinCode || undefined,
        gstNumber: gstNumber || undefined,
        creditLimit: parsedCreditLimit,
        pendingAmount: pendingAmount !== undefined ? parseFloat(pendingAmount) : 0,
        createdBy: req.user!.email,
      });

      // Trigger "New Customer" Notification
      await notificationService.createNotification({
        businessId,
        title: "New Customer",
        message: `Customer ${name} (${mobile}) has been registered.`,
        type: "Success",
        priority: "Low",
        module: "Customers",
        referenceType: "Customer",
        referenceId: result.id,
      });

      res.status(201).json({
        success: true,
        message: "Customer profile registered successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await customerService.updateCustomer(businessId, id as string, {
        ...req.body,
        updatedBy: req.user!.email,
      });

      res.json({
        success: true,
        message: "Customer profile details updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await customerService.deleteCustomer(businessId, id as string);

      res.json({
        success: true,
        message: "Customer profile soft deleted successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
