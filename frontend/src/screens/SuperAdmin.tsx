import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  CheckCircle2, 
  Search, 
  DollarSign, 
  RefreshCw,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  KeyRound,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Copy,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
  Store,
  Check,
  Tag,
  FolderPlus,
  Edit2,
  ShoppingCart,
  Wrench,
  Zap,
  Package,
  Hammer,
  Building,
  Truck,
  Shirt,
  Smartphone,
  Tv,
  Glasses,
  Gem,
  Pill,
  Coffee,
  Sparkles,
  BookOpen,
  Utensils,
  Car,
  HeartPulse,
  Scissors,
  UserPlus,
  Send,
  MessageSquare,
  Share2,
  ExternalLink,
  CheckCheck,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../config/api";
import { useBusiness } from "../context/BusinessContext";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  details?: string;
  category?: "DATABASE" | "AUTH" | "VALIDATION" | "NETWORK" | "PAYMENT" | "SYSTEM";
  simplifiedTitle?: string;
  explanation?: string;
  suggestedAction?: string;
  isActionRequired?: boolean;
}

const getLogInterpretation = (log: LogEntry) => {
  if (log.simplifiedTitle && log.explanation && log.suggestedAction) {
    return {
      category: log.category || "SYSTEM",
      simplifiedTitle: log.simplifiedTitle,
      explanation: log.explanation,
      suggestedAction: log.suggestedAction,
      isActionRequired: log.isActionRequired ?? (log.level !== "INFO"),
    };
  }

  const combined = `${log.message} ${log.details || ""}`.toLowerCase();

  // 1. Database Connection Pool Exhaustion / Timeout
  if (
    combined.includes("pool timeout") || 
    combined.includes("pool connections") || 
    combined.includes("failed to retrieve a connection from pool") ||
    combined.includes("connection pool")
  ) {
    return {
      category: "DATABASE" as const,
      simplifiedTitle: "Database Connection Pool Exhausted (Timeout)",
      explanation: "All available PostgreSQL connection pool slots were active and busy. Incoming queries waited longer than the pool timeout (10,000ms) without getting an idle slot.",
      suggestedAction: "1. In 'backend/.env', append '?connection_limit=25&pool_timeout=20' to DATABASE_URL.\n2. Verify all Prisma queries in backend services are awaited and transactions are properly committed.\n3. Restart the backend daemon to reset connection pools.",
      isActionRequired: true
    };
  }

  // 2. Database & Unique Constraints (Duplicates & Already Registered)
  if (
    combined.includes("unique constraint") || 
    combined.includes("p2002") || 
    combined.includes("already exists") || 
    combined.includes("duplicate") || 
    combined.includes("already registered")
  ) {
    const isPhone = combined.includes("phone") || combined.includes("mobile");
    const isEmail = combined.includes("email");
    return {
      category: "DATABASE" as const,
      simplifiedTitle: isPhone 
        ? "Duplicate Phone Number Conflict" 
        : isEmail 
          ? "Duplicate Email Conflict (Already Registered)" 
          : "Duplicate Unique Record Conflict",
      explanation: isPhone 
        ? "The mobile number provided is already registered to an existing merchant or user account. QuickBizs enforces unique phone numbers for security." 
        : isEmail 
          ? "The email address provided is already registered in the system database. Each user account requires a unique email address." 
          : "The record violates a unique constraint index in the database. Identical duplicate data cannot be re-inserted.",
      suggestedAction: "1. Use an alternate phone number or email address.\n2. In this Admin Console, check the 'Stores Directory' or 'Users' tab to review, reset password, or update the existing account.",
      isActionRequired: true
    };
  }

  // 2b. SaaS Subscription & Plan Quota Limits
  if (
    combined.includes("subscription limit") || 
    combined.includes("limit reached") || 
    combined.includes("maximum allowed limit") || 
    combined.includes("saas limit")
  ) {
    return {
      category: "DATABASE" as const,
      simplifiedTitle: "Store Catalog Quota Reached (Subscription Limit)",
      explanation: "This business has reached its plan quota for products (default 100 on Basic plan) or customers. Additional items cannot be added until the subscription plan is upgraded.",
      suggestedAction: "1. In this Admin Console, navigate to the 'Stores Directory' or 'Tenants' tab.\n2. Locate the merchant's store and click 'Edit Store' or 'Upgrade Plan'.\n3. Switch the plan from Basic to Pro (1,000 items) or Enterprise (50,000 items), or increase the max_products limit.",
      isActionRequired: true
    };
  }

  // 3. Database Connection Failure / Unreachable
  if (
    combined.includes("econnrefused") || 
    combined.includes("cant reach database") || 
    combined.includes("can't reach database") || 
    combined.includes("prismaclientinitializationerror") || 
    combined.includes("database server was not found")
  ) {
    return {
      category: "DATABASE" as const,
      simplifiedTitle: "PostgreSQL Database Server Unreachable",
      explanation: "The Node.js backend cannot establish a TCP socket connection to PostgreSQL. The database service may be stopped, port 5432 blocked, or DATABASE_URL credentials incorrect.",
      suggestedAction: "1. Check if PostgreSQL service is running in Windows Services (services.msc) or run 'Get-Service postgresql*'.\n2. Verify host, port, username, and password in 'backend/.env' (DATABASE_URL).\n3. Run 'npx prisma db pull' in backend directory to verify connectivity.",
      isActionRequired: true
    };
  }

  // 4. Foreign Key Constraints (P2003)
  if (combined.includes("p2003") || combined.includes("foreign key constraint") || combined.includes("violates foreign key")) {
    return {
      category: "DATABASE" as const,
      simplifiedTitle: "Foreign Key Integrity Constraint Violation",
      explanation: "An operation attempted to reference or delete a record that has active dependencies (e.g. creating an order for an invalid businessId/userId, or deleting a store with active orders).",
      suggestedAction: "1. Confirm the parent business or user record exists before creating dependent items.\n2. Deactivate the entity with soft delete (isActive: false) instead of cascade deletion.",
      isActionRequired: true
    };
  }

  // 5. Authentication & Password Mismatch
  if (combined.includes("invalid credentials") || combined.includes("bcrypt") || combined.includes("password mismatch") || combined.includes("incorrect password")) {
    return {
      category: "AUTH" as const,
      simplifiedTitle: "Authentication Failed (Invalid Credentials)",
      explanation: "A login attempt failed because the submitted phone/email and password did not match the hashed record stored in the database.",
      suggestedAction: "1. Verify the user is using the correct 10-digit phone number and exact case-sensitive password.\n2. In this Admin Console, navigate to 'Merchants & Users' tab and click 'Reset Password' to assign fresh credentials.",
      isActionRequired: true
    };
  }

  // 6. Token & Session Expiry
  if (combined.includes("jwt expired") || combined.includes("jwt malformed") || combined.includes("unauthorized") || combined.includes("no token provided") || combined.includes("invalid token")) {
    return {
      category: "AUTH" as const,
      simplifiedTitle: "Authentication Session Expired or Invalid Token",
      explanation: "The HTTP request carried an expired or invalid JSON Web Token (JWT) in the Authorization header.",
      suggestedAction: "1. The user must sign in again to receive a renewed authentication token.\n2. If this occurs immediately after login, verify 'JWT_SECRET' in 'backend/.env' is configured properly.",
      isActionRequired: true
    };
  }

  // 7. Validation & Missing Fields
  if (combined.includes("validation") || combined.includes("is required") || combined.includes("must be") || combined.includes("invalid input") || combined.includes("must be 10 digits")) {
    return {
      category: "VALIDATION" as const,
      simplifiedTitle: "Input Validation Error (Missing / Malformed Fields)",
      explanation: "The API payload failed client or server schema validation. Required parameters were missing, empty, or incorrectly formatted.",
      suggestedAction: "1. Inspect the form submission inputs in frontend to ensure all required fields are filled.\n2. Review controller validation logic in 'backend/src/controllers/'.",
      isActionRequired: true
    };
  }

  // 8. Payments & Razorpay
  if (combined.includes("razorpay") || combined.includes("payment") || combined.includes("order_id")) {
    return {
      category: "PAYMENT" as const,
      simplifiedTitle: "Payment Gateway Transaction Notice",
      explanation: "An issue or notice occurred during Razorpay order creation, payment capture, or webhook verification.",
      suggestedAction: "1. Verify 'RAZORPAY_KEY_ID' and 'RAZORPAY_KEY_SECRET' in 'backend/.env'.\n2. Check internet connectivity and inspect webhook event logs in the Razorpay Dashboard.",
      isActionRequired: true
    };
  }

  // 9. WebSocket / Real-time events
  if (combined.includes("socket client") || combined.includes("joined rooms") || combined.includes("socket.io")) {
    return {
      category: "SYSTEM" as const,
      simplifiedTitle: "WebSocket Real-Time Event",
      explanation: log.message,
      suggestedAction: "Normal background event for real-time synchronization across connected terminals. No action required.",
      isActionRequired: false
    };
  }

  // 10. General Warning
  if (log.level === "WARN") {
    return {
      category: "SYSTEM" as const,
      simplifiedTitle: "System Warning Recorded",
      explanation: log.message || "The system logged a non-fatal warning condition.",
      suggestedAction: "Review the parameters and server state. Warnings typically do not prevent application availability.",
      isActionRequired: true
    };
  }

  // 11. General Error
  if (log.level === "ERROR") {
    return {
      category: "SYSTEM" as const,
      simplifiedTitle: "System Runtime Exception Occurred",
      explanation: log.message.replace(/^Error:\s*/i, "") || "An unexpected server runtime error occurred.",
      suggestedAction: "Click 'Tech Trace' below to inspect the call stack, check the affected route controller, and restart the backend server if persistent.",
      isActionRequired: true
    };
  }

  // 12. Info / Success
  return {
    category: "SYSTEM" as const,
    simplifiedTitle: "System Activity Event",
    explanation: log.message,
    suggestedAction: "Normal system event. No action required.",
    isActionRequired: false
  };
};

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  infos: number;
  bufferCapacity: number;
  lastLogTime: string | null;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  businessId: string;
  businessName: string;
  businessPlan: string;
  role: string;
  createdAt: string;
}

