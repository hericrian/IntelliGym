import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const { signUp, error, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const weakPassword = password.length > 0 && password.length < 6;

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Comece configurando seu perfil: objetivo, equipamentos e limitações."
      onSubmit={async (event) => {
        event.preventDefault();
        await signUp({ name, email, password });
        navigate("/app/onboarding", { replace: true });
      }}
      footer={<Link to="/login">Já tenho conta</Link>}
    >
      <label className="field">
        <span>Nome</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </label>
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
          autoComplete="new-password"
          minLength={6}
          aria-describedby="senha-dica"
          required
        />
        <small
          id="senha-dica"
          style={{
            color: weakPassword ? "var(--warning)" : "var(--text-muted)"
          }}
        >
          Use ao menos 6 caracteres.
        </small>
      </label>

      {error ? (
        <div className="feedback feedback--error" role="alert">
          {error}
        </div>
      ) : null}

      <button className="hero-button" type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Criando conta...
          </>
        ) : (
          "Cadastrar"
        )}
      </button>
    </AuthCard>
  );
}
