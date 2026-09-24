import { globalSearchRepository } from "../repositories/globalSearchRepository";
import { logger } from "../utils/logger";

interface SearchResult {
  module: string; // PRODUCTS, CUSTOMERS, INVOICES, PURCHASES, EXPENSES, EMPLOYEES, TASKS, NOTIFICATIONS
  title: string;
  subtitle: string;
  action: string; // Open Product, Open Customer, Open Invoice, etc.
  targetId: string;
}

export class GlobalSearchService {
  async executeSearch(
    businessId: string,
    userId: string,
    role: string,
    query: string
  ): Promise<Record<string, SearchResult[]>> {
    const term = query.trim().toLowerCase();
    const results: Record<string, SearchResult[]> = {};

    // 1. Log search to history
    if (term.length > 1) {
      await globalSearchRepository.logSearch(businessId, userId, query, "General");
    }

    // 2. Evaluate Smart Searches
    if (term === "low stock" || term === "lowstock") {
      const stock = await globalSearchRepository.getLowStockProducts(businessId);
      results["PRODUCTS"] = stock.map(s => ({
        module: "PRODUCTS",
        title: s.product.name,
        subtitle: `Stock: ${s.availableQuantity} | Limit: 10`,
        action: "Open Product",
        targetId: s.productId,
      }));
      return results;
    }

    if (term === "pending payments" || term === "pendingpayments" || term === "due") {
      const customers = await globalSearchRepository.getPendingPaymentsCustomers(businessId);
      results["CUSTOMERS"] = customers.map(c => ({
        module: "CUSTOMERS",
        title: c.name,
        subtitle: `Pending: ₹${c.pendingAmount.toLocaleString()} | Mobile: ${c.mobile}`,
        action: "Open Customer",
        targetId: c.id,
      }));
      return results;
    }

    if (term === "today sales" || term === "today's sales" || term === "todaysales") {
      const orders = await globalSearchRepository.getTodayOrders(businessId);
      const total = orders.reduce((sum, o) => sum + o.grandTotal, 0);
      results["REPORTS"] = [{
        module: "REPORTS",
        title: `Today's Billing Sales Metrics`,
        subtitle: `Total Sales Count: ${orders.length} | Revenue: ₹${total.toLocaleString()}`,
        action: "Open Reports",
        targetId: "reports",
      }];
      return results;
    }

    if (term === "employee absent" || term === "absent employees" || term === "absent") {
      const absents = await globalSearchRepository.getTodayAbsentEmployees(businessId);
      results["EMPLOYEES"] = absents.map(e => ({
        module: "EMPLOYEES",
        title: `${e.firstName} ${e.lastName}`,
        subtitle: `Designation: ${e.designation} | Mobile: ${e.mobile}`,
        action: "Open Staff",
        targetId: e.id,
      }));
      return results;
    }

    // 3. Evaluate Module permissions and execute parallel queries
    const promises: Promise<void>[] = [];

    // Products
    if (role === "Owner" || role === "Admin" || role === "SuperAdmin" || role === "Cashier" || role === "Warehouse") {
      promises.push(
        globalSearchRepository.searchProducts(businessId, query).then(data => {
          if (data.length > 0) {
            results["PRODUCTS"] = data.map(p => ({
              module: "PRODUCTS",
              title: p.name,
              subtitle: `Barcode: ${p.barcode || "N/A"} | Price: ₹${p.price}`,
              action: "Open Product",
              targetId: p.id,
            }));
          }
        })
      );
    }

    // Customers
    if (role === "Owner" || role === "Admin" || role === "SuperAdmin" || role === "Cashier" || role === "Accountant") {
      promises.push(
        globalSearchRepository.searchCustomers(businessId, query).then(data => {
          if (data.length > 0) {
            results["CUSTOMERS"] = data.map(c => ({
              module: "CUSTOMERS",
              title: c.name,
              subtitle: `Phone: ${c.mobile} | Pending: ₹${c.pendingAmount}`,
              action: "Open Customer",
              targetId: c.id,
            }));
          }
        })
      );
    }

    // Suppliers
    if (role === "Owner" || role === "Admin" || role === "SuperAdmin" || role === "Accountant") {
      promises.push(
        globalSearchRepository.searchSuppliers(businessId, query).then(data => {
          if (data.length > 0) {
            results["SUPPLIERS"] = data.map(s => ({
              module: "SUPPLIERS",
              title: s.companyName,
              subtitle: `Contact: ${s.contactPerson} | Phone: ${s.mobile}`,
              action: "Open Supplier",
              targetId: s.id,
            }));
          }
        })
      );
    }

    // Invoices / Orders
    if (role === "Owner" || role === "Admin" || role === "SuperAdmin" || role === "Cashier" || role === "Accountant") {
      promises.push(
        globalSearchRepository.searchInvoices(businessId, query).then(data => {
          if (data.length > 0) {
            results["INVOICES"] = data.map(o => ({
              module: "INVOICES",
              title: `Invoice #${o.invoiceNumber}`,
              subtitle: `Customer: ${o.customer?.name || "Walk-in Customer"} | Total: ₹${o.grandTotal}`,
              action: "Open Invoice",
              targetId: o.id,
            }));
          }
        })
      );
    }

    // Purchases
    if (role === "Owner" || role === "Admin" || role === "SuperAdmin" || role === "Accountant" || role === "Warehouse") {
      promises.push(
        globalSearchRepository.searchPurchases(businessId, query).then(data => {
          if (data.length > 0) {
            results["PURCHASES"] = data.map(p => ({
              module: "PURCHASES",
              title: `Purchase PO #${p.poNumber}`,
              subtitle: `Supplier: ${p.supplier?.companyName || "N/A"} | Amount: ₹${p.grandTotal}`,
              action: "Open Purchase",
              targetId: p.id,
            }));
          }
        })
      );
    }

    // Expenses
    if (role === "Owner" || role === "Admin" || role === "SuperAdmin" || role === "Accountant") {
      promises.push(
        globalSearchRepository.searchExpenses(businessId, query).then(data => {
          if (data.length > 0) {
            results["EXPENSES"] = data.map(e => ({
              module: "EXPENSES",
              title: e.description,
              subtitle: `Category: ${e.category} | Amount: ₹${e.amount}`,
              action: "Open Expense",
              targetId: e.id,
            }));
          }
        })
      );
    }

    // Employees
    if (role === "Owner" || role === "Admin" || role === "SuperAdmin") {
      promises.push(
        globalSearchRepository.searchEmployees(businessId, query).then(data => {
          if (data.length > 0) {
            results["EMPLOYEES"] = data.map(e => ({
              module: "EMPLOYEES",
              title: `${e.firstName} ${e.lastName}`,
              subtitle: `Code: ${e.employeeCode} | Designation: ${e.designation}`,
              action: "Open Staff",
              targetId: e.id,
            }));
          }
        })
      );
    }

    // Tasks & Notifications (Accessible to employees as department scopes)
    promises.push(
      globalSearchRepository.searchTasks(businessId, query).then(data => {
        // Enforce filters inside tasks
        if (data.length > 0) {
          results["TASKS"] = data.map((t: any) => ({
            module: "TASKS",
            title: t.title,
            subtitle: `Priority: ${t.priority} | Status: ${t.status}`,
            action: "Open Tasks",
            targetId: t.id,
          }));
        }
      })
    );

    promises.push(
      globalSearchRepository.searchNotifications(businessId, query).then(data => {
        if (data.length > 0) {
          results["NOTIFICATIONS"] = data.map(n => ({
            module: "NOTIFICATIONS",
            title: n.title,
            subtitle: `Priority: ${n.priority} | Message: ${n.message}`,
            action: "Open Notifications",
            targetId: n.id,
          }));
        }
      })
    );

    await Promise.all(promises);

    return results;
  }

  async getRecentSearches(businessId: string, userId: string) {
    return globalSearchRepository.getRecentSearches(businessId, userId);
  }

  async getFavorites(businessId: string, userId: string) {
    return globalSearchRepository.getFavorites(businessId, userId);
  }

  async addFavorite(businessId: string, userId: string, data: {
    targetModule: string;
    targetId: string;
    title: string;
    subtitle?: string | null;
  }) {
    return globalSearchRepository.addFavorite(businessId, userId, data);
  }

  async removeFavorite(businessId: string, userId: string, id: string) {
    return globalSearchRepository.removeFavorite(businessId, userId, id);
  }
}
export const globalSearchService = new GlobalSearchService();
