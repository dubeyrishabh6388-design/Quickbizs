import React from "react";
import { 
  X, 
  Activity, 
  CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";

interface MiddayCheckPopupProps {
  checkData: any;
  onDismiss: () => void;
  onActionClick: (screen: "dashboard" | "billing" | "inventory" | "customers" | "suppliers" | "reports" | "ai" | "staff") => void;
}

export const MiddayCheckPopup: React.FC<MiddayCheckPopupProps> = ({
  checkData,
  onDismiss,
  onActionClick,
}) => {
  if (!checkData) return null;

  const { targetCompletion, insights, lowStockCount } = checkData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-slate-100/60 font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-orange/10 rounded-xl">
            <Activity className="h-4.5 w-4.5 text-brand-orange animate-pulse" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Mid-Day Business Check
          </span>
        </div>
        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Target Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
          <span>Today's Sales Target:</span>
          <span className="text-brand-orange">{targetCompletion}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-brand-orange h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, targetCompletion)}%` }}
          />
        </div>
      </div>

      {/* Rule Insights list */}
      <div className="space-y-2 mb-5">
        {insights.map((ins: string, idx: number) => (
          <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 font-semibold leading-normal">
            <CheckCircle2 className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
            <span>{ins}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {lowStockCount > 0 ? (
          <button
            onClick={() => onActionClick("inventory")}
            className="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-bold text-[10px] py-2.5 rounded-xl cursor-pointer shadow-sm transition-all"
          >
            Open Inventory
          </button>
        ) : (
          <button
            onClick={() => onActionClick("reports")}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-2.5 rounded-xl cursor-pointer shadow-sm transition-all"
          >
            Open Reports
          </button>
        )}
        <button
          onClick={onDismiss}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-2.5 rounded-xl cursor-pointer transition-all"
        >
          Dismiss Today
        </button>
      </div>

    </motion.div>
  );
};
