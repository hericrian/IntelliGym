import { useState } from "react";

import { useAuth } from "../hooks/useAuth";

export function ProfilePage() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState(false);

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
      </div>

      <form
        className="form-grid panel-card"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <label className="field">
          <span>Nome</span>
          <input defaultValue={profile?.nome ?? "Heric"} />
        </label>
        <label className="field">
          <span>Foto</span>
          <input type="file" accept="image/*" />
        </label>
        <label className="field">
          <span>Idade</span>
          <input
            type="number"
            min="12"
            max="100"
            defaultValue={profile?.idade ?? 31}
          />
        </label>
        <label className="field">
          <span>Altura (cm)</span>
          <input
            type="number"
            min="100"
            max="240"
            defaultValue={profile?.altura ?? 178}
          />
        </label>
        <label className="field">
          <span>Peso (kg)</span>
          <input
            type="number"
            min="30"
            max="250"
            defaultValue={profile?.peso ?? 86}
          />
        </label>
        <label className="field">
          <span>Objetivo</span>
          <input defaultValue={profile?.objetivo ?? "reabilitação"} />
        </label>
        <label className="field">
          <span>Nível</span>
          <input defaultValue={profile?.nivel ?? "intermediário"} />
        </label>
        <label className="field">
          <span>Local de treino</span>
          <input defaultValue={profile?.localTreino ?? "híbrido"} />
        </label>
        <label className="field">
          <span>Tempo por treino (min)</span>
          <input
            type="number"
            min="10"
            max="180"
            defaultValue={profile?.duracaoPreferida ?? 45}
          />
        </label>
        <label className="field field--wide">
          <span>Equipamentos</span>
          <input
            defaultValue={(
              profile?.equipamentosDisponiveis ?? ["halteres", "mini band"]
            ).join(", ")}
          />
        </label>
        <label className="field field--wide">
          <span>Dias disponíveis</span>
          <input
            defaultValue={(
              profile?.diasTreino ?? ["segunda", "quarta", "sexta"]
            ).join(", ")}
          />
        </label>
        <label className="field field--wide">
          <span>Dores e limitações</span>
          <textarea
            rows={4}
            defaultValue={(
              profile?.limitacoes ?? ["menisco lateral direito"]
            ).join(", ")}
          />
        </label>

        <button className="hero-button" type="submit">
          Salvar perfil
        </button>
      </form>

      {saved ? (
        <div className="feedback feedback--success" role="status">
          Perfil salvo neste dispositivo.
        </div>
      ) : null}
    </div>
  );
}
