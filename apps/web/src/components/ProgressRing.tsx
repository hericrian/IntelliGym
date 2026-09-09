import { useEffect, useRef } from "react";

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ProgressRingProps = {
  value: number;
  color: string;
  label: string;
  active: boolean;
  delay?: number;
};

/**
 * Anel + contador. A animação usa a Web Animations API em vez de uma
 * biblioteca: mesmo controle programático, rodando com performance de CSS e
 * interrompível — e sem somar peso ao bundle da landing.
 */
export function ProgressRing({
  value,
  color,
  label,
  active,
  delay = 0
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);
  const played = useRef(false);

  useEffect(() => {
    const circle = circleRef.current;
    const output = valueRef.current;
    if (!active || played.current || !circle || !output) return;
    played.current = true;

    const target = CIRCUMFERENCE * (1 - value / 100);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      circle.style.strokeDashoffset = `${target}`;
      output.textContent = `${value}%`;
      return;
    }

    const duration = 900;

    circle.animate(
      [{ strokeDashoffset: CIRCUMFERENCE }, { strokeDashoffset: target }],
      {
        duration,
        delay,
        fill: "forwards",
        easing: "cubic-bezier(0.23, 1, 0.32, 1)"
      }
    );

    let frame = 0;
    const start = performance.now() + delay;

    const tick = (now: number) => {
      const elapsed = Math.min(Math.max(now - start, 0) / duration, 1);
      // Mesma curva do anel para que número e traço cheguem juntos.
      const eased = 1 - Math.pow(1 - elapsed, 3);
      output.textContent = `${Math.round(value * eased)}%`;
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value, delay]);

  return (
    <div className="progress-ring">
      <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
        <circle
          cx="42"
          cy="42"
          r={RADIUS}
          fill="none"
          stroke="var(--data-track)"
          strokeWidth="7"
        />
        <circle
          ref={circleRef}
          cx="42"
          cy="42"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <span className="progress-ring__value" ref={valueRef} aria-hidden="true">
        0%
      </span>
      <span className="u-visually-hidden">
        {label}: {value}%
      </span>
    </div>
  );
}
