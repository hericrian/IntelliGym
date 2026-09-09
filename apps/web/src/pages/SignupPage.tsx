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

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Configure sua conta com Firebase Authentication e perfil inicial no Firestore."
      onSubmit={async (event) => {
        event.preventDefault();
        await signUp({ name, email, password });
        navigate("/app/onboarding", { replace: true });
      }}
      footer={<Link to="/login">Ja tenho conta</Link>}
    >
      <label className="field">
        <span>Nome</span>
        <input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
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
        {loading ? "Criando conta..." : "Cadastrar"}
      </button>
    </AuthCard>
  );
}
