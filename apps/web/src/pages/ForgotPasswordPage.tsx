import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthCard } from "../components/AuthCard";
import { useAuth } from "../hooks/useAuth";

export function ForgotPasswordPage() {
  const { resetPassword, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Enviaremos um link para você redefinir a senha da sua conta."
      onSubmit={async (event) => {
        event.preventDefault();
        await resetPassword(email);
        setSuccess("Enviamos as instruções de recuperação para o seu e-mail.");
      }}
      footer={<Link to="/login">Voltar ao login</Link>}
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

      {success ? (
        <div className="feedback feedback--success" role="status">
          {success}
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
            Enviando...
          </>
        ) : (
          "Enviar link"
        )}
      </button>
    </AuthCard>
  );
}
