import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { InstallBanner } from "../components/InstallBanner";
import { InstallGuide } from "../components/InstallGuide";
import { Logo } from "../components/Logo";

const slides = [
  ["Treino de hoje", "Peito & tríceps", "6 exercícios · 52 min", "workout"],
  [
    "Execução guiada",
    "Supino inclinado",
    "Série 3 de 4 · 10 repetições",
    "exercise"
  ],
  ["Sua evolução", "+18% de volume", "nas últimas 6 semanas", "progress"],
  ["Recuperação", "Pronto para treinar", "Seu ritmo, respeitado", "recovery"]
] as const;

const benefits = [
  [
    "01",
    "Feito para você",
    "Treinos que acompanham seu objetivo, sua rotina e os equipamentos que você tem."
  ],
  [
    "02",
    "Treine com confiança",
    "Orientações visuais, descanso no tempo certo e uma sessão fácil de seguir."
  ],
  [
    "03",
    "Veja sua evolução",
    "Histórico, consistência e progresso reunidos para manter a motivação em alta."
  ]
] as const;

function Demo({ kind }: { kind: (typeof slides)[number][3] }) {
  if (kind === "progress")
    return (
      <div className="demo-chart" aria-hidden="true">
        {[34, 48, 43, 61, 72, 88, 96].map((h, i) => (
          <i
            key={h}
            style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
          />
        ))}
      </div>
    );
  if (kind === "recovery")
    return (
      <div className="demo-readiness" aria-hidden="true">
        <span>
          <strong>86</strong>
          <small>%</small>
        </span>
        <p>Energia em alta</p>
      </div>
    );
  if (kind === "exercise")
    return (
      <div className="bench-photo">
        <img
          src="/bench-press-demo.png"
          alt="Atleta executando supino inclinado com barra"
          loading="lazy"
        />
        <span className="bench-demo__rep">
          08 <small>REP</small>
        </span>
        <div className="bench-demo__line">
          <i />
        </div>
      </div>
    );
  return (
    <div className="demo-workout" aria-hidden="true">
      {["Supino inclinado", "Crucifixo", "Tríceps corda"].map((x, i) => (
        <div key={x}>
          <span>{i + 1}</span>
          <p>
            {x}
            <small>{i === 0 ? "Em andamento" : "A seguir"}</small>
          </p>
          <b>{i === 0 ? "10×" : "—"}</b>
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const move = (direction: -1 | 1) => {
    const next = (active + direction + slides.length) % slides.length;
    setActive(next);
    track.current?.children[next]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  };
  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <Link to="/" aria-label="IntelliGym — início">
          <Logo height={30} priority />
        </Link>
        <nav aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#demonstracao">Demonstração</a>
        </nav>
        <div className="marketing-header__actions">
          <Link className="text-link" to="/login">
            Entrar
          </Link>
          <Link className="hero-button marketing-header__cta" to="/signup">
            Começar grátis
          </Link>
        </div>
      </header>
      <main>
        <InstallBanner />

        <section className="marketing-hero">
          <div className="marketing-hero__grid" />
          <div className="marketing-hero__copy">
            <span className="marketing-kicker">
              <i /> Seu treino. Sua evolução.
            </span>
            <h1>
              Treinar bem ficou <em>mais simples.</em>
            </h1>
            <p>
              Planos personalizados, orientação durante cada exercício e
              progresso que você consegue enxergar.
            </p>
            <div className="hero-actions">
              <Link className="hero-button" to="/signup">
                Montar meu treino grátis
              </Link>
              <a
                className="hero-button hero-button--secondary"
                href="#demonstracao"
              >
                Ver o app em ação
              </a>
            </div>
            <div className="marketing-proof">
              <div className="proof-avatars">
                <span>AM</span>
                <span>RF</span>
                <span>CS</span>
              </div>
              <p>
                <strong>Feito para a vida real</strong>
                <small>Em casa ou na academia</small>
              </p>
            </div>
          </div>
          <div
            className="phone-stage"
            aria-label="Demonstração animada do aplicativo"
          >
            <span className="phone-stage__badge">AO VIVO</span>
            <div className="phone-frame">
              <div className="phone-speaker" />
              <div className="phone-ui">
                <div className="phone-status">
                  <span>09:41</span>
                  <b>● ● ▰</b>
                </div>
                <div className="phone-greeting">
                  <small>OLÁ, ATLETA</small>
                  <strong>Vamos treinar?</strong>
                </div>
                <div className="phone-feature">
                  <span>HOJE</span>
                  <h2>Peito & tríceps</h2>
                  <p>6 exercícios · 52 min</p>
                  <button type="button" tabIndex={-1}>
                    INICIAR TREINO <b>→</b>
                  </button>
                </div>
                <div className="phone-stats">
                  <span>
                    <b>12</b>
                    <small>treinos</small>
                  </span>
                  <span>
                    <b>4</b>
                    <small>semanas</small>
                  </span>
                  <span>
                    <b>86%</b>
                    <small>ritmo</small>
                  </span>
                </div>
                <div className="phone-progress">
                  <span>Progresso semanal</span>
                  <b>3 de 4</b>
                  <i />
                </div>
              </div>
            </div>
            <span className="phone-stage__label">
              INTELLIGYM <b>™</b>
            </span>
          </div>
        </section>
        <section className="marketing-section" id="demonstracao">
          <div className="marketing-section__head">
            <div>
              <span className="section-index">01 / PRODUTO</span>
              <h2>O app em ação.</h2>
            </div>
            <div className="carousel-controls">
              <button
                onClick={() => move(-1)}
                aria-label="Demonstração anterior"
              >
                ←
              </button>
              <button onClick={() => move(1)} aria-label="Próxima demonstração">
                →
              </button>
            </div>
          </div>
          <div className="showcase-track" ref={track}>
            {slides.map(([eyebrow, title, meta, kind], i) => (
              <article
                className={`showcase-card ${i === active ? "showcase-card--active" : ""}`}
                key={title}
                onClick={() => setActive(i)}
              >
                <div className="showcase-card__screen">
                  <Demo kind={kind} />
                </div>
                <span>{eyebrow}</span>
                <h3>{title}</h3>
                <p>{meta}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="marketing-section benefit-section"
          id="como-funciona"
        >
          <div className="marketing-section__head">
            <div>
              <span className="section-index">02 / EXPERIÊNCIA</span>
              <h2>Tudo para manter o ritmo.</h2>
            </div>
          </div>
          <div className="benefit-grid">
            {benefits.map(([n, t, p]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="marketing-section" id="download">
          <div className="marketing-section__head">
            <div>
              <span className="section-index">03 / APLICATIVO</span>
              <h2>Instale no celular ou no computador</h2>
            </div>
          </div>
          <InstallGuide />
        </section>

        <section className="marketing-cta">
          <span>COMECE HOJE</span>
          <h2>
            Seu próximo treino
            <br />
            começa aqui.
          </h2>
          <p>
            Crie seu perfil e receba uma experiência feita para o seu momento.
          </p>
          <Link className="hero-button" to="/signup">
            Criar minha conta
          </Link>
        </section>
      </main>
      <footer className="site-footer marketing-footer">
        <Logo height={24} />
        <p>Treino inteligente, no seu ritmo.</p>
        <div>
          <Link to="/login">Entrar</Link>
          <Link to="/signup">Começar agora</Link>
        </div>
      </footer>
    </div>
  );
}
