import { useState } from "react";
import { motion } from "motion/react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/treinos", label: "Treinos" },
  { to: "/app/gerar-treino", label: "Gerar treino" },
  { to: "/app/progresso", label: "Progresso" },
  { to: "/app/dor-e-recuperacao", label: "Dor e recuperacao" },
  { to: "/app/equipamentos", label: "Equipamentos" },
  { to: "/app/assistente", label: "Assistente" },
  { to: "/app/biblioteca", label: "Biblioteca" },
  { to: "/app/perfil", label: "Perfil" },
  { to: "/app/configuracoes", label: "Configuracoes" }
] as const;

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-frame">
      <aside className={`app-sidebar ${menuOpen ? "app-sidebar--open" : ""}`}>
        <NavLink className="brand-mark" to="/">
          <span className="brand-mark__icon">IG</span>
          <span>
            <strong>IntelliGym</strong>
            <small>Treine. Evolua. Inteligente.</small>
          </span>
        </NavLink>
        <nav className="app-nav" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) => `app-nav__link ${isActive ? "app-nav__link--active" : ""}`}
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <span>Plano atual</span>
          <strong>Free preparado para Premium</strong>
          <p>Assinaturas entram sem mudar a navegacao principal.</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <button className="icon-button app-header__menu" onClick={() => setMenuOpen((value) => !value)}>
            Menu
          </button>
          <div>
            <span className="section-kicker">Area autenticada</span>
            <strong>{profile?.nome ?? user?.displayName ?? "Usuario IntelliGym"}</strong>
          </div>
          <div className="app-header__actions">
            <button className="ghost-button" onClick={() => navigate("/app/gerar-treino")}>
              Novo treino
            </button>
            <button className="ghost-button" onClick={() => void signOut().then(() => navigate("/"))}>
              Sair
            </button>
          </div>
        </header>
        <motion.main
          className="app-content"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: "easeOut" }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

