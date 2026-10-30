import { useState, useEffect } from "react";
import { BusinessProvider, useBusiness } from "./context/BusinessContext";
import type { UserRole } from "./context/BusinessContext";
import { Sidebar } from "./components/Sidebar";
import type { ScreenType } from "./components/Sidebar";
import { AIAssistPanel } from "./components/AIAssistPanel";
import { Dashboard } from "./screens/Dashboard";
import { Billing } from "./screens/Billing";
import { Inventory } from "./screens/Inventory";
import { Customers } from "./screens/Customers";
import { Suppliers } from "./screens/Suppliers";
import { Reports } from "./screens/Reports";
import { AIAssistantScreen } from "./screens/AIAssistantScreen";
import { Staff } from "./screens/Staff";
import { SuperAdmin } from "./screens/SuperAdmin";
import { AutomationConsole } from "./screens/AutomationConsole";
import { Settings } from "./screens/Settings";
import { Tasks } from "./screens/Tasks";
import { Header } from "./components/Header";
import { RecoveryCenter } from "./screens/RecoveryCenter";
import { CounterMode } from "./screens/CounterMode";
import { GlobalSearchOverlay } from "./components/GlobalSearchOverlay";
import { Login } from "./screens/Login";
import { CustomerDashboard } from "./screens/CustomerDashboard";
import { IncomingOrders } from "./screens/IncomingOrders";
import { PWAInstallModal } from "./components/PWAInstallModal";
import { AppSplashScreen } from "./components/common/AppSplashScreen";
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  BarChart3,
  HandCoins,
  Store,
  UserCheck,
  Activity,
  Tag,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { api } from "./config/api";

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(() => {
    try {
      const userStr = localStorage.getItem("qb_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.role === "SuperAdmin") return "superadmin";
      }
      const saved = localStorage.getItem("qb_active_screen");
      if (saved) return saved as ScreenType;
    } catch {}
    return "dashboard";
  });

  useEffect(() => {
    if (activeScreen) {
      localStorage.setItem("qb_active_screen", activeScreen);
    }
  }, [activeScreen]);

  const { products, customers, currentRole, setCurrentRole, getRoleAllowedModules } = useBusiness();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!(localStorage.getItem("qb_token") && localStorage.getItem("qb_user"));
    } catch {
      return false;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    try {
      return !(localStorage.getItem("qb_token") && localStorage.getItem("qb_user"));
    } catch {
      return true;
    }
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPWAInstallForced, setIsPWAInstallForced] = useState(false);

  // Responsive Sidebar State - default open on desktop, persisted in localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qb_sidebar_open");
      if (saved !== null) return saved === "true";
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("qb_sidebar_open", String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Dark/Light theme state
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("qb_theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("qb_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Keyboard shortcut listener for Global Search (Ctrl+K or Cmd+K) & Sidebar Toggle (Ctrl+B or Cmd+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for auth-logout event to log the user out
  useEffect(() => {
    const handleAuthLogout = () => {
      handleLogout();
    };
    window.addEventListener("auth-logout", handleAuthLogout);
    return () => window.removeEventListener("auth-logout", handleAuthLogout);
  }, []);

  // Listen for counter-locked event to immediately switch to billing
  useEffect(() => {
    const handleCounterLocked = () => {
      setActiveScreen("billing");
    };
    window.addEventListener("counter-locked", handleCounterLocked);
    return () => window.removeEventListener("counter-locked", handleCounterLocked);
  }, []);

  // Listen for custom trigger to open PWA install modal on-demand
  useEffect(() => {
    const handleOpenPWA = () => {
      setIsPWAInstallForced(true);
    };
    window.addEventListener("open-pwa-install", handleOpenPWA);
    return () => window.removeEventListener("open-pwa-install", handleOpenPWA);
  }, []);

  // Check auth session validity on mount
  useEffect(() => {
    const token = localStorage.getItem("qb_token");
    const userStr = localStorage.getItem("qb_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Pre-apply user role immediately so UI never flashes wrong role on load
        if (user.role) {
          setCurrentRole(user.role as UserRole);
          if (user.role === "SuperAdmin") setActiveScreen("superadmin");
        }

        api
          .get("/auth/session")
          .then((res) => {
            if (res.data?.success) {
              const verified = res.data.data?.user || res.data.user;
              const finalRole = (verified?.role || user.role) as UserRole;
              setCurrentRole(finalRole);
              if (finalRole === "SuperAdmin") setActiveScreen("superadmin");
              setIsAuthenticated(true);
            } else {
              handleLogout();
            }
          })
          .catch((err) => {
            // Only log out if explicit 401 Unauthorized from backend
            if (err?.response?.status === 401) {
              handleLogout();
            } else {
              // Retain local session on network latency or temporary glitch
              if (user.role === "SuperAdmin") setActiveScreen("superadmin");
              setIsAuthenticated(true);
            }
          })
          .finally(() => {
            setIsAuthLoading(false);
          });
      } catch (err) {
        handleLogout();
        setIsAuthLoading(false);
      }
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  const handleAuthSuccess = (data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      role: string;
      businessId: string;
    };
  }) => {
    localStorage.setItem("qb_token", data.accessToken);
    localStorage.setItem("qb_refresh_token", data.refreshToken);
    localStorage.setItem("qb_user", JSON.stringify(data.user));
    
    setCurrentRole(data.user.role as UserRole);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event("auth-success"));

    if (data.user.role === "SuperAdmin") setActiveScreen("superadmin");
    else if (data.user.role === "Owner") setActiveScreen("dashboard");
    else if (data.user.role === "Cashier") setActiveScreen("billing");
    else if (data.user.role === "Accountant") setActiveScreen("reports");
    else if (data.user.role === "Warehouse") setActiveScreen("inventory");
  };

  const handleLogout = () => {
    localStorage.removeItem("qb_token");
    localStorage.removeItem("qb_refresh_token");
    localStorage.removeItem("qb_user");
    setIsAuthenticated(false);
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const pendingDuesCount = customers.filter((c) => c.pendingDues > 0).length;

  const isAllowed = getRoleAllowedModules(currentRole).includes(activeScreen);

  const isSuperAdmin = currentRole === "SuperAdmin" || activeScreen === "superadmin" || !!(localStorage.getItem("qb_user")?.includes('"SuperAdmin"'));

  const renderScreen = () => {
    // SuperAdmin is the Root Platform Administrator - always render the Admin console directly, never show Access Restricted or Merchant UI!
    if (isSuperAdmin) {
      return <SuperAdmin />;
    }

    if (!isAllowed) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 h-screen text-slate-700 dark:text-slate-200">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl space-y-4">
            <div className="h-14 w-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Access Restricted</h3>
            <p className="text-xs text-brand-paragraph dark:text-slate-400 leading-relaxed">
              Your active persona <strong className="text-slate-800 dark:text-slate-200 uppercase">{currentRole}</strong> does not have permission keys to access <strong>{activeScreen}</strong>.
            </p>
            <button
              onClick={() => {
                if (currentRole === "Owner") setActiveScreen("dashboard");
                else if (currentRole === "Cashier") setActiveScreen("billing");
                else if (currentRole === "Accountant") setActiveScreen("reports");
                else if (currentRole === "Warehouse") setActiveScreen("inventory");
                else setActiveScreen("dashboard");
              }}
              className="w-full py-3 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
            >
              Return to Authorized Module
            </button>
          </div>
        </div>
      );
    }

    switch (activeScreen) {
      case "dashboard":
        return <Dashboard setActiveScreen={setActiveScreen} />;
      case "incoming-orders":
        return <IncomingOrders />;
      case "billing":
        return <Billing setActiveScreen={setActiveScreen} />;
      case "inventory":
        return <Inventory />;
      case "customers":
        return <Customers />;
      case "suppliers":
        return <Suppliers />;
      case "reports":
        return <Reports setActiveScreen={setActiveScreen} />;
      case "automation":
        return <AutomationConsole />;
      case "ai":
        return <AIAssistantScreen />;
      case "staff":
        return <Staff />;
      case "settings":
        return <Settings />;
      case "tasks":
        return <Tasks />;
      case "recovery":
        return <RecoveryCenter setActiveScreen={setActiveScreen} />;
      case "counter":
        return <CounterMode setActiveScreen={setActiveScreen} />;
      default:
        return <Dashboard setActiveScreen={setActiveScreen} />;
    }
  };

  if (isAuthLoading) {
    return <AppSplashScreen variant="merchant" />;
  }

  if (!isAuthenticated) {
    return <Login onAuthSuccess={handleAuthSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }

  if ((currentRole as string) === "Customer") {
    return <CustomerDashboard handleLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen overflow-hidden relative">
      
      {/* Sidebar Drawer backdrop overlay for mobile screen sizes */}
      <AnimatePresence>
        {isSidebarOpen && !isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation (Hidden completely for SuperAdmin - Full Width Experience) */}
      {!isSuperAdmin && (
        <div 
          className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out shrink-0 ${
            isSidebarOpen 
              ? "translate-x-0 w-72" 
              : "-translate-x-full lg:-ml-72 w-72 pointer-events-none"
          }`}
        >
          <Sidebar
            activeScreen={activeScreen}
            setActiveScreen={(screen) => {
              setActiveScreen(screen);
              if (window.innerWidth < 1024) {
                setIsSidebarOpen(false); // close drawer on mobile tap only
              }
            }}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            lowStockCount={lowStockCount}
            pendingDuesCount={pendingDuesCount}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative pb-16 lg:pb-0 bg-slate-50 dark:bg-slate-950 transition-all duration-300">
        
        {/* Unified Responsive Header */}
        <Header 
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          currentRole={currentRole}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          isSidebarOpen={isSidebarOpen}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Content container */}
        <div className="flex-1 overflow-y-auto min-h-0 w-full">{renderScreen()}</div>
      </main>

      {/* Native Mobile App Floating Dock Navigation */}
      {currentRole === "SuperAdmin" ? (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 pt-1 pb-[max(env(safe-area-inset-bottom),6px)] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-around max-w-md mx-auto relative">
            {[
              { id: "tenants", label: "Stores", icon: Store },
              { id: "users", label: "Users", icon: UserCheck },
              { id: "logs", label: "Live Logs", icon: Activity, isCenter: true },
              { id: "categories", label: "Categories", icon: Tag },
              { id: "diagnostics", label: "Health", icon: Database },
            ].map((item) => {
              const Icon = item.icon;
              const currentAdminTab = (() => {
                try {
                  return localStorage.getItem("qb_admin_tab") || "tenants";
                } catch {
                  return "tenants";
                }
              })();
              const isActive = currentAdminTab === item.id;

              const handleAdminDockClick = (tabId: string) => {
                try {
                  localStorage.setItem("qb_admin_tab", tabId);
                } catch {}
                setActiveScreen("superadmin");
                window.dispatchEvent(new CustomEvent("qb-admin-tab-change", { detail: tabId }));
                window.dispatchEvent(new CustomEvent("qb-admin-tab-updated", { detail: tabId }));
              };

              if (item.isCenter) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAdminDockClick(item.id)}
                    className="flex flex-col items-center -mt-5 group cursor-pointer active:scale-90 transition-transform relative z-10"
                  >
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/40 ring-4 ring-slate-950 scale-105"
                        : "bg-slate-900 text-amber-400 border border-slate-700/80 ring-4 ring-slate-950"
                    }`}>
                      <Icon className="h-5.5 w-5.5 stroke-[2.5]" />
                    </div>
                    <span className={`text-[10px] font-black mt-1 tracking-tight ${
                      isActive ? "text-amber-400" : "text-slate-400"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleAdminDockClick(item.id)}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl cursor-pointer transition-all active:scale-90 ${
                    isActive
                      ? "text-amber-400 font-black"
                      : "text-slate-400 hover:text-slate-200 font-medium"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      ) : (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-3 pt-1 pb-[max(env(safe-area-inset-bottom),6px)] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {[
            { id: "dashboard", label: "Home", icon: LayoutDashboard },
            { id: "inventory", label: "Stock", icon: Package },
            { id: "billing", label: "Quick POS", icon: Receipt, isCenter: true },
            { id: "recovery", label: "Recovery", icon: HandCoins },
            { id: "reports", label: "Analytics", icon: BarChart3 },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;

            if (item.isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen("billing")}
                  className="flex flex-col items-center -mt-5 group cursor-pointer active:scale-90 transition-transform relative z-10"
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-tr from-brand-orange to-amber-500 text-white shadow-brand-orange/40 ring-4 ring-slate-100 dark:ring-slate-900 scale-105"
                      : "bg-slate-900 dark:bg-brand-orange text-white shadow-slate-900/30 dark:shadow-brand-orange/30 ring-4 ring-white dark:ring-slate-900"
                  }`}>
                    <Icon className="h-5.5 w-5.5 stroke-[2.5]" />
                  </div>
                  <span className={`text-[10px] font-black mt-1 tracking-tight ${
                    isActive ? "text-brand-orange" : "text-slate-600 dark:text-slate-400"
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id as ScreenType)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl cursor-pointer transition-all active:scale-90 ${
                  isActive
                    ? "text-brand-orange font-black"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-orange" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      )}

      {/* Floating AI Panel Nudge */}
      {currentRole === "Owner" && <AIAssistPanel />}

      {/* Global Search & Command Modal overlay */}
      <GlobalSearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveScreen={setActiveScreen}
      />

      {/* PWA Download / Install Modal */}
      {isAuthenticated && (
        <PWAInstallModal
          forceOpen={isPWAInstallForced}
          onClose={() => setIsPWAInstallForced(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BusinessProvider>
      <AppContent />
    </BusinessProvider>
  );
}
