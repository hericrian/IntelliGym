import { animate, createScope, stagger } from "animejs";
import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";

import { useAppState } from "../../core/state/AppStateContext";
import { painBadge, totalSets } from "../../domain/selectors";
import { colors } from "../../ui/theme";
import { getHeroMetrics, supportsWebGL } from "./web/heroSupport";

const WebHeroScene = lazy(() => import("./web/WebHeroScene"));

export function HomeScreen() {
  const { progress, selectedWorkout, setActiveTab } = useAppState();
  const shouldReduceMotion = useReducedMotion();
  const enableWebGl = useMemo(
    () => supportsWebGL({ disableAnimations: Boolean(shouldReduceMotion) }),
    [shouldReduceMotion]
  );
  const metrics = useMemo(
    () => getHeroMetrics(progress, selectedWorkout),
    [progress, selectedWorkout]
  );
  const heroScopeRef = useRef<HTMLDivElement | null>(null);
  const statsScopeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const heroNode = heroScopeRef.current;
    const statsNode = statsScopeRef.current;

    if (!heroNode || !statsNode || shouldReduceMotion) {
      return;
    }

    const scope = createScope({ root: heroNode }).add(() => {
      animate(".hero-pill", {
        y: [14, 0],
        opacity: [0, 1],
        delay: stagger(60),
        duration: 640,
        ease: "out(4)"
      });
    });

    const statTargets = Array.from(
      statsNode.querySelectorAll<HTMLElement>("[data-value-target]")
    );
    const lineTargets = Array.from(
      statsNode.querySelectorAll<SVGCircleElement>("[data-ring-length]")
    );

    statTargets.forEach((element) => {
      const target = Number(element.dataset.valueTarget ?? "0");
      const state = { value: 0 };

      animate(state, {
        value: target,
        duration: 1100,
        delay: 220,
        ease: "outExpo",
        onUpdate: () => {
          element.textContent = `${Math.round(state.value)}%`;
        }
      });
    });

    lineTargets.forEach((element, index) => {
      const ringLength = Number(element.dataset.ringLength ?? "0");
      const offset = Number(element.dataset.ringOffset ?? ringLength);
      element.style.strokeDasharray = `${ringLength}`;
      element.style.strokeDashoffset = `${ringLength}`;

      animate(element, {
        strokeDashoffset: [ringLength, offset],
        duration: 1000,
        delay: 180 + index * 120,
        ease: "outExpo"
      });
    });

    return () => {
      scope.revert();
    };
  }, [shouldReduceMotion]);

  return (
    <div style={styles.page}>
      <section style={styles.heroShell} ref={heroScopeRef}>
        <div style={styles.heroBackdrop} />
        <div style={styles.heroGrid}>
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={styles.copyColumn}
          >
            <div className="hero-pill" style={styles.kicker}>
              IntelliGym
            </div>
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 34 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: "easeOut" }}
              style={styles.heroTitle}
            >
              Treino inteligente para evoluir com mais seguranca, consistencia e
              contexto.
            </motion.h1>
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.16, ease: "easeOut" }}
              style={styles.heroDescription}
            >
              Uma experiencia premium para casa, academia e recuperacao
              funcional, com base preparada para IA, camera, progressao segura e
              crescimento real do produto.
            </motion.p>
            <div style={styles.ctaRow}>
              <HeroButton
                label="Comecar agora"
                onClick={() => setActiveTab("workout")}
              />
              <HeroButton
                label="Conhecer o aplicativo"
                onClick={() => setActiveTab("progress")}
                secondary
              />
            </div>
            <div style={styles.metricPills}>
              <MetricPill
                label={`${selectedWorkout.estimatedDurationMin} min`}
              />
              <MetricPill label={`${totalSets(selectedWorkout)} series`} />
              <MetricPill
                label={`Dor ${painBadge(selectedWorkout.weeklyPainAverage)}`}
                warning
              />
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.12, ease: "easeOut" }}
            style={styles.visualColumn}
          >
            <div style={styles.visualCard}>
              {enableWebGl ? (
                <Suspense fallback={<StaticHeroFallback />}>
                  <WebHeroScene />
                </Suspense>
              ) : (
                <StaticHeroFallback />
              )}
              <div style={styles.visualOverlay}>
                <span style={styles.overlayEyebrow}>Modo premium</span>
                <strong style={styles.overlayTitle}>
                  Treino em casa, academia e recuperacao
                </strong>
                <span style={styles.overlayText}>
                  Visual rico na web, com fallback leve e profissional no mobile
                  ou sem WebGL.
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          style={styles.scrollHint}
        >
          Role para ver as trilhas de treino, recuperacao e progresso.
        </motion.div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionKicker}>Experiencias</span>
          <h2 style={styles.sectionTitle}>
            Tres caminhos claros para usar o IntelliGym
          </h2>
        </div>
        <div style={styles.cardGrid}>
          {[
            {
              title: "Treino em casa",
              text: "Sessões objetivas com halteres, faixas, bicicleta e progressão pensada para aderência real."
            },
            {
              title: "Academia",
              text: "Rotinas mais densas, com controle de carga, volume, descanso e substituições inteligentes."
            },
            {
              title: "Recuperacao",
              text: "Fases claras de fortalecimento, estabilidade e retorno gradual ao esporte sem promessas médicas."
            }
          ].map((item, index) => (
            <motion.article
              key={item.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
              whileInView={
                shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
              }
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.65,
                delay: 0.08 * index,
                ease: "easeOut"
              }}
              style={styles.featureCard}
            >
              <span className="hero-pill" style={styles.cardIndex}>
                0{index + 1}
              </span>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardText}>{item.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionKicker}>Indicadores</span>
          <h2 style={styles.sectionTitle}>
            Microanimacoes com utilidade, nao so efeito
          </h2>
        </div>
        <div style={styles.progressGrid} ref={statsScopeRef}>
          {metrics.map((metric) => (
            <ProgressMetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              accent={metric.accent}
              subtitle={metric.subtitle}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroButton({
  label,
  onClick,
  secondary = false
}: {
  label: string;
  onClick: () => void;
  secondary?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        ...styles.button,
        ...(secondary ? styles.secondaryButton : {})
      }}
    >
      {label}
    </motion.button>
  );
}

function MetricPill({
  label,
  warning = false
}: {
  label: string;
  warning?: boolean;
}) {
  return (
    <div
      className="hero-pill"
      style={{
        ...styles.metricPill,
        ...(warning ? styles.metricWarning : {})
      }}
    >
      {label}
    </div>
  );
}

function ProgressMetricCard({
  accent,
  label,
  subtitle,
  value
}: {
  accent: string;
  label: string;
  subtitle: string;
  value: number;
}) {
  const circumference = 219.91;
  const offset = circumference * (1 - value / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={styles.progressCard}
    >
      <div style={styles.ringWrap}>
        <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">
          <circle
            cx="45"
            cy="45"
            r="35"
            fill="none"
            stroke="#2A2533"
            strokeWidth="8"
          />
          <circle
            cx="45"
            cy="45"
            r="35"
            fill="none"
            stroke={accent}
            strokeWidth="8"
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
            data-ring-length={circumference}
            data-ring-offset={offset}
          />
        </svg>
        <span data-value-target={value} style={styles.ringValue}>
          0%
        </span>
      </div>
      <strong style={styles.progressLabel}>{label}</strong>
      <span style={styles.progressText}>{subtitle}</span>
    </motion.div>
  );
}

function StaticHeroFallback() {
  return (
    <div style={styles.fallbackVisual}>
      <div style={styles.fallbackCore} />
      <div style={styles.fallbackRing} />
      <div style={styles.fallbackColumn} />
      <div style={styles.fallbackPulse} />
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    background:
      "radial-gradient(circle at top, rgba(56, 120, 84, 0.18), transparent 28%), #000000",
    color: colors.text,
    padding: "28px 24px 80px"
  },
  heroShell: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "36px",
    border: `1px solid ${colors.border}`,
    background:
      "linear-gradient(160deg, rgba(33,29,38,0.95) 0%, rgba(18,16,20,0.98) 55%, rgba(21,18,24,1) 100%)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
    padding: "36px",
    maxWidth: "1280px",
    margin: "0 auto 28px"
  },
  heroBackdrop: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(120deg, rgba(51,230,165,0.07), transparent 32%, transparent 68%, rgba(255,179,102,0.07))"
  },
  heroGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: "28px",
    alignItems: "stretch"
  },
  copyColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "18px",
    minWidth: 0
  },
  visualColumn: {
    display: "flex",
    alignItems: "stretch"
  },
  kicker: {
    alignSelf: "flex-start",
    display: "inline-flex",
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(112,240,197,0.25)",
    background: "rgba(42,37,51,0.75)",
    color: colors.accentSoft,
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.16em",
    textTransform: "uppercase"
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(2.8rem, 6vw, 4.9rem)",
    lineHeight: 1.02,
    fontWeight: 850,
    maxWidth: "11ch"
  },
  heroDescription: {
    margin: 0,
    color: colors.mutedText,
    fontSize: "1.05rem",
    lineHeight: 1.7,
    maxWidth: "58ch"
  },
  ctaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "8px"
  },
  button: {
    appearance: "none",
    border: "none",
    borderRadius: "18px",
    minHeight: "56px",
    padding: "0 22px",
    background: colors.accent,
    color: colors.background,
    fontWeight: 800,
    fontSize: "0.98rem",
    cursor: "pointer",
    boxShadow: "0 14px 34px rgba(51,230,165,0.18)"
  },
  secondaryButton: {
    background: "rgba(42,37,51,0.88)",
    color: colors.text,
    border: `1px solid ${colors.border}`,
    boxShadow: "none"
  },
  metricPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "8px"
  },
  metricPill: {
    display: "inline-flex",
    padding: "10px 14px",
    borderRadius: "999px",
    border: `1px solid ${colors.border}`,
    background: "rgba(48,42,58,0.78)",
    color: colors.text,
    fontSize: "0.86rem",
    fontWeight: 700
  },
  metricWarning: {
    color: colors.warning,
    borderColor: colors.warningBorder,
    background: "rgba(51,35,19,0.86)"
  },
  visualCard: {
    position: "relative",
    flex: 1,
    minHeight: "clamp(360px, 54vw, 560px)",
    borderRadius: "28px",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(24, 21, 28, 0.8) 0%, rgba(8, 17, 26, 1) 100%)",
    border: `1px solid ${colors.border}`
  },
  visualOverlay: {
    position: "absolute",
    left: "18px",
    right: "18px",
    bottom: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "16px 18px",
    borderRadius: "22px",
    background: "rgba(15, 13, 17, 0.76)",
    backdropFilter: "blur(12px)",
    border: `1px solid rgba(112,240,197,0.12)`
  },
  overlayEyebrow: {
    color: colors.accent,
    textTransform: "uppercase",
    fontSize: "0.72rem",
    letterSpacing: "0.16em",
    fontWeight: 800
  },
  overlayTitle: {
    fontSize: "1rem"
  },
  overlayText: {
    color: colors.mutedText,
    fontSize: "0.92rem",
    lineHeight: 1.5
  },
  fallbackVisual: {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: "clamp(360px, 54vw, 560px)",
    background:
      "radial-gradient(circle at 50% 32%, rgba(112,240,197,0.14), transparent 26%), linear-gradient(180deg, rgba(10,18,28,0.6), rgba(15,13,17,1))"
  },
  fallbackCore: {
    position: "absolute",
    width: "210px",
    height: "280px",
    left: "50%",
    top: "46%",
    transform: "translate(-50%, -50%)",
    borderRadius: "100px 100px 80px 80px",
    background:
      "linear-gradient(180deg, rgba(243,247,251,0.95), rgba(168,163,179,0.65) 55%, rgba(80,75,88,0.3))",
    boxShadow: "0 30px 60px rgba(0,0,0,0.24)"
  },
  fallbackRing: {
    position: "absolute",
    width: "330px",
    height: "330px",
    left: "50%",
    top: "42%",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    border: "1px solid rgba(112,240,197,0.22)"
  },
  fallbackColumn: {
    position: "absolute",
    width: "110px",
    height: "340px",
    left: "50%",
    top: "48%",
    transform: "translate(-50%, -50%)",
    borderRadius: "60px",
    border: "1px solid rgba(255,255,255,0.08)"
  },
  fallbackPulse: {
    position: "absolute",
    width: "500px",
    height: "500px",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(51,230,165,0.08), transparent 62%)"
  },
  scrollHint: {
    position: "relative",
    zIndex: 1,
    marginTop: "24px",
    color: colors.mutedText,
    fontSize: "0.92rem"
  },
  section: {
    maxWidth: "1280px",
    margin: "0 auto 28px"
  },
  sectionHeader: {
    marginBottom: "18px"
  },
  sectionKicker: {
    display: "inline-flex",
    color: colors.accent,
    textTransform: "uppercase",
    fontWeight: 800,
    letterSpacing: "0.14em",
    fontSize: "0.76rem"
  },
  sectionTitle: {
    margin: "10px 0 0",
    fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
    lineHeight: 1.08
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px"
  },
  featureCard: {
    padding: "22px",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(33,29,38,0.96), rgba(21,18,24,1))",
    border: `1px solid ${colors.border}`,
    minHeight: "220px"
  },
  cardIndex: {
    display: "inline-flex",
    padding: "9px 12px",
    borderRadius: "999px",
    background: "rgba(42,37,51,0.86)",
    color: colors.accentSoft,
    fontWeight: 800,
    fontSize: "0.74rem"
  },
  cardTitle: {
    margin: "16px 0 8px",
    fontSize: "1.4rem"
  },
  cardText: {
    margin: 0,
    color: colors.mutedText,
    lineHeight: 1.7
  },
  progressGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px"
  },
  progressCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "flex-start",
    padding: "22px",
    borderRadius: "26px",
    background:
      "linear-gradient(180deg, rgba(33,29,38,0.96), rgba(21,18,24,1))",
    border: `1px solid ${colors.border}`
  },
  ringWrap: {
    position: "relative",
    width: "90px",
    height: "90px"
  },
  ringValue: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "1rem"
  },
  progressLabel: {
    fontSize: "1.05rem"
  },
  progressText: {
    color: colors.mutedText,
    lineHeight: 1.6
  }
};
