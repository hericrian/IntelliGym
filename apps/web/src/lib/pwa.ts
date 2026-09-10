export type InstallPlatform = "android" | "ios" | "desktop" | "unsupported";

/** Evento proprietário do Chromium — não existe nas libs padrão do DOM. */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

/** O app já está rodando instalado (standalone / janela própria)? */
export function isStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    // iOS Safari não expõe display-mode; usa esta flag não padronizada.
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export function detectInstallPlatform(
  userAgent = navigator.userAgent
): InstallPlatform {
  const ua = userAgent.toLowerCase();

  // iPadOS 13+ se declara como Mac; o toque é o que o diferencia.
  const isIpadOS = /macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/.test(ua) || isIpadOS) return "ios";
  if (/android/.test(ua)) return "android";
  if (/mobile/.test(ua)) return "unsupported";
  return "desktop";
}

/**
 * No iOS só o Safari instala na tela de início. Chrome/Firefox/Edge no iPhone
 * usam o mesmo motor, mas não expõem "Adicionar à Tela de Início".
 */
export function isIosSafari(userAgent = navigator.userAgent) {
  const ua = userAgent.toLowerCase();
  const isWebkit = /safari/.test(ua) && !/crios|fxios|edgios|opios/.test(ua);
  return detectInstallPlatform(userAgent) === "ios" && isWebkit;
}

const DISMISS_KEY = "intelligym.installDismissedAt";
const DISMISS_DAYS = 14;

export function wasInstallDismissed() {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const elapsed = Date.now() - Number(raw);
    return elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function rememberInstallDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Modo privado / storage bloqueado: só não lembramos da dispensa.
  }
}
