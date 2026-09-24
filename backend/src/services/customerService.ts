import { CustomerRepository } from "../repositories/customerRepository";
import { prisma } from "../config/prisma";

const customerRepository = new CustomerRepository();

export class CustomerService {
  async getCustomers(params: {
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

    const [customers, total] = await Promise.all([
      customerRepository.findMany({
        businessId: params.businessId,
        search: params.search,
        city: params.city,
        skip,
        take,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }),
      customerRepository.count({
        businessId: params.businessId,
        search: params.search,
        city: params.city,
      }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getCustomerById(businessId: string, id: string) {
    const customer = await customerRepository.findById(businessId, id);
    if (!customer) {
      const err: any = new Error("Customer profile not found.");
      err.statusCode = 404;
      err.problem = "Search index query failed.";
      err.reason = "No customer details match the requested identifier.";
      err.solution = "Please double check the ID or verify profile search keys.";
      throw err;
    }
    return customer;
  }

  async getOutstanding(businessId: string) {
    return customerRepository.findOutstanding(businessId);
  }

  async getTopCustomers(businessId: string, limit: number = 5) {
    return customerRepository.findTopCustomers(businessId, limit);
  }

  async createCustomer(
    businessId: string,
    data: {
      name: string;
      mobile: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      pinCode?: string;
      gstNumber?: string;
      creditLimit?: number;
      pendingAmount?: number;
      createdBy?: string;
    }
  ) {
    // 1. Validation (Step 8: Validation)
    if (!data.name || !data.mobile) {
      const err: any = new Error("Customer name and mobile phone are mandatory.");
      err.statusCode = 400;
      throw err;
    }

    // Check SaaS plan limit validation
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (business) {
      const currentCustomersCount = await prisma.customer.count({
        where: { businessId, isDeleted: false },
      });
      if (currentCustomersCount >= business.maxCustomers) {
        const err: any = new Error("Subscription limit reached.");
        err.statusCode = 400;
        err.problem = "SaaS Limit Validation Failed.";
        err.reason = `Your business has reached the maximum allowed limit of ${business.maxCustomers} customers under the ${business.plan} plan.`;
        err.solution = "Please upgrade your subscription to unlock additional customer profiles.";
        throw err;
      }
    }

    // Duplicate mobile validation (Step 6 & 8)
    const cleanMobile = data.mobile.replace(/\s+/g, "");
    const existing = await customerRepository.findByMobile(businessId, cleanMobile);
    if (existing) {
      const err: any = new Error(`Customer mobile number "${data.mobile}" already exists.`);
      err.statusCode = 400;
      err.problem = "Duplicate phone check failed.";
      err.reason = "A customer profile is already registered with this mobile number.";
      err.solution = "Please use a unique mobile number or update the existing profile.";
      throw err;
    }

    // Email format validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        const err: any = new Error("Invalid email address format.");
        err.statusCode = 400;
        throw err;
      }
    }

    // Auto-generate customer code (Step 6)
    const latest = await customerRepository.findLatestCustomerCode(businessId);
    let nextNum = 1;
    if (latest && latest.customerCode.startsWith("CUST-")) {
      const parts = latest.customerCode.split("-");
      const currentNum = parseInt(parts[1], 10);
      if (!isNaN(currentNum)) {
        nextNum = currentNum + 1;
      }
    }
    const customerCode = `CUST-${String(nextNum).padStart(4, "0")}`;

    const customer = await customerRepository.create(businessId, {
      ...data,
      mobile: cleanMobile,
      customerCode,
      pendingAmount: data.pendingAmount || 0,
      creditLimit: data.creditLimit || 10000,
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "Customer Registration",
        module: "Customers",
        reason: `Registered customer "${customer.name}" with code ${customer.customerCode}`,
        status: "Success",
      },
    });

    return customer;
  }

  async updateCustomer(
    businessId: string,
    id: string,
    data: {
      name?: string;
      mobile?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      pinCode?: string;
      gstNumber?: string;
      creditLimit?: number;
      pendingAmount?: number;
      rewardPoints?: number;
      lastPurchaseAt?: Date;
      updatedBy?: string;
    }
  ) {
    const existing = await customerRepository.findById(businessId, id);
    if (!existing) {
      const err: any = new Error("Customer profile not found.");
      err.statusCode = 404;
      throw err;
    }

    // Validate mobile uniqueness if changed
    if (data.mobile && data.mobile.replace(/\s+/g, "") !== existing.mobile) {
      const cleanMobile = data.mobile.replace(/\s+/g, "");
      const duplicate = await customerRepository.findByMobile(businessId, cleanMobile);
      if (duplicate) {
        const err: any = new Error("Mobile number matches an existing customer profile.");
        err.statusCode = 400;
        throw err;
      }
      data.mobile = cleanMobile;
    }

    await customerRepository.update(businessId, id, data);
    const updated = await customerRepository.findById(businessId, id);

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "Customer Profile Update",
        module: "Customers",
        reason: `Modified details for customer "${updated?.name}" (${updated?.customerCode})`,
        status: "Success",
      },
    });

    return updated;
  }

  async deleteCustomer(businessId: string, id: string) {
    const existing = await customerRepository.findById(businessId, id);
    if (!existing) {
      const err: any = new Error("Customer profile not found.");
      err.statusCode = 404;
      throw err;
    }

    await customerRepository.delete(businessId, id);

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        businessId,
        action: "Customer Account Archival",
        module: "Customers",
        reason: `Archived customer profile "${existing.name}" (${existing.customerCode})`,
        status: "Success",
      },
    });

    return { success: true, message: "Customer profile archived successfully." };
  }

  // Automate purchase triggers (Step 9)
  async recordPurchase(
    businessId: string,
    id: string,
    totalAmount: number,
    isCredit: boolean
  ) {
    const customer = await customerRepository.findById(businessId, id);
    if (!customer) return null;

    const pendingAmount = isCredit ? customer.pendingAmount + totalAmount : customer.pendingAmount;
    
    // Reward points auto-update: 1 point for every ₹100 spent (Step 6 & 9)
    const pointsEarned = Math.floor(totalAmount / 100);
    const rewardPoints = customer.rewardPoints + pointsEarned;

    return this.updateCustomer(businessId, id, {
      pendingAmount,
      rewardPoints,
      lastPurchaseAt: new Date() as any, // Cast for update
    });
  }
}
