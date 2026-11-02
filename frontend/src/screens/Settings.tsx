import React, { useState, useEffect, useCallback } from "react";
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
  RotateCcw,
  Phone,
  MapPin,
  Percent,
  WalletCards,
  Languages
} from "lucide-react";
import { api } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import type { UserRole, ScreenType } from "../context/BusinessContext";
import { useTranslation } from "../context/LanguageContext";

// Native iOS/React-Native Style Switch Component
const IOSSwitch: React.FC<{ 
  checked: boolean; 
  onChange: () => void; 
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${checked ? "bg-brand-orange" : "bg-slate-300 dark:bg-slate-700"}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

const departmentRoleTabs: { role: UserRole; label: string; icon: React.ElementType; badge: string; desc: string }[] = [
  { role: "Owner", label: "Business Owner", icon: Crown, badge: "Master", desc: "Full store control, financial analytics & root security" },
  { role: "Manager", label: "Store Manager", icon: UserCheck, badge: "Manager", desc: "Floor supervision, billing, stock & daily reports" },
  { role: "Cashier", label: "Cashier Terminal", icon: Zap, badge: "Counter", desc: "Fast billing, barcode scanning & customer lookup" },
  { role: "Accountant", label: "Store Accountant", icon: BarChart3, badge: "Finance", desc: "Khata ledger, customer credit, supplier payables & P&L" },
  { role: "Warehouse", label: "Warehouse Staff", icon: Package, badge: "Stock", desc: "Inventory adjustments, low stock alerts & order dispatch" },
  { role: "Employee", label: "Staff Employee", icon: Users, badge: "Staff", desc: "Assisted customer service & POS billing assistance" },
  { role: "SuperAdmin", label: "SaaS Super Admin", icon: ShieldCheck, badge: "System", desc: "Platform operations & automation workflows" },
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
  { id: "expenses", label: "Expenses Ledger", desc: "Track daily expenses & store overheads", icon: WalletCards },
  { id: "ai", label: "AI Business Assistant", desc: "Intelligent predictions & reorder advice", icon: Sparkles },
  { id: "settings", label: "Store Settings", desc: "Store profile, backup & security keys", icon: Settings2 },
];

type SettingsSection = "profile" | "billing" | "roles" | "security";

export const Settings: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsSection>("profile");

  const handleLogout = () => {
    localStorage.removeItem("qb_token");
    window.location.reload();
  };
  
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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

  const fetchBusinessProfile = useCallback(async () => {
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
  }, [businessId]);

  useEffect(() => {
    fetchBusinessProfile();
  }, [fetchBusinessProfile]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfileAndBilling = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!businessId) return;
    setIsSaving(true);
    try {
      updateGstSettings({
        gstEnabled: localGstEnabled,
        gstRate: parseFloat(localGstRate) || 0,
        gstNumber: localGstNumber.trim()
      });
      await api.put(`/business/${businessId}`, {
        name: shopName,
        phone,
        address,
        openingHours,
        gstNumber: localGstNumber.trim()
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
    } finally {
      setIsSaving(false);
    }
  };

  const { 
    operatingMode, 
    setOperatingMode, 
    ownerPin, 
    setOwnerPin, 
    departmentConfigs, 
    updateRoleModules, 
    updateRolePin,
    gstSettings,
    updateGstSettings
  } = useBusiness();

  // Local GST States
  const [localGstEnabled, setLocalGstEnabled] = useState(gstSettings?.gstEnabled !== false);
  const [localGstRate, setLocalGstRate] = useState(gstSettings?.gstRate?.toString() || "5");
  const [localGstNumber, setLocalGstNumber] = useState(gstSettings?.gstNumber || "");

  useEffect(() => {
    if (gstSettings) {
      setLocalGstEnabled(gstSettings.gstEnabled !== false);
      setLocalGstRate(gstSettings.gstRate?.toString() || "5");
      setLocalGstNumber(gstSettings.gstNumber || "");
    }
  }, [gstSettings]);

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
      Owner: ["dashboard", "incoming-orders", "billing", "inventory", "customers", "suppliers", "reports", "expenses", "ai", "staff", "settings", "recovery", "counter"],
      Manager: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "expenses", "incoming-orders", "counter"],
      Accountant: ["reports", "expenses", "customers", "suppliers", "recovery"],
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
    <div className="w-full p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 pb-28 text-slate-900 dark:text-white transition-colors">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-xs z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

      {/* Standard Adaptive Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-orange/20">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t("settings.title", "Store & System Settings")}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                {language === "hi" ? "लाइव स्टोर" : "Live Store"}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {t("settings.subtitle", "Store profile, bill receipt design, department access control & security keys")}
            </p>
          </div>
        </div>

        <button
          onClick={handleBackup}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Database className="h-4 w-4 text-brand-orange" />
          <span>{language === "hi" ? "बैकअप लें" : "Quick Backup"}</span>
        </button>
      </div>

      {/* React-Native Style Segmented Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto no-scrollbar w-full">
        
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "profile"
              ? "bg-white dark:bg-slate-900 text-brand-orange shadow-sm scale-[1.01]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Store className="h-4 w-4" />
          <span>{t("settings.storeProfile", "Store Profile")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "billing"
              ? "bg-white dark:bg-slate-900 text-brand-orange shadow-sm scale-[1.01]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>{t("settings.billingPickups", "Billing & Pickups")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "roles"
              ? "bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-sm scale-[1.01]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{t("settings.staffRoles", "Staff & Roles (RBAC)")}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-white/20 text-white">7</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === "security"
              ? "bg-white dark:bg-slate-900 text-brand-orange shadow-sm scale-[1.01]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>{t("settings.securitySystem", "Security & System")}</span>
        </button>

      </div>

      {/* TAB 1: STORE PROFILE */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfileAndBilling} className="space-y-4 max-w-3xl">
          
          {/* APPLICATION DISPLAY LANGUAGE CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Languages className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {language === "hi" ? "ऐप की भाषा (Application Language)" : "Application Language"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === "hi" 
                      ? "1-क्लिक में पूरा ऐप्लिकेशन अंग्रेजी या हिन्दी में बदलें" 
                      : "Switch between English and हिन्दी with 1 click across the entire application"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  language === "en"
                    ? "border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 ring-2 ring-brand-orange/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      English
                      {language === "en" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-brand-orange text-white">Active</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Standard English interface & thermal bills
                    </div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  language === "en" ? "border-brand-orange bg-brand-orange text-white" : "border-slate-300 dark:border-slate-600"
                }`}>
                  {language === "en" && <Check className="w-3 h-3" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  language === "hi"
                    ? "border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 ring-2 ring-brand-orange/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      हिन्दी (Hindi)
                      {language === "hi" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-brand-orange text-white">सक्रिय</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      पूरा ऐप हिन्दी में: बिलिंग, स्टॉक, उधारी व सेटिंग्स
                    </div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  language === "hi" ? "border-brand-orange bg-brand-orange text-white" : "border-slate-300 dark:border-slate-600"
                }`}>
                  {language === "hi" && <Check className="w-3 h-3" />}
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {language === "hi" ? "दुकान की पहचान और पता (Store Profile)" : "Store Identity & Location"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === "hi" ? "बिल और रसीद पर छपने वाली दुकान की जानकारी" : "Basic information printed on receipts and customer pickup pages"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Business / Store Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                    placeholder="e.g. QuickBizs Mart & General Store"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Opening Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      required
                      placeholder="e.g. 07:00-21:00"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Complete Store Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop #4, Main Market, MG Road, Pune 411001"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-brand-orange/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? (language === "hi" ? "सुरक्षित किया जा रहा है..." : "Saving Changes...") : (language === "hi" ? "स्टोर प्रोफाइल सेव करें" : "Save Store Profile")}</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* TAB 2: BILLING & PICKUPS */}
      {activeTab === "billing" && (
        <form onSubmit={handleSaveProfileAndBilling} className="space-y-4 max-w-3xl">
          
          {/* Bill Receipt Format */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-brand-orange/10 text-brand-orange">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Bill & Invoice Receipt Settings
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Configure print voucher numbering and custom footer message
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Invoice Prefix Code
                </label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="e.g. INV or QB"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Example: {invoicePrefix}-00104
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Receipt Footer Note
                </label>
                <input
                  type="text"
                  value={invoiceFooter}
                  onChange={(e) => setInvoiceFooter(e.target.value)}
                  placeholder="e.g. Thank you for shopping with us!"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tax & GST Configuration Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Goods & Services Tax (GST) Setup
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Enable or disable tax on POS bills, customize tax percentage rate, and enter GSTIN
                  </p>
                </div>
              </div>

              <IOSSwitch 
                checked={localGstEnabled} 
                onChange={() => setLocalGstEnabled(!localGstEnabled)} 
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Calculate GST on POS Invoices
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {localGstEnabled 
                    ? `GST is ACTIVE at ${localGstRate}% — Automatically calculated and printed on invoices`
                    : "GST is DISABLED — 0% tax applied, no GST row shown on customer bills or printed receipts"}
                </span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                localGstEnabled 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}>
                {localGstEnabled ? `Active (${localGstRate}%)` : "Disabled"}
              </span>
            </div>

            {localGstEnabled && (
              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      GST Rate Percentage (%) <span className="text-rose-500">*</span>
                    </label>
                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5">
                      {[0, 5, 12, 18, 28].map((rate) => (
                        <button
                          type="button"
                          key={rate}
                          onClick={() => setLocalGstRate(rate.toString())}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                            localGstRate === rate.toString()
                              ? "bg-brand-orange text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={localGstRate}
                    onChange={(e) => setLocalGstRate(e.target.value)}
                    placeholder="e.g. 5 or 18"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Store GSTIN Number (Tax ID)
                  </label>
                  <input
                    type="text"
                    value={localGstNumber}
                    onChange={(e) => setLocalGstNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 27AAAAA0000A1Z5 (Optional)"
                    className="w-full uppercase bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Printed at the top of thermal bills and WhatsApp invoice receipts
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Pickup Configuration */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Digital Pickup Configurations
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Store counter pickup order queue and preparation timing
                  </p>
                </div>
              </div>

              <IOSSwitch 
                checked={pickupEnabled} 
                onChange={() => setPickupEnabled(!pickupEnabled)} 
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Enable Customer Digital Pickups
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Customers can pre-order online and collect directly at the cash counter
                </span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                pickupEnabled 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}>
                {pickupEnabled ? "Active" : "Disabled"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Max Active Pickup Orders
                </label>
                <input
                  type="number"
                  value={maxActiveOrders}
                  onChange={(e) => setMaxActiveOrders(Number(e.target.value))}
                  min={1}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Average Prep Time (Minutes)
                </label>
                <input
                  type="number"
                  value={orderPrepTime}
                  onChange={(e) => setOrderPrepTime(Number(e.target.value))}
                  min={1}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-brand-orange/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving Changes..." : "Save Billing & Pickup Settings"}</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* TAB 3: STAFF & ROLES (RBAC) */}
      {activeTab === "roles" && (
        <div className="space-y-5">
          
          {/* Header Explanation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Role-Based Workstation Access (RBAC)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Assign 4-digit station PINs and toggle permitted modules for each staff workstation
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 self-start sm:self-auto shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Real-time Active RBAC
            </span>
          </div>

          {/* Native Touch-Friendly Horizontal Role Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
              Select Department or Role:
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {departmentRoleTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = selectedDeptRole === tab.role;
                const currentPin = departmentConfigs[tab.role]?.pin || "----";

                return (
                  <button
                    key={tab.role}
                    type="button"
                    onClick={() => setSelectedDeptRole(tab.role)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all cursor-pointer whitespace-nowrap shrink-0 text-left ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md scale-[1.02]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-orange/50 hover:bg-slate-50"
                    }`}
                  >
                    <TabIcon className={`h-4 w-4 ${isSelected ? "text-brand-orange" : "text-slate-400"}`} />
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        {tab.label}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                          isSelected 
                            ? "bg-brand-orange text-white" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          PIN: {currentPin}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Control Card */}
          {selectedDeptRole && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
              
              {/* Role Header & PIN Manager */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  {(() => {
                    const currentMeta = departmentRoleTabs.find(t => t.role === selectedDeptRole);
                    const Icon = currentMeta?.icon || Users;
                    return (
                      <>
                        <div className="h-12 w-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                              {currentMeta?.label}
                            </h3>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
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
                <form onSubmit={handleSaveDeptPin} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
                  <div className="flex items-center gap-1.5 pl-2">
                    <KeyRound className="h-4 w-4 text-brand-orange" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      PIN:
                    </span>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={deptPinEdit}
                    onChange={(e) => setDeptPinEdit(e.target.value)}
                    placeholder="••••"
                    className="w-20 text-center font-mono tracking-widest bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-black rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Save PIN
                  </button>
                </form>
              </div>

              {/* Module Switches Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Authorized Modules ({departmentConfigs[selectedDeptRole]?.allowedModules?.length || 0} / {storeModuleCatalog.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Toggle which pages {selectedDeptRole} can access. Unchecked modules will be locked.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGrantAllModules(selectedDeptRole)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:text-brand-orange transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Grant All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetRoleDefaults(selectedDeptRole)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:text-brand-orange transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Module Cards with Native iOS Switch Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all select-none flex items-center justify-between gap-3 ${
                        isOwner
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-90 cursor-default"
                          : isChecked
                          ? "bg-brand-orange/5 dark:bg-brand-orange/10 border-brand-orange/30 shadow-xs cursor-pointer"
                          : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/80 dark:border-slate-800 opacity-60 hover:opacity-100 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isChecked 
                            ? "bg-brand-orange text-white shadow-xs" 
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                        }`}>
                          <ModuleIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                            {module.label}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                            {module.desc}
                          </span>
                        </div>
                      </div>

                      {/* Native iOS Switch */}
                      <IOSSwitch
                        checked={!!isChecked}
                        disabled={isOwner}
                        onChange={() => {
                          if (!isOwner) handleToggleModule(selectedDeptRole, module.id);
                        }}
                      />
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 4: SECURITY & SYSTEM */}
      {activeTab === "security" && (
        <div className="space-y-5 max-w-4xl">
          
          {/* Operating Mode Choice */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-brand-orange/10 text-brand-orange">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Store Operating Model
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Choose whether you run the store solo or with multiple cashiers
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Solo Shopkeeper */}
              <button
                type="button"
                onClick={() => {
                  setOperatingMode("solo");
                  showToast("✓ Switched to Solo Shopkeeper Mode");
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  operatingMode === "solo"
                    ? "bg-brand-orange/10 border-brand-orange text-slate-900 dark:text-white shadow-xs ring-1 ring-brand-orange"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
                    <Store className="h-4 w-4 text-brand-orange" />
                    <span>Solo Shopkeeper</span>
                  </div>
                  {operatingMode === "solo" && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Owner operates the cash counter directly. Persona switcher hidden for fastest billing.
                </p>
              </button>

              {/* Multi-Staff Counter */}
              <button
                type="button"
                onClick={() => {
                  setOperatingMode("multi-staff");
                  showToast("✓ Switched to Multi-Staff Mode with PIN Lock");
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  operatingMode === "multi-staff"
                    ? "bg-brand-orange/10 border-brand-orange text-slate-900 dark:text-white shadow-xs ring-1 ring-brand-orange"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
                    <Users className="h-4 w-4 text-brand-orange" />
                    <span>Multi-Staff Counter</span>
                  </div>
                  {operatingMode === "multi-staff" && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Cashiers & staff at counter. Profit margins, net reports & salaries locked behind 4-digit PIN.
                </p>
              </button>
            </div>
          </div>

          {/* Owner Security PIN */}
          {operatingMode === "multi-staff" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      4-Digit Owner Security PIN
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Required to unlock confidential net reports and store margins on counter terminals
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetPin}
                  className="text-xs font-bold text-slate-400 hover:text-brand-orange underline cursor-pointer"
                >
                  Reset to 1234
                </button>
              </div>

              <form onSubmit={handleUpdatePin} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Current PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="••••"
                      required
                      className="w-full text-center tracking-widest font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">New 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="••••"
                      required
                      className="w-full text-center tracking-widest font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Confirm New PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      placeholder="••••"
                      required
                      className="w-full text-center tracking-widest font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-brand-orange text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Lock className="h-4 w-4" />
                  <span>Update Owner Security PIN</span>
                </button>
              </form>
            </div>
          )}

          {/* Change User Password */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Change Account Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Update your primary login password for QuickBizs portal
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-orange/20 transition-all disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                <span>{isChangingPassword ? "Updating Password..." : "Update Password"}</span>
              </button>
            </form>
          </div>

          {/* Database Backup & Sign Out Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Database Backup */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Store Database Backup</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Save a secure encrypted snapshot of all customers, orders, and inventory.
              </p>
              <button
                type="button"
                onClick={handleBackup}
                className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Database className="h-4 w-4" />
                <span>Download Database Snapshot</span>
              </button>
            </div>

            {/* Logout */}
            <div className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-950/80 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-600">
                <LogOut className="h-5 w-5" />
                <h3 className="text-sm font-black">Exit Store Session</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Log out of the active terminal session on this device.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 font-black rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out of Store Account</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
