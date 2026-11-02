import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Moon, 
  Search, 
  LogOut, 
  Menu, 
  Unlock,
  LayoutDashboard,
  ShoppingCart,
  HandCoins,
  Receipt,
  Zap,
  Package,
  Users,
  Truck,
  UserCheck,
  BarChart3,
  Sparkles,
  Settings,
  Shield,
  Download,
  Store,
  Tag,
  Terminal,
  Cpu,
  WalletCards,
  Languages,
  Check,
  X
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import logo from "../assets/logo.jpg";
import { NotificationBell } from "./NotificationDrawer";
import type { ScreenType } from "./Sidebar";
import { useBusiness } from "../context/BusinessContext";
import type { UserRole } from "../context/BusinessContext";
import { OwnerPinModal } from "./OwnerPinModal";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface HeaderProps {
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;
  currentRole: UserRole;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  onOpenSearch: () => void;
}

interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  businessId?: string;
  businessName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  setActiveScreen,
  currentRole,
  theme,
  toggleTheme,
  onLogout,
  onToggleSidebar,
  isSidebarOpen = true,
  onOpenSearch
}) => {
  const { operatingMode, setCurrentRole, getRoleAllowedModules, products, customers } = useBusiness();
  const { t, language, toggleLanguage } = useTranslation();
  const { isInstalled, platformType } = usePWAInstall();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isOwnerPinOpen, setIsOwnerPinOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const pendingDuesCount = customers.filter(c => (c.pendingDues || 0) > 0).length;

  const allNavItems: { id: ScreenType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, badge: lowStockCount + pendingDuesCount },
    { id: "incoming-orders", label: t("nav.incomingOrders"), icon: ShoppingCart },
    { id: "billing", label: t("nav.billing"), icon: Receipt },
    { id: "counter", label: t("nav.counter"), icon: Zap },
    { id: "inventory", label: t("nav.inventory"), icon: Package, badge: lowStockCount },
    { id: "customers", label: t("nav.customers"), icon: Users, badge: pendingDuesCount },
    { id: "recovery", label: t("nav.recovery"), icon: HandCoins },
    { id: "suppliers", label: t("nav.suppliers"), icon: Truck },
    { id: "expenses", label: t("nav.expenses"), icon: WalletCards },
    { id: "staff", label: t("nav.staff"), icon: UserCheck },
    { id: "reports", label: t("nav.reports"), icon: BarChart3 },
    { id: "ai", label: t("nav.ai"), icon: Sparkles },
    { id: "settings", label: t("nav.settings"), icon: Settings },
    { id: "superadmin", label: t("nav.superadmin"), icon: Shield },
  ];

  const allowedModules = getRoleAllowedModules ? getRoleAllowedModules(currentRole) : [];
  const headerNavItems = allNavItems.filter(item => currentRole === "Owner" ? item.id !== "superadmin" : allowedModules.includes(item.id));

  const [activeAdminTab, setActiveAdminTab] = useState<string>(() => {
    try {
      return localStorage.getItem("qb_admin_tab") || "tenants";
    } catch {
      return "tenants";
    }
  });

  useEffect(() => {
    const handleTabUpdated = (e: any) => {
      if (e.detail) setActiveAdminTab(e.detail);
    };
    window.addEventListener("qb-admin-tab-updated", handleTabUpdated);
    return () => window.removeEventListener("qb-admin-tab-updated", handleTabUpdated);
  }, []);

  const handleAdminTabClick = (tabId: string) => {
    setActiveAdminTab(tabId);
    try {
      localStorage.setItem("qb_admin_tab", tabId);
    } catch {}
    setActiveScreen("superadmin");
    window.dispatchEvent(new CustomEvent("qb-admin-tab-change", { detail: tabId }));
  };

  const adminNavTabs = [
    { id: "tenants", label: "Stores & Platform", icon: Store },
    { id: "users", label: "Merchants & Users", icon: Users },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "logs", label: "Live Logs & Errors", icon: Terminal },
    { id: "diagnostics", label: "System Diagnostics", icon: Cpu },
  ];

  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem("qb_user");
        if (userStr) {
          setCurrentUser(JSON.parse(userStr));
        }
      } catch (e) {
        console.error("Failed to load user info:", e);
      }
    };

    loadUser();
    window.addEventListener("auth-success", loadUser);
    return () => window.removeEventListener("auth-success", loadUser);
  }, []);

  // Generate initials for avatar
  const displayName = currentUser?.name || (currentRole === "Owner" ? "Business Owner" : currentRole);
  const initials = displayName
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "QB";

  const isDark = theme === "dark";

  // ─── ULTRA PREMIUM SUPERADMIN NAVBAR (Full Width, Spacious, No Congestion) ───
  
  const renderProfileModal = () => (
    <AnimatePresence>
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center sm:justify-end p-2 sm:p-4 sm:pr-8 pt-2 sm:pt-16 bg-black/60 backdrop-blur-sm">
          <div 
            className="absolute inset-0" 
            onClick={() => setIsProfileModalOpen(false)} 
          />

          <motion.div 
            initial={{ opacity: 0, y: -70, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -70, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto z-10 mt-1 sm:mt-0"
          >
            {/* Top native collapse pill handle */}
            <div 
              className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-1 sm:hidden cursor-pointer" 
              onClick={() => setIsProfileModalOpen(false)} 
            />
            {/* Header: User Avatar & Info */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-brand-orange/30 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">
                    {displayName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                      {currentRole}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                      {currentUser?.businessName || "Store"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SECTION 1: LANGUAGE SWITCHER (1-CLICK) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-brand-orange" />
                <span>{language === "hi" ? "ऐप की भाषा चुनें (Language)" : "Application Language"}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (language !== "en") toggleLanguage();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    language === "en"
                      ? "border-brand-orange bg-brand-orange/10 ring-2 ring-brand-orange/20 text-brand-orange font-black"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇬🇧</span>
                    <span className="text-xs font-bold">English</span>
                  </div>
                  {language === "en" && <Check className="h-4 w-4 text-brand-orange" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (language !== "hi") toggleLanguage();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    language === "hi"
                      ? "border-brand-orange bg-brand-orange/10 ring-2 ring-brand-orange/20 text-brand-orange font-black"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-xs font-bold">हिन्दी (Hindi)</span>
                  </div>
                  {language === "hi" && <Check className="h-4 w-4 text-brand-orange" />}
                </button>
              </div>
            </div>

            {/* SECTION 2: THEME APPEARANCE */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                {isDark ? <Moon className="h-3.5 w-3.5 text-amber-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
                <span>{language === "hi" ? "थीम मोड (Appearance)" : "Theme Appearance"}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isDark) toggleTheme();
                  }}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !isDark
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 text-amber-600 font-black"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold">{language === "hi" ? "लाइट मोड" : "Light Mode"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isDark) toggleTheme();
                  }}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isDark
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 text-amber-400 font-black"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Moon className="h-4 w-4 text-slate-300" />
                  <span className="text-xs font-bold">{language === "hi" ? "डार्क मोड" : "Dark Mode"}</span>
                </button>
              </div>
            </div>

            {/* SECTION 3: APP SHORTCUTS (Settings, Install App) */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              {!isInstalled && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    window.dispatchEvent(new Event("open-pwa-install"));
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-brand-orange/10 hover:bg-brand-orange/15 text-brand-orange font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="h-4 w-4 animate-bounce" />
                    <span>{language === "hi" ? "क्विकबिज़ ऐप इंस्टॉल करें" : "Install QuickBizs Mobile App"}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-brand-orange text-white">App</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setActiveScreen("settings");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span>{language === "hi" ? "दुकान सेटिंग्स व प्रोफाइल" : "Store Settings & Configuration"}</span>
                </div>
                <span className="text-[10px] text-slate-400">➔</span>
              </button>
            </div>

            {/* SECTION 4: SIGN OUT */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onLogout();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{language === "hi" ? "खाते से लॉगआउट करें (Sign Out)" : "Sign Out of Store"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (currentRole === "SuperAdmin") {
    return (
      <header className="sticky top-0 z-50 shrink-0 bg-slate-950/98 backdrop-blur-2xl border-b border-slate-800 text-slate-200 shadow-xl select-none">
        {/* Brand Luxury Accent Top Bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.9)]" />

        {/* ─── MOBILE NATIVE SUPERADMIN APP BAR (Visible on < lg screens) ─── */}
        <div className="flex lg:hidden flex-col w-full bg-slate-950 px-3 pt-2 pb-1 border-b border-slate-850">
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Left: Brand & Admin Tag */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={logo}
                  alt="QuickBizs Logo"
                  className="h-6 w-6 rounded-md object-cover ring-1 ring-amber-500/50 shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-slate-950 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-black text-white tracking-tight">
                  Quick<span className="text-amber-400">Bizs</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin
                </span>
              </div>
            </div>

            {/* Right: Theme, Profile & Mobile Logout */}
            <div className="flex items-center gap-1 shrink-0">
              {/* 1-Click Language Switcher (EN / हिन्दी) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer bg-slate-900/80 hover:bg-slate-850 text-slate-200 border border-slate-700/80 active:scale-95 shadow-xs text-[11px] font-black"
            title={language === "en" ? "हिन्दी में बदलें (Switch to Hindi)" : "Switch to English"}
            aria-label="Toggle Language"
          >
            <Languages className="h-3.5 w-3.5 text-brand-orange" />
            <span className="font-bold">{language === "en" ? "HI" : "EN"}</span>
          </button>

          {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1 rounded-lg transition-all cursor-pointer flex items-center justify-center bg-slate-900 text-amber-400 border border-slate-800 active:scale-95 shadow-xs"
                title={isDark ? "Light Mode" : "Dark Mode"}
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5 text-slate-300" />}
              </button>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Admin Avatar */}
              <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-[9px] shrink-0 select-none shadow-xs ring-1 ring-amber-400/50">
                {initials}
              </div>

              {/* Sign Out */}
              <button
                onClick={onLogout}
                className="p-1 rounded-lg transition-all cursor-pointer flex items-center justify-center bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 active:scale-95 shadow-xs ml-0.5"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── DESKTOP SUPERADMIN NAVBAR (Visible on lg+ screens) ─── */}
        <div className="hidden lg:flex items-center justify-between gap-4 lg:gap-6 w-full px-5 lg:px-8 py-2">
          {/* Left: QuickBizs Brand & Root OS Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <img
                src={logo}
                alt="QuickBizs Logo"
                className="h-8 w-8 rounded-lg object-cover ring-1.5 ring-amber-500/40 shadow-sm shrink-0"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
            </div>

            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight">
                  Quick<span className="text-amber-400">Bizs</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Root
                </span>
              </div>
            </div>
          </div>

          {/* Center / Compact Modern Segmented Navigation Tabs */}
          <div className="flex items-center justify-center">
            <nav className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-inner">
              {adminNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeAdminTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleAdminTabClick(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap group select-none shrink-0 ${
                      isActive
                        ? "text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSuperAdminHeaderTab"
                        className="absolute inset-0 z-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-xs"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      />
                    )}

                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 relative z-10 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-amber-400"
                      }`}
                    />

                    <span className="relative z-10 font-bold tracking-tight">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Controls, Profile & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Status Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE</span>
            </div>

            {/* 1-Click Language Switcher (EN / हिन्दी) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer bg-slate-900/80 hover:bg-slate-850 text-slate-200 border border-slate-700/80 active:scale-95 shadow-xs text-[11px] font-black"
            title={language === "en" ? "हिन्दी में बदलें (Switch to Hindi)" : "Switch to English"}
            aria-label="Toggle Language"
          >
            <Languages className="h-3.5 w-3.5 text-brand-orange" />
            <span className="font-bold">{language === "en" ? "HI" : "EN"}</span>
          </button>

          {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center bg-slate-900 hover:bg-slate-850 text-amber-400 border border-slate-800 active:scale-95"
              title={isDark ? "Light Mode" : "Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-300" />
              )}
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Admin Profile Capsule */}
            <div className="flex items-center gap-2 pl-1 pr-2.5 py-0.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
              <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-[10px] shrink-0 select-none shadow-xs">
                {initials}
              </div>

              <div className="hidden md:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {displayName}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 hover:border-rose-600 shadow-xs"
              title="Sign Out as Administrator"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      
        {renderProfileModal()}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 transition-all duration-200 shrink-0 bg-brand-navy border-b border-slate-800 text-slate-300 shadow-md">
      {/* Brand Glowing Top Accent Bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-orange to-transparent shadow-[0_0_12px_rgba(249,115,22,0.6)]" />

      {/* ─── MOBILE NATIVE APP BAR (Visible on < lg screens) ─── */}
      <div className="flex lg:hidden items-center justify-between gap-1.5 sm:gap-2 w-full px-2.5 sm:px-3 py-2 bg-brand-navy/98 backdrop-blur-xl">
        {/* Left: Drawer toggle + Brand & Store Name */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/70 active:scale-95 shadow-xs"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <img src={logo} alt="Logo" className="h-7 w-7 rounded-lg object-cover ring-1 ring-brand-orange/40 shrink-0" />
            <div className="flex flex-col min-w-0 leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate max-w-[100px] sm:max-w-[180px]">
                  {currentUser?.businessName || "QuickBizs"}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Store Live" />
              </div>
              <span className="text-[9px] font-bold text-brand-orange uppercase tracking-wider truncate mt-0.5">
                {currentRole}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions + Clean Profile Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Copilot Quick Action on Mobile */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assist"))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            title="QuickBizs AI Copilot"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>AI</span>
          </button>

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center bg-slate-900/80 hover:bg-slate-850 text-slate-300 border border-slate-700/80 active:scale-95 shadow-xs"
            aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Initials Avatar -> Opens Profile Drawer */}
          <button 
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 select-none shadow-sm cursor-pointer active:scale-95 ring-2 ring-brand-orange/40 hover:opacity-95 transition-all"
            title={displayName + " - Profile, Language & Settings"}
          >
            {initials}
          </button>
        </div>
      </div>

      {/* ─── DESKTOP HEADER (Visible on lg+ screens) ─── */}
      <div className="hidden lg:flex items-center justify-between gap-3 w-full px-5 lg:px-6 py-2">
        
        {/* WHEN SIDEBAR IS OPEN: Show Search Bar in Header */}
        {isSidebarOpen ? (
          <div className="flex items-center flex-1 max-w-xl mx-2 sm:mx-4">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium transition-all cursor-pointer group bg-slate-900/90 hover:bg-slate-850 text-slate-300 border border-slate-700/80 hover:border-brand-orange/50 shadow-inner"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="h-4 w-4 text-slate-400 group-hover:text-brand-orange transition-colors shrink-0" />
                <span className="hidden sm:inline truncate">Search products, orders, customers...</span>
                <span className="sm:hidden truncate">Search...</span>
              </div>
              <kbd className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md font-mono transition-colors bg-slate-950 text-slate-400 border border-slate-800 shadow-inner shrink-0">
                Ctrl + K
              </kbd>
            </button>
          </div>
        ) : (
          /* WHEN SIDEBAR IS CLOSED: Search filter is REMOVED, all menus & icons come to Header */
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden pr-2">
            {/* Sidebar Re-open Toggle Button */}
            <button 
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 group bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 hover:border-brand-orange/40 shadow-xs"
              title="Open Sidebar (Ctrl+B)"
              aria-label="Open Sidebar"
            >
              <Menu className="h-5 w-5 transition-transform group-hover:scale-110" />
            </button>

            {/* Compact Brand Logo & Title */}
            <div className="hidden sm:flex items-center gap-2 pr-2.5 border-r border-slate-800 shrink-0">
              <img src={logo} alt="QuickBizs Logo" className="h-7 w-7 rounded-lg object-cover shadow-xs" />
              <span className="text-xs font-black text-white tracking-tight hidden md:inline">
                Quick<span className="text-brand-orange">Bizs</span>
              </span>
            </div>

            {/* Horizontal Header Navigation Bar / Dock */}
            <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 min-w-0 flex-1">
              {headerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveScreen(item.id)}
                    className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30 scale-102 ring-1 ring-brand-orange/50"
                        : "text-slate-400 hover:text-white hover:bg-slate-850/90 border border-transparent hover:border-slate-700/60"
                    }`}
                    title={item.label}
                  >
                    <Icon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "scale-105" : "text-slate-400 group-hover:text-white"}`} />
                    <span className="tracking-tight">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? "bg-white text-brand-orange" : "bg-rose-500 text-white"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Right Section: Controls, Logged-in User Profile & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Install / Download App Quick Action */}
          {!isInstalled && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-pwa-install"))}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-black bg-brand-orange/15 hover:bg-brand-orange/25 text-brand-orange border border-brand-orange/30 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title={platformType === "desktop" ? "Download QuickBizs for Desktop" : "Install QuickBizs Mobile App"}
            >
              <Download className="h-3.5 w-3.5 animate-bounce text-brand-orange" />
              <span className="text-[11px] font-black">{platformType === "desktop" ? "Install" : "App"}</span>
            </button>
          )}

          {/* 1-Click Language Switcher (EN / हिन्दी) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-brand-orange/40 shadow-xs text-xs font-black"
            title={language === "en" ? "हिन्दी में बदलें (Switch to Hindi)" : "Switch to English"}
            aria-label="Toggle Language"
          >
            <Languages className="h-4 w-4 text-brand-orange" />
            <span>{language === "en" ? "हिन्दी" : "English"}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 text-brand-orange border border-slate-700/80 hover:border-brand-orange/40 shadow-xs"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-300" />
            )}
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Quick Counter Unlock for Multi-Staff Indian Stores */}
          {operatingMode === "multi-staff" && currentRole === "Cashier" && (
            <button
              type="button"
              onClick={() => setIsOwnerPinOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-orange/15 hover:bg-brand-orange/25 text-brand-orange border border-brand-orange/30 transition-all cursor-pointer shadow-xs"
              title="Enter Owner PIN to unlock full management access"
            >
              <Unlock className="h-3.5 w-3.5" />
              <span>Unlock Owner</span>
            </button>
          )}

          <div className="h-6 w-[1px] hidden sm:block bg-slate-800" />

          {/* Logged-In User Profile Details in Capsule */}
          <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-2xl transition-all bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 shadow-inner cursor-pointer hover:border-brand-orange/50 active:scale-98" title="Click to open Profile & Language">
            <div className="h-9 w-9 rounded-xl bg-brand-orange text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-[0_0_16px_rgba(249,115,22,0.35)] ring-2 ring-brand-orange/30">
              {initials}
            </div>

            <div className="hidden md:flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold max-w-[130px] truncate text-white">
                  {displayName}
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                  {currentRole}
                </span>
              </div>
              <span className="text-[10px] font-medium truncate max-w-[150px] text-slate-400">
                {currentUser?.email || currentUser?.phone || "QuickBizs Merchant"}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer group ml-0.5 bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700/80 hover:border-rose-600 transition-colors"
            title="Sign Out from this account"
          >
            <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

        </div>
      </div>

      <OwnerPinModal
        isOpen={isOwnerPinOpen}
        onClose={() => setIsOwnerPinOpen(false)}
        targetRoleTitle="Business Owner"
        onSuccess={() => {
          setCurrentRole("Owner");
          setActiveScreen("dashboard");
        }}
      />
      {renderProfileModal()}
    </header>
  );
};
