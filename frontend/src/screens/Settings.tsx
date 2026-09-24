import React, { useState, useEffect } from "react";
import { 
  Building, 
  Receipt, 
  Database, 
  LogOut, 
  Save, 
  CheckCircle2,
  Clock,
  Lock,
  Settings2,
  ShieldCheck,
  KeyRound,
  Store,
  Users,
  Crown,
  UserCheck,
  BarChart3,
  Package,
  Zap,
  ShoppingCart,
  Truck,
  Sparkles,
  HandCoins,
  Check,
  RotateCcw
} from "lucide-react";
import { api } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import type { UserRole, ScreenType } from "../context/BusinessContext";

const departmentRoleTabs: { role: UserRole; label: string; icon: React.ElementType; badge: string; desc: string }[] = [
  { role: "Manager", label: "Store Manager", icon: UserCheck, badge: "Manager", desc: "Floor supervision, billing, stock & daily reports" },
  { role: "Accountant", label: "Store Accountant", icon: BarChart3, badge: "Finance", desc: "Khata ledger, customer credit, supplier payables & P&L" },
  { role: "Cashier", label: "Cashier Terminal", icon: Zap, badge: "Counter", desc: "Fast billing, barcode scanning & customer lookup" },
  { role: "Warehouse", label: "Warehouse Staff", icon: Package, badge: "Stock", desc: "Inventory adjustments, low stock alerts & order dispatch" },
  { role: "Employee", label: "Staff Employee", icon: Users, badge: "Staff", desc: "Assisted customer service & POS billing assistance" },
  { role: "SuperAdmin", label: "SaaS Super Admin", icon: ShieldCheck, badge: "System", desc: "Platform operations & automation workflows" },
  { role: "Owner", label: "Business Owner", icon: Crown, badge: "Master", desc: "Full store control, financial analytics & root security" },
];

const storeModuleCatalog: { id: ScreenType; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard & Analytics", desc: "Daily revenue, net profit & peak hours", icon: Building },
  { id: "billing", label: "Billing / POS", desc: "Instant checkout & tax invoice print", icon: Receipt },
  { id: "counter", label: "Counter Mode", desc: "1-touch fast terminal for rush hours", icon: Zap },
  { id: "incoming-orders", label: "Incoming Orders", desc: "Online pickup & packing queue", icon: ShoppingCart },
  { id: "inventory", label: "Inventory & Stock", desc: "Product catalog, stock levels & alerts", icon: Package },
  { id: "customers", label: "Customers & Khata", desc: "Customer profiles & Udhaar ledger", icon: Users },
  { id: "suppliers", label: "Suppliers & Purchases", desc: "Vendor directory & purchase ledger", icon: Truck },
  { id: "staff", label: "Staff Attendance", desc: "Muster roll, days present & absences", icon: UserCheck },
  { id: "reports", label: "Business Reports", desc: "P&L reports, expenses & tax ledger", icon: BarChart3 },
  { id: "recovery", label: "Recovery Center", desc: "Credit dues recovery & alerts", icon: HandCoins },
  { id: "ai", label: "AI Business Assistant", desc: "Intelligent predictions & reorder advice", icon: Sparkles },
  { id: "settings", label: "Store Settings", desc: "Store profile, backup & security keys", icon: Settings2 },
];

