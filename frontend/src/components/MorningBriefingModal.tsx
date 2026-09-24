import React from "react";
import { 
  Sun, 
  AlertOctagon, 
  CheckCircle2, 
  Package, 
  ShoppingCart, 
  FileText,
  Activity,
  AlertTriangle,
  RotateCw,
  EyeOff,
  Play,
  TrendingUp,
  Coins
} from "lucide-react";
import { motion } from "framer-motion";

interface MorningBriefingModalProps {
  briefing: any;
  onDismiss: () => void;
  onActionClick: (screen: "dashboard" | "billing" | "inventory" | "customers" | "suppliers" | "reports" | "ai" | "staff") => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

export const MorningBriefingModal: React.FC<MorningBriefingModalProps> = ({
  briefing,
  onDismiss,
  onActionClick,
  onRegenerate,
  isLoading
}) => {
  if (!briefing || !briefing.briefing) return null;

  const { header, yesterdaySummary, todayStatus, bestProducts, problemArea, priorities } = briefing.briefing;
  const { scores } = briefing;

  const healthColor = 
    scores.health >= 90 ? "text-emerald-500" :
    scores.health >= 75 ? "text-slate-200" :
    scores.health >= 60 ? "text-brand-orange" : "text-rose-500";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl bg-white/95 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] border border-white/20"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-orange/20 rounded-2xl">
              <Sun className="h-7 w-7 text-brand-orange" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Good Morning, {header.businessName} Owner!
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Business Morning Briefing • FY {header.currentFY} • {header.todayDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer text-slate-300 transition-all border border-slate-700"
              title="Recalculate Briefing"
            >
              <RotateCw className={`h-4.5 w-4.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onDismiss}
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 transition-all"
            >
              <EyeOff className="h-4.5 w-4.5" />
              Dismiss Today
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/50">
          
          {/* Section 1: Business Scores (Gauge Dashboard) */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-slate-500" />
              Administrative Business Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Health Score</span>
                <span className={`text-2xl font-black block mt-2 ${healthColor}`}>{scores.health}%</span>
                <span className="text-[9px] text-slate-500 font-semibold block mt-1">Excellent</span>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sales Score</span>
                <span className="text-2xl font-black text-slate-800 block mt-2">{scores.sales}%</span>
                <span className="text-[9px] text-slate-500 block mt-1">Sales target index</span>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Profit Score</span>
                <span className="text-2xl font-black text-slate-800 block mt-2">{scores.profit}%</span>
                <span className="text-[9px] text-slate-500 block mt-1">Margin checks index</span>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Inventory</span>
                <span className="text-2xl font-black text-slate-800 block mt-2">{scores.inventory}%</span>
                <span className="text-[9px] text-slate-500 block mt-1">Shelf fill status</span>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Customers</span>
                <span className="text-2xl font-black text-slate-800 block mt-2">{scores.customer}%</span>
                <span className="text-[9px] text-slate-500 block mt-1">Reach performance</span>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Finance</span>
                <span className="text-2xl font-black text-slate-800 block mt-2">{scores.finance}%</span>
                <span className="text-[9px] text-slate-500 block mt-1">Collections status</span>
              </div>

            </div>
          </div>

          {/* Section 2: Yesterday's Summary & Splits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
                Yesterday's Performance Overview
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yesterday Sales</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-1 block">₹{yesterdaySummary.sales.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{yesterdaySummary.orders} bills generated</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yesterday Profit</span>
                  <span className="text-lg font-extrabold text-emerald-600 mt-1 block">₹{yesterdaySummary.profit.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Net operating margin</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overheads Paid</span>
                  <span className="text-lg font-extrabold text-rose-500 mt-1 block">₹{yesterdaySummary.expenses.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Overhead costs logged</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Ticket Size</span>
                  <span className="text-lg font-extrabold text-slate-800 mt-1 block">₹{yesterdaySummary.avgBillValue.toFixed(0)}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Per customer ticket</span>
                </div>
              </div>

              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Collection splits & credit</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block">Cash Box</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">₹{yesterdaySummary.cashCollection.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block">UPI Net</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">₹{yesterdaySummary.upiCollection.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block">Card Net</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">₹{yesterdaySummary.cardCollection.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[9px] text-slate-400 font-bold block">Credit (Udhari)</span>
                  <span className="text-xs font-bold text-rose-550 mt-1 block">₹{yesterdaySummary.creditSales.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Today status */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
                  <Coins className="h-4.5 w-4.5 text-blue-500" />
                  Today's Registers Status
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Opening Cash Box:</span>
                    <span className="font-extrabold text-slate-800">₹{todayStatus.openingCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Pending Collections:</span>
                    <span className="font-extrabold text-brand-orange">₹{todayStatus.pendingPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Supplier Dues:</span>
                    <span className="font-extrabold text-rose-500">₹{todayStatus.supplierPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Staff Attendance:</span>
                    <span className="font-bold text-emerald-600">
                      {todayStatus.attendance.present} present / {todayStatus.attendance.absent} absent
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Bests & Problem Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Best selling products */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
                <Package className="h-4.5 w-4.5 text-slate-600" />
                Product sales leaders
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Best Profit Goods</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block">{bestProducts.highestProfitProduct}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Best Category</span>
                    <span className="text-xs font-bold text-emerald-600 mt-1 block">{bestProducts.highestRevenueCategory}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {bestProducts.topSelling.slice(0, 3).map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <span className="text-[9px] text-slate-400 block">{p.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-700 block">{p.qty} sold</span>
                        <span className="text-[9px] text-slate-400 block">₹{p.revenue} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Problem Areas */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
                <AlertOctagon className="h-4.5 w-4.5 text-rose-500" />
                Critical Problem Areas
              </h3>
              <div className="space-y-3.5 text-xs">
                {problemArea.zeroSales.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span className="text-slate-600 font-medium">
                      Zero Sales items: {problemArea.zeroSales.slice(0, 2).map((p: any) => p.name).join(", ")}
                    </span>
                  </div>
                )}
                {problemArea.expiringSoon.length > 0 && (
                  <div className="flex items-start gap-2 text-brand-orange">
                    <AlertTriangle className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                    <span className="font-medium">Expiring Soon: {problemArea.expiringSoon[0]}</span>
                  </div>
                )}
                {problemArea.lowStock.length > 0 && (
                  <div className="flex items-start gap-2 text-rose-700">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">Low Stock: {problemArea.lowStock[0].name} ({problemArea.lowStock[0].stock} units left)</span>
                  </div>
                )}
                {problemArea.negativeMargin.length > 0 && (
                  <div className="flex items-start gap-2 text-rose-750">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Negative Margins: {problemArea.negativeMargin[0]}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Section 4: Action Checklist Priorities */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              Prioritized Task List
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priorities.map((act: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                    readOnly
                  />
                  <span className="text-xs font-semibold text-slate-700">{act}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Actions Menu */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 flex flex-wrap gap-3 shrink-0">
          <button
            onClick={() => onActionClick("billing")}
            className="flex-1 min-w-[150px] bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            Start My Business Day
          </button>
          <button
            onClick={() => onActionClick("reports")}
            className="flex-1 min-w-[150px] bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
          >
            <FileText className="h-4.5 w-4.5" />
            View Reports
          </button>
          <button
            onClick={() => onActionClick("dashboard")}
            className="flex-1 min-w-[150px] bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 shadow-brand-orange/20"
          >
            <Play className="h-4.5 w-4.5 fill-current" />
            Dismiss
          </button>
        </div>
      </motion.div>
    </div>
  );
};
