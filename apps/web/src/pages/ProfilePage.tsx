import { useState } from "react";

import { SyncBadge } from "../components/SyncBadge";
import { useAuth } from "../hooks/useAuth";
import { useUserData } from "../hooks/useUserData";
import type { StoredProfile } from "../lib/localCache";

/** Campos de lista chegam do formulário como texto separado por vírgula. */
function toList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && String(value).trim() !== "" ? parsed : null;
}

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, saveProfile, syncState } = useUserData();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const patch: Partial<StoredProfile> = {
      nome: String(form.get("nome") ?? "").trim() || null,
      idade: toNumber(form.get("idade")),
      altura: toNumber(form.get("altura")),
      peso: toNumber(form.get("peso")),
      objetivo: String(form.get("objetivo") ?? "").trim() || null,
      nivel: String(form.get("nivel") ?? "").trim() || null,
      localTreino: String(form.get("localTreino") ?? "").trim() || null,
      duracaoPreferida: toNumber(form.get("duracaoPreferida")),
      diasTreino: toList(String(form.get("diasTreino") ?? "")),
      limitacoes: toList(String(form.get("limitacoes") ?? ""))
    };

    setSaving(true);
    try {
      await saveProfile(patch);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Perfil</span>
          <h1>Dados pessoais e preferências</h1>
          <p>
            Estes campos alimentam o gerador de treinos e os avisos de
            segurança.
          </p>
        </div>
        <SyncBadge />
      </div>

      <form
        className="form-grid panel-card"
        onSubmit={handleSubmit}
        onChange={() => setSaved(false)}
      >
        <label className="field">
          <span>Nome</span>
          <input
            name="nome"
            defaultValue={profile?.nome ?? user?.displayName ?? ""}
          />
        </label>
        <label className="field">
          <span>E-mail</span>
          <input
            value={profile?.email ?? user?.email ?? ""}
            readOnly
            disabled
          />
        </label>
        <label className="field">
          <span>Idade</span>
          <input
            name="idade"
            type="number"
            min="12"
            max="100"
            defaultValue={profile?.idade ?? ""}
          />
        </label>
        <label className="field">
          <span>Altura (cm)</span>
          <input
            name="altura"
            type="number"
            min="100"
            max="240"
            defaultValue={profile?.altura ?? ""}
          />
        </label>
        <label className="field">
          <span>Peso (kg)</span>
          <input
            name="peso"
            type="number"
            min="30"
            max="250"
            step="0.1"
            defaultValue={profile?.peso ?? ""}
          />
        </label>
        <label className="field">
          <span>Objetivo</span>
          <input
            name="objetivo"
            defaultValue={profile?.objetivo ?? ""}
            placeholder="Ex.: reabilitação"
          />
        </label>
        <label className="field">
          <span>Nível</span>
          <select name="nivel" defaultValue={profile?.nivel ?? "intermediario"}>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </label>
        <label className="field">
          <span>Local de treino</span>
          <select
            name="localTreino"
            defaultValue={profile?.localTreino ?? "hibrido"}
          >
            <option value="casa">Casa</option>
            <option value="academia">Academia</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </label>
        <label className="field">
          <span>Tempo por treino (min)</span>
          <input
            name="duracaoPreferida"
            type="number"
            min="10"
            max="180"
            defaultValue={profile?.duracaoPreferida ?? 45}
          />
        </label>
        <label className="field field--wide">
          <span>Dias disponíveis</span>
          <input
            name="diasTreino"
            defaultValue={(profile?.diasTreino ?? []).join(", ")}
            placeholder="segunda, quarta, sexta"
          />
        </label>
        <label className="field field--wide">
          <span>Dores e limitações</span>
          <textarea
            name="limitacoes"
            rows={3}
            defaultValue={(profile?.limitacoes ?? []).join(", ")}
            placeholder="menisco lateral direito, lombar"
          />
        </label>

        <button className="hero-button" type="submit" disabled={saving}>
          {saving ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar perfil"
          )}
        </button>
      </form>

      {saved ? (
        <div className="feedback feedback--success" role="status">
          {syncState === "synced"
            ? "Perfil salvo na sua conta."
            : "Perfil salvo neste aparelho. Sincronizamos assim que houver conexão."}
        </div>
      ) : null}
    </div>
  );
}
