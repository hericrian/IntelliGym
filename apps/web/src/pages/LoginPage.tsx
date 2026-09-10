import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { IconGoogle } from "../components/Icons";
import { hasFirebaseConfig } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { signIn, signInWithGoogle, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const firebaseReady = hasFirebaseConfig();

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/app/dashboard";

  return (
    <AuthCard
      title="Entrar na plataforma"
      subtitle="Acesse sua conta para sincronizar treinos, progresso e dados protegidos."
      onSubmit={async (event) => {
        event.preventDefault();
        await signIn({ email, password });
        navigate(redirectTo, { replace: true });
      }}
      footer={
        <>
          <Link to="/forgot-password">Esqueci minha senha</Link>
          <Link to="/signup">Criar conta</Link>
        </>
      }
    >
      <label className="field">
        <span>E-mail</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="field">
        <span>Senha</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      {!firebaseReady ? (
        <div className="feedback feedback--warning" role="status">
          Modo de demonstração ativo. Seus treinos ficam somente neste navegador
          até o Firebase ser conectado.
        </div>
      ) : null}
      {error ? (
        <div className="feedback feedback--error" role="alert">
          {error}
        </div>
      ) : null}

      <button className="hero-button" type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>

      <span className="auth-divider">ou</span>

      <button
        className="hero-button hero-button--secondary"
        type="button"
        disabled={loading}
        onClick={async () => {
          await signInWithGoogle();
          navigate(redirectTo, { replace: true });
        }}
      >
        <IconGoogle />
        {firebaseReady
          ? "Continuar com Google"
          : "Experimentar em modo demonstração"}
      </button>
    </AuthCard>
  );
}
