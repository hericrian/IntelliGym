import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  IconAssistant,
  IconClose,
  IconDashboard,
  IconEquipment,
  IconLibrary,
  IconLogout,
  IconMenu,
  IconPlus,
  IconProfile,
  IconProgress,
  IconRecovery,
  IconSettings,
  IconSparkles,
  IconWorkouts
} from "../components/Icons";
import { Logo } from "../components/Logo";
import { useAuth } from "../hooks/useAuth";
import { useMediaQuery } from "../hooks/useMediaQuery";

const navGroups = [
  {
    label: "Treinar",
    items: [
      { to: "/app/dashboard", label: "Dashboard", Icon: IconDashboard },
      { to: "/app/treinos", label: "Treinos", Icon: IconWorkouts },
      { to: "/app/gerar-treino", label: "Gerar treino", Icon: IconSparkles },
      { to: "/app/biblioteca", label: "Biblioteca", Icon: IconLibrary }
    ]
  },
  {
    label: "Acompanhar",
    items: [
      { to: "/app/progresso", label: "Progresso", Icon: IconProgress },
      {
        to: "/app/dor-e-recuperacao",
        label: "Dor e recuperação",
        Icon: IconRecovery
      },
      { to: "/app/assistente", label: "Assistente", Icon: IconAssistant }
    ]
  },
  {
    label: "Conta",
    items: [
      { to: "/app/equipamentos", label: "Equipamentos", Icon: IconEquipment },
      { to: "/app/perfil", label: "Perfil", Icon: IconProfile },
      { to: "/app/configuracoes", label: "Configurações", Icon: IconSettings }
    ]
  }
] as const;

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCompact = useMediaQuery("(max-width: 1180px)");
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const displayName =
    profile?.nome ?? user?.displayName ?? "Usuário IntelliGym";

  // A gaveta fecha sozinha ao navegar — permanecer aberta sobre a nova tela
  // seria um estado morto.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const drawerHidden = isCompact && !menuOpen;

  return (
    <div className="app-frame">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <aside
        className={`app-sidebar ${menuOpen ? "app-sidebar--open" : ""}`}
        id="navegacao-principal"
        // Fora da tela a gaveta não pode receber foco por Tab.
        inert={drawerHidden}
      >
        <NavLink className="brand-mark" to="/" aria-label="IntelliGym — início">
          <Logo height={26} priority />
        </NavLink>

        <nav className="app-nav" aria-label="Navegação principal">
          {navGroups.map((group) => (
            <div className="app-nav__group" key={group.label}>
              <span className="app-nav__group-label">{group.label}</span>
              {group.items.map(({ to, label, Icon }) => (
                <NavLink
                  className={({ isActive }) =>
                    `app-nav__link ${isActive ? "app-nav__link--active" : ""}`
                  }
                  key={to}
                  to={to}
                >
                  <Icon />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="sidebar-card__label">Plano atual</span>
          <strong>Free, pronto para Premium</strong>
          <p>Assinaturas entram sem mudar a navegação principal.</p>
        </div>
      </aside>

      {menuOpen && isCompact ? (
        <button
          className="app-scrim"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="app-main">
        <header className="app-header">
          <button
            className="icon-button app-header__menu"
            type="button"
            ref={menuButtonRef}
            aria-expanded={menuOpen}
            aria-controls="navegacao-principal"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>

          <div className="app-header__identity">
            <span className="section-kicker">Área autenticada</span>
            <strong>{displayName}</strong>
          </div>

          <div className="app-header__actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => navigate("/app/gerar-treino")}
            >
              <IconPlus />
              <span>Novo treino</span>
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => void signOut().then(() => navigate("/"))}
            >
              <IconLogout />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Fade curto por rota: só evita o "pulo" do carregamento lazy.
            Sem deslocamento — navegar é frequente e movimento aqui cansa. */}
        <main className="app-content" id="conteudo" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
