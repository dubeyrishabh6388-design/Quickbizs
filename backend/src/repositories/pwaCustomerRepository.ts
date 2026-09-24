import { prisma } from "../config/prisma";

export class PwaCustomerRepository {
  async findByPhone(phone: string) {
    return prisma.pwaCustomer.findFirst({
      where: { phone, isDeleted: false },
      include: { trustScore: true, addresses: true },
    });
  }

  async findById(id: string) {
    return prisma.pwaCustomer.findFirst({
      where: { id, isDeleted: false },
      include: { trustScore: true, addresses: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.pwaCustomer.findFirst({
      where: { email, isDeleted: false },
      include: { trustScore: true, addresses: true },
    });
  }

  async create(data: { name: string; phone: string; email?: string; passwordHash?: string }) {
    return prisma.pwaCustomer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        passwordHash: data.passwordHash,
        trustScore: {
          create: {
            score: 100,
            activeOrdersCount: 0,
            restrictedStatus: false,
          },
        },
      },
      include: { trustScore: true },
    });
  }

  async update(id: string, data: any) {
    return prisma.pwaCustomer.update({
      where: { id },
      data,
      include: { trustScore: true },
    });
  }

  async delete(id: string) {
    return prisma.pwaCustomer.update({
      where: { id },
      data: { isDeleted: true, status: "Deleted" },
    });
  }

  // --- Address Repository Operations ---
  async findAddresses(customerId: string) {
    return prisma.pwaCustomerAddress.findMany({
      where: { customerId },
      orderBy: { isDefault: "desc" },
    });
  }

  async findAddressById(id: string) {
    return prisma.pwaCustomerAddress.findUnique({
      where: { id },
    });
  }

  async unsetDefaultAddresses(customerId: string) {
    return prisma.pwaCustomerAddress.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });
  }

  async createAddress(customerId: string, data: any) {
    return prisma.pwaCustomerAddress.create({
      data: {
        customerId,
        ...data,
      },
    });
  }

  async updateAddress(id: string, data: any) {
    return prisma.pwaCustomerAddress.update({
      where: { id },
      data,
    });
  }

  async deleteAddress(id: string) {
    return prisma.pwaCustomerAddress.delete({
      where: { id },
    });
  }

  // --- Favourite Shops Repository Operations ---
  async findFavouriteShops(customerId: string) {
    return prisma.pwaFavouriteShop.findMany({
      where: { customerId },
      include: { business: true },
    });
  }

  async findFavouriteShop(customerId: string, businessId: string) {
    return prisma.pwaFavouriteShop.findUnique({
      where: {
        customerId_businessId: { customerId, businessId },
      },
    });
  }

  async addFavouriteShop(customerId: string, businessId: string) {
    return prisma.pwaFavouriteShop.create({
      data: {
        customerId,
        businessId,
      },
      include: { business: true },
    });
  }

  async removeFavouriteShop(customerId: string, businessId: string) {
    return prisma.pwaFavouriteShop.delete({
      where: {
        customerId_businessId: { customerId, businessId },
      },
    });
  }

  // --- Trust Score Operations ---
  async findTrustScore(customerId: string) {
    return prisma.pwaCustomerTrustScore.findUnique({
      where: { customerId },
    });
  }

  async updateTrustScore(
    customerId: string,
    data: {
      score?: number;
      activeOrdersCount?: number;
      restrictedStatus?: boolean;
    }
  ) {
    return prisma.pwaCustomerTrustScore.update({
      where: { customerId },
      data,
    });
  }
}
