import React from "react";
import { 
  X, 
  TrendingUp, 
  Calendar,
  Receipt,
  Wallet,
  CheckCircle2,
  Package,
  Users,
  ArrowRight,
  Sparkles,
  QrCode,
  Banknote,
  Trophy,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface YesterdayMetrics {
  sales: number;
  bills: number;
  aov: number;
  profit: number;
  expenses: number;
  netProfit: number;
  marginPct: number;
  cash: number;
  upi: number;
  credit: number;
  growthVsPrev: number;
  topItem: {
    name: string;
    qty: number;
    revenue: number;
  };
}

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  yesterdayData: YesterdayMetrics;
  storeHealthScore: number;
  lowStockCount: number;
  pendingUdhaarTotal: number;
  totalDebtorsCount: number;
  onNavigate: (screen: "dashboard" | "billing" | "inventory" | "customers" | "reports" | "recovery") => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  onClose,
  yesterdayData,
  storeHealthScore,
  lowStockCount,
  pendingUdhaarTotal,
  totalDebtorsCount,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const yesterdayDate = new Date(Date.now() - 86400000).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short"
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-fadeIn">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner shrink-0">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg tracking-tight leading-none text-white">
                    Daily Store Briefing
                  </h3>
                  <span className="bg-white/25 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Once a Day
                  </span>
                </div>
                <p className="text-[11px] text-white/90 font-medium mt-1">
                  Yesterday's Performance ({yesterdayDate}) • Opening for {todayDate}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer shrink-0"
              title="Close briefing"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 no-scrollbar">
            
            {/* 1. YESTERDAY'S CORE FINANCIAL METRICS */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-brand-orange" />
                  Yesterday's Financial Ledger
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {yesterdayData.bills} Orders Billed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                
                {/* Revenue */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                      Sales Revenue
                    </span>
                    <Receipt className="h-3.5 w-3.5 text-brand-orange" />
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    ₹{yesterdayData.sales.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] font-bold text-brand-orange mt-1 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    +{yesterdayData.growthVsPrev}% vs prev day
                  </div>
                </div>

                {/* Net Profit */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                      Net Profit
                    </span>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹{yesterdayData.netProfit.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                    {yesterdayData.marginPct}% Gross Margin
                  </div>
                </div>

                {/* Overhead Expenses */}
                <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                      Store Expenses
                    </span>
                    <Wallet className="h-3.5 w-3.5 text-rose-500" />
                  </div>
                  <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
                    ₹{yesterdayData.expenses.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                    Avg Bill: ₹{yesterdayData.aov.toLocaleString("en-IN")}
                  </div>
                </div>

              </div>
            </div>

            {/* 2. PAYMENT SPLIT & BESTSELLER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              
              {/* Payment Split */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                  Payment Mode Distribution
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Banknote className="h-3.5 w-3.5 text-emerald-500" /> Cash
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{yesterdayData.cash.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <QrCode className="h-3.5 w-3.5 text-brand-orange" /> UPI / QR
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{yesterdayData.upi.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5 text-rose-500" /> Udhaar (Credit)
                    </span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">
                      ₹{yesterdayData.credit.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bestseller Highlight */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                    Top Selling SKU Yesterday
                  </span>
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="h-9 w-9 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                      <Trophy className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                        {yesterdayData.topItem.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {yesterdayData.topItem.qty} units sold • ₹{yesterdayData.topItem.revenue.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Store Health Index</span>
                  <span className="font-black text-brand-orange flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {storeHealthScore}%
                  </span>
                </div>
              </div>

            </div>

            {/* 3. TODAY'S MORNING CHECKLIST / FOCUS ITEMS */}
            <div className="p-4 rounded-2xl bg-brand-orange/5 dark:bg-brand-orange/10 border border-brand-orange/20 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-orange flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Today's Opening Priorities
              </span>

              <div className="space-y-2">
                {/* Low stock alert */}
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-brand-orange shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">
                        {lowStockCount > 0 ? `${lowStockCount} products are running low` : "All catalog stock levels are healthy"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {lowStockCount > 0 ? "Reorder before rush hour to prevent stockouts" : "No critical purchase orders required"}
                      </span>
                    </div>
                  </div>
                  {lowStockCount > 0 && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate("inventory");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-brand-orange/10 hover:bg-brand-orange hover:text-white text-brand-orange font-black text-[10px] transition-all cursor-pointer shrink-0"
                    >
                      Stock
                    </button>
                  )}
                </div>

                {/* Udhaar dues alert */}
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-rose-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">
                        {pendingUdhaarTotal > 0 ? `₹${pendingUdhaarTotal.toLocaleString("en-IN")} pending in Customer Khata` : "Zero overdue accounts"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {totalDebtorsCount > 0 ? `${totalDebtorsCount} customers have pending balances` : "All customer credit accounts clear"}
                      </span>
                    </div>
                  </div>
                  {pendingUdhaarTotal > 0 && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate("recovery");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 font-black text-[10px] transition-all cursor-pointer shrink-0"
                    >
                      Collect
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Shown once today • Saves to local device</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onNavigate("reports");
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                View Full Reports
              </button>

              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-black bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
