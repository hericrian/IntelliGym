import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type { HealthCheckResponse } from "@intelligym/shared";

import { InstallBanner } from "../components/InstallBanner";
import { InstallGuide } from "../components/InstallGuide";
import { HeroSceneBoundary } from "../components/HeroSceneBoundary";
import { Logo } from "../components/Logo";
import { ProgressRing } from "../components/ProgressRing";
import { StaticHeroFallback } from "../components/StaticHeroFallback";
import { useInView } from "../hooks/useInView";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { fetchHealth } from "../lib/api";
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
  const [ringsRef, ringsInView] = useInView<HTMLDivElement>();

  useEffect(() => {
    void fetchHealth()
      .then(setHealth)
      .catch(() => setHealthError("API indisponível no momento."));
  }, []);

  return (
    <div className="page-shell">
      <InstallBanner />

      <main>
        {/* Entrada do hero em CSS: roda fora da main thread, que aqui está
            ocupada baixando e compilando a cena 3D. */}
        <section className="hero-shell">
          <div className="hero-backdrop" />
          <div className="hero-grid">
            <div className="hero-copy u-stagger">
              <Logo height={112} priority />
              <h1 className="hero-title">
                Seu treino, seu ritmo, sua evolução.
              </h1>
              <p className="hero-description">
                Escolha seus equipamentos, objetivo e rotina. O IntelliGym
                organiza um plano claro para casa, academia e fortalecimento
                gradual com mais segurança.
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
                <span className="soft-chip">Plano adaptativo</span>
                <span className="soft-chip">Casa ou academia</span>
                <span className="soft-chip">Acompanhe sua evolução</span>
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
                  <span className="section-kicker">Treino em movimento</span>
                  <strong>Seu programa acompanha o seu momento</strong>
                  <span>
                    Execute, registre e ajuste cada sessão em uma experiência
                    simples de seguir.
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
              Instale no celular ou no computador
            </h2>
          </div>
          <InstallGuide />
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
