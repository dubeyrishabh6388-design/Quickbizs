import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  Store, 
  PackageCheck, 
  Sparkles, 
  Lock,
  Receipt,
  UserCheck
} from "lucide-react";

interface AppSplashScreenProps {
  variant?: "merchant" | "customer";
  customMessage?: string;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  variant = "merchant",
  customMessage,
}) => {
  const isMerchant = variant === "merchant";

  const merchantSteps = [
    { text: "Initializing secure POS ledger...", icon: ShieldCheck, detail: "AES-256 local encrypted cache" },
    { text: "Verifying merchant business context...", icon: Store, detail: "Aiven MySQL Cloud synced" },
    { text: "Loading offline catalog & smart inventory...", icon: PackageCheck, detail: "Fast-loading catalog ready" },
    { text: "Readying high-speed billing terminal...", icon: Zap, detail: "Counter Mode & GST engine online" },
  ];

  const customerSteps = [
    { text: "Authenticating customer profile...", icon: UserCheck, detail: "End-to-end verified profile" },
    { text: "Syncing digital receipts & order history...", icon: Receipt, detail: "Khata ledger & invoices verified" },
    { text: "Loading live store catalog & pickup slots...", icon: Store, detail: "Direct merchant connectivity active" },
  ];

  const steps = isMerchant ? merchantSteps : customerSteps;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 300);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  const CurrentStepIcon = steps[currentStepIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between min-h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden p-6">
      {/* Ambient background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-brand-orange/20 via-amber-500/10 to-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top micro brand header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-wider uppercase pt-2"
      >
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          System Online
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <Lock className="w-3 h-3 text-brand-orange" />
          Encrypted POS Core
        </span>
      </motion.div>

      {/* Center Branding & Live Status */}
      <div className="flex flex-col items-center max-w-sm w-full text-center my-auto">
        {/* Animated Brand Logo Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative mb-6"
        >
          {/* Pulsing ring aura */}
          <div className="absolute -inset-3 bg-gradient-to-r from-brand-orange via-amber-500 to-indigo-600 rounded-3xl blur-xl opacity-40 animate-pulse" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-1 border border-slate-700/80 shadow-2xl flex items-center justify-center overflow-hidden">
            <img 
              src="/pwa-icon.svg" 
              alt="QuickBizs Logo" 
              className="w-full h-full object-cover rounded-xl drop-shadow-md"
            />
          </div>

          {/* Mini active badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md">
            <Sparkles className="w-3 h-3" />
          </div>
        </motion.div>

        {/* Brand Title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1.5 mb-7"
        >
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
              Quick<span className="text-brand-orange">Bizs</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {isMerchant ? "POS OS" : "Customer"}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto">
            {isMerchant 
              ? "Next-Gen Retail Billing, Inventory & Khata OS" 
              : "Smart Digital Passbook & Store Connect"}
          </p>
        </motion.div>

        {/* Dynamic Micro-Status Indicator */}
        <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs min-h-[36px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={customMessage || steps[currentStepIndex].text}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
                  <CurrentStepIcon className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-200">
                    {customMessage || steps[currentStepIndex].text}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {steps[currentStepIndex].detail}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <span className="text-xs font-black text-brand-orange tabular-nums shrink-0 ml-2">
              {progress}%
            </span>
          </div>

          {/* Shimmering Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-orange via-amber-400 to-indigo-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
            {/* Shimmer reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
      </div>

      {/* Bottom Live System Metrics Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md flex flex-col items-center gap-3 pb-2"
      >
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            256-Bit SSL Secured
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
            <Zap className="w-3 h-3 text-amber-400" />
            Offline POS Active
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
            <Store className="w-3 h-3 text-indigo-400" />
            Cloud Database Live
          </div>
        </div>

        <span className="text-[10px] font-medium text-slate-600">
          QuickBizs OS v2.4 • High-Availability Enterprise PWA
        </span>
      </motion.div>
    </div>
  );
};
