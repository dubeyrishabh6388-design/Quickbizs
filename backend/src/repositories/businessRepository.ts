import { prisma } from "../config/prisma";

export class BusinessRepository {
  async findById(id: string) {
    return prisma.business.findFirst({
      where: { id, isDeleted: false },
    });
  }

  async findByPhone(phone: string) {
    return prisma.business.findFirst({
      where: { phone, isDeleted: false },
    });
  }

  async create(data: {
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
    return prisma.business.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        ownerName: data.ownerName,
        gstNumber: data.gstNumber,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        businessType: data.businessType,
        openingHours: data.openingHours,
        logo: data.logo,
      },
    });
  }

  async update(
    id: string,
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
    return prisma.business.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.business.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
