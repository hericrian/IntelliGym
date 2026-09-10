import { useCallback, useEffect, useState } from "react";

import {
  detectInstallPlatform,
  isStandalone,
  rememberInstallDismissed,
  wasInstallDismissed,
  type BeforeInstallPromptEvent,
  type InstallPlatform
} from "../lib/pwa";

type InstallState = {
  platform: InstallPlatform;
  /** Chromium já sinalizou que o app é instalável e guardamos o evento. */
  canPrompt: boolean;
  installed: boolean;
  dismissed: boolean;
  /** Abre o diálogo nativo. Devolve o desfecho, ou null se não havia evento. */
  promptInstall: () => Promise<"accepted" | "dismissed" | null>;
  dismiss: () => void;
};

// Fora do componente: o evento chega uma única vez, muitas vezes antes do
// React montar, então é capturado no módulo e reaproveitado.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    listeners.forEach((notify) => notify());
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((notify) => notify());
  });
}

export function useInstallPrompt(): InstallState {
  const [canPrompt, setCanPrompt] = useState(() => deferredPrompt !== null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [dismissed, setDismissed] = useState(() => wasInstallDismissed());
  const [platform] = useState<InstallPlatform>(() => detectInstallPlatform());

  useEffect(() => {
    const sync = () => {
      setCanPrompt(deferredPrompt !== null);
      setInstalled(isStandalone());
    };

    listeners.add(sync);
    sync();

    const media = window.matchMedia("(display-mode: standalone)");
    media.addEventListener("change", sync);

    return () => {
      listeners.delete(sync);
      media.removeEventListener("change", sync);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    // O evento só pode ser usado uma vez.
    deferredPrompt = null;
    listeners.forEach((notify) => notify());

    if (outcome === "dismissed") {
      rememberInstallDismissed();
      setDismissed(true);
    }

    return outcome;
  }, []);

  const dismiss = useCallback(() => {
    rememberInstallDismissed();
    setDismissed(true);
  }, []);

  return { platform, canPrompt, installed, dismissed, promptInstall, dismiss };
}
