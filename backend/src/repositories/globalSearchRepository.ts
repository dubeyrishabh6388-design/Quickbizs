import { prisma } from "../config/prisma";

export class GlobalSearchRepository {
  async searchProducts(businessId: string, query: string) {
    return prisma.product.findMany({
      where: {
        businessId,
        isDeleted: false,
        OR: [
          { name: { contains: query } },
          { barcode: { contains: query } },
          { supplierName: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  async searchCustomers(businessId: string, query: string) {
    return prisma.customer.findMany({
      where: {
        businessId,
        isDeleted: false,
        OR: [
          { name: { contains: query } },
          { mobile: { contains: query } },
          { email: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  async searchSuppliers(businessId: string, query: string) {
    return prisma.supplier.findMany({
      where: {
        businessId,
        isDeleted: false,
        OR: [
          { companyName: { contains: query } },
          { contactPerson: { contains: query } },
          { mobile: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  async searchInvoices(businessId: string, query: string) {
    return prisma.order.findMany({
      where: {
        businessId,
        deletedAt: null,
        OR: [
          { invoiceNumber: { contains: query } },
          {
            customer: {
              name: { contains: query },
            },
          },
        ],
      },
      include: { customer: true },
      take: 10,
    });
  }

  async searchPurchases(businessId: string, query: string) {
    return prisma.purchaseOrder.findMany({
      where: {
        businessId,
        OR: [
          { poNumber: { contains: query } },
          { remarks: { contains: query } },
        ],
      },
      include: { supplier: true },
      take: 10,
    });
  }

  async searchExpenses(businessId: string, query: string) {
    return prisma.expense.findMany({
      where: {
        businessId,
        deletedAt: null,
        OR: [
          { description: { contains: query } },
          { category: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  async searchEmployees(businessId: string, query: string) {
    return prisma.employee.findMany({
      where: {
        businessId,
        deletedAt: null,
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
          { designation: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  async searchTasks(businessId: string, query: string) {
    return prisma.employeeTask.findMany({
      where: {
        businessId,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  async searchNotifications(businessId: string, query: string) {
    return prisma.notification.findMany({
      where: {
        businessId,
        OR: [
          { title: { contains: query } },
          { message: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  // Smart Search DB triggers helpers
  async getLowStockProducts(businessId: string) {
    return prisma.inventory.findMany({
      where: {
        businessId,
        deletedAt: null,
        availableQuantity: { lte: 10 },
      },
      include: { product: true },
      take: 20,
    });
  }

  async getPendingPaymentsCustomers(businessId: string) {
    return prisma.customer.findMany({
      where: {
        businessId,
        isDeleted: false,
        pendingAmount: { gt: 0 },
      },
      orderBy: { pendingAmount: "desc" },
      take: 20,
    });
  }

  async getTodayOrders(businessId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.order.findMany({
      where: {
        businessId,
        createdAt: { gte: today },
      },
      take: 50,
    });
  }

  async getTodayAbsentEmployees(businessId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fetch present employee IDs
    const present = await prisma.attendance.findMany({
      where: {
        businessId,
        date: { gte: today },
        status: { in: ["Present", "Late"] },
      },
      select: { employeeId: true },
    });
    
    const presentIds = present.map(p => p.employeeId);

    return prisma.employee.findMany({
      where: {
        businessId,
        deletedAt: null,
        id: { notIn: presentIds },
      },
      take: 20,
    });
  }

  // History & Favorites CRUD
  async logSearch(businessId: string, userId: string, searchText: string, searchModule: string) {
    return prisma.searchHistory.create({
      data: {
        businessId,
        userId,
        searchText,
        searchModule,
      },
    });
  }

  async getRecentSearches(businessId: string, userId: string) {
    return prisma.searchHistory.findMany({
      where: { businessId, userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  async getFavorites(businessId: string, userId: string) {
    return prisma.searchFavorite.findMany({
      where: { businessId, userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addFavorite(businessId: string, userId: string, data: {
    targetModule: string;
    targetId: string;
    title: string;
    subtitle?: string | null;
  }) {
    return prisma.searchFavorite.create({
      data: {
        businessId,
        userId,
        targetModule: data.targetModule,
        targetId: data.targetId,
        title: data.title,
        subtitle: data.subtitle || null,
      },
    });
  }

  async removeFavorite(businessId: string, userId: string, id: string) {
    return prisma.searchFavorite.deleteMany({
      where: { id, businessId, userId },
    });
  }
}
export const globalSearchRepository = new GlobalSearchRepository();