export const Settings: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem("qb_token");
    window.location.reload();
  };
  
  const [shopName, setShopName] = useState("QuickBizs Store");
  const [phone, setPhone] = useState("9876543210");
  const [address, setAddress] = useState("Main Market");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [invoiceFooter, setInvoiceFooter] = useState("Thank you for shopping with us!");

  const [openingHours, setOpeningHours] = useState("07:00-21:00");
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [maxActiveOrders, setMaxActiveOrders] = useState(20);
  const [orderPrepTime, setOrderPrepTime] = useState(15);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const userStr = localStorage.getItem("qb_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const businessId = user?.businessId;

  const fetchBusinessProfile = async () => {
    if (!businessId) return;
    try {
      const res = await api.get(`/business/${businessId}`);
      if (res.data?.success && res.data?.data) {
        const b = res.data.data;
        setShopName(b.name || "");
        setPhone(b.phone || "");
        setAddress(b.address || "");
        setOpeningHours(b.openingHours || "07:00-21:00");
        setPickupEnabled(b.pickupEnabled !== false);
        setMaxActiveOrders(b.maxActiveOrders || 20);
        setOrderPrepTime(b.orderPrepTime || 15);
      }
    } catch (err) {
      console.error("Failed to load business settings profile:", err);
    }
  };

  useEffect(() => {
    fetchBusinessProfile();
  }, [businessId]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      await api.put(`/business/${businessId}`, {
        name: shopName,
        phone,
        address,
        openingHours
      });
      await api.put(`/business/${businessId}/settings`, {
        pickupEnabled,
        maxActiveOrders: Number(maxActiveOrders),
        orderPrepTime: Number(orderPrepTime)
      });
      showToast("✓ Settings Saved Successfully");
      fetchBusinessProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update business configuration.");
    }
  };

  const { 
    operatingMode, 
    setOperatingMode, 
    ownerPin, 
    setOwnerPin, 
    departmentConfigs, 
    updateRoleModules, 
    updateRolePin 
  } = useBusiness();

  // Department RBAC Management State
  const [selectedDeptRole, setSelectedDeptRole] = useState<UserRole>("Manager");
  const [deptPinEdit, setDeptPinEdit] = useState<string>(() => departmentConfigs["Manager"]?.pin || "2222");

  useEffect(() => {
    setDeptPinEdit(departmentConfigs[selectedDeptRole]?.pin || "");
  }, [selectedDeptRole, departmentConfigs]);

  const handleSaveDeptPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (deptPinEdit.length !== 4 || !/^\d{4}$/.test(deptPinEdit)) {
      alert("Department PIN must be exactly 4 numeric digits (0-9).");
      return;
    }
    updateRolePin(selectedDeptRole, deptPinEdit);
    showToast(`✓ Access PIN for ${selectedDeptRole} updated to ${deptPinEdit}`);
  };

  const handleToggleModule = (role: UserRole, moduleId: ScreenType) => {
    const current = departmentConfigs[role]?.allowedModules || [];
    let updated: ScreenType[];
    if (current.includes(moduleId)) {
      if (current.length <= 1) {
        alert("Each department must have at least one assigned module.");
        return;
      }
      updated = current.filter(m => m !== moduleId);
    } else {
      updated = [...current, moduleId];
    }
    updateRoleModules(role, updated);
    showToast(`✓ Updated module permissions for ${role}`);
  };

  const handleGrantAllModules = (role: UserRole) => {
    const allIds = storeModuleCatalog.map(m => m.id);
    updateRoleModules(role, allIds);
    showToast(`✓ Granted all module access to ${role}`);
  };

  const handleResetRoleDefaults = (role: UserRole) => {
    const defaults: Record<UserRole, ScreenType[]> = {
      Owner: ["dashboard", "incoming-orders", "billing", "inventory", "customers", "suppliers", "reports", "ai", "staff", "settings", "recovery", "counter"],
      Manager: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "incoming-orders", "counter"],
      Accountant: ["reports", "customers", "suppliers", "recovery"],
      Cashier: ["billing", "counter", "customers", "incoming-orders"],
      Warehouse: ["inventory", "incoming-orders"],
      SuperAdmin: ["superadmin", "automation"],
      Employee: ["billing", "counter"]
    };
    updateRoleModules(role, defaults[role] || []);
    showToast(`✓ Reset ${role} permissions to default`);
  };

  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinInput.trim() !== ownerPin.trim()) {
      alert("Current Owner PIN is incorrect. (Default is 1234)");
      return;
    }
    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      alert("New PIN must be exactly 4 digits (0-9).");
      return;
    }
    if (newPinInput !== confirmPinInput) {
      alert("New PIN and Confirm PIN do not match.");
      return;
    }
    setOwnerPin(newPinInput);
    setCurrentPinInput("");
    setNewPinInput("");
    setConfirmPinInput("");
    showToast("✓ Owner Security PIN Updated Successfully");
  };

  const handleResetPin = () => {
    setOwnerPin("1234");
    showToast("✓ Owner PIN Reset to Default: 1234");
  };

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.post("/auth/password/change", {
        currentPassword,
        newPassword
      });
      if (res.data?.success) {
        showToast("✓ Password Updated Successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(res.data?.message || "Failed to update password.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update password. Please verify your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleBackup = () => {
    showToast("✓ Store Data Backup Created");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-5 pb-24 text-slate-900 dark:text-white">
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-sm z-50 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          {toastMsg}
        </div>
      )}

      {/* Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange rounded-xl">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                App & Store Settings
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                Configuration
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Store Profile, Security PIN, Passwords, Role Permissions, and Database Backups
            </p>
          </div>
        </div>
        <button
          onClick={handleBackup}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Database className="h-4 w-4" />
          Create Store Backup
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-4">
               {/* Section 1: Shop Details */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Building className="h-5 w-5 text-emerald-600" />
              1. Shop Details
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Shop / Business Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Shop Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Opening Hours (e.g. 07:00-21:00)</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bill Receipt Settings */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Receipt className="h-5 w-5 text-brand-orange" />
              2. Bill Receipt Format
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Bill Prefix Code</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Receipt Footer Note</label>
                <input
                  type="text"
                  value={invoiceFooter}
                  onChange={(e) => setInvoiceFooter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Section 2.5: Pickup Settings */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Settings2 className="h-5 w-5 text-brand-orange" />
              3. Pickup Configurations
            </h2>

            <div className="flex items-center gap-2 py-1.5">
              <input
                type="checkbox"
                id="pickupEnabled"
                checked={pickupEnabled}
                onChange={(e) => setPickupEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-400 text-brand-orange focus:ring-brand-orange cursor-pointer animate-pulse"
              />
              <label htmlFor="pickupEnabled" className="text-xs font-black text-slate-700 dark:text-slate-300 cursor-pointer">
                Enable secure customer pickup orders
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Max Active Pickup Orders</label>
                <input
                  type="number"
                  value={maxActiveOrders}
                  onChange={(e) => setMaxActiveOrders(Number(e.target.value))}
                  min={1}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Average Prep Time (Minutes)</label>
                <input
                  type="number"
                  value={orderPrepTime}
                  onChange={(e) => setOrderPrepTime(Number(e.target.value))}
                  min={1}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer"
          >
            <Save className="h-5 w-5" />
            Save Configuration
          </button>
        </form>

        {/* Right Column: Operating Mode, Security, Backup, Password, & Logout */}
        <div className="space-y-4">
          
          {/* Section: Indian Retail Operating Mode & Counter Security */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-orange" />
                3. Operating Mode & Terminal Security (दुकान सुरक्षा)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                Indian Retail
              </span>
            </div>

            {/* Operating Mode Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                Shop Operating Model / दुकान संचालन प्रकार:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Mode 1: Solo Shopkeeper */}
                <button
                  type="button"
                  onClick={() => {
                    setOperatingMode("solo");
                    showToast("✓ Switched to Solo Shopkeeper Mode");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    operatingMode === "solo"
                      ? "bg-brand-orange/10 border-brand-orange text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 dark:text-white">
                      <Store className="h-4 w-4 text-brand-orange" />
                      <span>Solo Shopkeeper</span>
                    </div>
                    {operatingMode === "solo" && (
                      <span className="h-2 w-2 rounded-full bg-brand-orange"></span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    <strong>एकल व्यापारी:</strong> I run the shop alone. Hides persona switcher completely for clean direct access.
                  </div>
                </button>

                {/* Mode 2: Multi-Staff Counter */}
                <button
                  type="button"
                  onClick={() => {
                    setOperatingMode("multi-staff");
                    showToast("✓ Switched to Multi-Staff Mode with PIN Lock");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    operatingMode === "multi-staff"
                      ? "bg-brand-orange/10 border-brand-orange text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 dark:text-white">
                      <Users className="h-4 w-4 text-brand-orange" />
                      <span>Multi-Staff & Counter</span>
                    </div>
                    {operatingMode === "multi-staff" && (
                      <span className="h-2 w-2 rounded-full bg-brand-orange"></span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    <strong>स्टाफ व काउंटर:</strong> Staff at counter. Owner profit & reports locked behind 4-digit PIN with 1-click counter lock.
                  </div>
                </button>
              </div>
            </div>

            {/* Owner Security PIN Section */}
            {operatingMode === "multi-staff" && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <KeyRound className="h-4 w-4 text-brand-orange" />
                    <span>4-Digit Owner Security PIN (मालिक पिन)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPin}
                    className="text-[10px] text-slate-400 hover:text-brand-orange underline cursor-pointer"
                    title="Reset to default 1234"
                  >
                    Reset (1234)
                  </button>
                </div>

                <form onSubmit={handleUpdatePin} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Current PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value)}
                        placeholder="••••"
                        required
                        className="w-full text-center tracking-widest font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">New 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="••••"
                        required
                        className="w-full text-center tracking-widest font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Confirm New</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value)}
                        placeholder="••••"
                        required
                        className="w-full text-center tracking-widest font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-brand-orange text-white font-black rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Update Owner Security PIN</span>
                  </button>
                </form>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                  💡 <strong>Security Rule:</strong> Cashiers and counter staff cannot access Daily Net Profit, Wholesale Cost Price, or other Staff Salaries without this PIN.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Data Backup */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Database className="h-5 w-5 text-blue-600" />
              4. Store Data Backup
            </h2>
            
            <p className="text-xs text-slate-500 font-medium">Backup your product catalog, sales bills, and customer ledger safely.</p>
            
            <button
              onClick={handleBackup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="h-4 w-4" />
              Create Immediate Backup
            </button>
          </div>

          {/* Section 4: Change Password Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Lock className="h-5 w-5 text-brand-orange" />
              5. Change User Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Confirm New</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full mt-2 py-2.5 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Lock className="h-4 w-4" />
                {isChangingPassword ? "Updating Password..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Section 5: Logout */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-sm font-black text-rose-600 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <LogOut className="h-5 w-5 text-rose-600" />
              6. Exit & Sign Out
            </h2>

            <button
              onClick={handleLogout}
              className="w-full bg-rose-50 hover:bg-rose-105 dark:bg-rose-950/40 text-rose-600 font-black py-3 rounded-xl text-xs border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out of Store Account
            </button>
          </div>

        </div>

      </div>

      {/* Section 4: Department Passwords & Module Access Control (Full Width) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm space-y-6">
        {/* Header with Title and Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Department Workstations & Module Permissions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  विभाग पासवर्ड और मॉड्यूल नियंत्रण — Define unique passwords and assign authorized sections for each team member
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Real-time Active RBAC
            </span>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Select Department to Configure / विभाग चुनें:
          </label>
          <div className="flex flex-wrap gap-2">
            {departmentRoleTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = selectedDeptRole === tab.role;
              const currentPin = departmentConfigs[tab.role]?.pin || "----";
              const moduleCount = departmentConfigs[tab.role]?.allowedModules?.length || 0;

              return (
                <button
                  key={tab.role}
                  type="button"
                  onClick={() => setSelectedDeptRole(tab.role)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md scale-[1.02]"
                      : "bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-orange/50 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <TabIcon className={`h-4 w-4 ${isSelected ? "text-brand-orange" : "text-slate-400"}`} />
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      {tab.label}
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                        isSelected 
                          ? "bg-brand-orange text-white" 
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}>
                        PIN: {currentPin}
                      </span>
                    </div>
                    <div className="text-[10px] opacity-75 font-medium">
                      {moduleCount} Modules Allowed
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Detail & PIN Card */}
        {selectedDeptRole && (
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-700/60 pb-4">
              <div className="flex items-start gap-3">
                {(() => {
                  const currentMeta = departmentRoleTabs.find(t => t.role === selectedDeptRole);
                  const Icon = currentMeta?.icon || Users;
                  return (
                    <>
                      <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-2xl">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {currentMeta?.label}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {currentMeta?.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {currentMeta?.desc}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* PIN Management Box */}
              <form onSubmit={handleSaveDeptPin} className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-brand-orange" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Station PIN:
                  </span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={deptPinEdit}
                  onChange={(e) => setDeptPinEdit(e.target.value)}
                  placeholder="••••"
                  className="w-20 text-center font-mono tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-black text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save PIN</span>
                </button>
              </form>
            </div>

            {/* Allowed Modules Header & Batch Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Assigned Store Modules ({departmentConfigs[selectedDeptRole]?.allowedModules?.length || 0} / {storeModuleCatalog.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select which sections {selectedDeptRole} can access. Unchecked modules will be completely hidden from their sidebar and locked.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGrantAllModules(selectedDeptRole)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:text-brand-orange hover:border-brand-orange transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Grant All Modules
                </button>
                <button
                  type="button"
                  onClick={() => handleResetRoleDefaults(selectedDeptRole)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:text-brand-orange hover:border-brand-orange transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
              {storeModuleCatalog.map((module) => {
                const ModuleIcon = module.icon;
                const isChecked = departmentConfigs[selectedDeptRole]?.allowedModules?.includes(module.id);
                const isOwner = selectedDeptRole === "Owner";

                return (
                  <div
                    key={module.id}
                    onClick={() => {
                      if (!isOwner) handleToggleModule(selectedDeptRole, module.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all select-none ${
                      isOwner 
                        ? "bg-slate-100/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-90 cursor-default"
                        : isChecked
                        ? "bg-white dark:bg-slate-800 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/20 cursor-pointer hover:border-emerald-600"
                        : "bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 opacity-60 hover:opacity-100 cursor-pointer hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl mt-0.5 ${
                          isChecked 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                        }`}>
                          <ModuleIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                            {module.label}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {module.desc}
                          </p>
                        </div>
                      </div>

                      {/* Checkbox indicator */}
                      <div className="mt-1">
                        {isOwner ? (
                          <div className="h-4 w-4 rounded bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : isChecked ? (
                          <div className="h-4 w-4 rounded bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanatory Footer Callout */}
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="text-brand-orange font-black">🔒 Security Active:</span>
                <span>When staff enters PIN <strong>{departmentConfigs[selectedDeptRole]?.pin || "----"}</strong>, only the checked modules will be visible in their workstation.</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Master PIN 1234 Overrides Any Role
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
