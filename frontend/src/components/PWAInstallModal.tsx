import React, { useState, useEffect } from "react";
import { 
  Download, 
  X, 
  Smartphone, 
  Zap, 
  WifiOff, 
  ShieldCheck, 
  Share, 
  PlusSquare,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  forceOpen = false,
  onClose
}) => {
  const { 
    hasNativePrompt, 
    isInstalled, 
    isIOS, 
    isStandalone, 
    platformType, 
    promptInstall, 
    downloadDesktopLauncher 
  } = usePWAInstall();

  const [isOpen, setIsOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Preparing download...");
  const [justInstalled, setJustInstalled] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  // Determine if modal should automatically show
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setShowManualGuide(false);
      setInstalling(false);
      setJustInstalled(false);
      return;
    }

    if (isInstalled || isStandalone) {
      setIsOpen(false);
      return;
    }

    // Check cooldown in localStorage (3 days)
    const dismissedAt = localStorage.getItem("qb_pwa_dismissed_at");
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 3) {
        return;
      }
    }

    // Show after slight delay for better UX after login
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [forceOpen, isInstalled, isStandalone]);

  const handleClose = () => {
    localStorage.setItem("qb_pwa_dismissed_at", Date.now().toString());
    setIsOpen(false);
    setShowManualGuide(false);
    setInstalling(false);
    if (onClose) onClose();
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS strictly enforces Safari's share menu
      setShowManualGuide(true);
      return;
    }

    setInstalling(true);
    setDownloadProgress(25);
    setStatusMessage("Initializing application package...");

    if (hasNativePrompt) {
      try {
        setDownloadProgress(60);
        setStatusMessage("Opening native install prompt...");
        const installed = await promptInstall();
        if (installed) {
          setDownloadProgress(100);
          setStatusMessage("Installation complete!");
          setInstalling(false);
          setJustInstalled(true);
          setTimeout(() => {
            setIsOpen(false);
            if (onClose) onClose();
          }, 2000);
          return;
        }
      } catch (err) {
        console.error("[PWA] Prompt failed:", err);
      }
    }

    // Direct 1-Click Application Launcher Download
    setDownloadProgress(50);
    setStatusMessage("Downloading QuickBizs Application...");
    downloadDesktopLauncher();

    setTimeout(() => {
      setDownloadProgress(85);
      setStatusMessage("Finalizing shortcut on device...");
    }, 350);

    setTimeout(() => {
      setDownloadProgress(100);
      setStatusMessage("Download complete!");
      setInstalling(false);
      setJustInstalled(true);
      setTimeout(() => {
        setIsOpen(false);
        if (onClose) onClose();
      }, 2500);
    }, 850);
  };

  if (!isOpen || (isInstalled && !forceOpen && !justInstalled)) {
    return null;
  }

  const isDesktop = platformType === "desktop";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header gradient banner */}
          <div className="relative bg-gradient-to-br from-brand-orange via-orange-600 to-amber-600 p-5 sm:p-6 text-white text-center overflow-hidden">
            {/* Background glowing circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-black/10 rounded-full blur-lg pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/35 text-white/90 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Icon preview */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center p-1.5 mb-3 ring-4 ring-white/30">
              <img 
                src="/pwa-192.png" 
                alt="QuickBizs Icon" 
                className="w-full h-full rounded-xl object-contain shadow-inner"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <h3 className="text-xl font-black tracking-tight">
              {justInstalled 
                ? "App Ready On Your Device!" 
                : isDesktop 
                  ? "Download QuickBizs Desktop App" 
                  : "Download QuickBizs Mobile App"}
            </h3>
            <p className="text-xs text-orange-100 font-medium mt-1 max-w-xs mx-auto">
              {isDesktop 
                ? "Install on Windows / Mac for high-speed counter billing and offline access" 
                : "Add QuickBizs to your home screen for lightning-fast 1-tap POS billing"}
            </p>
          </div>

          {/* Body Features or Instructions */}
          <div className="p-5 sm:p-6 space-y-4">
            {justInstalled ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">
                  QuickBizs is ready on your device!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You can now launch QuickBizs directly from your home screen or desktop application menu.
                </p>
              </div>
            ) : installing ? (
              /* Animated direct download progress */
              <div className="space-y-3 py-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-brand-orange animate-bounce" />
                    {statusMessage}
                  </span>
                  <span className="text-brand-orange font-extrabold">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-brand-orange to-amber-500 h-2.5 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${downloadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Downloading and configuring QuickBizs application package...
                </p>
              </div>
            ) : isIOS && showManualGuide ? (
              /* iOS Safari Instructions */
              <div className="space-y-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl text-xs text-slate-700 dark:text-slate-200">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-brand-orange" />
                  Install on iPhone / iPad:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <span>Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 text-blue-500 mx-0.5" /> in Safari toolbar.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <span>Tap <strong>Add to Home Screen</strong> <PlusSquare className="inline w-3.5 h-3.5 text-slate-600 dark:text-slate-300 mx-0.5" />.</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Feature highlights */
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-brand-orange shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Instant Launch & Zero Latency</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Opens in standalone mode without browser bars</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 shrink-0">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Offline Capability</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Continue viewing stock and khata during internet cuts</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Desktop & Mobile Native Integration</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Pins to your home screen or taskbar for quick checkout</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={installing}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center cursor-pointer disabled:opacity-50"
              >
                {justInstalled ? "Done" : "Maybe Later"}
              </button>

              {!isIOS && !justInstalled && (
                installing ? (
                  <div className="flex-[1.5] py-2.5 px-4 rounded-xl text-xs font-black bg-brand-orange/20 text-brand-orange border border-brand-orange/40 text-center flex items-center justify-center gap-2">
                    <Download className="w-4 h-4 animate-bounce" />
                    <span>Downloading...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="flex-[1.5] py-2.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-brand-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDesktop ? "Download for Desktop" : "Install Mobile App"}</span>
                  </button>
                )
              )}

              {isIOS && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-[1.5] py-2.5 px-4 rounded-xl text-xs font-black bg-brand-orange text-white shadow-lg shadow-brand-orange/30 hover:bg-orange-600 transition-all text-center cursor-pointer active:scale-95"
                >
                  Got It
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
