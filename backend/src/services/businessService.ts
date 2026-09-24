import { BusinessRepository } from "../repositories/businessRepository";
import { prisma } from "../config/prisma";

const businessRepository = new BusinessRepository();

export class BusinessService {
  async getNearbyShops(lat: number, lng: number, radiusMeters: number = 5000) {
    const latDelta = radiusMeters / 111000;
    const lngDelta = radiusMeters / (111000 * Math.cos(lat * Math.PI / 180));

    return prisma.business.findMany({
      where: {
        isDeleted: false,
        isOpen: true,
        pickupAvailability: true,
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        logo: true,
        address: true,
        latitude: true,
        longitude: true,
        businessType: true,
        openingHours: true,
      },
    });
  }

  private validatePhone(phone?: string) {
    if (phone && !phone.match(/^\+?[1-9]\d{1,14}$/)) {
      const err: any = new Error("Invalid phone number format.");
      err.statusCode = 400;
      err.problem = "Validation failed.";
      err.reason = "Phone must match E.164 standard formatting.";
      err.solution = "Please check the phone entry and try again.";
      throw err;
    }
  }

  private validateEmail(email?: string) {
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      const err: any = new Error("Invalid email address format.");
      err.statusCode = 400;
      err.problem = "Validation failed.";
      err.reason = "Email entry does not match pattern guidelines.";
      throw err;
    }
  }

  private validateGst(gst?: string) {
    if (gst && !gst.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)) {
      const err: any = new Error("Invalid GSTIN format.");
      err.statusCode = 400;
      err.problem = "Validation failed.";
      err.reason = "GSTIN must be a valid 15-character alphanumeric Indian Tax ID.";
      err.solution = "Please confirm your 15-digit GST details.";
      throw err;
    }
  }

  async createBusiness(data: {
    name: string;
    phone?: string;
    email?: string;
    ownerName?: string;
    gstNumber?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    businessType?: string;
    openingHours?: string;
    logo?: string;
  }) {
    if (!data.name) {
      const err: any = new Error("Business name is required.");
      err.statusCode = 400;
      throw err;
    }

    this.validatePhone(data.phone);
    this.validateEmail(data.email);
    this.validateGst(data.gstNumber);

    if (data.phone) {
      const existing = await businessRepository.findByPhone(data.phone);
      if (existing) {
        const err: any = new Error("A business with this phone number is already registered.");
        err.statusCode = 409;
        err.problem = "Duplicate entry check failed.";
        err.reason = "Only one store can be mapped to a phone number.";
        throw err;
      }
    }

    return businessRepository.create(data);
  }

  async getBusinessById(id: string) {
    const business = await businessRepository.findById(id);
    if (!business) {
      const err: any = new Error("Business profile not found.");
      err.statusCode = 404;
      throw err;
    }
    return business;
  }

  async updateBusiness(
    id: string,
    requestingUser: { tenantId: string; role: string },
    data: {
      name?: string;
      phone?: string;
      email?: string;
      ownerName?: string;
      gstNumber?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      businessType?: string;
      openingHours?: string;
      logo?: string;
      pickupAvailability?: boolean;
      isOpen?: boolean;
      pickupEnabled?: boolean;
      pickupTimeSlots?: string;
      maxActiveOrders?: number;
      orderPrepTime?: number;
      notificationPreferences?: string;
      status?: string;
    }
  ) {
    // Owner Authorization Check (Step 4: Security)
    if (requestingUser.tenantId !== id) {
      const err: any = new Error("Access Denied: You cannot update profiles outside your business tenant.");
      err.statusCode = 403;
      throw err;
    }

    if (requestingUser.role !== "Owner" && requestingUser.role !== "SuperAdmin") {
      const err: any = new Error("Access Denied: Only business Owners have keys to update this profile.");
      err.statusCode = 403;
      throw err;
    }

    const business = await this.getBusinessById(id);

    this.validatePhone(data.phone);
    this.validateEmail(data.email);
    this.validateGst(data.gstNumber);

    if (data.phone && data.phone !== business.phone) {
      const existing = await businessRepository.findByPhone(data.phone);
      if (existing) {
        const err: any = new Error("This phone number is already registered by another business.");
        err.statusCode = 409;
        throw err;
      }
    }

    return businessRepository.update(id, data);
  }

  async deleteBusiness(id: string, requestingUser: { tenantId: string; role: string }) {
    if (requestingUser.tenantId !== id) {
      const err: any = new Error("Access Denied: You cannot delete templates outside your business tenant.");
      err.statusCode = 403;
      throw err;
    }

    if (requestingUser.role !== "Owner" && requestingUser.role !== "SuperAdmin") {
      const err: any = new Error("Access Denied: Only business Owners can delete this profile.");
      err.statusCode = 403;
      throw err;
    }

    await this.getBusinessById(id);
    return businessRepository.delete(id);
  }
}
