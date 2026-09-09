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
          <h1>Dados pessoais e preferencias</h1>
        </div>
      </div>
      <form className="form-grid panel-card" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
        <label className="field"><span>Nome</span><input defaultValue={profile?.nome ?? "Heric"} /></label>
        <label className="field"><span>Foto</span><input type="file" accept="image/*" /></label>
        <label className="field"><span>Idade</span><input defaultValue={profile?.idade ?? 31} /></label>
        <label className="field"><span>Altura</span><input defaultValue={profile?.altura ?? 178} /></label>
        <label className="field"><span>Peso</span><input defaultValue={profile?.peso ?? 86} /></label>
        <label className="field"><span>Objetivo</span><input defaultValue={profile?.objetivo ?? "reabilitacao"} /></label>
        <label className="field"><span>Nivel</span><input defaultValue={profile?.nivel ?? "intermediario"} /></label>
        <label className="field"><span>Local de treino</span><input defaultValue={profile?.localTreino ?? "hibrido"} /></label>
        <label className="field field--wide"><span>Equipamentos</span><input defaultValue={(profile?.equipamentosDisponiveis ?? ["halteres", "mini band"]).join(", ")} /></label>
        <label className="field"><span>Dias disponiveis</span><input defaultValue={(profile?.diasTreino ?? ["segunda", "quarta", "sexta"]).join(", ")} /></label>
        <label className="field"><span>Tempo por treino</span><input defaultValue={profile?.duracaoPreferida ?? 45} /></label>
        <label className="field field--wide"><span>Dores e limitacoes</span><textarea rows={4} defaultValue={(profile?.limitacoes ?? ["menisco lateral direito"]).join(", ")} /></label>
        <button className="hero-button">Salvar perfil</button>
      </form>
      {saved ? <div className="feedback feedback--success">Perfil salvo no modo mock.</div> : null}
    </div>
  );
}

