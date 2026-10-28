import { prisma } from "../config/prisma";
import { encryptDbField, decryptDbField } from "../utils/dbEncryption";

export function decryptPwaCustomer<T extends Record<string, any> | null | undefined>(cust: T): T {
  if (!cust) return cust;
  return {
    ...cust,
    name: cust.name ? (decryptDbField(cust.name) as string) : cust.name,
    phone: cust.phone ? (decryptDbField(cust.phone) as string) : cust.phone,
    email: cust.email ? (decryptDbField(cust.email) as string) : cust.email,
  };
}

export class PwaCustomerRepository {
  async findByPhone(phone: string) {
    const encPhone = encryptDbField(phone) || phone;
    const cust = await prisma.pwaCustomer.findFirst({
      where: {
        isDeleted: false,
        OR: [{ phone }, { phone: encPhone }],
      },
      include: { trustScore: true, addresses: true },
    });
    return decryptPwaCustomer(cust);
  }

  async findById(id: string) {
    const cust = await prisma.pwaCustomer.findFirst({
      where: { id, isDeleted: false },
      include: { trustScore: true, addresses: true },
    });
    return decryptPwaCustomer(cust);
  }

  async findByEmail(email: string) {
    const encEmail = encryptDbField(email) || email;
    const cust = await prisma.pwaCustomer.findFirst({
      where: {
        isDeleted: false,
        OR: [{ email }, { email: encEmail }],
      },
      include: { trustScore: true, addresses: true },
    });
    return decryptPwaCustomer(cust);
  }

  async create(data: { name: string; phone: string; email?: string; passwordHash?: string }) {
    const encData = {
      name: encryptDbField(data.name) || data.name,
      phone: encryptDbField(data.phone) || data.phone,
      email: data.email ? encryptDbField(data.email) : data.email,
      passwordHash: data.passwordHash,
    };
    const created = await prisma.pwaCustomer.create({
      data: {
        ...encData,
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
    return decryptPwaCustomer(created);
  }

  async update(id: string, data: any) {
    const encData = { ...data };
    if (encData.name) encData.name = encryptDbField(encData.name);
    if (encData.phone) encData.phone = encryptDbField(encData.phone);
    if (encData.email) encData.email = encryptDbField(encData.email);

    const updated = await prisma.pwaCustomer.update({
      where: { id },
      data: encData,
      include: { trustScore: true },
    });
    return decryptPwaCustomer(updated);
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
