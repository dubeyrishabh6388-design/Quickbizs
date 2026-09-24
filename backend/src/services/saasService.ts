import { prisma } from "../config/prisma";

export class SaasService {
  async getTenants() {
    return prisma.business.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async updateTenantStatus(id: string, status: "Active" | "Suspended") {
    const updated = await prisma.business.update({
      where: { id },
      data: { status },
    });
    return updated;
  }

  async getSubscriptions() {
    return prisma.business.findMany({
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        maxUsers: true,
        maxProducts: true,
        maxCustomers: true,
        subscriptionExpiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateSubscription(
    id: string,
    data: {
      plan: string;
      maxUsers?: number;
      maxProducts?: number;
      maxCustomers?: number;
      subscriptionExpiresAt?: string | null;
    }
  ) {
    const updated = await prisma.business.update({
      where: { id },
      data: {
        plan: data.plan,
        maxUsers: data.maxUsers !== undefined ? data.maxUsers : undefined,
        maxProducts: data.maxProducts !== undefined ? data.maxProducts : undefined,
        maxCustomers: data.maxCustomers !== undefined ? data.maxCustomers : undefined,
        subscriptionExpiresAt: data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null,
      },
    });
    return updated;
  }
}
