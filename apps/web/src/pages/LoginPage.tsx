import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { signIn, signInWithGoogle, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/app/dashboard";

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
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>
      <label className="field">
        <span>Senha</span>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
      </label>
      {error ? <div className="feedback feedback--error">{error}</div> : null}
      <button className="hero-button" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
      <button
        className="hero-button hero-button--secondary"
        type="button"
        disabled={loading}
        onClick={async () => {
          await signInWithGoogle();
          navigate("/app/dashboard", { replace: true });
        }}
      >
        Continuar com Google
      </button>
    </AuthCard>
  );
}
