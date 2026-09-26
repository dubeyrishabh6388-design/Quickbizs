import React, { useState, useEffect } from "react";
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
  Shield
} from "lucide-react";
import logo from "../assets/logo.jpg";
import { NotificationBell } from "./NotificationDrawer";
import type { ScreenType } from "./Sidebar";
import { useBusiness } from "../context/BusinessContext";
import type { UserRole } from "../context/BusinessContext";
import { OwnerPinModal } from "./OwnerPinModal";

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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isOwnerPinOpen, setIsOwnerPinOpen] = useState(false);

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const pendingDuesCount = customers.filter(c => (c.pendingDues || 0) > 0).length;

  const allNavItems: { id: ScreenType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: lowStockCount + pendingDuesCount },
    { id: "incoming-orders", label: "Orders", icon: ShoppingCart },
    { id: "billing", label: "POS", icon: Receipt },
    { id: "counter", label: "Counter", icon: Zap },
    { id: "inventory", label: "Inventory", icon: Package, badge: lowStockCount },
    { id: "customers", label: "Customers", icon: Users, badge: pendingDuesCount },
    { id: "recovery", label: "Recovery", icon: HandCoins },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "staff", label: "Staff", icon: UserCheck },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "ai", label: "AI Copilot", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "superadmin", label: "Admin", icon: Shield },
  ];

  const allowedModules = getRoleAllowedModules ? getRoleAllowedModules(currentRole) : [];
  const headerNavItems = allNavItems.filter(item => allowedModules.includes(item.id));

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

  return (
    <header className="sticky top-0 z-30 transition-all duration-200 shrink-0 bg-brand-navy border-b border-slate-800 text-slate-300 shadow-md">
      {/* Brand Glowing Top Accent Bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-orange to-transparent shadow-[0_0_12px_rgba(249,115,22,0.6)]" />

      {/* ─── MOBILE NATIVE APP BAR (Visible on < lg screens) ─── */}
      <div className="flex lg:hidden items-center justify-between gap-2 w-full px-3 py-2 bg-brand-navy/98 backdrop-blur-xl">
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
                <span className="text-xs font-black text-white truncate max-w-[120px] sm:max-w-[200px]">
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

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center bg-slate-900/80 hover:bg-slate-850 text-slate-300 border border-slate-700/80 active:scale-95 shadow-xs"
            aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center bg-slate-900/80 hover:bg-slate-850 text-brand-orange border border-slate-700/80 active:scale-95 shadow-xs"
            aria-label="Toggle Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-300" />
            )}
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Avatar */}
          <div 
            onClick={onToggleSidebar}
            className="h-7 w-7 rounded-xl bg-brand-orange text-white flex items-center justify-center font-black text-[10px] shrink-0 select-none shadow-sm cursor-pointer active:scale-95 ring-1 ring-brand-orange/40"
            title={`${displayName} (${currentRole})`}
          >
            {initials}
          </div>
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
        <div className="flex items-center gap-2.5 sm:gap-3">

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
          <div className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-2xl transition-all bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 shadow-inner">
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
    </header>
  );
};
