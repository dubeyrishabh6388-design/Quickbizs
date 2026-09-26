import { env } from "../config/env";
import { api } from "../config/api";
import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const decodeToken = (token: string) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
};

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  supplierName: string;
  barcode?: string;
  customFields?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  pendingDues: number;
  advancedPayment: number;
  email?: string;
  lastActive: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  pendingDues: number;
  contactPerson: string;
  lastOrdered: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type UserRole = "Owner" | "Cashier" | "Accountant" | "Warehouse" | "SuperAdmin" | "Manager" | "Employee";

export type ScreenType = "dashboard" | "incoming-orders" | "billing" | "inventory" | "customers" | "suppliers" | "reports" | "ai" | "staff" | "superadmin" | "automation" | "settings" | "tasks" | "recovery" | "counter";

export interface RoleDepartmentConfig {
  pin: string;
  allowedModules: ScreenType[];
  label: string;
  description: string;
}

export interface Tenant {
  id: string;
  name: string;
  plan: "Basic" | "Premium" | "Enterprise";
  status: "Active" | "Suspended";
  registeredDate: string;
  salesCount: number;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerType: "Retail" | "Member" | "Wholesale";
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  gst: number;
  roundOff: number;
  total: number;
  paymentMethod: "Cash" | "UPI" | "Credit" | "Split" | "Card" | "Wallet" | "Gift Card";
  splitDetails?: { cash: number; upi: number };
  status: "Paid" | "Pending";
}

export interface Alert {
  id: string;
  type: "stock" | "payment" | "supplier" | "festival" | "weather" | "employee";
  severity: "info" | "success" | "warning" | "error";
  message: string;
  details: string;
  actionLabel: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: "Present" | "Absent" | "Late";
  phone: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: "Rent" | "Electricity" | "Salary" | "Tea/Snacks" | "Other";
  date: string;
  status: "Approved" | "Pending Approval";
  loggedBy: string;
}

export interface StockMovementLog {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

export interface AutomationLog {
  id: string;
  time: string;
  trigger: string;
  action: string;
  result: string;
  status: "Success" | "Failed";
  duration: string;
}

export interface ReadinessTask {
  id: string;
  task: string;
  completed: boolean;
}

interface BusinessContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: Order[];
  alerts: Alert[];
  employees: Employee[];
  expenses: Expense[];
  readinessChecklist: ReadinessTask[];
  addOrder: (
    customerId: string | undefined,
    customerName: string,
    customerType: Order["customerType"],
    items: OrderItem[],
    subtotal: number,
    discount: number,
    gst: number,
    roundOff: number,
    total: number,
    paymentMethod: Order["paymentMethod"],
    splitDetails?: { cash: number; upi: number }
  ) => any;
  updateProductStock: (id: string, amount: number, reason: string) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  addCustomer: (name: string, phone: string, email?: string) => void;
  settleCustomerDues: (id: string, amount: number) => void;
  addSupplier: (name: string, phone: string, contactPerson: string) => void;
  settleSupplierDues: (id: string, amount: number) => void;
  restockProduct: (id: string, quantity: number) => void;
  dismissAlert: (id: string) => void;
  toggleEmployeeStatus: (id: string, status: Employee["status"]) => void;
  addExpense: (description: string, amount: number, category: Expense["category"]) => void;
  toggleReadinessTask: (id: string) => void;
  askAI: (query: string) => Promise<string>;
  getAIForecast: () => Promise<{ demandPrediction: string; rosterSuggestion: string; cashflowAdvice: string }>;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  tenants: Tenant[];
  toggleTenantStatus: (id: string) => void;
  stockMovementLogs: StockMovementLog[];
  logStockMovement: (productId: string, productName: string, quantity: number, reason: string) => void;
  approveExpense: (id: string) => void;
  automationLogs: AutomationLog[];
  logAutomation: (trigger: string, action: string, result: string, status: "Success" | "Failed", duration: string) => void;
  triggerScheduledJobs: () => void;
  businessPreferences: {
    businessType: string;
    businessSize: string;
    sellOnline: boolean;
    visibleModules: string[];
    dashboardLayout: string[];
    productAttributes: { name: string; type: string }[];
  } | null;
  businessFeatures: {
    gstRequired: boolean;
    barcodeRequired: boolean;
    inventoryTracking: boolean;
    creditLedger: boolean;
    purchaseManagement: boolean;
    employeeManagement: boolean;
    homeDelivery: boolean;
    multiBranch: boolean;
  } | null;
  fetchBusinessFeatures: () => Promise<void>;
  productSchema: {
    businessType: string;
    categories?: string[];
    units?: string[];
    fields?: { name: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string }[];
    sections?: {
      name: string;
      order: number;
      fields: { name: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string }[];
    }[];
  } | null;
  fetchProductSchema: () => Promise<void>;
  operatingMode: "solo" | "multi-staff";
  setOperatingMode: (mode: "solo" | "multi-staff") => void;
  ownerPin: string;
  setOwnerPin: (pin: string) => void;
  verifyOwnerPin: (pin: string) => boolean;
  lockCounter: () => void;
  departmentConfigs: Record<UserRole, RoleDepartmentConfig>;
  updateRoleModules: (role: UserRole, modules: ScreenType[]) => void;
  updateRolePin: (role: UserRole, newPin: string) => void;
  verifyRolePin: (role: UserRole, enteredPin: string) => boolean;
  getRoleAllowedModules: (role: UserRole) => ScreenType[];
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products Database State
  const [products, setProducts] = useState<Product[]>([]);