interface BusinessCategory {
  id: string;
  label: string;
  desc: string;
  icon: string;
  defaultCategories: string[];
  isCustom?: boolean;
  storeCount: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingCart,
  Wrench,
  Zap,
  Package,
  Store,
  Hammer,
  Building,
  Layers,
  Truck,
  Shirt,
  Smartphone,
  Tv,
  Glasses,
  Gem,
  Pill,
  Coffee,
  Sparkles,
  BookOpen,
  Utensils,
  Car,
  HeartPulse,
  Scissors,
  UserPlus,
  Send,
  MessageSquare,
  Share2,
  ExternalLink,
  CheckCheck,
  Tag,
  ShieldCheck,
};

const AVAILABLE_ICONS = [
  { name: "ShoppingCart", label: "Cart", icon: ShoppingCart },
  { name: "Store", label: "Store", icon: Store },
  { name: "Wrench", label: "Spares", icon: Wrench },
  { name: "Zap", label: "Electrical", icon: Zap },
  { name: "Package", label: "Package", icon: Package },
  { name: "Hammer", label: "Hardware", icon: Hammer },
  { name: "Building", label: "Building", icon: Building },
  { name: "Layers", label: "Materials", icon: Layers },
  { name: "Truck", label: "Wholesale", icon: Truck },
  { name: "Shirt", label: "Clothing", icon: Shirt },
  { name: "Smartphone", label: "Mobile", icon: Smartphone },
  { name: "Tv", label: "Electronics", icon: Tv },
  { name: "Glasses", label: "Optical", icon: Glasses },
  { name: "Gem", label: "Jewelry", icon: Gem },
  { name: "Pill", label: "Pharmacy", icon: Pill },
  { name: "Coffee", label: "Bakery/Cafe", icon: Coffee },
  { name: "Utensils", label: "Restaurant", icon: Utensils },
  { name: "Sparkles", label: "Beauty", icon: Sparkles },
  { name: "BookOpen", label: "Stationery", icon: BookOpen },
  { name: "Car", label: "Automobile", icon: Car },
  { name: "HeartPulse", label: "Medical", icon: HeartPulse },
  { name: "Scissors", label: "Salon", icon: Scissors },
];

function getCategoryIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || Store;
}

interface DiagnosticsData {
  status: string;
  database: {
    status: string;
    latencyMs: number;
  };
  uptime: number;
  nodeVersion: string;
  platform: string;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  counts: {
    businesses: number;
    users: number;
    orders: number;
    products: number;
  };
  loggerStats: LogStats;
  timestamp: string;
}




