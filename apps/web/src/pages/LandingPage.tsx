import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type { HealthCheckResponse } from "@intelligym/shared";

import { DownloadBanner } from "../components/DownloadBanner";
import { HeroSceneBoundary } from "../components/HeroSceneBoundary";
import { Logo } from "../components/Logo";
import { ProgressRing } from "../components/ProgressRing";
import { StaticHeroFallback } from "../components/StaticHeroFallback";
import { hasFirebaseConfig } from "../config/firebase";
import { useInView } from "../hooks/useInView";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { fetchHealth } from "../lib/api";
import { detectMobilePlatform } from "../lib/device";
import { supportsWebGL } from "../lib/heroSupport";

const LazyScene = lazy(async () => {
  const module = await import("../components/HeroScene");
  return { default: module.HeroScene };
});

const tracks = [
  {
    label: "Treino em casa",
    title: "Rotinas elegantes e adaptativas",
    text: "Plano inteligente para halteres, faixas, bike e uma rotina consistente sem depender de academia."
  },
  {
    label: "Academia",
    title: "Volume, carga e progresso",
    text: "Organização de exercícios, descanso, substituições e progresso semanal em uma experiência profissional."
  },
  {
    label: "Recuperação",
    title: "Fortalecimento com contexto",
    text: "Fluxo seguro para joelho, ombro e retorno gradual ao esporte, sem linguagem clínica irresponsável."
  }
];

const architecture = [
  {
    label: "Frontend",
    title: "Cloudflare para entrega rápida e segura",
    text: "Deploy contínuo, CDN global, preview por branch e uma base preparada para produto real."
  },
  {
    label: "Dados",
    title: "Firebase como camada gerenciada",
    text: "Base pronta para autenticação, banco, arquivos e notificações, sem travar o frontend enquanto as credenciais definitivas não entram."
  },
  {
    label: "Backend",
    title: "Workers para API e regras de negócio",
    text: "API global para gerar treinos, integrações futuras e a lógica sensível do produto."
  }
];

const plans = [
  [
    "Free",
    "Treinos de demonstração, biblioteca e acompanhamento inicial para validar o produto."
  ],
  [
    "Premium",
    "IA personalizada, câmera para técnica, histórico avançado e periodização."
  ],
  [
    "Profissional",
    "Painel para personal, fisioterapeuta e acompanhamento de alunos."
  ]
];

const progressCards = [
  {
    label: "Aderência",
    value: 83,
    accent: "var(--brand)",
    subtitle: "4 sessões planejadas com consistência."
  },
  {
    label: "Conforto",
    value: 70,
    accent: "var(--accent)",
    subtitle: "Dor monitorada sem ignorar sinais de alerta."
  },
  {
    label: "Evolução",
    value: 56,
    accent: "var(--text-secondary)",
    subtitle: "Progresso de carga e estabilidade por fase."
  }
];

const appStoreUrl = import.meta.env.VITE_APP_STORE_URL;
const playStoreUrl = import.meta.env.VITE_PLAY_STORE_URL;
const appDownloadUrl = import.meta.env.VITE_APP_DOWNLOAD_URL;

function getPrimaryDownloadUrl(
  platform: ReturnType<typeof detectMobilePlatform>
) {
  if (platform === "ios" && appStoreUrl) return appStoreUrl;
  if (platform === "android" && playStoreUrl) return playStoreUrl;
  return appDownloadUrl || playStoreUrl || appStoreUrl || null;
}

