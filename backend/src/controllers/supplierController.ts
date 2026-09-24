import { Response, NextFunction } from "express";
import { SupplierService } from "../services/supplierService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { notificationService } from "../services/notificationService";

const supplierService = new SupplierService();

export class SupplierController {
  async getSuppliers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { search, city, page, limit, sortBy, sortOrder } = req.query;

      const result = await supplierService.getSuppliers({
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
        message: "Supplier records ledger retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getSupplierById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await supplierService.getSupplierById(businessId, id as string);

      res.json({
        success: true,
        message: "Supplier profile details retrieved successfully.",
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
      const result = await supplierService.getOutstanding(businessId);

      res.json({
        success: true,
        message: "Outstanding payables ledger retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopSuppliers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { limit } = req.query;
      const parsedLimit = limit ? parseInt(String(limit), 10) : 5;

      const result = await supplierService.getTopSuppliers(businessId, parsedLimit);

      res.json({
        success: true,
        message: "Top payables supplier ledger retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createSupplier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { companyName, contactPerson, mobile, email, gstNumber, panNumber, address, city, state, pinCode, paymentTerms, creditLimit, outstandingAmount, notes } = req.body;

      if (!companyName || !contactPerson || !mobile) {
        const err: any = new Error("Required supplier parameters missing.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Company name, contact person, and mobile phone are mandatory parameters.";
        err.solution = "Please fill in the name, contact, and phone fields.";
        throw err;
      }

      const parsedCreditLimit = creditLimit !== undefined ? parseFloat(creditLimit) : 100000;
      if (parsedCreditLimit < 0) {
        const err: any = new Error("Credit limit cannot be a negative value.");
        err.statusCode = 400;
        throw err;
      }

      const result = await supplierService.createSupplier(businessId, {
        companyName,
        contactPerson,
        mobile,
        email: email || undefined,
        gstNumber: gstNumber || undefined,
        panNumber: panNumber || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pinCode: pinCode || undefined,
        paymentTerms: paymentTerms || undefined,
        creditLimit: parsedCreditLimit,
        outstandingAmount: outstandingAmount !== undefined ? parseFloat(outstandingAmount) : 0,
        notes: notes || undefined,
        createdBy: req.user!.email,
      });

      // Trigger "New Supplier" Notification
      await notificationService.createNotification({
        businessId,
        title: "New Supplier",
        message: `Supplier ${companyName} (${contactPerson}) has been registered.`,
        type: "Success",
        priority: "Low",
        module: "Suppliers",
        referenceType: "Supplier",
        referenceId: result.id,
      });

      res.status(201).json({
        success: true,
        message: "Supplier profile registered successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await supplierService.updateSupplier(businessId, id as string, {
        ...req.body,
        updatedBy: req.user!.email,
      });

      res.json({
        success: true,
        message: "Supplier profile details updated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSupplier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await supplierService.deleteSupplier(businessId, id as string);

      res.json({
        success: true,
        message: "Supplier profile soft deleted successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
