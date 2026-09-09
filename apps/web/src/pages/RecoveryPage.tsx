import { useState } from "react";

import { savePainLog } from "../lib/trainingStore";
import { painRecords } from "../mocks/intelligym";

export function RecoveryPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [score, setScore] = useState(2);
  const [region, setRegion] = useState("Joelho direito");
  const [trigger, setTrigger] = useState("Step-up acima de 20 cm");

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Recuperacao</span>
          <h1>Dor, mobilidade e retorno gradual</h1>
        </div>
      </div>
      <section className="panel-card">
        <p>
          Este registro ajuda a reduzir ou trocar exercícios, mas não diagnostica nem trata lesões. Procure atendimento urgente se houver deformidade, incapacidade de apoiar peso, dor forte após trauma, febre, perda de força/sensibilidade ou inchaço importante.
        </p>
      </section>
      <form
        className="form-grid panel-card"
        onSubmit={(event) => {
          event.preventDefault();
          savePainLog({ score, region, trigger, createdAt: new Date().toISOString() });
          setMessage(score >= 5 ? "Registro salvo. Como a dor foi moderada/alta, reduza a carga, não force a amplitude e procure um profissional se não melhorar." : "Registro salvo neste dispositivo. Mantenha movimentos lentos e sem piora de sintomas.");
        }}
      >
        <label className="field"><span>Intensidade da dor: {score}/10</span><input type="range" min="0" max="10" value={score} onChange={(event) => setScore(Number(event.target.value))} /></label>
        <label className="field"><span>Região</span><input value={region} onChange={(event) => setRegion(event.target.value)} /></label>
        <label className="field"><span>Movimento que causou desconforto</span><input value={trigger} onChange={(event) => setTrigger(event.target.value)} /></label>
        <label className="field"><span>Mobilidade percebida</span><select defaultValue="melhor"><option value="melhor">Melhor</option><option value="igual">Igual</option><option value="pior">Pior</option></select></label>
        <label className="field field--wide"><span>Observacoes</span><textarea rows={4} defaultValue="Sem travamento, desconforto leve ao subir escadas." /></label>
        <button className="hero-button">Salvar registro</button>
      </form>
      {message ? <div className="feedback feedback--success">{message}</div> : null}
      <section className="content-grid content-grid--two">
        <article className="panel-card">
          <h2>Grafico semanal</h2>
          <div className="bar-list">
            {painRecords.map((record) => (
              <div className="bar-row" key={record.day}><span>{record.day}</span><div><i style={{ width: `${record.after * 10}%` }} /></div><small>{record.note}</small></div>
            ))}
          </div>
        </article>
        <article className="panel-card">
          <h2>Alertas de piora</h2>
          <p>Nenhum alerta critico. Se houver dor aguda, travamento ou aumento persistente, interrompa e procure profissional.</p>
          <div className="chip-row">
            <span className="soft-chip">Forca: melhorando</span>
            <span className="soft-chip">Equilibrio: estavel</span>
            <span className="soft-chip">Mobilidade: monitorar</span>
          </div>
        </article>
      </section>
    </div>
  );
}
