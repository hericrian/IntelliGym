import { useSyncExternalStore } from "react";

/**
 * Lê uma media query de forma segura para SSR/hidratação, sem efeito e sem
 * render extra: o React assina a própria MediaQueryList.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
