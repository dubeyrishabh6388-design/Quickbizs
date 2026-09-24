import { PwaCustomerRepository } from "../repositories/pwaCustomerRepository";
import { prisma } from "../config/prisma";
import { InventoryService } from "./inventoryService";

const pwaCustomerRepository = new PwaCustomerRepository();
const inventoryService = new InventoryService();

export class PwaCustomerService {
  async getProfile(customerId: string) {
    const customer = await pwaCustomerRepository.findById(customerId);
    if (!customer) {
      const err: any = new Error("PWA Customer profile not found.");
      err.statusCode = 404;
      throw err;
    }
    return customer;
  }

  async updateProfile(
    customerId: string,
    data: {
      name?: string;
      email?: string;
      profilePhoto?: string;
      dob?: string;
      preferredLanguage?: string;
    }
  ) {
    const existing = await pwaCustomerRepository.findById(customerId);
    if (!existing) {
      const err: any = new Error("PWA Customer profile not found.");
      err.statusCode = 404;
      throw err;
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        const err: any = new Error("Customer name cannot be empty.");
        err.statusCode = 400;
        throw err;
      }
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          const err: any = new Error("Invalid email format.");
          err.statusCode = 400;
          throw err;
        }
      }
      updateData.email = data.email || null;
    }

    if (data.profilePhoto !== undefined) {
      updateData.profilePhoto = data.profilePhoto;
    }

    if (data.dob !== undefined) {
      if (data.dob) {
        const parsedDob = new Date(data.dob);
        if (isNaN(parsedDob.getTime())) {
          const err: any = new Error("Invalid date of birth format.");
          err.statusCode = 400;
          throw err;
        }
        updateData.dob = parsedDob;
      } else {
        updateData.dob = null;
      }
    }

    if (data.preferredLanguage !== undefined) {
      updateData.preferredLanguage = data.preferredLanguage || "en";
    }

    return pwaCustomerRepository.update(customerId, updateData);
  }

  async deleteProfile(customerId: string) {
    const existing = await pwaCustomerRepository.findById(customerId);
    if (!existing) {
      const err: any = new Error("PWA Customer profile not found.");
      err.statusCode = 404;
      throw err;
    }
    return pwaCustomerRepository.delete(customerId);
  }

  // --- Address Management ---
  async getAddresses(customerId: string) {
    return pwaCustomerRepository.findAddresses(customerId);
  }

  async createAddress(
    customerId: string,
    data: {
      addressType: string;
      addressLine1: string;
      addressLine2?: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }
  ) {
    if (!data.addressType || !data.addressLine1 || !data.city || !data.state || !data.pincode) {
      const err: any = new Error("Mandatory address fields missing.");
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.pwaCustomerAddress.updateMany({
          where: { customerId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.pwaCustomerAddress.create({
        data: {
          customerId,
          addressType: data.addressType,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: data.isDefault || false,
        },
      });
    });
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    data: {
      addressType?: string;
      addressLine1?: string;
      addressLine2?: string;
      landmark?: string;
      city?: string;
      state?: string;
      pincode?: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }
  ) {
    const existing = await pwaCustomerRepository.findAddressById(addressId);
    if (!existing || existing.customerId !== customerId) {
      const err: any = new Error("Address not found.");
      err.statusCode = 404;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.pwaCustomerAddress.updateMany({
          where: { customerId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.pwaCustomerAddress.update({
        where: { id: addressId },
        data,
      });
    });
  }

  async deleteAddress(customerId: string, addressId: string) {
    const existing = await pwaCustomerRepository.findAddressById(addressId);
    if (!existing || existing.customerId !== customerId) {
      const err: any = new Error("Address not found.");
      err.statusCode = 404;
      throw err;
    }
    return pwaCustomerRepository.deleteAddress(addressId);
  }

  async setDefaultAddress(customerId: string, addressId: string) {
    const existing = await pwaCustomerRepository.findAddressById(addressId);
    if (!existing || existing.customerId !== customerId) {
      const err: any = new Error("Address not found.");
      err.statusCode = 404;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      await tx.pwaCustomerAddress.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.pwaCustomerAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  }

  // --- Favourite Shops ---
  async getFavouriteShops(customerId: string) {
    return pwaCustomerRepository.findFavouriteShops(customerId);
  }

  async addFavouriteShop(customerId: string, businessId: string) {
    const shop = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!shop || shop.isDeleted) {
      const err: any = new Error("Shop does not exist.");
      err.statusCode = 400;
      throw err;
    }

    const existing = await pwaCustomerRepository.findFavouriteShop(customerId, businessId);
    if (existing) {
      return existing;
    }

    return pwaCustomerRepository.addFavouriteShop(customerId, businessId);
  }

  async removeFavouriteShop(customerId: string, businessId: string) {
    const existing = await pwaCustomerRepository.findFavouriteShop(customerId, businessId);
    if (!existing) {
      const err: any = new Error("Shop not in favourites list.");
      err.statusCode = 400;
      throw err;
    }
    return pwaCustomerRepository.removeFavouriteShop(customerId, businessId);
  }

  // --- Order History ---
  async getOrders(customerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [orders, total] = await Promise.all([
      prisma.pickupOrder.findMany({
        where: { customerId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { items: true, business: true },
      }),
      prisma.pickupOrder.count({
        where: { customerId },
      }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderDetails(customerId: string, orderId: string) {
    const order = await prisma.pickupOrder.findFirst({
      where: { id: orderId, customerId },
      include: { items: true, business: true },
    });

    if (!order) {
      const err: any = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    return order;
  }

  async repeatOrder(customerId: string, orderId: string) {
    const order = await prisma.pickupOrder.findFirst({
      where: { id: orderId, customerId },
      include: { items: true },
    });

    if (!order) {
      const err: any = new Error("Original order not found.");
      err.statusCode = 404;
      throw err;
    }

    // Verify customer trust score before permitting active checkout
    const trust = await pwaCustomerRepository.findTrustScore(customerId);
    if (trust && trust.restrictedStatus) {
      const err: any = new Error("Ordering is restricted. Please contact support to resolve trust rating limits.");
      err.statusCode = 403;
      throw err;
    }

    const { PickupOrderService } = require("./pickupOrderService");
    const pickupOrderService = new PickupOrderService();

    // Map scheduled pickup time to 30 mins in future
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + 30);

    return pickupOrderService.createOrder(customerId, {
      businessId: order.businessId,
      items: order.items.map((it: any) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
      scheduledPickupTime: scheduledTime.toISOString(),
      orderNotes: `Repeated order cloned from ${order.orderNumber}`,
      paymentMethod: order.paymentMethod,
    });
  }

  async cancelOrder(customerId: string, orderId: string) {
    const { PickupOrderService } = require("./pickupOrderService");
    const pickupOrderService = new PickupOrderService();
    return pickupOrderService.cancelOrder(customerId, orderId);
  }

  // --- Trust Score ---
  async getTrustScore(customerId: string) {
    const score = await pwaCustomerRepository.findTrustScore(customerId);
    if (!score) {
      const err: any = new Error("Trust score records not found.");
      err.statusCode = 404;
      throw err;
    }
    return score;
  }

  async autoUpdateTrustScore(customerId: string, success: boolean) {
    const trust = await pwaCustomerRepository.findTrustScore(customerId);
    if (!trust) return null;

    let newScore = trust.score;
    if (success) {
      newScore = Math.min(100, trust.score + 5);
    } else {
      // penalty for no-shows or delayed cancel after prepare
      newScore = Math.max(0, trust.score - 15);
    }

    const restrictedStatus = newScore < 50;

    return pwaCustomerRepository.updateTrustScore(customerId, {
      score: newScore,
      restrictedStatus,
    });
  }
}
