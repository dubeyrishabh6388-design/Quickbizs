import { env } from "../config/env";
import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Search,
  CheckCheck,
  Trash2,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Package,
  CreditCard,
  Users,
  Truck,
  ShoppingCart,
  Settings,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  module: string;
  isRead: boolean;
  createdAt: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getModuleConfig = (module: string) => {
  switch (module?.toLowerCase()) {
    case "billing":   return { icon: <CreditCard className="h-4 w-4" />, color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
    case "inventory": return { icon: <Package className="h-4 w-4" />,    color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
    case "staff":     return { icon: <Users className="h-4 w-4" />,       color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
    case "vendors":
    case "suppliers": return { icon: <Truck className="h-4 w-4" />,       color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
    case "orders":    return { icon: <ShoppingCart className="h-4 w-4" />, color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
    case "system":    return { icon: <Settings className="h-4 w-4" />,     color: "bg-brand-orange/10 text-brand-orange" };
    default:          return { icon: <Bell className="h-4 w-4" />,         color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "critical":
    case "high":
      return {
        bar: "bg-brand-orange",
        icon: <AlertOctagon className="h-3.5 w-3.5 text-brand-orange" />,
        label: "text-brand-orange",
        dot: "bg-brand-orange",
      };
    case "medium":
      return {
        bar: "bg-brand-orange/50",
        icon: <AlertTriangle className="h-3.5 w-3.5 text-brand-orange/70" />,
        label: "text-brand-orange/80",
        dot: "bg-brand-orange/60",
      };
    case "low":
      return {
        bar: "bg-slate-300 dark:bg-slate-600",
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />,
        label: "text-slate-400",
        dot: "bg-slate-400",
      };
    default:
      return {
        bar: "bg-slate-200 dark:bg-slate-700",
        icon: <Info className="h-3.5 w-3.5 text-slate-400" />,
        label: "text-slate-400",
        dot: "bg-slate-300",
      };
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem("qb_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ── Fetch notifications from API ──
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "All") params.set("module", activeTab);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(
        `${env.apiUrl}/api/v1/notifications?${params.toString()}`,
        { headers: authHeader() }
      );
      const json = await res.json();
      if (json.success) setNotifications(json.data ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  // ── Fetch unread count ──
  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const res = await fetch(`${env.apiUrl}/api/v1/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) setUnreadCount(json.data.count ?? 0);
    } catch {
      /* silent */
    }
  }, []);

  // Refresh unread count on mount, login, and on a calm 60s background interval
  useEffect(() => {
    const token = localStorage.getItem("qb_token");
    if (token) {
      fetchUnreadCount();
    }

    const iv = setInterval(() => {
      if (localStorage.getItem("qb_token")) {
        fetchUnreadCount();
      }
    }, 60000);

    window.addEventListener("auth-success", fetchUnreadCount);
    return () => {
      clearInterval(iv);
      window.removeEventListener("auth-success", fetchUnreadCount);
    };
  }, [fetchUnreadCount]);

  // Fetch notifications when drawer opens or filters change
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Debounce search
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => fetchNotifications(), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Actions ──
  const markAllRead = async () => {
    try {
      await fetch(`${env.apiUrl}/api/v1/notifications/read-all`, {
        method: "PUT",
        headers: authHeader(),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const markOneRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await fetch(`${env.apiUrl}/api/v1/notifications/${id}/read`, {
        method: "PUT",
        headers: authHeader(),
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const deleteNotif = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await fetch(`${env.apiUrl}/api/v1/notifications/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => {
        const wasUnread = notifications.find(n => n.id === id && !n.isRead);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch { /* silent */ }
  };

  // ── Derived data ──
  const tabs = ["All", "Billing", "Inventory", "Staff", "Vendors", "System"];

  const displayed = notifications.filter(n => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.message?.toLowerCase().includes(q) ||
      n.module?.toLowerCase().includes(q)
    );
  });

  const unreadInList = displayed.filter(n => !n.isRead).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Bell Button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 group
          bg-slate-900/80 hover:bg-slate-850
          border border-slate-700/80
          text-slate-300 hover:text-brand-orange
          hover:border-brand-orange/40
          ${unreadCount > 0 ? "ring-2 ring-brand-orange/20" : ""}`}
        title="Store Notifications"
        aria-label="Open Notifications"
      >
        <Bell className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${unreadCount > 0 ? "text-brand-orange" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-25" />
            <span className="relative z-10 min-w-[20px] h-5 px-1.5 rounded-full bg-brand-orange text-white font-black text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-950 tabular-nums">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* ── Drawer ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Full-screen dimmed backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              style={{ zIndex: 9998 }}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed top-0 right-0 h-screen w-full max-w-[400px] bg-white dark:bg-slate-950 flex flex-col"
              style={{ zIndex: 9999 }}
            >
              {/* ── Header ── */}
              <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
                    <Bell className="h-4.5 w-4.5 text-brand-orange" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                      Notifications
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchNotifications()}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  {unreadInList > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-brand-orange hover:bg-brand-orange/10 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* ── Search ── */}
              <div className="shrink-0 px-4 pt-3 pb-2 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search notifications…"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-9 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-orange transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Module Tabs ── */}
              <div className="shrink-0 px-4 pb-2.5 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  {tabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        activeTab === tab
                          ? "bg-brand-orange text-white shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-white hover:border-slate-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Notification List ── */}
              <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-950">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                    <Loader2 className="h-7 w-7 animate-spin text-brand-orange" />
                    <span className="text-xs font-semibold">Loading notifications…</span>
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      <Bell className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                        {search ? "No results found" : "All caught up!"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search
                          ? `Nothing matching "${search}"`
                          : activeTab !== "All"
                          ? `No ${activeTab} notifications`
                          : "No notifications yet"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {displayed.map((notif, i) => {
                      const mod = getModuleConfig(notif.module);
                      const pri = getPriorityConfig(notif.priority);
                      return (
                        <motion.div
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ delay: Math.min(i * 0.025, 0.3) }}
                          onClick={() => setSelectedNotif(notif)}
                          className={`relative bg-white dark:bg-slate-900 rounded-xl border cursor-pointer group transition-all hover:shadow-md hover:border-brand-orange/30 overflow-hidden ${
                            notif.isRead
                              ? "border-slate-200 dark:border-slate-800 opacity-75"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {/* Priority colour bar */}
                          <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${pri.bar} rounded-l-xl`} />

                          <div className="pl-4 pr-3 py-3 flex gap-3 items-start">
                            {/* Unread dot */}
                            {!notif.isRead && (
                              <span className={`absolute top-3.5 right-3 h-2 w-2 rounded-full ${pri.dot} shrink-0`} />
                            )}

                            {/* Module icon */}
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${mod.color}`}>
                              {mod.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-3">
                              {/* Module + Priority row */}
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  {notif.module || "General"}
                                </span>
                                <span className={`flex items-center gap-0.5 text-[9px] font-black uppercase ${pri.label}`}>
                                  {pri.icon}
                                  {notif.priority}
                                </span>
                              </div>

                              {/* Title */}
                              <p className={`text-xs font-black leading-snug ${notif.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                                {notif.title}
                              </p>

                              {/* Message */}
                              {notif.message && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                              )}

                              {/* Time + actions */}
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {timeAgo(notif.createdAt)}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notif.isRead && (
                                    <button
                                      onClick={e => markOneRead(notif.id, e)}
                                      title="Mark as read"
                                      className="p-1 rounded-md hover:bg-brand-orange/10 text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                                    >
                                      <CheckCheck className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={e => deleteNotif(notif.id, e)}
                                    title="Delete"
                                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div className="h-4" />
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="shrink-0 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {displayed.length} notification{displayed.length !== 1 ? "s" : ""}
                  {activeTab !== "All" && ` · ${activeTab}`}
                </span>
                <span className="text-[11px] font-bold text-brand-orange">QuickBizs</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Detail Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotif(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl font-sans"
            >
              {/* Close */}
              <button
                onClick={() => setSelectedNotif(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-3 pr-8 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${getModuleConfig(selectedNotif.module).color}`}>
                  {getModuleConfig(selectedNotif.module).icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {selectedNotif.module || "General"}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${
                      ["high", "critical"].includes(selectedNotif.priority?.toLowerCase())
                        ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}>
                      {selectedNotif.priority}
                    </span>
                    {selectedNotif.isRead && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Read</span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {selectedNotif.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {timeAgo(selectedNotif.createdAt)}
                  </p>
                </div>
              </div>

              {/* Message */}
              {selectedNotif.message && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 p-3.5 mb-4">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedNotif.message}
                  </p>
                </div>
              )}

              {/* Reference */}
              {selectedNotif.referenceType && selectedNotif.referenceId && (
                <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold uppercase tracking-wider">{selectedNotif.referenceType}:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{selectedNotif.referenceId}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-black rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
                {!selectedNotif.isRead && (
                  <button
                    onClick={() => { markOneRead(selectedNotif.id); setSelectedNotif(null); }}
                    className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-sm shadow-brand-orange/20"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
