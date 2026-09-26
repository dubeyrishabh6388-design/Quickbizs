import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallState {
  hasNativePrompt: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  platformType: "mobile" | "desktop";
  promptInstall: () => Promise<boolean>;
  downloadDesktopLauncher: () => void;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if running in standalone mode (already installed as PWA)
  const isStandalone = typeof window !== "undefined" && (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );

  // Detect iOS
  const isIOS = typeof window !== "undefined" && (
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
    !(window as any).MSStream
  );

  // Detect Mobile vs Desktop / Laptop
  const isMobile = typeof window !== "undefined" && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default mini-infobar so our custom modal controls it
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem("qb_pwa_installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        localStorage.setItem("qb_pwa_installed", "true");
        return true;
      }
      return false;
    } catch (err) {
      console.error("[PWA] Installation prompt failed:", err);
      return false;
    }
  }, [deferredPrompt]);

  // Generates and triggers download of a native Windows / Mac desktop shortcut launcher
  const downloadDesktopLauncher = useCallback(() => {
    try {
      const origin = window.location.origin;
      const shortcutContent = `[InternetShortcut]
URL=${origin}/
IconIndex=0
IconFile=${origin}/favicon.jpg
HotKey=0
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,11
`;
      const blob = new Blob([shortcutContent], { type: "application/internet-shortcut" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "QuickBizs-App.url";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[PWA] Failed to download desktop launcher:", err);
    }
  }, []);

  return {
    hasNativePrompt: !!deferredPrompt,
    isInstallable: !!deferredPrompt || isIOS,
    isInstalled: isInstalled || isStandalone,
    isIOS,
    isStandalone,
    platformType: isMobile ? "mobile" : "desktop",
    promptInstall,
    downloadDesktopLauncher,
  };
}
