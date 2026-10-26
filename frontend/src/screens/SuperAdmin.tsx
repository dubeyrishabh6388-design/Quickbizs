import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  CheckCircle2, 
  Search, 
  DollarSign, 
  Users,
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
  Cpu,
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
  Scissors
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
}

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
  const { tenants, toggleTenantStatus } = useBusiness();
  const [activeTab, setActiveTab] = useState<"logs" | "users" | "categories" | "tenants" | "diagnostics">("logs");
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

  // Copy Stack Trace
  const handleCopyLog = (log: LogEntry) => {
    const textToCopy = `[${log.timestamp}] [${log.level}] : ${log.message}\n${log.details || ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
    showToast("Log details copied to clipboard.", "info");
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
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl flex items-center gap-2.5 shadow-2xl border ${
              toastMsg.type === "error"
                ? "bg-rose-950 border-rose-800 text-rose-200"
                : toastMsg.type === "info"
                  ? "bg-sky-950 border-sky-800 text-sky-200"
                  : "bg-slate-900 border-slate-800 text-emerald-400"
            }`}
          >
            {toastMsg.type === "error" ? (
              <XCircle className="h-5 w-5 text-rose-400" />
            ) : toastMsg.type === "info" ? (
              <Info className="h-5 w-5 text-sky-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
            <span className="text-xs font-bold text-white">{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Console Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl ring-4 ring-rose-500/10">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Master Admin Control Center
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Root Admin
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Full system control · Live error monitoring &amp; stack traces · Categories &amp; user management · Platform diagnostics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Change Admin Password Button */}
          <button
            onClick={() => setIsAdminPassModalOpen(true)}
            className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-amber-200/60 dark:border-amber-500/20"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Change Admin Password
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              if (activeTab === "logs") fetchLogs();
              else if (activeTab === "users") fetchUsers();
              else if (activeTab === "categories") fetchCategories();
              else if (activeTab === "diagnostics") fetchDiagnostics();
              showToast("Refreshing admin data...", "info");
            }}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLogs || isLoadingUsers || isLoadingCategories || isLoadingDiagnostics ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        {[
          { 
            id: "logs", 
            label: "Live Error & Logs", 
            icon: Activity, 
            badge: logStats?.errors ? `${logStats.errors} Errors` : undefined,
            badgeColor: logStats?.errors ? "bg-rose-500 text-white" : ""
          },
          { 
            id: "users", 
            label: "User Management", 
            icon: Users,
            badge: users.length ? `${users.length}` : undefined,
            badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          },
          { 
            id: "categories", 
            label: "Category Management", 
            icon: Tag,
            badge: categories.length ? `${categories.length}` : undefined,
            badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          },
          { 
            id: "tenants", 
            label: "Stores & Tenants", 
            icon: Store,
            badge: `${tenants.length}`,
            badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          },
          { 
            id: "diagnostics", 
            label: "System Diagnostics", 
            icon: Cpu 
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE ERROR & SYSTEM LOGS                                           */}
      {/* ========================================================================= */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Errors Recorded</p>
                <p className="text-2xl font-black text-rose-500 mt-1">{logStats?.errors ?? 0}</p>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Warnings</p>
                <p className="text-2xl font-black text-amber-500 mt-1">{logStats?.warnings ?? 0}</p>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <Info className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Info / Events</p>
                <p className="text-2xl font-black text-emerald-500 mt-1">{logStats?.infos ?? 0}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Buffer Depth</p>
                <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                  {logStats?.total ?? 0} <span className="text-xs font-normal text-slate-400">/ {logStats?.bufferCapacity ?? 1000}</span>
                </p>
              </div>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: "ALL", label: "All Logs" },
                { id: "ERROR", label: "Errors Only", count: logStats?.errors },
                { id: "WARN", label: "Warnings", count: logStats?.warnings },
                { id: "INFO", label: "Info", count: logStats?.infos },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLogLevelFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    logLevelFilter === f.id
                      ? f.id === "ERROR"
                        ? "bg-rose-500 text-white"
                        : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <span>{f.label}</span>
                  {f.count !== undefined && f.count > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Search logs or stack trace..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                onClick={handleClearLogs}
                title="Flush log buffer"
                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear Buffer</span>
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
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-xs">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isError = log.level === "ERROR";
                  const isWarn = log.level === "WARN";

                  return (
                    <div
                      key={log.id}
                      className={`p-3.5 transition-colors ${
                        isError
                          ? "bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/30"
                          : isWarn
                            ? "bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/50"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 tracking-wider ${
                              isError
                                ? "bg-rose-500 text-white"
                                : isWarn
                                  ? "bg-amber-500 text-white"
                                  : "bg-emerald-500 text-white"
                            }`}
                          >
                            {log.level}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="text-slate-800 dark:text-slate-100 font-sans font-bold text-xs break-words">
                              {log.message}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-sans text-slate-400 font-semibold">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                              </span>
                              <span>ID: {log.id}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 font-sans">
                          <button
                            onClick={() => handleCopyLog(log)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Copy log entry"
                          >
                            {copiedLogId === log.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {log.details && (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>{isExpanded ? "Hide Details" : "Stack Trace"}</span>
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && log.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-slate-900 text-rose-300 rounded-xl overflow-x-auto text-[11px] leading-relaxed border border-slate-800 font-mono"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 mb-2 border-b border-slate-800 font-sans">
                            <span className="font-bold uppercase tracking-wider text-slate-400">Error Payload / Stack Trace</span>
                            <span className="text-[9px]">Captured by Application Logger</span>
                          </div>
                          <pre className="whitespace-pre-wrap break-all">{log.details}</pre>
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

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SaaS Revenue Run-rate</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-sans">
                    ₹{totalMonthlyEarnings.toLocaleString()}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-500/10">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                {activeTenantsCount} active paying businesses
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Stores</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-sans">
                    {activeTenantsCount} / {tenants.length}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl text-brand-orange bg-brand-orange/10">
                  <Store className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                {tenants.filter(t => t.status === "Suspended").length} stores suspended
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enterprise Accounts</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-sans">
                    {tenants.filter(t => t.plan === "Enterprise").length}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl text-purple-500 bg-purple-500/10">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                Unlimited scale &amp; dedicated support
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Health Status</p>
                  <h3 className="text-2xl font-black text-emerald-500 mt-1.5 font-sans">
                    99.98%
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                All cloud clusters operational
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Business Stores Directory</span>
                <span className="text-xs bg-slate-900 dark:bg-slate-800 text-white px-2 py-0.5 rounded-full font-bold">
                  {tenants.length} Total
                </span>
              </h3>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={tenantSearchQuery}
                  onChange={(e) => setTenantSearchQuery(e.target.value)}
                  placeholder="Search store name or plan..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
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

    </div>
  );
};
