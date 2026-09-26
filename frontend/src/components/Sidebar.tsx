import React, { useState, useRef, useEffect } from "react";
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  Truck, 
  BarChart3, 
  Sparkles,
  UserCheck,
  Shield,
  Settings,
  HandCoins,
  Zap,
  ShoppingCart,
  Crown,
  User,
  ChevronDown,
  Check,
  Search,
  X,
  Lock,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBusiness } from "../context/BusinessContext";
import type { UserRole } from "../context/BusinessContext";
import { OwnerPinModal } from "./OwnerPinModal";
import { usePWAInstall } from "../hooks/usePWAInstall";
import logo from "../assets/logo.jpg";

export type ScreenType = "dashboard" | "incoming-orders" | "billing" | "inventory" | "customers" | "suppliers" | "reports" | "ai" | "staff" | "superadmin" | "automation" | "settings" | "tasks" | "recovery" | "counter";

interface SidebarProps {
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;
  onClose?: () => void;
  lowStockCount: number;
  pendingDuesCount: number;
}

interface RoleConfig {
  id: UserRole;
  title: string;
  subtitle: string;
  badge: string;
  iconBg: string;
  iconColor: string;
  icon: React.ElementType;
}

const roleConfigs: RoleConfig[] = [
  {
    id: "Owner",
    title: "Business Owner",
    subtitle: "Full store control & analytics",
    badge: "Admin",
    iconBg: "bg-brand-orange/15 border-brand-orange/30",
    iconColor: "text-brand-orange",
    icon: Crown,
  },
  {
    id: "Cashier",
    title: "Cashier Terminal",
    subtitle: "High-speed POS billing & checkout",
    badge: "Counter",
    iconBg: "bg-slate-700/40 border-slate-600/30",
    iconColor: "text-slate-300",
    icon: Zap,
  },
  {
    id: "Accountant",
    title: "Store Accountant",
    subtitle: "Khata ledger, dues & reports",
    badge: "Finance",
    iconBg: "bg-slate-700/40 border-slate-600/30",
    iconColor: "text-slate-300",
    icon: BarChart3,
  },
  {
    id: "Warehouse",
    title: "Warehouse Staff",
    subtitle: "Inventory, stock alert & dispatch",
    badge: "Stock",
    iconBg: "bg-slate-700/40 border-slate-600/30",
    iconColor: "text-slate-300",
    icon: Package,
  },
  {
    id: "Manager",
    title: "Store Manager",
    subtitle: "Floor supervision & operations",
    badge: "Manager",
    iconBg: "bg-slate-700/40 border-slate-600/30",
    iconColor: "text-slate-300",
    icon: UserCheck,
  },
  {
    id: "Employee",
    title: "Staff Employee",
    subtitle: "Assisted counter & customer service",
    badge: "Staff",
    iconBg: "bg-slate-700/40 border-slate-600/30",
    iconColor: "text-slate-300",
    icon: User,
  },
  {
    id: "SuperAdmin",
    title: "SaaS Super Admin",
    subtitle: "Multi-tenant platform control",
    badge: "System",
    iconBg: "bg-slate-700/40 border-slate-600/30",
    iconColor: "text-slate-300",
    icon: Shield,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeScreen, 
  setActiveScreen, 
  onClose,
  lowStockCount,
  pendingDuesCount
}) => {
  const { currentRole, setCurrentRole, operatingMode, getRoleAllowedModules } = useBusiness();
  const { isInstalled, platformType } = usePWAInstall();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingTargetRole, setPendingTargetRole] = useState<RoleConfig | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Role Default Redirection with PIN Protection per Department
  const initiateRoleChange = (role: RoleConfig) => {
    if (role.id === currentRole) {
      setIsDropdownOpen(false);
      return;
    }

    if (operatingMode === "multi-staff") {
      setPendingTargetRole(role);
      setIsDropdownOpen(false);
      setPinModalOpen(true);
      return;
    }

    applyRoleChange(role.id);
  };

  const applyRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setIsDropdownOpen(false);
    if (newRole === "SuperAdmin") {
      setActiveScreen("superadmin");
    } else if (newRole === "Owner") {
      setActiveScreen("dashboard");
    } else if (newRole === "Cashier") {
      setActiveScreen("billing");
    } else if (newRole === "Accountant") {
      setActiveScreen("reports");
    } else if (newRole === "Warehouse") {
      setActiveScreen("inventory");
    } else if (newRole === "Manager") {
      setActiveScreen("dashboard");
    } else if (newRole === "Employee") {
      setActiveScreen("billing");
    }
  };

  // Streamlined retail navigation - completely dynamic based on department permissions
  const allMenuItems: { id: ScreenType; label: string; icon: React.ElementType; badge?: number; highlight?: boolean }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: lowStockCount + pendingDuesCount },
    { id: "incoming-orders", label: "Incoming Orders", icon: ShoppingCart },
    { id: "recovery", label: "Recovery Center", icon: HandCoins },
    { id: "billing", label: "Billing / POS", icon: Receipt },
    { id: "counter", label: "Counter Mode", icon: Zap },
    { id: "inventory", label: "Inventory", icon: Package, badge: lowStockCount },
    { id: "customers", label: "Customers & Khata", icon: Users, badge: pendingDuesCount },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "staff", label: "Staff Attendance", icon: UserCheck },
    { id: "reports", label: "Business Reports", icon: BarChart3 },
    { id: "ai", label: "AI Assistant", icon: Sparkles, highlight: true },
    { id: "settings", label: "Store Settings", icon: Settings },
    { id: "superadmin", label: "Platform Stats", icon: Shield, highlight: true },
  ];

  // Dynamic modules permitted for the current department
  const allowedModules = getRoleAllowedModules(currentRole);
  const menuItems = allMenuItems.filter(item => allowedModules.includes(item.id));

  const activeRoleConfig = roleConfigs.find(r => r.id === currentRole) || roleConfigs[0];
  const ActiveRoleIcon = activeRoleConfig.icon;

  return (
    <aside className="w-72 bg-brand-navy border-r border-slate-800 flex flex-col text-slate-300 h-screen sticky top-0 shrink-0">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={logo} alt="QuickBizs Logo" className="h-9 w-9 rounded-lg object-cover shadow-md shadow-brand-orange/20 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl font-bold font-sans text-white tracking-tight leading-none truncate">
              Quick<span className="text-brand-orange">Bizs</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block truncate">
              Business OS
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-brand-orange hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700/60 transition-all cursor-pointer shrink-0 group"
            title="Collapse Sidebar (Ctrl+B)"
            aria-label="Collapse Sidebar"
          >
            <X className="h-5 w-5 transition-transform group-hover:scale-105" />
          </button>
        )}
      </div>

      {/* Modern Interactive Persona Switcher & Search Section */}
      <div className="px-5 py-4 border-b border-slate-800 space-y-3 bg-slate-900/30 relative" ref={dropdownRef}>
        
        {operatingMode === "solo" ? (
          /* Solo Shopkeeper Mode: Zero Clutter, Full Store Access */
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                एकल व्यापारी • Solo Owner
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 uppercase">
                Full Control
              </span>
            </div>
            <div className="w-full flex items-center justify-between bg-slate-850 border border-slate-700/70 rounded-xl p-2.5 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-brand-orange/15 border-brand-orange/30 text-brand-orange border flex items-center justify-center shrink-0 shadow-2xs">
                  <Crown className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white tracking-tight truncate">
                    Store Owner / दुकान मालिक
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Direct access to all operations
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Staff Mode: Protected Persona Switcher */
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse"></span>
                Active Terminal
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 uppercase">
                  {activeRoleConfig.badge}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="w-full flex items-center justify-between bg-slate-850 hover:bg-slate-800/90 border border-slate-700/70 hover:border-brand-orange/50 rounded-xl p-2.5 transition-all text-left group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`h-8 w-8 rounded-lg ${activeRoleConfig.iconBg} ${activeRoleConfig.iconColor} border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}>
                  <ActiveRoleIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white tracking-tight truncate group-hover:text-brand-orange transition-colors">
                    {activeRoleConfig.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {activeRoleConfig.subtitle}
                  </div>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${isDropdownOpen ? "rotate-180 text-brand-orange" : ""}`} />
            </button>
          </div>
        )}

        {/* Dropdown Menu Overlay */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-4 right-4 top-[84px] z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl p-2 space-y-1 ring-1 ring-white/10"
            >
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
                <span>Switch Workstation Persona</span>
                <span className="text-brand-orange text-[9px]">QuickBizs OS</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5">
                {roleConfigs.map((role) => {
                  const RoleIcon = role.icon;
                  const isSelected = currentRole === role.id;
                  const isProtected = operatingMode === "multi-staff" && role.id !== currentRole;

                  return (
                    <button
                      key={role.id}
                      onClick={() => initiateRoleChange(role)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer group ${
                        isSelected 
                          ? "bg-slate-800/90 border border-brand-orange/40 text-white shadow-xs" 
                          : "hover:bg-slate-800/60 border border-transparent text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-7 w-7 rounded-lg ${role.iconBg} ${role.iconColor} border flex items-center justify-center shrink-0`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                              {role.title}
                            </span>
                            <span className="text-[8px] font-bold px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {role.badge}
                            </span>
                            {isProtected && (
                              <span className="text-[8px] font-bold px-1 rounded bg-rose-950/40 text-rose-400 border border-rose-800/40 flex items-center gap-0.5">
                                <Lock className="h-2 w-2" />
                                PIN
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {role.subtitle}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-brand-orange text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Quick Search Button */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { ctrlKey: true, key: "k" }));
          }}
          className="w-full flex items-center justify-between bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-brand-orange/50 rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-slate-200 font-medium tracking-tight transition-all active:scale-[0.98] cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-orange transition-colors" />
            <span className="font-semibold text-xs text-slate-300 group-hover:text-white">Quick Search...</span>
          </div>
          <kbd className="bg-slate-900 text-[10px] px-1.5 py-0.5 rounded font-mono text-slate-400 border border-slate-700/80 shadow-2xs group-hover:border-brand-orange/40 group-hover:text-brand-orange transition-colors">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id as ScreenType)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold relative overflow-hidden group cursor-pointer ${
                isActive 
                  ? "text-white" 
                  : item.highlight 
                    ? "text-brand-orange hover:text-brand-orange-hover"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {/* Sliding backdrop for active link */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className={`absolute inset-0 z-0 ${
                    item.highlight 
                      ? "bg-brand-orange" 
                      : "bg-slate-800"
                  }`}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="flex items-center gap-3 relative z-10">
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive 
                    ? "text-white" 
                    : item.highlight 
                      ? "text-brand-orange"
                      : "text-slate-400 group-hover:text-slate-200"
                }`} />
                <span>{item.label}</span>
              </div>

              {/* Badges for active notification indicators */}
              {item.badge && item.badge > 0 ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full relative z-10 ${
                  isActive 
                    ? item.highlight ? "bg-white text-brand-orange" : "bg-brand-orange text-white" 
                    : "bg-slate-800 border border-slate-700 text-slate-300"
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Download / Install App Section in Mobile & Desktop Sidebar */}
      {!isInstalled && (
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-gradient-to-br from-brand-orange/20 via-orange-950/40 to-slate-900 border border-brand-orange/40 shadow-lg shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-orange/30">
              <Download className="h-4.5 w-4.5 animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">
                {platformType === "desktop" ? "QuickBizs Desktop" : "QuickBizs Mobile App"}
              </p>
              <p className="text-[10px] text-orange-200/80 truncate">
                {platformType === "desktop" ? "Install for Windows/Mac" : "Add to Mobile Home Screen"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClose && window.innerWidth < 1024) {
                onClose();
              }
              window.dispatchEvent(new Event("open-pwa-install"));
            }}
            className="w-full mt-2.5 py-2 px-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-brand-orange/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download / Install App</span>
          </button>
        </div>
      )}

      {/* Owner PIN Security Modal for Indian Counter Protection */}
      <OwnerPinModal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPendingTargetRole(null);
        }}
        targetRole={pendingTargetRole?.id}
        targetRoleTitle={pendingTargetRole?.title}
        onSuccess={() => {
          if (pendingTargetRole) {
            applyRoleChange(pendingTargetRole.id);
            setPendingTargetRole(null);
          }
        }}
      />
    </aside>
  );
};
