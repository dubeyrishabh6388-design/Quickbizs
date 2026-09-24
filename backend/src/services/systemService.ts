import fs from "fs";
import path from "path";
import { prisma } from "../config/prisma";

export class SystemService {
  async getHealth() {
    const memory = process.memoryUsage();
    // Verify DB connectivity
    let dbStatus = "Connected";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "Disconnected";
    }

    return {
      status: "Healthy",
      uptime: process.uptime(),
      memory: {
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      },
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }

  async getAuditLogs(businessId: string) {
    return prisma.auditLog.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });
  }

  async logAction(data: {
    userId?: string;
    businessId: string;
    action: string;
    module: string;
    status: "Success" | "Failed";
    ipAddress?: string;
    device?: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        businessId: data.businessId,
        action: data.action,
        module: data.module,
        status: data.status,
        ipAddress: data.ipAddress || null,
        device: data.device || null,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        reason: data.reason || null,
      },
    });
  }

  async getBackups(businessId: string) {
    const backupDir = path.join(__dirname, "../../backups");
    if (!fs.existsSync(backupDir)) {
      return [];
    }
    const files = fs.readdirSync(backupDir).filter((f) => f.startsWith(`backup-${businessId}-`));
    return files.map((filename) => {
      const filePath = path.join(backupDir, filename);
      const stat = fs.statSync(filePath);
      return {
        id: filename,
        filename,
        filePath,
        fileSize: stat.size,
        status: "Success",
        type: "Manual",
        createdAt: stat.birthtime,
      };
    });
  }

  async createBackup(businessId: string) {
    const backupDir = path.join(__dirname, "../../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Gather all tables records for complete state snapshot
    const [
      businesses,
      users,
      roles,
      products,
      customers,
      suppliers,
      inventories,
      orders,
      expenses,
      employees,
      notifications,
      settings,
    ] = await Promise.all([
      prisma.business.findMany({ where: { id: businessId } }),
      prisma.user.findMany({ where: { businessId } }),
      prisma.role.findMany({ where: { businessId } }),
      prisma.product.findMany({ where: { businessId } }),
      prisma.customer.findMany({ where: { businessId } }),
      prisma.supplier.findMany({ where: { businessId } }),
      prisma.inventory.findMany({ where: { businessId } }),
      prisma.order.findMany({ where: { businessId } }),
      prisma.expense.findMany({ where: { businessId } }),
      prisma.employee.findMany({ where: { businessId } }),
      prisma.notification.findMany({ where: { businessId } }),
      prisma.businessSetting.findMany({ where: { businessId } }),
    ]);

    const backupData = {
      businesses,
      users,
      roles,
      products,
      customers,
      suppliers,
      inventories,
      orders,
      expenses,
      employees,
      notifications,
      settings,
    };

    const filename = `backup-${businessId}-${Date.now()}.json`;
    const filePath = path.join(backupDir, filename);
    const content = JSON.stringify(backupData, null, 2);

    fs.writeFileSync(filePath, content, "utf8");

    const record = {
      id: filename,
      businessId,
      filename,
      filePath,
      fileSize: Buffer.byteLength(content),
      status: "Success",
      type: "Manual",
      createdAt: new Date(),
    };

    await this.logAction({
      businessId,
      action: "Create Database Backup",
      module: "Security",
      status: "Success",
      newValue: filename,
    });

    return record;
  }

  async restoreBackup(businessId: string, id: string) {
    const backupDir = path.join(__dirname, "../../backups");
    const filePath = path.join(backupDir, id);

    if (!fs.existsSync(filePath)) {
      const err: any = new Error("Backup file not found.");
      err.statusCode = 404;
      throw err;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Overwrite database within transactional boundaries to support atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Delete dependent child records first
      await tx.notification.deleteMany({ where: { businessId } });
      await tx.expense.deleteMany({ where: { businessId } });
      await tx.orderItem.deleteMany({ where: { order: { businessId } } });
      await tx.order.deleteMany({ where: { businessId } });
      await tx.inventory.deleteMany({ where: { businessId } });
      await tx.product.deleteMany({ where: { businessId } });
      await tx.customer.deleteMany({ where: { businessId } });
      await tx.supplier.deleteMany({ where: { businessId } });
      await tx.employee.deleteMany({ where: { businessId } });
      await tx.businessSetting.deleteMany({ where: { businessId } });

      // 2. Restore main tables
      for (const item of data.settings || []) {
        await tx.businessSetting.create({ data: item });
      }
      for (const item of data.products || []) {
        await tx.product.create({ data: item });
      }
      for (const item of data.inventories || []) {
        await tx.inventory.create({ data: item });
      }
      for (const item of data.customers || []) {
        await tx.customer.create({ data: item });
      }
      for (const item of data.suppliers || []) {
        await tx.supplier.create({ data: item });
      }
      for (const item of data.employees || []) {
        await tx.employee.create({ data: item });
      }
      for (const item of data.orders || []) {
        await tx.order.create({ data: item });
      }
      for (const item of data.expenses || []) {
        await tx.expense.create({ data: item });
      }
      for (const item of data.notifications || []) {
        await tx.notification.create({ data: item });
      }
    });

    await this.logAction({
      businessId,
      action: "Restore Database Backup",
      module: "Security",
      status: "Success",
      oldValue: id,
    });

    return true;
  }
}
