import React from "react";
import { 
  X, 
  Moon, 
  TrendingUp, 
  Package, 
  AlertOctagon, 
  Zap 
} from "lucide-react";
import { motion } from "framer-motion";

interface DayClosingSummaryModalProps {
  closingData: any;
  onDismiss: () => void;
  onActionClick: (screen: "dashboard" | "billing" | "inventory" | "customers" | "suppliers" | "reports" | "ai" | "staff") => void;
}

export const DayClosingSummaryModal: React.FC<DayClosingSummaryModalProps> = ({
  closingData,
  onDismiss,
  onActionClick,
}) => {
  if (!closingData) return null;

  const { summary, winners, attentionRequired, tomorrowPlan } = closingData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-white/95 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white/20"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-orange/20 rounded-2xl">
              <Moon className="h-7 w-7 text-brand-orange" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Daily Closing summary Report
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Locked register audit balances
              </p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/50">
          
          {/* Today Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
              Today's Reconciled Collections
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today Sales</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">₹{summary.sales.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">{summary.bills} bills generated</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today Net Profit</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">₹{summary.profit.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Margins check cleared</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today Expenses</span>
                <span className="text-xl font-extrabold text-rose-500 mt-1 block">₹{summary.expenses.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Overhead costs paid</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Collections</span>
                <span className="text-xl font-extrabold text-brand-orange mt-1 block">₹{summary.outstandingCollection.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Credit dues accumulation</span>
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Cash drawer</span>
              <span className="text-sm font-bold text-slate-800 block mt-1">₹{summary.cashCollection.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">UPI Collections</span>
              <span className="text-sm font-bold text-slate-800 block mt-1">₹{summary.upiCollection.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Card splits</span>
              <span className="text-sm font-bold text-slate-800 block mt-1">₹{summary.cardCollection.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Credit Sales (Udhari)</span>
              <span className="text-sm font-bold text-rose-505 block mt-1">₹{summary.creditSales.toLocaleString()}</span>
            </div>
          </div>

          {/* Winners & Tomorrow Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Winners */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
                <Package className="h-4.5 w-4.5 text-brand-orange" />
                Today's Operations Highlights
              </h3>
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Top sold product:</span>
                  <span className="text-slate-800">{winners.topProduct}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Highest Category Sales:</span>
                  <span className="text-slate-800">{winners.topCategory}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Top Customer:</span>
                  <span className="text-slate-800">{winners.topCustomer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Cashier / Staff of the Day:</span>
                  <span className="text-slate-800">{winners.topEmployee}</span>
                </div>
              </div>
            </div>

            {/* Tomorrow's Plan */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
                <Zap className="h-4.5 w-4.5 text-brand-orange" />
                Recommended focus areas tomorrow
              </h3>
              <div className="space-y-3">
                {tomorrowPlan.map((act: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Attention Required */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
              <AlertOctagon className="h-4.5 w-4.5 text-rose-500" />
              Attention Required Warnings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Pending Bills Dues</span>
                <span className="text-lg font-bold block mt-1 text-slate-800">{attentionRequired.pendingPaymentsCount}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Pending POs</span>
                <span className="text-lg font-bold block mt-1 text-slate-800">{attentionRequired.pendingPurchasesCount}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Out of Stock Alert</span>
                <span className="text-lg font-bold block mt-1 text-rose-500">{attentionRequired.lowStockCount} items</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Open Task checklist</span>
                <span className="text-lg font-bold block mt-1 text-slate-800">{attentionRequired.openTasksCount} actions</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-end gap-3 shrink-0">
          <button
            onClick={() => onActionClick("reports")}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all active:scale-95"
          >
            View Reports
          </button>
          <button
            onClick={onDismiss}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-brand-orange/20"
          >
            Dismiss Report
          </button>
        </div>
      </motion.div>
    </div>
  );
};
