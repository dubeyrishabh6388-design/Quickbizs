import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Delete, X, AlertCircle } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { UserRole } from "../context/BusinessContext";

interface OwnerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetRole?: UserRole;
  targetRoleTitle?: string;
}

export const OwnerPinModal: React.FC<OwnerPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetRole = "Owner",
  targetRoleTitle = "Business Owner",
}) => {
  const { verifyRolePin, departmentConfigs } = useBusiness();
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setErrorMsg(null);
      setShake(false);
    }
  }, [isOpen]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin("");
    setErrorMsg(null);
  };

  const verify = (code: string) => {
    if (verifyRolePin(targetRole, code)) {
      setErrorMsg(null);
      onSuccess();
      onClose();
    } else {
      setShake(true);
      const defaultHint = departmentConfigs[targetRole]?.pin || "1234";
      setErrorMsg(`गलत पिन! Incorrect ${targetRoleTitle} PIN. (Default: ${defaultHint})`);
      setTimeout(() => {
        setShake(false);
        setPin("");
      }, 700);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pin, targetRole]);

  if (!isOpen) return null;

  const roleDefaultPin = departmentConfigs[targetRole]?.pin || "1234";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: shake ? [-8, 8, -8, 8, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-white space-y-5 z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center space-y-2 pt-2">
            <div className="inline-flex p-3 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange mb-1 shadow-lg shadow-brand-orange/10">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              {targetRoleTitle} सुरक्षा पिन
            </h3>
            <p className="text-xs text-slate-400 max-w-[260px] mx-auto leading-relaxed">
              Enter <strong className="text-brand-orange font-bold">{targetRoleTitle}</strong> access PIN to unlock this workstation (or Owner Master PIN).
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <motion.div
                  key={index}
                  animate={{
                    scale: isFilled ? 1.15 : 1,
                    backgroundColor: isFilled ? "#f97316" : "transparent",
                  }}
                  transition={{ duration: 0.15 }}
                  className={`h-4 w-4 rounded-full border-2 transition-all ${
                    isFilled
                      ? "border-brand-orange bg-brand-orange shadow-md shadow-brand-orange/40"
                      : "border-slate-600 bg-slate-800/60"
                  }`}
                />
              );
            })}
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-950/40 border border-rose-800/50 py-1.5 px-3 rounded-xl text-center"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(String(num))}
                className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 text-lg font-bold text-white transition-all cursor-pointer shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-2xl bg-slate-850 hover:bg-slate-800 active:scale-95 border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigit("0")}
              className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 text-lg font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-2xl bg-slate-850 hover:bg-slate-800 active:scale-95 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Backspace"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Department Lock
            </span>
            <span>Default PIN: <strong className="text-slate-400 font-mono">{roleDefaultPin}</strong></span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