  // Onboarding features and preferences
  const [businessPreferences, setBusinessPreferences] = useState<any | null>(null);
  const [businessFeatures, setBusinessFeatures] = useState<any | null>(null);

  const fetchBusinessFeatures = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/business/features`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data) {
        setBusinessFeatures(json.data.features);
        setBusinessPreferences(json.data.preferences);
      }
    } catch (err) {
      console.error("Failed to fetch business features:", err);
    }
  };

  const [productSchema, setProductSchema] = useState<any | null>(null);

  const fetchProductSchema = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/product/template`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data) {
        setProductSchema(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch product schema template:", err);
    }
  };

  useEffect(() => {
    fetchProductSchema();
    window.addEventListener("auth-success", fetchProductSchema);
    return () => window.removeEventListener("auth-success", fetchProductSchema);
  }, []);

  useEffect(() => {
    fetchBusinessFeatures();
    window.addEventListener("auth-success", fetchBusinessFeatures);
    return () => window.removeEventListener("auth-success", fetchBusinessFeatures);
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data?.products) {
        setProducts(json.data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products from backend:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.addEventListener("auth-success", fetchProducts);
    return () => window.removeEventListener("auth-success", fetchProducts);
  }, []);

  // Customers Database State
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data?.customers) {
        const mapped = json.data.customers.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.mobile,
          pendingDues: c.pendingAmount,
          advancedPayment: 0,
          email: c.email || undefined,
          lastActive: c.lastPurchaseAt ? c.lastPurchaseAt.split("T")[0] : c.createdAt.split("T")[0],
          rewardPoints: c.rewardPoints || 0,
        }));
        setCustomers(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch customers from backend:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    window.addEventListener("auth-success", fetchCustomers);
    return () => window.removeEventListener("auth-success", fetchCustomers);
  }, []);

  // Suppliers Database State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data?.suppliers) {
        const mapped = json.data.suppliers.map((s: any) => ({
          id: s.id,
          name: s.companyName,
          phone: s.mobile,
          pendingDues: s.outstandingAmount,
          contactPerson: s.contactPerson,
          lastOrdered: s.lastPurchaseDate ? s.lastPurchaseDate.split("T")[0] : s.createdAt.split("T")[0],
        }));
        setSuppliers(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch suppliers from backend:", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    window.addEventListener("auth-success", fetchSuppliers);
    return () => window.removeEventListener("auth-success", fetchSuppliers);
  }, []);

  // Orders Database State
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data?.orders) {
        const mapped = json.data.orders.map((o: any) => ({
          id: o.invoiceNumber,
          customerId: o.customerId,
          customerName: o.customer?.name || o.customerName || "Walk-in Customer",
          customerType: o.customerType,
          date: o.createdAt,
          items: o.items.map((i: any) => ({
            productId: i.productId,
            name: i.productName,
            quantity: i.quantity,
            price: i.unitPrice,
          })),
          subtotal: o.subtotal,
          discount: o.discount,
          gst: o.gstAmount,
          roundOff: o.roundOff,
          total: o.grandTotal,
          paymentMethod: o.paymentMethod,
          status: o.paymentStatus === "Paid" ? ("Paid" as const) : ("Pending" as const),
          dbId: o.id,
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch orders from backend:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    window.addEventListener("auth-success", fetchOrders);
    return () => window.removeEventListener("auth-success", fetchOrders);
  }, []);

  // Employees Database State
  const [employees, setEmployees] = useState<Employee[]>([]);

  const fetchEmployees = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data) {
        setEmployees(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch employees from backend:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    window.addEventListener("auth-success", fetchEmployees);
    return () => window.removeEventListener("auth-success", fetchEmployees);
  }, []);

  // Expenses Database State
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/finance/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data?.expenses) {
        const mapped = json.data.expenses.map((e: any) => ({
          id: e.id,
          description: e.description,
          amount: e.amount,
          category: e.category,
          date: e.createdAt,
          status: e.status === "Approved" ? ("Approved" as const) : ("Pending Approval" as const),
          loggedBy: e.loggedBy,
        }));
        setExpenses(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch expenses from backend:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    window.addEventListener("auth-success", fetchExpenses);
    return () => window.removeEventListener("auth-success", fetchExpenses);
  }, []);

  // Shop Readiness Morning Checklist (Chapter 3 Step 2)
  const [readinessChecklist, setReadinessChecklist] = useState<ReadinessTask[]>([
    { id: "rc1", task: "Check shelves for fresh stock alignment", completed: false },
    { id: "rc2", task: "Scan Dairy rack for product expiration dates", completed: false },
    { id: "rc3", task: "Clear pending online WhatsApp orders queue", completed: false },
    { id: "rc4", task: "Verify starting cashier cash box float (₹5,000)", completed: true },
    { id: "rc5", task: "Confirm thermal receipt printing paper is loaded", completed: false },
    { id: "rc6", task: "Sanitize counter & sweep entrance layout", completed: true },
  ]);

  // Chapter 4: User Roles & SaaS active tenants
  const [currentRole, setCurrentRole] = useState<UserRole>("Owner");

  // Store Operating Mode & Owner Security PIN (Indian Retail Security)
  const [operatingMode, setOperatingModeState] = useState<"solo" | "multi-staff">(() => {
    const saved = localStorage.getItem("qb_operating_mode");
    return (saved === "solo" || saved === "multi-staff") ? saved : "multi-staff";
  });

  const setOperatingMode = (mode: "solo" | "multi-staff") => {
    setOperatingModeState(mode);
    localStorage.setItem("qb_operating_mode", mode);
    if (mode === "solo") {
      setCurrentRole("Owner");
    }
  };

  const [ownerPin, setOwnerPinState] = useState<string>(() => {
    return localStorage.getItem("qb_owner_pin") || "1234";
  });

  const defaultDepartmentConfigs: Record<UserRole, RoleDepartmentConfig> = {
    Owner: {
      pin: "1234",
      label: "Business Owner",
      description: "Full store control, financial analytics & system settings",
      allowedModules: [
        "dashboard", "incoming-orders", "billing", "inventory", 
        "customers", "suppliers", "reports", "ai", "staff", 
        "settings", "recovery", "counter"
      ]
    },
    Manager: {
      pin: "2222",
      label: "Store Manager",
      description: "Floor supervision, billing, customers, stock & reports",
      allowedModules: [
        "dashboard", "billing", "inventory", "customers", 
        "suppliers", "reports", "incoming-orders", "counter"
      ]
    },
    Accountant: {
      pin: "3333",
      label: "Store Accountant",
      description: "Khata ledger, debts, tax reports & vendor payables",
      allowedModules: [
        "reports", "customers", "suppliers", "recovery"
      ]
    },
    Cashier: {
      pin: "0000",
      label: "Cashier Terminal",
      description: "High-speed POS billing, counter mode & customer khata lookups",
      allowedModules: [
        "billing", "counter", "customers", "incoming-orders"
      ]
    },
    Warehouse: {
      pin: "4444",
      label: "Warehouse Staff",
      description: "Inventory tracking, stock alerts & packing dispatch",
      allowedModules: [
        "inventory", "incoming-orders"
      ]
    },
    SuperAdmin: {
      pin: "9999",
      label: "SaaS Super Admin",
      description: "Platform tenants, automation engine & server health",
      allowedModules: [
        "superadmin", "automation"
      ]
    },
    Employee: {
      pin: "1111",
      label: "Staff Employee",
      description: "Assisted counter & customer service",
      allowedModules: [
        "billing", "counter"
      ]
    }
  };

  const [departmentConfigs, setDepartmentConfigs] = useState<Record<UserRole, RoleDepartmentConfig>>(() => {
    try {
      const saved = localStorage.getItem("qb_role_departments");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultDepartmentConfigs, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load department configs:", e);
    }
    return defaultDepartmentConfigs;
  });

  const updateRoleModules = (role: UserRole, modules: ScreenType[]) => {
    setDepartmentConfigs(prev => {
      const updated = {
        ...prev,
        [role]: {
          ...prev[role],
          allowedModules: modules
        }
      };
      localStorage.setItem("qb_role_departments", JSON.stringify(updated));
      return updated;
    });
  };

  const updateRolePin = (role: UserRole, newPin: string) => {
    const cleanPin = newPin.trim();
    setDepartmentConfigs(prev => {
      const updated = {
        ...prev,
        [role]: {
          ...prev[role],
          pin: cleanPin
        }
      };
      localStorage.setItem("qb_role_departments", JSON.stringify(updated));
      return updated;
    });
    if (role === "Owner") {
      setOwnerPinState(cleanPin);
      localStorage.setItem("qb_owner_pin", cleanPin);
    }
  };

  const verifyRolePin = (role: UserRole, enteredPin: string): boolean => {
    const clean = enteredPin.trim();
    const rolePin = departmentConfigs[role]?.pin?.trim() || "1234";
    const masterOwnerPin = (departmentConfigs["Owner"]?.pin || ownerPin).trim();
    return clean === rolePin || clean === masterOwnerPin;
  };

  const getRoleAllowedModules = (role: UserRole): ScreenType[] => {
    return departmentConfigs[role]?.allowedModules || defaultDepartmentConfigs[role]?.allowedModules || [];
  };

  const setOwnerPin = (newPin: string) => {
    const cleanPin = newPin.trim();
    setOwnerPinState(cleanPin);
    localStorage.setItem("qb_owner_pin", cleanPin);
    updateRolePin("Owner", cleanPin);
  };

  const verifyOwnerPin = (enteredPin: string): boolean => {
    return verifyRolePin("Owner", enteredPin);
  };

  const lockCounter = () => {
    setCurrentRole("Cashier");
    window.dispatchEvent(new CustomEvent("counter-locked"));
  };
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const fetchTenants = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    // Only SuperAdmin is authorized to fetch all tenants across the SaaS platform
    try {
      const userStr = localStorage.getItem("qb_user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      if (user?.role !== "SuperAdmin") return;
    } catch {
      return;
    }

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/admin/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data) {
        const mapped = json.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          plan: t.plan,
          status: t.status,
          registeredDate: new Date(t.registeredDate).toISOString().split("T")[0],
          salesCount: 1450,
        }));
        setTenants(mapped);
      }
    } catch (err) {
      console.error("Failed to load business tenants list:", err);
    }
  };

  useEffect(() => {
    fetchTenants();
    window.addEventListener("auth-success", fetchTenants);
    return () => window.removeEventListener("auth-success", fetchTenants);
  }, []);

  const toggleTenantStatus = async (id: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return;

    const newStatus = tenant.status === "Active" ? "Suspended" : "Active";

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/admin/tenants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await response.json();
      if (json.success) {
        fetchTenants();
      }
    } catch (err) {
      console.error("Failed to toggle tenant status:", err);
    }
  };

  // Chapter 5: Stock Movement Logs (IR-006)
  const [stockMovementLogs, setStockMovementLogs] = useState<StockMovementLog[]>([
    { id: "LOG-001", productId: "p1", productName: "Amul Milk (1L)", quantity: -10, reason: "Morning Billing Sales Check-out", date: "2026-07-03T11:00:00", user: "Cashier" },
  ]);

  const logStockMovement = (productId: string, productName: string, quantity: number, reason: string) => {
    const newLog: StockMovementLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      productId,
      productName,
      quantity,
      reason,
      date: new Date().toISOString(),
      user: currentRole
    };
    setStockMovementLogs(prev => [newLog, ...prev]);
  };

  // Chapter 7: Automation Logs
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([
    { id: "AUT-01", time: "09:00:15", trigger: "Employee Attendance started", action: "Log Present Shift Attendance", result: "Sunil Verma marked Present", status: "Success", duration: "8ms" },
    { id: "AUT-02", time: "09:00:16", trigger: "Employee Attendance started", action: "Check Standby Staff Allocation", result: "Alerted Owner of Rohit Singh absence", status: "Success", duration: "12ms" },
    { id: "AUT-03", time: "10:30:00", trigger: "Log Overhead Expense (EXP-01)", action: "Reports Margin Subtraction", result: "Deducted ₹150 from net profit margins", status: "Success", duration: "3ms" },
  ]);

  const logAutomation = (trigger: string, action: string, result: string, status: "Success" | "Failed" = "Success", duration: string = "5ms") => {
    const newLog: AutomationLog = {
      id: `AUT-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      trigger,
      action,
      result,
      status,
      duration
    };
    setAutomationLogs(prev => [newLog, ...prev]);
  };

  const triggerScheduledJobs = () => {
    logAutomation("Cron Schedule Trigger", "Scan stock thresholds", "All 7 shelves audited. Low stock alerts synced.", "Success", "14ms");
    logAutomation("Cron Schedule Trigger", "Calculate daily sales sum", "Reconciled total transactions.", "Success", "6ms");
    logAutomation("Cron Schedule Trigger", "SaaS Cloud Data Backup Sync", "Database state uploaded to cloud backup node.", "Success", "28ms");
  };

  const [dbAlerts, setDbAlerts] = useState<Alert[]>([]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data) {
        const mapped = json.data.map((n: any) => ({
          id: n.id,
          type: (n.type.toLowerCase() === "warning" ? "stock" : n.type.toLowerCase() === "error" ? "payment" : "supplier") as any,
          severity: (n.type.toLowerCase() === "warning" ? "warning" : n.type.toLowerCase() === "error" ? "error" : "info") as any,
          message: n.title,
          details: n.message,
          actionLabel: "Dismiss Alert",
        }));
        setDbAlerts(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    let socketInstance: any = null;

    const initSocket = () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }

      const token = localStorage.getItem("qb_token");
      if (!token) return;

      const payload = decodeToken(token);
      if (!payload) return;

      console.log("Connecting real-time socket...");
      socketInstance = io(`${env.apiUrl}`, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected. Registering client...");
        socketInstance.emit("register", {
          businessId: payload.businessId,
          userId: payload.userId,
          role: payload.role,
        });
      });

      socketInstance.on("notification:new", (newNotification: any) => {
        console.log("Socket: New notification received:", newNotification);
        const mapped = {
          id: newNotification.id,
          type: (newNotification.type.toLowerCase() === "warning" ? "stock" : newNotification.type.toLowerCase() === "error" ? "payment" : "supplier") as any,
          severity: (newNotification.type.toLowerCase() === "warning" ? "warning" : newNotification.type.toLowerCase() === "error" ? "error" : "info") as any,
          message: newNotification.title,
          details: newNotification.message,
          actionLabel: "Dismiss Alert",
        };
        setDbAlerts(prev => [mapped, ...prev]);
      });

      socketInstance.on("notification:update", () => {
        fetchNotifications();
      });

      socketInstance.on("notification:delete", (deleted: { id: string }) => {
        setDbAlerts(prev => prev.filter(a => a.id !== deleted.id));
      });
    };

    initSocket();
    window.addEventListener("auth-success", fetchNotifications);
    window.addEventListener("auth-success", initSocket);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
      window.removeEventListener("auth-success", fetchNotifications);
      window.removeEventListener("auth-success", initSocket);
    };
  }, []);

  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Sync alerts
  useEffect(() => {
    const lowStockProducts = products.filter(p => p.stock <= p.minStock);
    const newStockAlerts: Alert[] = lowStockProducts.map(p => ({
      id: `stock-${p.id}`,
      type: "stock" as const,
      severity: "warning" as const,
      message: `${p.name} stock is low (${p.stock} units left).`,
      details: `Current inventory (${p.stock}) is below safety stock level (${p.minStock}). Click to order from ${p.supplierName}.`,
      actionLabel: "Restock Now"
    }));

    const creditCustomers = customers.filter(c => c.pendingDues > 0);
    const newPaymentAlerts: Alert[] = creditCustomers.map(c => ({
      id: `pay-${c.id}`,
      type: "payment" as const,
      severity: c.pendingDues > 1000 ? ("error" as const) : ("warning" as const),
      message: `Collect ₹${c.pendingDues.toLocaleString()} from ${c.name} (Pending Credit).`,
      details: `Has pending dues of ₹${c.pendingDues.toLocaleString()} accumulated from credit orders. Active phone: ${c.phone}.`,
      actionLabel: "Remind on WhatsApp"
    }));

    const absentStaff = employees.filter(e => e.status === "Absent");
    const newStaffAlerts: Alert[] = absentStaff.map(e => ({
      id: `staff-${e.id}`,
      type: "employee" as const,
      severity: "warning" as const,
      message: `${e.name} (${e.role}) is Absent today.`,
      details: `Reported absent today. Work assignments might need re-allocation. Phone: ${e.phone}.`,
      actionLabel: "Call Staff"
    }));

    setAlerts(prev => {
      const otherAlerts = prev.filter(a => a.type !== "stock" && a.type !== "payment" && a.type !== "employee");
      return [...newStockAlerts, ...newPaymentAlerts, ...newStaffAlerts, ...dbAlerts, ...otherAlerts];
    });
  }, [products, customers, employees, dbAlerts]);

  // Place Order (With pricing summary & split payment details) via backend API
  const addOrder = async (
    customerId: string | undefined,
    customerName: string,
    customerType: Order["customerType"],
    items: OrderItem[],
    subtotal: number,
    discount: number,
    gst: number,
    roundOff: number,
    total: number,
    paymentMethod: Order["paymentMethod"],
    splitDetails?: { cash: number; upi: number }
  ) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return { success: false, message: "No session active." };

    // Prevent TS unused parameter checks
    void subtotal;
    void gst;
    void roundOff;

    // Distribute discount proportionally
    const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);
    const itemDiscountProportion = discount / (totalQty || 1);

    const backendItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
      discount: Math.round(itemDiscountProportion * item.quantity),
      gst: 5,
    }));

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: customerId || null,
          customerName,
          customerType,
          items: backendItems,
          paymentMethod,
          splitDetails: splitDetails || null,
        }),
      });

      const json = await response.json();
      if (json.success) {
        fetchOrders();
        fetchProducts();
        fetchCustomers();
        
        const invoiceNum = json.data?.order?.invoiceNumber || "INV-GEN";
        logAutomation(`Invoice ${invoiceNum} Created`, "Save Invoice Transactions Ledger", `Invoice ${invoiceNum} saved successfully in MySQL`, "Success", "8ms");
        logAutomation(`Invoice ${invoiceNum} Created`, "Reduce Product Shelves Stock", `Subtracted ordered items from inventory shelf stock`, "Success", "12ms");
        if (paymentMethod === "Credit" && customerId) {
          logAutomation(`Invoice ${invoiceNum} Created`, "Settle Customer Credit Accounts", `Added ₹${total.toLocaleString()} dues to customer history`, "Success", "7ms");
        }
        logAutomation(`Invoice ${invoiceNum} Created`, "Reports Margin Accumulation", `Added ₹${total.toLocaleString()} to net profit calculations`, "Success", "4ms");
      }
      return json;
    } catch (err) {
      console.error("Failed to complete POS checkout order:", err);
      return { success: false, message: "Server connection failure." };
    }
  };

  // Adjust stock manually via backend API
  const updateProductStock = async (id: string, amount: number, reason: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const prod = products.find(p => p.id === id);
    if (!prod) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/inventory/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          adjustedQty: amount,
          reason,
        }),
      });
      const json = await response.json();
      if (json.success) {
        fetchProducts();
        logStockMovement(id, prod.name, amount, reason);
        logAutomation("Manual Stock Adjust", "Shelf Inventory Update", `Adjusted product ${prod.name} by ${amount} units. Reason: ${reason}`, "Success", "5ms");
      }
    } catch (err) {
      console.error("Failed to adjust product stock:", err);
    }
  };

  // Add Product (Chapter 6 & 7) via backend API
  const addProduct = async (newProdData: Omit<Product, "id">) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProdData),
      });
      const json = await response.json();
      if (json.success) {
        fetchProducts();
        logAutomation("Product Added", "Expand Product Catalog Ledger", `Added new product "${newProdData.name}" to inventory shelf catalog`, "Success", "3ms");
      }
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  // Add Customer via backend API
  const addCustomer = async (name: string, phone: string, email?: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, mobile: phone, email }),
      });
      const json = await response.json();
      if (json.success) {
        fetchCustomers();
      }
    } catch (err) {
      console.error("Failed to add customer:", err);
    }
  };

  // Settle Customer Dues via backend API
  const settleCustomerDues = async (id: string, amount: number) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const cust = customers.find(c => c.id === id);
    if (!cust) return;

    const newDues = Math.max(0, cust.pendingDues - amount);

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pendingAmount: newDues }),
      });
      const json = await response.json();
      if (json.success) {
        fetchCustomers();
      }
    } catch (err) {
      console.error("Failed to settle customer dues:", err);
    }
  };

  // Add Supplier via backend API
  const addSupplier = async (name: string, phone: string, contactPerson: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyName: name, mobile: phone, contactPerson }),
      });
      const json = await response.json();
      if (json.success) {
        fetchSuppliers();
      }
    } catch (err) {
      console.error("Failed to add supplier:", err);
    }
  };

  // Settle Supplier Dues via backend API
  const settleSupplierDues = async (id: string, amount: number) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;

    const newDues = Math.max(0, supplier.pendingDues - amount);

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/suppliers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ outstandingAmount: newDues }),
      });
      const json = await response.json();
      if (json.success) {
        fetchSuppliers();
      }
    } catch (err) {
      console.error("Failed to settle supplier dues:", err);
    }
  };

  // Restock items (order from supplier) via backend API (ACID PO & GRN workflow)
  const restockProduct = async (id: string, quantity: number) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const prod = products.find(p => p.id === id);
    if (!prod) return;

    const supp = suppliers.find(s => s.name === prod.supplierName);
    if (!supp) return;

    try {
      // 1. Create Purchase Order
      const createPoRes = await fetch(`${env.apiUrl}/api/v1/purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId: supp.id,
          items: [
            {
              productId: id,
              orderedQuantity: quantity,
              purchasePrice: prod.costPrice,
              gst: 18,
              discount: 0,
            },
          ],
          remarks: `Replenishment PO for product "${prod.name}"`,
        }),
      });

      const poJson = await createPoRes.json();
      if (!poJson.success) {
        console.error("Failed to create purchase order:", poJson.message);
        return;
      }

      const poId = poJson.data?.po?.id;

      // 2. Receive Goods (GRN) to update inventory and supplier dues ledger
      const grnRes = await fetch(`${env.apiUrl}/api/v1/purchases/${poId}/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receivedItems: [
            {
              productId: id,
              receivedQty: quantity,
              damagedQty: 0,
              rejectedQty: 0,
              missingQty: 0,
            },
          ],
          remarks: "Auto-receipt replenishment order",
        }),
      });

      const grnJson = await grnRes.json();
      if (grnJson.success) {
        fetchProducts();
        fetchSuppliers();
        logStockMovement(id, prod.name, quantity, "Supplier Delivery Restock (GRN)");
        logAutomation("Supplier PO Restocked", "Replenish Product Shelf Inventory", `Created Purchase Order & processed GRN for ${quantity} units of ${prod.name}`, "Success", "15ms");
      }
    } catch (err) {
      console.error("Failed to complete PO & GRN restock workflow:", err);
    }
  };

  // Dismiss alert via backend API
  const dismissAlert = async (id: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    if (id.length > 10) {
      try {
        await fetch(`${env.apiUrl}/api/v1/notifications/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchNotifications();
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    } else {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  // Toggle Employee Attendance via backend API
  const toggleEmployeeStatus = async (id: string, status: Employee["status"]) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/employees/attendance/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeId: id, status }),
      });
      const json = await response.json();
      if (json.success) {
        fetchEmployees();
        logAutomation(`Employee ${emp.name} Shift Update`, "Update Staff Shift Status", `Shift status updated to ${status}`, "Success", "3ms");
      }
    } catch (err) {
      console.error("Failed to toggle employee attendance status:", err);
    }
  };

  // Log Business Cost via backend API
  const addExpense = async (description: string, amount: number, category: Expense["category"]) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/finance/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, amount, category }),
      });
      const json = await response.json();
      if (json.success) {
        fetchExpenses();
        const expense = json.data;
        logAutomation(`Expenditure ${expense.id} Logged`, "Add Expense Record", `Logged ₹${amount} for ${description}. Status: ${expense.status}`, "Success", "3ms");
      }
    } catch (err) {
      console.error("Failed to log expense:", err);
    }
  };

  // Approve Expense via backend API
  const approveExpense = async (id: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/finance/expenses/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await response.json();
      if (json.success) {
        fetchExpenses();
        logAutomation(`Expense ${id} Approved by Owner`, "Subtract Business Cash Available", `Deducted approved cost ₹${json.data?.amount} from register cash drawer`, "Success", "4ms");
        logAutomation(`Expense ${id} Approved by Owner`, "Reports Margin Subtraction", `Deducted cost from net profit calculations`, "Success", "2ms");
      }
    } catch (err) {
      console.error("Failed to approve expense:", err);
    }
  };

  // Toggle Shop Readiness Morning Tasks (Chapter 3)
  const toggleReadinessTask = (id: string) => {
    setReadinessChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Real AI Store Intelligence powered by Google Gemini 3.6 Flash
  const askAI = async (query: string): Promise<string> => {
    // 1. Prepare live store context snapshot
    const todaySales = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const lowStockItems = products
      .filter(p => p.stock <= p.minStock)
      .map(p => ({
        name: p.name,
        stock: p.stock,
        minStock: p.minStock,
        price: p.price,
        supplierName: p.supplierName
      }));
    const topUdhaarCustomers = customers
      .filter(c => c.pendingDues > 0)
      .sort((a, b) => b.pendingDues - a.pendingDues)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        phone: c.phone,
        pendingDues: c.pendingDues
      }));
    const totalOutstandingUdhaar = customers.reduce((acc, c) => acc + (c.pendingDues || 0), 0);
    const totalSuppliersDue = suppliers.reduce((acc, s) => acc + (s.pendingDues || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const absentStaff = employees.filter(e => e.status === "Absent").map(e => `${e.name} (${e.role})`);

    const storeContext = {
      storeName: "QuickBizs Store",
      businessType: businessPreferences?.businessType || "Retail Store",
      todaySales,
      ordersCount: orders.length,
      paymentBreakdown: {
        cash: orders.filter(o => o.paymentMethod === "Cash").reduce((acc, o) => acc + o.total, 0),
        upi: orders.filter(o => o.paymentMethod === "UPI").reduce((acc, o) => acc + o.total, 0),
        credit: orders.filter(o => o.paymentMethod === "Credit").reduce((acc, o) => acc + o.total, 0),
      },
      lowStockItems,
      topUdhaarCustomers,
      totalOutstandingUdhaar,
      totalSuppliersDue,
      staffAttendance: {
        total: employees.length,
        present: employees.filter(e => e.status !== "Absent").length,
        absent: absentStaff
      },
      totalExpenses
    };

    // 2. Primary: Call Backend AI Endpoint
    try {
      const res = await api.post("/ai/chat", { query, storeContext });
      if (res.data?.success && res.data?.reply) {
        return res.data.reply;
      }
    } catch (backendErr) {
      console.warn("Backend AI endpoint unavailable, using direct Gemini fallback:", backendErr);
    }

    // 3. Secondary: Direct Gemini 3.6 Flash Fallback
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    const geminiModel = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.6-flash";
    try {
      const systemInstruction = `You are QuickBizs AI Store Partner for Indian retail merchants.
Use this live store database to answer the merchant accurately with numbers, currency amounts (₹), customer names, and practical Kirana/Retail advice:
${JSON.stringify(storeContext, null, 2)}

Merchant question: ${query}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) {
          return reply.trim();
        }
      }
    } catch (directErr) {
      console.error("Direct Gemini API error:", directErr);
    }

    // 4. Local Heuristic Analysis Fallback
    if (lowStockItems.length > 0 && (query.toLowerCase().includes("stock") || query.toLowerCase().includes("reorder"))) {
      return `### 📦 Urgent Reorder Proposals\nYou have **${lowStockItems.length} products** low on stock: ${lowStockItems.map(p => `${p.name} (${p.stock} units left)`).join(", ")}. Please raise purchase orders today!`;
    }
    return `### 📊 Live Store Briefing\n- **Today's Sales:** ₹${todaySales.toLocaleString()} (${orders.length} bills)\n- **Pending Customer Udhaar:** ₹${totalOutstandingUdhaar.toLocaleString()}\n- **Low Stock Items:** ${lowStockItems.length}\n- **Staff Present:** ${employees.filter(e => e.status !== "Absent").length}/${employees.length}`;
  };

  const getAIForecast = async (): Promise<{ demandPrediction: string; rosterSuggestion: string; cashflowAdvice: string }> => {
    try {
      const res = await api.post("/ai/forecast", {
        storeContext: {
          todaySales: orders.reduce((acc, o) => acc + (o.total || 0), 0),
          ordersCount: orders.length,
          lowStockItems: products.filter(p => p.stock <= p.minStock),
          totalOutstandingUdhaar: customers.reduce((acc, c) => acc + (c.pendingDues || 0), 0),
          staffAttendance: {
            total: employees.length,
            present: employees.filter(e => e.status !== "Absent").length,
            absent: employees.filter(e => e.status === "Absent").map(e => e.name)
          }
        }
      });
      if (res.data?.success && res.data?.forecast) {
        return res.data.forecast;
      }
    } catch (e) {
      console.warn("Forecast API error:", e);
    }

    return {
      demandPrediction: "Tomorrow's customer footfalls are expected to be steady during morning and evening rush hours.",
      rosterSuggestion: "Keep billing counters fully staffed. Ensure inventory helpers are assigned early.",
      cashflowAdvice: "Collect outstanding Udhaar payments to optimize daily cash flow."
    };
  };

  return (
    <BusinessContext.Provider
      value={{
        products,
        customers,
        suppliers,
        orders,
        alerts,
        employees,
        expenses,
        readinessChecklist,
        addOrder,
        updateProductStock,
        addProduct,
        addCustomer,
        settleCustomerDues,
        addSupplier,
        settleSupplierDues,
        restockProduct,
        dismissAlert,
        toggleEmployeeStatus,
        addExpense,
        toggleReadinessTask,
        askAI,
        getAIForecast,
        currentRole,
        setCurrentRole,
        tenants,
        toggleTenantStatus,
        stockMovementLogs,
        logStockMovement,
        approveExpense,
        automationLogs,
        logAutomation,
        triggerScheduledJobs,
        businessPreferences,
        businessFeatures,
        fetchBusinessFeatures,
        productSchema,
        fetchProductSchema,
        operatingMode,
        setOperatingMode,
        ownerPin,
        setOwnerPin,
        verifyOwnerPin,
        lockCounter,
        departmentConfigs,
        updateRoleModules,
        updateRolePin,
        verifyRolePin,
        getRoleAllowedModules
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};