/** Seção que revela os cartões ao entrar na viewport, via classe CSS. */
function RevealGrid({
  children,
  className
}: {
  children: React.ReactNode;
  className: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div
      className={`${className} reveal ${inView ? "reveal--in" : ""}`}
      ref={ref}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enableWebGl = useMemo(
    () => supportsWebGL({ disableAnimations: reduceMotion }),
    [reduceMotion]
  );
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [platform, setPlatform] =
    useState<ReturnType<typeof detectMobilePlatform>>("desktop");
  const [ringsRef, ringsInView] = useInView<HTMLDivElement>();

  const firebaseReady = hasFirebaseConfig();
  const downloadUrl = getPrimaryDownloadUrl(platform);

  useEffect(() => {
    setPlatform(detectMobilePlatform(window.navigator.userAgent));
  }, []);

  useEffect(() => {
    void fetchHealth()
      .then(setHealth)
      .catch(() => setHealthError("API indisponível no momento."));
  }, []);

  return (
    <div className="page-shell">
      {platform !== "desktop" ? (
        <DownloadBanner platform={platform} downloadUrl={downloadUrl} />
      ) : null}

      <main>
        {/* Entrada do hero em CSS: roda fora da main thread, que aqui está
            ocupada baixando e compilando a cena 3D. */}
        <section className="hero-shell">
          <div className="hero-backdrop" />
          <div className="hero-grid">
            <div className="hero-copy u-stagger">
              <Logo height={36} priority />
              <h1 className="hero-title">
                Treino inteligente para evoluir com mais segurança e
                consistência.
              </h1>
              <p className="hero-description">
                Uma plataforma web profissional para casa, academia e
                recuperação funcional, entregue globalmente pelo Cloudflare e
                pronta para autenticação, dados e evolução contínua.
              </p>
              <div className="hero-actions">
                <Link className="hero-button" to="/signup">
                  Criar conta
                </Link>
                <Link
                  className="hero-button hero-button--secondary"
                  to="/login"
                >
                  Entrar na plataforma
                </Link>
              </div>
              <div className="hero-metrics">
                <span className="soft-chip">Cloudflare global</span>
                <span className="soft-chip">PWA instalável</span>
                <span className="soft-chip">Fallback sem WebGL</span>
              </div>
            </div>

            <div className="hero-visual">
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
                  <span className="section-kicker">Experiência premium</span>
                  <strong>
                    Hero 3D leve, responsivo e com fallback profissional
                  </strong>
                  <span>
                    Web forte para crescer agora e uma ponte clara para o app
                    nativo.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="plataforma">
          <div className="section-heading">
            <span className="section-kicker">Trilhas</span>
            <h2 className="section-title">
              Uma plataforma, três contextos de uso
            </h2>
          </div>
          <RevealGrid className="feature-grid">
            {tracks.map((item) => (
              <article className="feature-card" key={item.title}>
                <span className="hero-pill">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </RevealGrid>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">Infraestrutura</span>
            <h2 className="section-title">
              Arquitetura pronta para deploy e crescimento
            </h2>
          </div>
          <RevealGrid className="feature-grid">
            {architecture.map((item) => (
              <article className="feature-card" key={item.title}>
                <span className="hero-pill">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </RevealGrid>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">Integração</span>
            <h2 className="section-title">
              API ativa e interface pronta para escalar
            </h2>
          </div>
          <div className="api-card">
            <div>
              <strong>Status do backend</strong>
              <p className="api-card__status">
                <span
                  className={`api-card__dot ${
                    health
                      ? "api-card__dot--ok"
                      : healthError
                        ? "api-card__dot--error"
                        : ""
                  }`}
                  aria-hidden="true"
                />
                {health
                  ? `${health.service} respondeu com status ${health.status} na versão ${health.version}.`
                  : (healthError ?? "Consultando API...")}
              </p>
            </div>
            <code>GET /health</code>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">Indicadores</span>
            <h2 className="section-title">Microanimações com função real</h2>
          </div>
          <div className="progress-grid" ref={ringsRef}>
            {progressCards.map((metric, index) => (
              <div className="progress-card" key={metric.label}>
                <ProgressRing
                  value={metric.value}
                  color={metric.accent}
                  label={metric.label}
                  active={ringsInView}
                  delay={index * 110}
                />
                <strong>{metric.label}</strong>
                <p>{metric.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="download">
          <div className="section-heading">
            <span className="section-kicker">Aplicativo</span>
            <h2 className="section-title">
              Web forte agora, app nativo quando fizer sentido
            </h2>
          </div>
          <div className="download-card">
            <div>
              <strong>Instalação do aplicativo IntelliGym</strong>
              <p>
                O site é a porta principal de descoberta e conversão. Quando o
                usuário abrir no celular, mostramos um convite claro para baixar
                o app na loja correta.
              </p>
            </div>
            <div className="download-card__actions">
              {downloadUrl ? (
                <a className="hero-button" href={downloadUrl}>
                  Abrir link do app
                </a>
              ) : (
                <button className="hero-button" type="button" disabled>
                  Link das lojas pendente
                </button>
              )}
              <span className="download-note">
                {firebaseReady
                  ? "Firebase configurado no frontend."
                  : "Firebase ainda precisa das credenciais finais."}
              </span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="section-kicker">Planos futuros</span>
            <h2 className="section-title">
              Base preparada para crescer sem refazer
            </h2>
          </div>
          <RevealGrid className="feature-grid">
            {plans.map(([title, text]) => (
              <article className="feature-card" key={title}>
                <span className="hero-pill">{title}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </RevealGrid>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>IntelliGym</strong>
          <p>Treino, recuperação e inteligência aplicada ao movimento.</p>
        </div>
        <div className="site-footer__links">
          <Link className="text-link" to="/login">
            Entrar
          </Link>
          <Link className="text-link" to="/cadastro">
            Começar agora
          </Link>
        </div>
      </footer>
    </div>
  );
}
