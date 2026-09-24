import { SupplierRepository } from "../repositories/supplierRepository";
import { prisma } from "../config/prisma";

const supplierRepository = new SupplierRepository();

export class SupplierService {
  async getSuppliers(params: {
    businessId: string;
    search?: string;
    city?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [suppliers, total] = await Promise.all([
      supplierRepository.findMany({
        businessId: params.businessId,
        search: params.search,
        city: params.city,
        skip,
        take,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }),
      supplierRepository.count({
        businessId: params.businessId,
        search: params.search,
        city: params.city,
      }),
    ]);

    return {
      suppliers,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getSupplierById(businessId: string, id: string) {
    const supplier = await supplierRepository.findById(businessId, id);
    if (!supplier) {
      const err: any = new Error("Supplier record not found.");
      err.statusCode = 404;
      err.problem = "Search index query failed.";
      err.reason = "No supplier details match the requested identifier.";
      err.solution = "Please double check the ID or verify profile search keys.";
      throw err;
    }
    return supplier;
  }

  async getOutstanding(businessId: string) {
    return supplierRepository.findOutstanding(businessId);
  }

  async getTopSuppliers(businessId: string, limit: number = 5) {
    return supplierRepository.findTopSuppliers(businessId, limit);
  }

  async createSupplier(
    businessId: string,
    data: {
      companyName: string;
      contactPerson: string;
      mobile: string;
      email?: string;
      gstNumber?: string;
      panNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      pinCode?: string;
      paymentTerms?: string;
      creditLimit?: number;
      outstandingAmount?: number;
      notes?: string;
      createdBy?: string;
    }
  ) {
    // 1. Validation (Step 8)
    if (!data.companyName || !data.contactPerson || !data.mobile) {
      const err: any = new Error("Company name, contact person and mobile phone are mandatory.");
      err.statusCode = 400;
      throw err;
    }

    // Duplicate GST validation (Step 6 & 8)
    if (data.gstNumber) {
      const existingGst = await supplierRepository.findByGst(businessId, data.gstNumber);
      if (existingGst) {
        const err: any = new Error(`Supplier with GST number "${data.gstNumber}" is already registered.`);
        err.statusCode = 400;
        err.problem = "Duplicate GST registration blocked.";
        err.reason = "GST numbers must be unique across all active business suppliers.";
        err.solution = "Please assign a unique GST number or inspect existing records.";
        throw err;
      }
    }

    // Duplicate Mobile warning (Step 6)
    const cleanMobile = data.mobile.replace(/\s+/g, "");
    const existingMobile = await supplierRepository.findByMobile(businessId, cleanMobile);
    if (existingMobile) {
      await prisma.auditLog.create({
        data: {
          businessId,
          action: "SUPPLIER_DUPLICATE_MOBILE_WARNING",
          module: "Supplier",
          status: "Warning",
          reason: `Duplicate mobile "${data.mobile}" detected for company "${data.companyName}"`,
        },
      });
    }

    // Email format checks
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        const err: any = new Error("Invalid email address format.");
        err.statusCode = 400;
        throw err;
      }
    }

    // Auto-generate supplier code (Step 6)
    const latest = await supplierRepository.findLatestSupplierCode(businessId);
    let nextNum = 1;
    if (latest && latest.supplierCode.startsWith("SUP-")) {
      const parts = latest.supplierCode.split("-");
      const currentNum = parseInt(parts[1], 10);
      if (!isNaN(currentNum)) {
        nextNum = currentNum + 1;
      }
    }
    const supplierCode = `SUP-${String(nextNum).padStart(4, "0")}`;

    const supplier = await supplierRepository.create(businessId, {
      ...data,
      mobile: cleanMobile,
      supplierCode,
      outstandingAmount: data.outstandingAmount || 0,
      creditLimit: data.creditLimit || 100000,
    });

    // Create Audit Log (Step 9)
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "SUPPLIER_ONBOARDED",
        module: "Supplier",
        status: "Success",
        reason: `Onboarded supplier "${supplier.companyName}" with code ${supplier.supplierCode}`,
      },
    });

    return supplier;
  }

  async updateSupplier(
    businessId: string,
    id: string,
    data: {
      companyName?: string;
      contactPerson?: string;
      mobile?: string;
      email?: string;
      gstNumber?: string;
      panNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      pinCode?: string;
      paymentTerms?: string;
      creditLimit?: number;
      outstandingAmount?: number;
      lastPurchaseDate?: Date;
      notes?: string;
      updatedBy?: string;
    }
  ) {
    const existing = await supplierRepository.findById(businessId, id);
    if (!existing) {
      const err: any = new Error("Supplier record not found.");
      err.statusCode = 404;
      throw err;
    }

    // Validate GST uniqueness if changed
    if (data.gstNumber && data.gstNumber !== existing.gstNumber) {
      const duplicate = await supplierRepository.findByGst(businessId, data.gstNumber);
      if (duplicate) {
        const err: any = new Error("GST number matches an existing supplier profile.");
        err.statusCode = 400;
        throw err;
      }
    }

    await supplierRepository.update(businessId, id, data);
    const updated = await supplierRepository.findById(businessId, id);

    // Create Audit Log (Step 9)
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "SUPPLIER_UPDATED",
        module: "Supplier",
        status: "Success",
        reason: `Modified details for supplier "${updated?.companyName}" (${updated?.supplierCode})`,
      },
    });

    return updated;
  }

  async deleteSupplier(businessId: string, id: string) {
    const existing = await supplierRepository.findById(businessId, id);
    if (!existing) {
      const err: any = new Error("Supplier record not found.");
      err.statusCode = 404;
      throw err;
    }

    await supplierRepository.delete(businessId, id);

    // Create Audit Log (Step 9)
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "SUPPLIER_ARCHIVED",
        module: "Supplier",
        status: "Success",
        reason: `Archived supplier profile "${existing.companyName}" (${existing.supplierCode})`,
      },
    });

    return { success: true, message: "Supplier profile archived successfully." };
  }
}