export const SuperAdmin: React.FC = () => {
  const { tenants, toggleTenantStatus, fetchTenants } = useBusiness();
  const [activeTab, setActiveTabState] = useState<"logs" | "users" | "categories" | "tenants" | "diagnostics">(() => {
    try {
      const saved = localStorage.getItem("qb_admin_tab");
      if (saved && ["logs", "users", "categories", "tenants", "diagnostics"].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return "tenants";
  });

  const setActiveTab = (tab: "logs" | "users" | "categories" | "tenants" | "diagnostics") => {
    setActiveTabState(tab);
    try {
      localStorage.setItem("qb_admin_tab", tab);
    } catch {}
    window.dispatchEvent(new CustomEvent("qb-admin-tab-updated", { detail: tab }));
  };

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail && ["logs", "users", "categories", "tenants", "diagnostics"].includes(e.detail)) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("qb-admin-tab-change", handleTabChange);
    return () => window.removeEventListener("qb-admin-tab-change", handleTabChange);
  }, []);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // --- Logs State ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logStats, setLogStats] = useState<LogStats | null>(null);
  const [logLevelFilter, setLogLevelFilter] = useState<string>("ALL");
  const [logSearchQuery, setLogSearchQuery] = useState<string>("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // --- Users State ---
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("ALL");
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

  // --- Categories State ---
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>("");
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);

  // Add Category Modal
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [newCatLabel, setNewCatLabel] = useState<string>("");
  const [newCatDesc, setNewCatDesc] = useState<string>("");
  const [newCatIcon, setNewCatIcon] = useState<string>("Store");
  const [newCatDefaults, setNewCatDefaults] = useState<string>("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState<boolean>(false);

  // Edit Category Modal
  const [editingCategory, setEditingCategory] = useState<BusinessCategory | null>(null);
  const [editCatLabel, setEditCatLabel] = useState<string>("");
  const [editCatDesc, setEditCatDesc] = useState<string>("");
  const [editCatIcon, setEditCatIcon] = useState<string>("Store");
  const [editCatDefaults, setEditCatDefaults] = useState<string>("");
  const [isUpdatingCategory, setIsUpdatingCategory] = useState<boolean>(false);

  // --- Admin Password Change Modal ---
  const [isAdminPassModalOpen, setIsAdminPassModalOpen] = useState<boolean>(false);
  const [adminCurrentPassword, setAdminCurrentPassword] = useState<string>("");
  const [adminNewPassword, setAdminNewPassword] = useState<string>("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState<string>("");
  const [showAdminPass, setShowAdminPass] = useState<boolean>(false);
  const [isSubmittingAdminPass, setIsSubmittingAdminPass] = useState<boolean>(false);

  // --- User Password Reset Modal ---
  const [passwordModalUser, setPasswordModalUser] = useState<PlatformUser | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false);

  // --- Role Modal ---
  const [roleModalUser, setRoleModalUser] = useState<PlatformUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Owner");
  const [isSubmittingRole, setIsSubmittingRole] = useState<boolean>(false);

  // --- Diagnostics State ---
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState<boolean>(false);

  // --- Tenants Search ---
  const [tenantSearchQuery, setTenantSearchQuery] = useState<string>("");

  // --- Onboard Merchant (Admin Creates Shop & Sends Credentials) ---
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState<boolean>(false);
  const [onboardOwnerName, setOnboardOwnerName] = useState<string>("");
  const [onboardBusinessName, setOnboardBusinessName] = useState<string>("");
  const [onboardPhone, setOnboardPhone] = useState<string>("");
  const [onboardEmail, setOnboardEmail] = useState<string>("");
  const [onboardPassword, setOnboardPassword] = useState<string>("");
  const [onboardBusinessType, setOnboardBusinessType] = useState<string>("Grocery Store");
  const [onboardPlan, setOnboardPlan] = useState<string>("Basic");
  const [onboardAddress, setOnboardAddress] = useState<string>("");
  const [showOnboardPass, setShowOnboardPass] = useState<boolean>(false);
  const [isOnboardingMerchant, setIsOnboardingMerchant] = useState<boolean>(false);
  
  interface CreatedMerchantCredentials {
    businessId: string;
    businessName: string;
    ownerName: string;
    phone: string;
    email: string;
    password: string;
    businessType: string;
    plan: string;
    address?: string;
    createdAt: string;
  }
  const [createdCredentials, setCreatedCredentials] = useState<CreatedMerchantCredentials | null>(null);
  const [copiedFullMessage, setCopiedFullMessage] = useState<boolean>(false);

  const generateRandomPassword = (name: string, phone: string) => {
    const cleanName = (name || "Store").trim().split(" ")[0].replace(/[^a-zA-Z]/g, "");
    const cap = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
    const digits = phone && phone.length >= 4 ? phone.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
    return `${cap || "Shop"}@${digits}`;
  };

  const getMerchantWhatsAppText = (creds: CreatedMerchantCredentials) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://quickbizs.com";
    return `🏪 *QuickBizs - Aapki Dukan Ka Login ID & Password*

Namaste *${creds.ownerName}* ji,
Aapki dukan *${creds.businessName}* ka QuickBizs store account successfully create ho gaya hai.

Niche diye gaye User ID aur Password se aap turant login kar sakte hain:

📱 *User ID / Mobile:* ${creds.phone}
🔑 *Password:* ${creds.password}
🏪 *Shop Category:* ${creds.businessType}
💎 *Subscription Plan:* ${creds.plan}

🌐 *Login Portal:* ${origin}

Aap turant login karke apni billing, inventory aur customer khata book shuru kar sakte hain.
Kisi bhi sahayata ke liye sampark karein: QuickBizs Master Support.`;
  };

  const handleShareWhatsApp = (creds: CreatedMerchantCredentials) => {
    const text = getMerchantWhatsAppText(creds);
    const cleanPhone = creds.phone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    showToast("Opening WhatsApp to send credentials...", "info");
  };

  const handleCopyFullCredentials = (creds: CreatedMerchantCredentials) => {
    const text = getMerchantWhatsAppText(creds);
    navigator.clipboard.writeText(text);
    setCopiedFullMessage(true);
    setTimeout(() => setCopiedFullMessage(false), 2500);
    showToast("Full login credentials copied to clipboard!", "success");
  };

  const handleShareEmail = (creds: CreatedMerchantCredentials) => {
    const text = getMerchantWhatsAppText(creds);
    const subject = `Your QuickBizs Store Login Details - ${creds.businessName}`;
    const url = `mailto:${creds.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleShareSMS = (creds: CreatedMerchantCredentials) => {
    const text = getMerchantWhatsAppText(creds);
    const cleanPhone = creds.phone.replace(/[^0-9]/g, "");
    const url = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleOnboardMerchantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardBusinessName.trim() || !onboardOwnerName.trim() || !onboardPhone.trim()) {
      showToast("Store Name, Owner Name, and Mobile Number are required.", "error");
      return;
    }
    if (!/^\d{10}$/.test(onboardPhone.trim())) {
      showToast("Mobile number must be exactly 10 digits.", "error");
      return;
    }

    setIsOnboardingMerchant(true);
    try {
      const res = await api.post("/admin/onboard-merchant", {
        businessName: onboardBusinessName.trim(),
        ownerName: onboardOwnerName.trim(),
        phone: onboardPhone.trim(),
        email: onboardEmail.trim() || undefined,
        password: onboardPassword.trim() || undefined,
        businessType: onboardBusinessType,
        plan: onboardPlan,
        address: onboardAddress.trim() || undefined,
      });

      if (res.data?.success && res.data.data) {
        showToast(`Store "${res.data.data.businessName}" created successfully!`);
        setCreatedCredentials(res.data.data);
        setIsOnboardModalOpen(false);
        setOnboardBusinessName("");
        setOnboardOwnerName("");
        setOnboardPhone("");
        setOnboardEmail("");
        setOnboardPassword("");
        setOnboardAddress("");
        fetchUsers();
        if (fetchTenants) fetchTenants();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to create store account.", "error");
    } finally {
      setIsOnboardingMerchant(false);
    }
  };


  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // Fetch System Logs
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const params: any = { limit: 300 };
      if (logLevelFilter !== "ALL") params.level = logLevelFilter;
      if (logSearchQuery.trim()) params.search = logSearchQuery.trim();

      const res = await api.get("/system/logs", { params });
      if (res.data?.success && res.data.data) {
        setLogs(res.data.data.logs || []);
        setLogStats(res.data.data.stats || null);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to fetch system logs.", "error");
    } finally {
      setIsLoadingLogs(false);
    }
  }, [logLevelFilter, logSearchQuery, showToast]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const params: any = {};
      if (userRoleFilter !== "ALL") params.role = userRoleFilter;
      if (userStatusFilter !== "ALL") params.status = userStatusFilter.toLowerCase();
      if (userSearchQuery.trim()) params.search = userSearchQuery.trim();

      const res = await api.get("/admin/users", { params });
      if (res.data?.success && res.data.data) {
        setUsers(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to fetch platform users.", "error");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [userRoleFilter, userStatusFilter, userSearchQuery, showToast]);

  // Fetch Business Categories
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const params: any = {};
      if (categorySearchQuery.trim()) params.search = categorySearchQuery.trim();

      const res = await api.get("/admin/business-categories", { params });
      if (res.data?.success && res.data.data) {
        setCategories(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to fetch business categories.", "error");
    } finally {
      setIsLoadingCategories(false);
    }
  }, [categorySearchQuery, showToast]);

  // Fetch Diagnostics
  const fetchDiagnostics = useCallback(async () => {
    setIsLoadingDiagnostics(true);
    try {
      const res = await api.get("/system/diagnostics");
      if (res.data?.success && res.data.data) {
        setDiagnostics(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to fetch diagnostics.", "error");
    } finally {
      setIsLoadingDiagnostics(false);
    }
  }, [showToast]);

  // Initial and reactive data fetching
  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "categories") {
      fetchCategories();
    } else if (activeTab === "diagnostics") {
      fetchDiagnostics();
    }
  }, [activeTab, fetchLogs, fetchUsers, fetchCategories, fetchDiagnostics]);

  // Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear the logs buffer? Recent history will be flushed.")) {
      return;
    }
    try {
      const res = await api.post("/system/logs/clear");
      if (res.data?.success) {
        showToast("System logs buffer flushed successfully.");
        fetchLogs();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to clear logs.", "error");
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async (user: PlatformUser) => {
    const nextStatus = !user.isActive;
    try {
      const res = await api.put(`/admin/users/${user.id}/status`, { isActive: nextStatus });
      if (res.data?.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: nextStatus } : u));
        showToast(`User ${user.name} is now ${nextStatus ? "Active" : "Suspended"}.`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update user status.", "error");
    }
  };

  // User Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    setIsSubmittingPassword(true);
    try {
      const res = await api.post(`/admin/users/${passwordModalUser.id}/reset-password`, {
        newPassword
      });
      if (res.data?.success) {
        showToast(`Password updated successfully for ${passwordModalUser.name}.`);
        setPasswordModalUser(null);
        setNewPassword("");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to reset password.", "error");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Admin Change Self Password Submit
  const handleChangeAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNewPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      showToast("New password and confirm password do not match.", "error");
      return;
    }

    setIsSubmittingAdminPass(true);
    try {
      const res = await api.post("/admin/change-password", {
        currentPassword: adminCurrentPassword || undefined,
        newPassword: adminNewPassword,
      });

      if (res.data?.success) {
        showToast("Master Admin password changed successfully! Please save your new password.");
        setIsAdminPassModalOpen(false);
        setAdminCurrentPassword("");
        setAdminNewPassword("");
        setAdminConfirmPassword("");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to change admin password.", "error");
    } finally {
      setIsSubmittingAdminPass(false);
    }
  };

  // Change Role Submit
  const handleChangeRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setIsSubmittingRole(true);
    try {
      const res = await api.put(`/admin/users/${roleModalUser.id}/role`, {
        role: selectedRole
      });
      if (res.data?.success) {
        setUsers(prev => prev.map(u => u.id === roleModalUser.id ? { ...u, role: selectedRole } : u));
        showToast(`Role updated to ${selectedRole} for ${roleModalUser.name}.`);
        setRoleModalUser(null);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to change user role.", "error");
    } finally {
      setIsSubmittingRole(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: PlatformUser) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove ${user.name} (${user.email})?`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/users/${user.id}`);
      if (res.data?.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        showToast(`User ${user.name} removed successfully.`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to delete user.", "error");
    }
  };

  // Add Business Category Submit
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) {
      showToast("Category title is required.", "error");
      return;
    }

    setIsSubmittingCategory(true);
    try {
      const defaultCategories = newCatDefaults
        ? newCatDefaults.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const res = await api.post("/admin/business-categories", {
        label: newCatLabel.trim(),
        desc: newCatDesc.trim() || `${newCatLabel.trim()} Products & Supplies`,
        icon: newCatIcon,
        defaultCategories,
      });

      if (res.data?.success) {
        showToast(res.data.message || `Category "${newCatLabel}" added successfully.`);
        setIsAddCategoryOpen(false);
        setNewCatLabel("");
        setNewCatDesc("");
        setNewCatIcon("Store");
        setNewCatDefaults("");
        fetchCategories();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to add business category.", "error");
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Update Business Category Submit
  const handleUpdateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatLabel.trim()) return;

    setIsUpdatingCategory(true);
    try {
      const defaultCategories = editCatDefaults
        ? editCatDefaults.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const res = await api.put(`/admin/business-categories/${encodeURIComponent(editingCategory.id)}`, {
        label: editCatLabel.trim(),
        desc: editCatDesc.trim(),
        icon: editCatIcon,
        defaultCategories,
      });

      if (res.data?.success) {
        showToast(res.data.message || `Category updated successfully.`);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update category.", "error");
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // Delete Business Category
  const handleDeleteCategory = async (cat: BusinessCategory) => {
    const storeWarning = cat.storeCount > 0 
      ? ` Warning: ${cat.storeCount} active store(s) are using this vertical.` 
      : "";
    if (!window.confirm(`Are you sure you want to delete "${cat.label}"?${storeWarning}`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/business-categories/${encodeURIComponent(cat.id)}`);
      if (res.data?.success) {
        showToast(`Category "${cat.label}" deleted.`);
        setCategories(prev => prev.filter(c => c.id !== cat.id));
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to delete category.", "error");
    }
  };

  // Copy Clean Human-Readable Error Summary
  const handleCopyLog = (log: LogEntry) => {
    const info = getLogInterpretation(log);
    const textToCopy = `🚨 QuickBizs System Log Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Level: ${log.level}
🏷️ Category: ${info.category}
⏰ Time: ${new Date(log.timestamp).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Summary: ${info.simplifiedTitle}
🔍 Root Cause: ${info.explanation}
${info.isActionRequired !== false ? `💡 Fix & Resolution: ${info.suggestedAction}\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ Technical Message: ${log.message}
${log.details ? `\n🔍 Stack Trace:\n${log.details}` : ""}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
    showToast("Error report copied to clipboard!", "success");
  };

  // Tenants filtering
  const filteredTenants = useMemo(() => {
    return tenants.filter(t =>
      t.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
      t.plan.toLowerCase().includes(tenantSearchQuery.toLowerCase())
    );
  }, [tenants, tenantSearchQuery]);

  const totalMonthlyEarnings = useMemo(() => {
    return tenants
      .filter(t => t.status === "Active")
      .reduce((acc, t) => {
        const planPrice = t.plan === "Premium" ? 2500 : t.plan === "Enterprise" ? 9000 : 1000;
        return acc + planPrice;
      }, 0);
  }, [tenants]);

  const activeTenantsCount = tenants.filter(t => t.status === "Active").length;

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 w-full max-w-6xl mx-auto space-y-3 sm:space-y-4 pb-20 lg:pb-8 text-slate-900 dark:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-3 sm:top-5 right-3 sm:right-5 left-3 sm:left-auto z-50 px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-xl border backdrop-blur-xl ${
              toastMsg.type === "error"
                ? "bg-rose-950/95 border-rose-800 text-rose-200"
                : toastMsg.type === "info"
                  ? "bg-sky-950/95 border-sky-800 text-sky-200"
                  : "bg-slate-900/95 border-slate-800 text-emerald-400"
            }`}
          >
            {toastMsg.type === "error" ? (
              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : toastMsg.type === "info" ? (
              <Info className="h-4 w-4 text-sky-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-bold text-white flex-1">{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                Admin Console
              </h1>
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-500 border border-rose-500/25 shrink-0">
                Root
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate mt-0.5">
              Live monitoring, merchant stores, users &amp; system health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Onboard New Merchant Button */}
          <button
            onClick={() => {
              setOnboardOwnerName("");
              setOnboardBusinessName("");
              setOnboardPhone("");
              setOnboardEmail("");
              setOnboardPassword("");
              setOnboardAddress("");
              setIsOnboardModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Create store account for shopkeeper"
          >
            <UserPlus className="h-3.5 w-3.5 shrink-0" />
            <span>+ Onboard Merchant</span>
          </button>

          {/* Change Admin Password Button */}
          <button
            onClick={() => setIsAdminPassModalOpen(true)}
            className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer border border-amber-200/60 dark:border-amber-500/20 active:scale-95"
            title="Change Master Admin Password"
          >
            <KeyRound className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Pass</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              if (activeTab === "logs") fetchLogs();
              else if (activeTab === "users") fetchUsers();
              else if (activeTab === "categories") fetchCategories();
              else if (activeTab === "diagnostics") fetchDiagnostics();
              showToast("Refreshing data...", "info");
            }}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
            title="Refresh current module"
          >
            <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isLoadingLogs || isLoadingUsers || isLoadingCategories || isLoadingDiagnostics ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* TAB 1: LIVE ERROR & SYSTEM LOGS                                           */}
      {/* ========================================================================= */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Errors</p>
                <p className="text-xl font-black text-rose-500 mt-0.5">{logStats?.errors ?? 0}</p>
              </div>
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Warnings</p>
                <p className="text-xl font-black text-amber-500 mt-0.5">{logStats?.warnings ?? 0}</p>
              </div>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Info className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Events</p>
                <p className="text-xl font-black text-emerald-500 mt-0.5">{logStats?.infos ?? 0}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Depth</p>
                <p className="text-xl font-black text-slate-700 dark:text-slate-300 mt-0.5">
                  {logStats?.total ?? 0} <span className="text-[10px] font-normal text-slate-400">/ {logStats?.bufferCapacity ?? 1000}</span>
                </p>
              </div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
                <Layers className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0 no-scrollbar">
              {[
                { id: "ALL", label: "All" },
                { id: "ERROR", label: "Errors", count: logStats?.errors },
                { id: "WARN", label: "Warn", count: logStats?.warnings },
                { id: "INFO", label: "Info", count: logStats?.infos },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLogLevelFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0 ${
                    logLevelFilter === f.id
                      ? f.id === "ERROR"
                        ? "bg-rose-500 text-white"
                        : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <span>{f.label}</span>
                  {f.count !== undefined && f.count > 0 && (
                    <span className="text-[9px] px-1 py-0.2 rounded-full bg-black/20 text-white font-mono">
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Search logs or trace..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <button
                onClick={handleClearLogs}
                title="Flush log buffer"
                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Timestamp &amp; Event</span>
              <span>Level &amp; Actions</span>
            </div>

            {isLoadingLogs ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand-orange" />
                <p className="text-xs font-bold">Streaming system logs from server buffer...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">System Running Clean</p>
                <p className="text-xs">No matching logs or errors found in the current buffer filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs p-2 space-y-2">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isError = log.level === "ERROR";
                  const isWarn = log.level === "WARN";
                  const info = getLogInterpretation(log);

                  return (
                    <div
                      key={log.id}
                      className={`p-4 transition-all rounded-xl border ${
                        isError
                          ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                          : isWarn
                            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                            : "bg-slate-50/60 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {/* Top Row: Badges, Simplified Title & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1 font-sans">
                          {/* Level Badge */}
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isError ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30" : isWarn ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30" : "bg-emerald-500 text-white"
                          }`}>
                            {isError ? <AlertTriangle className="h-4 w-4" /> : isWarn ? <Info className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                                isError ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : isWarn ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              }`}>
                                {log.level}
                              </span>

                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                🏷️ {info.category}
                              </span>

                              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Easy-To-Understand Title */}
                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                              {info.simplifiedTitle}
                            </h4>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start font-sans">
                          <button
                            type="button"
                            onClick={() => handleCopyLog(log)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                            title="Copy clean error report"
                          >
                            {copiedLogId === log.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                                <span>Copy Report</span>
                              </>
                            )}
                          </button>

                          {log.details && (
                            <button
                              type="button"
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                                isExpanded
                                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                                  : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <span>{isExpanded ? "Hide Trace" : "Tech Trace"}</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Plain-Language Explanation & Solution Card */}
                      <div className="mt-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5 font-sans">
                        <div className="flex items-start gap-2.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5 ${
                            isError 
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" 
                              : isWarn 
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {isError || isWarn ? "Root Cause" : "Event Summary"}
                          </span>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                            {info.explanation}
                          </p>
                        </div>

                        {(isError || isWarn || info.isActionRequired) && (
                          <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Lightbulb className="h-3 w-3 text-amber-500" />
                              How to Fix &amp; Where to Check
                            </span>
                            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 leading-relaxed whitespace-pre-line space-y-1">
                              {info.suggestedAction}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expandable Technical Developer Stack Trace */}
                      {isExpanded && log.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3.5 bg-slate-950 text-rose-300 rounded-xl overflow-x-auto text-[11px] leading-relaxed border border-slate-800 font-mono shadow-inner"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-800 font-sans">
                            <span className="font-bold uppercase tracking-wider text-slate-400">
                              Developer Error Details &amp; Raw Stack Trace
                            </span>
                            <span className="text-[9px] text-slate-500">Node.js Server Runtime</span>
                          </div>
                          <div className="text-xs text-rose-200 font-bold mb-2">
                            Raw Message: {log.message}
                          </div>
                          <pre className="whitespace-pre-wrap break-all text-[11px] font-mono text-slate-300">
                            {log.details}
                          </pre>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT                                                    */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user, email, store..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="SuperAdmin">SuperAdmin</option>
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Accountant">Accountant</option>
                <option value="Warehouse">Warehouse</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900 dark:text-white">{users.length}</span> user accounts
            </div>
          </div>

          {/* Mobile-Optimized Cards for Users (< md) */}
          <div className="md:hidden space-y-3">
            {isLoadingUsers ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500 mb-2" />
                <p className="text-xs font-bold">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <p className="text-xs font-bold">No users found.</p>
              </div>
            ) : (
              users.map((u) => {
                const isSuper = u.role === "SuperAdmin";
                return (
                  <div
                    key={u.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm">
                            {u.name}
                          </h4>
                          {isSuper && (
                            <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.2 rounded font-black">
                              MASTER
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all mt-0.5">
                          {u.email}
                        </p>
                        {u.phone && (
                          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                            📞 {u.phone}
                          </p>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                        u.isActive
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                        {u.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase text-slate-400">Business / Store</p>
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{u.businessName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-extrabold uppercase text-slate-400">Role &amp; Plan</p>
                        <p className="font-bold text-amber-600 dark:text-amber-400">{u.role} · {u.businessPlan}</p>
                      </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${
                          u.isActive
                            ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {u.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        <span>{u.isActive ? "Suspend" : "Active"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setRoleModalUser(u);
                          setSelectedRole(u.role);
                        }}
                        className="py-2 px-1 rounded-xl text-[11px] font-extrabold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-all cursor-pointer text-center"
                      >
                        Role
                      </button>

                      <button
                        onClick={() => {
                          setPasswordModalUser(u);
                          setNewPassword("");
                        }}
                        className="py-2 px-1 rounded-xl text-[11px] font-extrabold bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <KeyRound className="h-3 w-3" />
                        <span>Pass</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={isSuper}
                        className="py-2 px-1 rounded-xl text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-400 hover:text-rose-500 disabled:opacity-30 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Business / Tenant</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand-orange mb-2" />
                        <p className="text-xs font-bold">Loading users across stores...</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400">
                        No platform users matched the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isSuperAdmin = u.role === "SuperAdmin";
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                <span>{u.name}</span>
                                {isSuperAdmin && (
                                  <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.2 rounded font-black">
                                    MASTER
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{u.email}</p>
                              {u.phone && <p className="text-[10px] text-slate-400 font-sans mt-0.5">📞 {u.phone}</p>}
                            </div>
                          </td>

                          <td className="p-4">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{u.businessName}</p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                Plan: {u.businessPlan}
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              isSuperAdmin
                                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900"
                                : u.role === "Owner"
                                  ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              u.isActive
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}>
                              {u.isActive ? "Active" : "Suspended"}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                  u.isActive
                                    ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                    : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                }`}
                                title={u.isActive ? "Suspend user" : "Activate user"}
                              >
                                {u.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                <span className="hidden sm:inline">{u.isActive ? "Suspend" : "Activate"}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRoleModalUser(u);
                                  setSelectedRole(u.role);
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                                title="Change User Role"
                              >
                                Role
                              </button>

                              <button
                                onClick={() => {
                                  setPasswordModalUser(u);
                                  setNewPassword("");
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 cursor-pointer transition-colors flex items-center gap-1"
                                title="Reset User Password"
                              >
                                <KeyRound className="h-3 w-3" />
                                <span className="hidden sm:inline">Pass</span>
                              </button>

                              {!isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUSINESS CATEGORIES (STORE VERTICALS)                              */}
      {/* ========================================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search retail vertical or business category..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="text-xs font-bold text-slate-500">
                Total <span className="text-slate-900 dark:text-white">{categories.length}</span> Business Categories
              </div>
            </div>

            <button
              onClick={() => {
                setNewCatLabel("");
                setNewCatDesc("");
                setNewCatIcon("Store");
                setNewCatDefaults("");
                setIsAddCategoryOpen(true);
              }}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
            >
              <FolderPlus className="h-4 w-4" />
              <span>+ Add Extra Category</span>
            </button>
          </div>

          {/* Cards Grid */}
          {isLoadingCategories ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-400">
              <RefreshCw className="h-7 w-7 animate-spin mx-auto text-brand-orange mb-3" />
              <p className="text-xs font-bold">Loading business categories &amp; store verticals...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-400">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No categories found matching your query.</p>
              <p className="text-xs text-slate-400 mt-1">Click "+ Add Extra Category" to create a new business vertical.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.icon);
                return (
                  <div
                    key={cat.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar with Icon & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-2xl ring-1 ring-brand-orange/20 shrink-0 group-hover:scale-105 transition-transform">
                          <IconComponent className="h-5 w-5" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {cat.storeCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {cat.storeCount} {cat.storeCount === 1 ? "Store" : "Stores"}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                              0 Stores
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditCatLabel(cat.label);
                              setEditCatDesc(cat.desc);
                              setEditCatIcon(cat.icon || "Store");
                              setEditCatDefaults((cat.defaultCategories || []).join(", "));
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">
                        {cat.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                        {cat.desc}
                      </p>

                      {/* Sub-categories Preview Chips */}
                      {cat.defaultCategories && cat.defaultCategories.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Sub-categories ({cat.defaultCategories.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {cat.defaultCategories.slice(0, 3).map((sub, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                              >
                                {sub}
                              </span>
                            ))}
                            {cat.defaultCategories.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400">
                                +{cat.defaultCategories.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status / Badges */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">ID: {cat.id}</span>
                      {cat.isCustom ? (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800">
                          Custom
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                          Built-in
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STORES & TENANTS                                                    */}
      {/* ========================================================================= */}
      {activeTab === "tenants" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Run-rate</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 font-sans">
                    ₹{totalMonthlyEarnings.toLocaleString()}
                  </h3>
                </div>
                <div className="p-2 rounded-lg text-emerald-500 bg-emerald-500/10">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[10px] font-medium text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                {activeTenantsCount} active stores
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Stores</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 font-sans">
                    {activeTenantsCount} / {tenants.length}
                  </h3>
                </div>
                <div className="p-2 rounded-lg text-brand-orange bg-brand-orange/10">
                  <Store className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[10px] font-medium text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                {tenants.filter(t => t.status === "Suspended").length} suspended
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enterprise Accounts</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 font-sans">
                    {tenants.filter(t => t.plan === "Enterprise").length}
                  </h3>
                </div>
                <div className="p-2 rounded-lg text-purple-500 bg-purple-500/10">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[10px] font-medium text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                Dedicated support
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cluster Health</p>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-500 mt-1 font-sans">
                    99.98%
                  </h3>
                </div>
                <div className="p-2 rounded-lg text-slate-500 bg-slate-100 dark:bg-slate-800">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[10px] font-medium text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                All cloud clusters online
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Stores Directory</span>
                <span className="text-[10px] bg-slate-900 dark:bg-slate-800 text-white px-2 py-0.2 rounded-full font-bold">
                  {tenants.length}
                </span>
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={tenantSearchQuery}
                  onChange={(e) => setTenantSearchQuery(e.target.value)}
                  placeholder="Search store name or plan..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                />
              </div>
            </div>

            {/* Mobile Cards for Stores (< md) */}
            <div className="md:hidden space-y-3">
              {filteredTenants.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                  <p className="text-xs font-bold">No stores found.</p>
                </div>
              ) : (
                filteredTenants.map((t) => {
                  const isActive = t.status === "Active";
                  return (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm">
                            {t.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {t.id}
                          </p>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                          isActive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase text-slate-400">Plan</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block mt-0.5 border ${
                            t.plan === "Enterprise"
                              ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                              : t.plan === "Premium"
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}>
                            {t.plan}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-extrabold uppercase text-slate-400">Processed</p>
                          <p className="font-bold text-slate-900 dark:text-white">{t.salesCount || 0} orders</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          toggleTenantStatus(t.id);
                          showToast(`${isActive ? "Suspended" : "Activated"} tenant subscription: ${t.name}`);
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                          isActive
                            ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
                            : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                        }`}
                      >
                        {isActive ? "Suspend Store" : "Re-activate Store"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="p-4">Store Name &amp; ID</th>
                      <th className="p-4">Subscription Plan</th>
                      <th className="p-4">Billing Volume</th>
                      <th className="p-4">Store Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                    {filteredTenants.map((t) => {
                      const isActive = t.status === "Active";
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-white text-sm">{t.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">ID: {t.id}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              t.plan === "Enterprise"
                                ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                                : t.plan === "Premium"
                                  ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                                  : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800"
                            }`}>
                              {t.plan}
                            </span>
                          </td>
                          <td className="p-4 font-sans text-slate-600 dark:text-slate-400">
                            {t.salesCount || 0} orders processed
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              isActive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                toggleTenantStatus(t.id);
                                showToast(`${isActive ? "Suspended" : "Activated"} tenant subscription: ${t.name}`);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors ${
                                isActive
                                  ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-600 dark:text-rose-400"
                                  : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {isActive ? "Suspend Store" : "Re-activate Store"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SYSTEM DIAGNOSTICS                                                 */}
      {/* ========================================================================= */}
      {activeTab === "diagnostics" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-brand-orange" />
                  Live Platform Health &amp; Infrastructure
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time database connection metrics, memory heaps, process uptime, and platform records
                </p>
              </div>

              <button
                onClick={fetchDiagnostics}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDiagnostics ? "animate-spin" : ""}`} />
                Run Diagnostics Ping
              </button>
            </div>

            {isLoadingDiagnostics && !diagnostics ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-orange mb-2" />
                <p className="text-xs font-bold">Querying system database and memory heaps...</p>
              </div>
            ) : diagnostics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Database Engine</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      diagnostics.database.status === "Connected" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    }`}>
                      {diagnostics.database.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                      {diagnostics.database.latencyMs} <span className="text-xs font-normal text-slate-400">ms ping</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Prisma PostgreSQL client</p>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Node.js Memory (RSS)</span>
                    <span className="text-xs font-mono font-bold text-slate-500">{diagnostics.nodeVersion}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                      {diagnostics.memory.rssMb} <span className="text-xs font-normal text-slate-400">MB RSS</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Heap Used: {diagnostics.memory.heapUsedMb} MB / {diagnostics.memory.heapTotalMb} MB
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Backend Uptime</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{diagnostics.platform}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-slate-900 dark:text-white font-sans">
                      {formatUptime(diagnostics.uptime)}
                    </p>
                    <p className="text-[11px] text-slate-500">Continuous uninterrupted service</p>
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                    Aggregated Platform Entities
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold">Businesses</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{diagnostics.counts.businesses}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold">Total Users</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{diagnostics.counts.users}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold">Processed Orders</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{diagnostics.counts.orders}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold">Catalog Products</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{diagnostics.counts.products}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EXTRA BUSINESS CATEGORY                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-xl">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Add Extra Business Category</h3>
                    <p className="text-xs text-slate-500 font-semibold">Creates a new store vertical available in merchant registration</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category Title / Business Vertical Name *
                  </label>
                  <input
                    type="text"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="e.g. Restaurant & Cafe, Gym & Fitness..."
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subtitle / Short Description
                  </label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="e.g. Dine-in, Takeaway & Bar, Supplements & Equipment..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Icon
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    {AVAILABLE_ICONS.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = newCatIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setNewCatIcon(item.name)}
                          className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-orange text-white shadow-xs font-bold scale-105"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                          title={item.label}
                        >
                          <IconComp className="h-4 w-4" />
                          <span className="text-[9px] truncate max-w-full">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Default Inventory Sub-categories (Comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={newCatDefaults}
                    onChange={(e) => setNewCatDefaults(e.target.value)}
                    placeholder="e.g. Main Course, Beverages, Starters, Desserts, Chinese"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    These default inventory categories will be auto-populated for any new store created under this vertical.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCategory || !newCatLabel.trim()}
                    className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    {isSubmittingCategory ? "Adding Category..." : "Confirm & Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: EDIT BUSINESS CATEGORY                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
                    <Edit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Edit Business Category</h3>
                    <p className="text-xs text-slate-500 font-semibold">{editingCategory.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category Title / Name *
                  </label>
                  <input
                    type="text"
                    value={editCatLabel}
                    onChange={(e) => setEditCatLabel(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subtitle / Short Description
                  </label>
                  <input
                    type="text"
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Change Icon
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    {AVAILABLE_ICONS.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = editCatIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setEditCatIcon(item.name)}
                          className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-orange text-white shadow-xs font-bold scale-105"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                          title={item.label}
                        >
                          <IconComp className="h-4 w-4" />
                          <span className="text-[9px] truncate max-w-full">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Default Inventory Sub-categories (Comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={editCatDefaults}
                    onChange={(e) => setEditCatDefaults(e.target.value)}
                    placeholder="e.g. Dairy, Grocery, Snacks, Drinks"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingCategory || !editCatLabel.trim()}
                    className="bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    {isUpdatingCategory ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: CHANGE ADMIN PASSWORD                                              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAdminPassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Change Master Admin Password</h3>
                    <p className="text-xs text-slate-500 font-semibold">Update credentials for ID: admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdminPassModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangeAdminPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password (Optional if already logged in)
                  </label>
                  <input
                    type={showAdminPass ? "text" : "password"}
                    value={adminCurrentPassword}
                    onChange={(e) => setAdminCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPass ? "text" : "password"}
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters..."
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showAdminPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showAdminPass ? "text" : "password"}
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password..."
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminPassModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdminPass || adminNewPassword.length < 6 || adminNewPassword !== adminConfirmPassword}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    {isSubmittingAdminPass ? "Updating Password..." : "Save Admin Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: RESET USER PASSWORD                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {passwordModalUser && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Reset User Password</h3>
                    <p className="text-xs text-slate-500 font-semibold">{passwordModalUser.name} · {passwordModalUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPasswordModalUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Plaintext Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters..."
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    This password will be securely hashed with bcrypt and immediate session invalidation will be triggered.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordModalUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPassword || newPassword.length < 6}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    {isSubmittingPassword ? "Resetting..." : "Save New Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: CHANGE ROLE                                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {roleModalUser && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Change User Role</h3>
                  <p className="text-xs text-slate-500 font-semibold">{roleModalUser.name} · {roleModalUser.businessName}</p>
                </div>
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangeRoleSubmit} className="space-y-4">
                <div className="space-y-2">
                  {[
                    { id: "SuperAdmin", title: "SuperAdmin (Master Control)", desc: "Global SaaS administration, system logs & tenant management" },
                    { id: "Owner", title: "Business Owner", desc: "Full store management, inventory, POS, reports & settings" },
                    { id: "Manager", title: "Store Manager", desc: "Floor supervision, stock adjustments & POS" },
                    { id: "Cashier", title: "Cashier Terminal", desc: "High-speed POS billing and customer khata lookups" },
                    { id: "Accountant", title: "Accountant", desc: "Khata ledger, recovery dues, tax reports" },
                    { id: "Warehouse", title: "Warehouse Staff", desc: "Inventory counts, stock shipments & dispatch" },
                  ].map((roleOption) => (
                    <label
                      key={roleOption.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedRole === roleOption.id
                          ? "bg-slate-900 text-white dark:bg-slate-800 border-slate-900 dark:border-slate-700"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value={roleOption.id}
                        checked={selectedRole === roleOption.id}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className={`text-xs font-bold ${selectedRole === roleOption.id ? "text-white" : "text-slate-900 dark:text-white"}`}>
                          {roleOption.title}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${selectedRole === roleOption.id ? "text-slate-300" : "text-slate-500"}`}>
                          {roleOption.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRoleModalUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRole}
                    className="bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    {isSubmittingRole ? "Updating..." : "Confirm Role Change"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    
      {/* ========================================================================= */}
      {/* MODAL: ONBOARD NEW MERCHANT / SHOP (ADMIN DIRECT CREATION)                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOnboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl ring-4 ring-emerald-500/10">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Onboard New Merchant / Shop
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Create store account &amp; directly send User ID &amp; Password
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleOnboardMerchantSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Store / Business Name *
                    </label>
                    <input
                      type="text"
                      value={onboardBusinessName}
                      onChange={(e) => setOnboardBusinessName(e.target.value)}
                      placeholder="e.g. Ramesh Kirana Store"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Owner Full Name *
                    </label>
                    <input
                      type="text"
                      value={onboardOwnerName}
                      onChange={(e) => setOnboardOwnerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number (Primary User ID) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={onboardPhone}
                        onChange={(e) => setOnboardPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={onboardEmail}
                      onChange={(e) => setOnboardEmail(e.target.value)}
                      placeholder="Auto-generated if left blank"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Business Category / Vertical *
                    </label>
                    <select
                      value={onboardBusinessType}
                      onChange={(e) => setOnboardBusinessType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subscription Plan
                    </label>
                    <select
                      value={onboardPlan}
                      onChange={(e) => setOnboardPlan(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Basic">Basic Plan (Standard POS &amp; Khata)</option>
                      <option value="Premium">Premium Plan (Full Multi-staff &amp; Barcode)</option>
                      <option value="Enterprise">Enterprise Plan (Unlimited Scale)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Merchant Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setOnboardPassword(generateRandomPassword(onboardOwnerName, onboardPhone))}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>⚡ Auto-Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showOnboardPass ? "text" : "password"}
                      value={onboardPassword}
                      onChange={(e) => setOnboardPassword(e.target.value)}
                      placeholder="e.g. Ramesh@3210 (or click Auto-Generate)"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOnboardPass(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showOnboardPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Leave blank to automatically generate a friendly password like <code>FirstName@Last4Digits</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Store Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={onboardAddress}
                    onChange={(e) => setOnboardAddress(e.target.value)}
                    placeholder="e.g. Shop #14, Main Gandhi Market"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsOnboardModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isOnboardingMerchant || !onboardBusinessName.trim() || !onboardOwnerName.trim() || !onboardPhone.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    {isOnboardingMerchant ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Create Store &amp; Generate Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: DIRECT SEND CREDENTIALS (WHATSAPP / SMS / COPY)                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {createdCredentials && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center space-y-2">
                <div className="h-14 w-14 mx-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center ring-8 ring-emerald-500/10">
                  <CheckCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Store Account Created Successfully!
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Login details are ready. Direct shopkeeper ko WhatsApp ya message send karein:
                </p>
              </div>

              {/* Credentials Highlight Box */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Name</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{createdCredentials.businessName}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {createdCredentials.plan} Plan
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User ID / Mobile</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{createdCredentials.phone}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdCredentials.phone);
                          showToast("User ID copied!", "info");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Copy User ID"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{createdCredentials.password}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdCredentials.password);
                          showToast("Password copied!", "info");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Copy Password"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <p>👤 <strong>Owner Name:</strong> {createdCredentials.ownerName}</p>
                  <p>🏪 <strong>Shop Category:</strong> {createdCredentials.businessType}</p>
                  <p>🌐 <strong>Login Portal:</strong> <span className="font-mono text-slate-700 dark:text-slate-300">{typeof window !== "undefined" ? window.location.origin : "https://quickbizs.com"}</span></p>
                </div>
              </div>

              {/* Direct Actions: Send WhatsApp, Copy, Email, SMS */}
              <div className="space-y-2.5">
                {/* 1. Direct WhatsApp Button */}
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(createdCredentials)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>📲 Send User ID &amp; Password via WhatsApp (+91 {createdCredentials.phone})</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  {/* 2. Copy Complete Message Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyFullCredentials(createdCredentials)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copiedFullMessage ? "Copied!" : "Copy All"}</span>
                  </button>

                  {/* 3. Send via SMS */}
                  <button
                    type="button"
                    onClick={() => handleShareSMS(createdCredentials)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send SMS</span>
                  </button>

                  {/* 4. Send via Email */}
                  <button
                    type="button"
                    onClick={() => handleShareEmail(createdCredentials)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setCreatedCredentials(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer underline"
                >
                  Close &amp; Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};