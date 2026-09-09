import { useEffect, useRef, useState } from "react";

/**
 * Dispara uma vez quando o elemento entra na viewport. Usado para revelar
 * seções da landing com CSS — a animação em si roda fora da main thread,
 * que na landing está ocupada carregando a cena 3D.
 */
export function useInView<T extends HTMLElement>(margin = "-15% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [margin]);

  return [ref, inView] as const;
}
