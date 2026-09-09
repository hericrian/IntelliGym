import { animate, createScope, stagger } from "animejs";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

import type { HealthCheckResponse } from "@intelligym/shared";

import { DownloadBanner } from "../components/DownloadBanner";
import { HeroSceneBoundary } from "../components/HeroSceneBoundary";
import { StaticHeroFallback } from "../components/StaticHeroFallback";
import { hasFirebaseConfig } from "../config/firebase";
import { fetchHealth } from "../lib/api";
import { detectMobilePlatform } from "../lib/device";
import { supportsWebGL } from "../lib/heroSupport";

const LazyScene = lazy(async () => {
  const module = await import("../components/HeroScene");
  return { default: module.HeroScene };
});

const metrics = [
  {
    label: "Treino em casa",
    title: "Rotinas elegantes e adaptativas",
    text: "Plano inteligente para halteres, faixas, bike e rotina consistente sem depender de academia."
  },
  {
    label: "Academia",
    title: "Volume, carga e progresso",
    text: "Organizacao de exercicios, descanso, substituicoes e progresso semanal em uma experiencia profissional."
  },
  {
    label: "Recuperacao",
    title: "Fortalecimento com contexto",
    text: "Fluxo seguro para joelho, ombro e retorno gradual ao esporte sem linguagem clinica irresponsavel."
  }
] as const;

const progressCards = [
  { label: "Aderencia", value: 83, accent: "#4cc38a", subtitle: "4 sessoes planejadas com consistencia." },
  { label: "Conforto", value: 70, accent: "#d8a267", subtitle: "Dor monitorada sem ignorar sinais de alerta." },
  { label: "Evolucao", value: 56, accent: "#c8d4de", subtitle: "Progresso de carga e estabilidade por fase." }
] as const;

const appStoreUrl = import.meta.env.VITE_APP_STORE_URL;
const playStoreUrl = import.meta.env.VITE_PLAY_STORE_URL;
const appDownloadUrl = import.meta.env.VITE_APP_DOWNLOAD_URL;

function getPrimaryDownloadUrl(platform: ReturnType<typeof detectMobilePlatform>) {
  if (platform === "ios" && appStoreUrl) {
    return appStoreUrl;
  }

  if (platform === "android" && playStoreUrl) {
    return playStoreUrl;
  }

  return appDownloadUrl || playStoreUrl || appStoreUrl || null;
}

