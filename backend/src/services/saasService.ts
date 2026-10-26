import bcrypt from "bcryptjs";
import crypto from "crypto";
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

  async getAllUsers(query?: { search?: string; role?: string; status?: string }) {
    const where: any = { isDeleted: false };

    if (query?.status) {
      if (query.status === "active") where.isActive = true;
      if (query.status === "suspended") where.isActive = false;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            plan: true,
            status: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let mapped = users.map((u) => {
      const activeRole = u.roles.find((r) => r.role?.name === "SuperAdmin")?.role?.name || u.roles[0]?.role?.name || "Owner";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        isActive: u.isActive,
        businessId: u.businessId,
        businessName: u.business?.name || "Unknown Store",
        businessPlan: u.business?.plan || "Basic",
        role: activeRole,
        createdAt: u.createdAt,
      };
    });

    if (query?.role && query.role !== "ALL") {
      mapped = mapped.filter((u) => u.role.toLowerCase() === query.role!.toLowerCase());
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase();
      mapped = mapped.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q)) ||
          u.businessName.toLowerCase().includes(q)
      );
    }

    return mapped;
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    // If deactivated, revoke active sessions
    if (!isActive) {
      await prisma.session.deleteMany({
        where: { userId },
      });
    }

    return user;
  }

  async updateUserRole(userId: string, newRoleName: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const err: any = new Error("User not found.");
      err.statusCode = 404;
      throw err;
    }

    // Find or create role for this business
    let targetRole = await prisma.role.findFirst({
      where: {
        businessId: user.businessId,
        name: newRoleName,
      },
    });

    if (!targetRole) {
      targetRole = await prisma.role.create({
        data: {
          id: crypto.randomUUID(),
          businessId: user.businessId,
          name: newRoleName,
        },
      });
    }

    // Reassign role
    await prisma.userRole.deleteMany({
      where: { userId },
    });

    await prisma.userRole.create({
      data: {
        userId,
        roleId: targetRole.id,
      },
    });

    return { userId, newRole: newRoleName };
  }

  async resetUserPassword(userId: string, newPlainPassword: string) {
    if (!newPlainPassword || newPlainPassword.length < 6) {
      const err: any = new Error("Password must be at least 6 characters.");
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPlainPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });

    // Invalidate existing sessions so user logs in with new credentials
    await prisma.session.deleteMany({
      where: { userId },
    });

    return { success: true, message: "User password reset successfully." };
  }

  async deleteUser(userId: string) {
    // Soft delete
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.session.deleteMany({
      where: { userId },
    });

    return user;
  }
  async getAllCategories(query?: { search?: string; businessType?: string }) {
    const categories = await prisma.productCategory.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            businessType: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const grouped = new Map();

    for (const c of categories) {
      const bType = c.business?.businessType || "Custom Business";
      const key = `${c.name.trim().toLowerCase()}:::${bType.toLowerCase()}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          id: c.id,
          name: c.name.trim(),
          businessType: bType,
          storeCount: 0,
          productCount: 0,
          categoryIds: [],
          createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
        });
      }

      const item = grouped.get(key);
      item.storeCount++;
      item.productCount += c._count.products;
      item.categoryIds.push(c.id);
    }

    let result = Array.from(grouped.values());

    if (query?.businessType && query.businessType !== "ALL") {
      const targetType = query.businessType.toLowerCase();
      result = result.filter(
        (c) => c.businessType.toLowerCase() === targetType
      );
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.businessType.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async createAdminCategory(data: { name: string; businessType?: string; isGlobal?: boolean }) {
    const catName = data.name.trim();
    if (!catName) {
      const err: any = new Error("Category name is required.");
      err.statusCode = 400;
      throw err;
    }

    let targetBusinesses = [];
    if (data.isGlobal || !data.businessType || data.businessType === "ALL") {
      targetBusinesses = await prisma.business.findMany({
        where: { isDeleted: false },
        select: { id: true, businessType: true }
      });
    } else {
      targetBusinesses = await prisma.business.findMany({
        where: { isDeleted: false, businessType: data.businessType },
        select: { id: true, businessType: true }
      });
    }

    if (targetBusinesses.length === 0) {
      targetBusinesses = await prisma.business.findMany({
        take: 1,
        select: { id: true, businessType: true }
      });
    }

    let addedCount = 0;
    for (const b of targetBusinesses) {
      const existing = await prisma.productCategory.findFirst({
        where: { businessId: b.id, name: catName }
      });
      if (!existing) {
        await prisma.productCategory.create({
          data: {
            id: crypto.randomUUID(),
            businessId: b.id,
            name: catName,
            orderIndex: 0
          }
        });
        addedCount++;
      }
    }

    const scopeDesc = data.isGlobal ? "All Platform Stores" : (data.businessType || "Selected Vertical");
    return {
      success: true,
      message: `Category "${catName}" added across ${addedCount} stores under "${scopeDesc}".`,
      addedCount
    };
  }

  async updateAdminCategory(id: string, name: string) {
    const catName = name.trim();
    if (!catName) {
      const err: any = new Error("Category name is required.");
      err.statusCode = 400;
      throw err;
    }

    const targetCat = await prisma.productCategory.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!targetCat) {
      throw new Error("Category not found.");
    }

    const oldName = targetCat.name;
    const bType = targetCat.business?.businessType;

    const matching = await prisma.productCategory.findMany({
      where: {
        name: oldName,
        business: { businessType: bType }
      },
      select: { id: true }
    });

    await prisma.productCategory.updateMany({
      where: { id: { in: matching.map(m => m.id) } },
      data: { name: catName }
    });

    return { success: true, updatedCount: matching.length, name: catName };
  }

  async deleteAdminCategory(id: string) {
    const targetCat = await prisma.productCategory.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!targetCat) {
      return { success: true, message: "Category deleted." };
    }

    const name = targetCat.name;
    const bType = targetCat.business?.businessType;

    const matching = await prisma.productCategory.findMany({
      where: {
        name,
        business: { businessType: bType }
      },
      select: { id: true }
    });

    await prisma.productCategory.deleteMany({
      where: { id: { in: matching.map(m => m.id) } }
    });

    return { success: true, message: `Category "${name}" removed from ${matching.length} stores in "${bType}".` };
  }

  async changeAdminPassword(userId: string, currentPass: string, newPass: string) {
    if (!newPass || newPass.length < 6) {
      const err: any = new Error("New password must be at least 6 characters.");
      err.statusCode = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      const err: any = new Error("Admin user not found.");
      err.statusCode = 404;
      throw err;
    }

    if (currentPass) {
      const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
      if (!isMatch) {
        const err: any = new Error("Current password verification failed. Please re-enter current password.");
        err.statusCode = 401;
        throw err;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPass, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });

    return { success: true, message: "Admin password updated successfully. Please note your new credentials." };
  }
}
