import React from "react";
import { 
  X, 
  TrendingUp, 
  Coins, 
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

interface Mission {
  id: string;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  category: string;
  status: "Pending" | "InProgress" | "Completed" | "Skipped";
}

interface MorningMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: {
    yesterdaySales: number;
    yesterdayExpenses: number;
    yesterdayProfit: number;
    totalCatalogProducts: number;
    lowStockCount: number;
    employeeAttendanceText: string;
  };
  scoreSheet: {
    salesScore: number;
    profitScore: number;
    recoveryScore: number;
    inventoryScore: number;
    customerScore: number;
    employeeScore: number;
    overallScore: number;
  };
  missions: Mission[];
}

export const MorningMissionModal: React.FC<MorningMissionModalProps> = ({
  isOpen,
  onClose,
  summary,
  scoreSheet,
  missions,
}) => {
  if (!isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60";
      case "High": return "bg-brand-orange/10 text-brand-orange border border-brand-orange/20";
      case "Medium": return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
      default: return "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    }
  };

  const score = Math.round(scoreSheet.overallScore || 0);

  const getScoreStatusText = (scoreVal: number) => {
    if (scoreVal >= 85) return { label: "Excellent Condition", color: "text-emerald-500" };
    if (scoreVal >= 70) return { label: "Good Performance", color: "text-slate-700 dark:text-slate-200" };
    if (scoreVal >= 50) return { label: "Needs Attention", color: "text-brand-orange" };
    return { label: "Critical Operations", color: "text-rose-500" };
  };

  const status = getScoreStatusText(score);

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-700 dark:text-slate-300 font-sans overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 h-48 w-48 bg-brand-orange/10 rounded-full blur-3xl -z-10" />

        {/* Header Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700 pb-4 mb-5">
          <div className="h-10 w-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
            <Compass className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
              Morning Mission Center
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">
              {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
          </div>
        </div>

        {/* Split Grid: Summary Stats vs Business Score */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          
          {/* Business Score Circular Gauge */}
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Overall Health</span>
            
            {/* radial circle */}
            <div className="relative h-24 w-24 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-orange"
                  strokeDasharray={`${score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{score}</span>
                <span className="text-[10px] text-slate-400 font-bold block">/100</span>
              </div>
            </div>

            <span className={`text-xs font-black ${status.color}`}>{status.label}</span>
          </div>

          {/* Yesterday KPI Cards */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Yesterday Review</span>
            
            <div className="grid grid-cols-2 gap-2.5">
              {/* Sales */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 block mb-0.5">Sales Volume</span>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  ₹{summary.yesterdaySales.toLocaleString()}
                </div>
              </div>

              {/* Profit */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Net Profit</span>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-brand-orange" />
                  ₹{summary.yesterdayProfit.toLocaleString()}
                </div>
              </div>

              {/* Expenses */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Overhead Costs</span>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                  ₹{summary.yesterdayExpenses.toLocaleString()}
                </div>
              </div>

              {/* Attendance */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Staff Status</span>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-orange" />
                  <span className="truncate">{summary.employeeAttendanceText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Missions Checklist Section */}
        <div className="space-y-3 mb-6">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Today's Focus Items</span>
          
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {missions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No pending focus items today. Operations are clean!</p>
            ) : (
              missions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex-1 pr-3">
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-tight">
                      {mission.title}
                    </h5>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getPriorityColor(mission.priority)}`}>
                    {mission.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
          >
            <Compass className="h-4 w-4" />
            Navigate to Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