export function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const enableWebGl = useMemo(
    () => supportsWebGL({ disableAnimations: Boolean(shouldReduceMotion) }),
    [shouldReduceMotion]
  );
  const heroRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<ReturnType<typeof detectMobilePlatform>>("desktop");

  const firebaseReady = hasFirebaseConfig();
  const downloadUrl = getPrimaryDownloadUrl(platform);

  useEffect(() => {
    setPlatform(detectMobilePlatform(window.navigator.userAgent));
  }, []);

  useEffect(() => {
    void fetchHealth()
      .then((payload) => setHealth(payload))
      .catch(() => setHealthError("API indisponivel no momento."));
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || !heroRef.current || !statsRef.current) {
      return;
    }

    const scope = createScope({ root: heroRef.current }).add(() => {
      animate(".hero-pill", {
        y: [14, 0],
        opacity: [0, 1],
        delay: stagger(70),
        duration: 640,
        ease: "out(4)"
      });
    });

    const statTargets = Array.from(statsRef.current.querySelectorAll<HTMLElement>("[data-value-target]"));
    const ringTargets = Array.from(statsRef.current.querySelectorAll<SVGCircleElement>("[data-ring-length]"));

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

    ringTargets.forEach((element, index) => {
      const ringLength = Number(element.dataset.ringLength ?? "0");
      const offset = Number(element.dataset.ringOffset ?? ringLength);
      element.style.strokeDasharray = `${ringLength}`;
      element.style.strokeDashoffset = `${ringLength}`;

      animate(element, {
        strokeDashoffset: [ringLength, offset],
        duration: 980,
        delay: 180 + index * 120,
        ease: "outExpo"
      });
    });

    return () => scope.revert();
  }, [shouldReduceMotion]);

  return (
    <div className="page-shell">
      {platform !== "desktop" ? <DownloadBanner platform={platform} downloadUrl={downloadUrl} /> : null}

      <section className="hero-shell" ref={heroRef}>
        <div className="hero-backdrop" />
        <div className="hero-grid">
          <motion.div
            className="hero-copy"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: "easeOut" }}
          >
            <div className="hero-pill hero-kicker">IntelliGym</div>
            <motion.h1
              className="hero-title"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 34 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.78, delay: 0.08, ease: "easeOut" }}
            >
              Treino inteligente para evoluir com mais seguranca e consistencia.
            </motion.h1>
            <motion.p
              className="hero-description"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.16, ease: "easeOut" }}
            >
              Uma plataforma web profissional para casa, academia e recuperação funcional, entregue globalmente
              pelo Cloudflare e pronta para autenticação, dados e evolução contínua.
            </motion.p>
            <div className="hero-actions">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}>
                <Link className="hero-button" to="/signup">
                  Criar conta
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}>
                <Link className="hero-button hero-button--secondary" to="/login">
                  Entrar na plataforma
                </Link>
              </motion.div>
            </div>
            <div className="hero-metrics">
              <span className="hero-pill">Cloudflare global</span>
              <span className="hero-pill">PWA instalável</span>
              <span className="hero-pill hero-pill--warning">Fallback sem WebGL</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.82, delay: 0.12, ease: "easeOut" }}
          >
            <div className="hero-stage">
              {enableWebGl ? (
                <HeroSceneBoundary fallback={<StaticHeroFallback />}>
                  <Suspense fallback={<StaticHeroFallback />}>
                    <LazyScene />
                  </Suspense>
                </HeroSceneBoundary>
              ) : (
                <StaticHeroFallback />
              )}
              <div className="hero-overlay">
                <span className="hero-overlay__eyebrow">Experiencia premium</span>
                <strong>Hero 3D leve, responsivo e com fallback profissional</strong>
                <span>Web forte para crescer agora e ponte clara para o app nativo nas lojas.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section" id="plataforma">
        <div className="section-heading">
          <span className="section-kicker">Trilhas</span>
          <h2 className="section-title">Uma plataforma, tres contextos de uso</h2>
        </div>
        <div className="feature-grid">
          {metrics.map((item, index) => (
            <motion.article
              key={item.title}
              className="feature-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.62, delay: index * 0.08, ease: "easeOut" }}
            >
              <span className="hero-pill feature-card__label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Infraestrutura</span>
          <h2 className="section-title">Arquitetura pronta para deploy e crescimento</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="hero-pill feature-card__label">Frontend</span>
            <h3>Cloudflare para entrega rápida e segura</h3>
            <p>Deploy contínuo, CDN global, preview por branch e uma base preparada para produto real.</p>
          </article>
          <article className="feature-card">
            <span className="hero-pill feature-card__label">Dados</span>
            <h3>Firebase como camada gerenciada</h3>
            <p>
              Base preparada para Auth, Firestore, Storage e notificacoes push, sem travar o frontend enquanto as
              credenciais definitivas nao entram.
            </p>
          </article>
          <article className="feature-card">
            <span className="hero-pill feature-card__label">Backend</span>
            <h3>Workers para API e regras de negócio</h3>
            <p>API global para gerar treinos, integrações futuras e lógica sensível do produto.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Integracao</span>
          <h2 className="section-title">API ativa e interface pronta para escalar</h2>
        </div>
        <div className="api-card">
          <div>
            <strong>Status do backend</strong>
            <p>
              {health
                ? `${health.service} respondeu com status ${health.status} na versao ${health.version}.`
                : healthError ?? "Consultando API..."}
            </p>
          </div>
          <code>GET /health</code>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Indicadores</span>
          <h2 className="section-title">Microanimacoes com funcao real</h2>
        </div>
        <div className="progress-grid" ref={statsRef}>
          {progressCards.map((metric) => {
            const circumference = 219.91;
            const offset = circumference * (1 - metric.value / 100);

            return (
              <motion.div
                key={metric.label}
                className="progress-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="progress-ring">
                  <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">
                    <circle cx="45" cy="45" r="35" fill="none" stroke="#20384E" strokeWidth="8" />
                    <circle
                      cx="45"
                      cy="45"
                      r="35"
                      fill="none"
                      stroke={metric.accent}
                      strokeWidth="8"
                      strokeLinecap="round"
                      transform="rotate(-90 45 45)"
                      data-ring-length={circumference}
                      data-ring-offset={offset}
                    />
                  </svg>
                  <span data-value-target={metric.value} className="progress-ring__value">
                    0%
                  </span>
                </div>
                <strong>{metric.label}</strong>
                <p>{metric.subtitle}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="section" id="download">
        <div className="section-heading">
          <span className="section-kicker">Aplicativo</span>
          <h2 className="section-title">Web forte agora, app nativo quando fizer sentido</h2>
        </div>
        <div className="download-card">
          <div>
            <strong>Instalacao do aplicativo IntelliGym</strong>
            <p>
              O site pode funcionar como porta principal de descoberta e conversao. Quando o usuario abrir no celular,
              mostramos um convite claro para baixar o app pela loja correta.
            </p>
          </div>
          <div className="download-card__actions">
            <a className="hero-button" href={downloadUrl ?? "#"} aria-disabled={!downloadUrl}>
              {downloadUrl ? "Abrir link do app" : "Link das lojas pendente"}
            </a>
            <span className="download-note">
              {firebaseReady ? "Firebase configurado no frontend." : "Firebase ainda precisa das credenciais finais."}
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="section-kicker">Planos futuros</span>
          <h2 className="section-title">Base preparada para crescer sem refazer</h2>
        </div>
        <div className="feature-grid">
          {[
            ["Free", "Treinos mockados, biblioteca e acompanhamento inicial para validar produto."],
            ["Premium", "IA personalizada, camera para tecnica, historico avancado e periodizacao."],
            ["Profissional", "Painel para personal, fisioterapeuta e acompanhamento de alunos."]
          ].map(([title, text]) => (
            <article className="feature-card" key={title}>
              <span className="hero-pill feature-card__label">{title}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <strong>IntelliGym</strong>
        <span>Produto web em evolucao para treino, recuperacao e inteligencia aplicada ao movimento.</span>
        <div className="hero-actions">
          <Link className="text-link" to="/login">Entrar</Link>
          <Link className="text-link" to="/cadastro">Comecar agora</Link>
        </div>
      </footer>
    </div>
  );
}
