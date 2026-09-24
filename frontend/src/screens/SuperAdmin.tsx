import React, { useState } from "react";
import { 
  Shield, 
  Activity, 
  Database, 
  Server, 
  CheckCircle, 
  Search, 
  DollarSign, 
  Users,
  RefreshCw
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";

export const SuperAdmin: React.FC = () => {
  const { tenants, toggleTenantStatus } = useBusiness();
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMonthlyEarnings = tenants
    .filter(t => t.status === "Active")
    .reduce((acc, t) => {
      const planPrice = t.plan === "Premium" ? 2500 : t.plan === "Enterprise" ? 9000 : 1000;
      return acc + planPrice;
    }, 0);

  const activeTenantsCount = tenants.filter(t => t.status === "Active").length;

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleToggleStatus = (id: string, name: string, active: boolean) => {
    toggleTenantStatus(id);
    showToast(`${active ? "Suspended" : "Activated"} tenant subscription: ${name}`);
  };

  const metrics = [
    { label: "SaaS Monthly Revenue", val: `₹${totalMonthlyEarnings.toLocaleString()}`, change: `${activeTenantsCount} active tenants`, icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Active Businesses", val: `${activeTenantsCount} / ${tenants.length}`, change: `${tenants.filter(t => t.status === "Suspended").length} accounts locked`, icon: Users, color: "text-brand-orange bg-brand-orange/10" },
    { label: "Global API Latency", val: "14 ms", change: "99.99% uptime status", icon: Activity, color: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" },
    { label: "Platform CPU Load", val: "8.5%", change: "Healthy load index", icon: Server, color: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Super Admin Console
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                SaaS Master
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Global SaaS Platform Administrator · Audit active business tenants, subscription plans, and server system health metrics
            </p>
          </div>
        </div>
        <button
          onClick={() => showToast("SaaS database diagnostic checks complete. Systems healthy.")}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Database className="h-4 w-4" />
          Check Database Logs
        </button>
      </div>

      {/* Platform Diagnostics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{m.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-sans">{m.val}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${m.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                {m.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenant Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tenants List (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>SaaS Tenant Organizations</span>
              <span className="text-xs bg-slate-900 dark:bg-slate-800 text-white px-2 py-0.5 rounded-full font-bold">
                {tenants.length} Total
              </span>
            </h3>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant or plan..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {/* Desktop/Tablet view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="p-4">Business Name</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Volume (Orders)</th>
                    <th className="p-4">Status</th>
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
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Registered: {t.registeredDate}</p>
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
                        <td className="p-4 font-sans text-slate-600 dark:text-slate-400">{t.salesCount} bills</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isActive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(t.id, t.name, isActive)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors ${
                              isActive
                                ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-600 dark:text-rose-400"
                                : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isActive ? "Suspend Shop" : "Re-activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card stack list view */}
            <div className="md:hidden p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              {filteredTenants.length === 0 ? (
                <p className="py-8 text-center text-slate-400 italic text-xs">No active subscription tenants registered.</p>
              ) : (
                filteredTenants.map((t) => {
                  const isActive = t.status === "Active";
                  return (
                    <div key={t.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 space-y-3 shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-2">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug">{t.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Reg: {t.registeredDate}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isActive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          t.plan === "Enterprise"
                            ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                            : t.plan === "Premium"
                              ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700"
                        }`}>
                          {t.plan}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-sans">{t.salesCount} bills generated</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
                        <button
                          onClick={() => handleToggleStatus(t.id, t.name, isActive)}
                          className={`w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors text-center ${
                            isActive
                              ? "bg-rose-600 hover:bg-rose-700 text-white"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {isActive ? "Suspend Subscription Plan" : "Re-activate Tenant"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Super Admin Audit Logs (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs h-[380px] flex flex-col justify-between">
          <div className="overflow-hidden flex flex-col flex-1">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-brand-orange" />
                Platform Audit Logs
              </span>
              <RefreshCw className="h-3.5 w-3.5 text-slate-400 hover:rotate-45 transition-transform cursor-pointer" />
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-700 dark:text-slate-300 leading-normal">Billing webhook processed for "Fresh Choice Supermarket".</p>
                  <span className="text-[9px] text-slate-400 mt-0.5 inline-block">10 seconds ago</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-700 dark:text-slate-300 leading-normal">SaaS health check OK. Latency checks registered inside limits.</p>
                  <span className="text-[9px] text-slate-400 mt-0.5 inline-block">5 minutes ago</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-700 dark:text-slate-300 leading-normal">Failed payment transaction recorded for tenant "Apex Fitness". Plan status: Suspended.</p>
                  <span className="text-[9px] text-slate-400 mt-0.5 inline-block">12 minutes ago</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-700 dark:text-slate-300 leading-normal">Tenant "Sunrise Bakery Cafe" upgraded monthly plan from Basic to Premium.</p>
                  <span className="text-[9px] text-slate-400 mt-0.5 inline-block">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
