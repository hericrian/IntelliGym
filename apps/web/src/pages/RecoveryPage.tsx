import { useState } from "react";

import { PainBars } from "../components/PainBars";
import { savePainLog } from "../lib/trainingStore";
import { painRecords } from "../mocks/intelligym";

export function RecoveryPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [score, setScore] = useState(2);
  const [region, setRegion] = useState("Joelho direito");
  const [trigger, setTrigger] = useState("Step-up acima de 20 cm");
  const [mobility, setMobility] = useState("melhor");
  const [notes, setNotes] = useState(
    "Sem travamento, desconforto leve ao subir escadas."
  );

  const highPain = score >= 5;

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Recuperação</span>
          <h1>Dor, mobilidade e retorno gradual</h1>
        </div>
      </div>

      <section className="panel-card">
        <p>
          Este registro ajuda a reduzir ou trocar exercícios, mas não
          diagnostica nem trata lesões. Procure atendimento urgente se houver
          deformidade, incapacidade de apoiar peso, dor forte após trauma,
          febre, perda de força ou sensibilidade, ou inchaço importante.
        </p>
      </section>

      <form
        className="form-grid panel-card"
        onSubmit={(event) => {
          event.preventDefault();
          savePainLog({
            score,
            region,
            trigger,
            createdAt: new Date().toISOString()
          });
          setMessage(
            highPain
              ? "Registro salvo. Como a dor foi moderada ou alta, reduza a carga, não force a amplitude e procure um profissional se não melhorar."
              : "Registro salvo neste dispositivo. Mantenha os movimentos lentos e sem piora dos sintomas."
          );
        }}
      >
        <label className="field">
          <span>Intensidade da dor: {score}/10</span>
          <input
            type="range"
            min="0"
            max="10"
            value={score}
            onChange={(event) => setScore(Number(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Região</span>
          <input
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Movimento que causou desconforto</span>
          <input
            value={trigger}
            onChange={(event) => setTrigger(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Mobilidade percebida</span>
          <select
            value={mobility}
            onChange={(event) => setMobility(event.target.value)}
          >
            <option value="melhor">Melhor</option>
            <option value="igual">Igual</option>
            <option value="pior">Pior</option>
          </select>
        </label>
        <label className="field field--wide">
          <span>Observações</span>
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <button className="hero-button" type="submit">
          Salvar registro
        </button>
      </form>

      {message ? (
        <div
          className={
            highPain
              ? "feedback feedback--warning"
              : "feedback feedback--success"
          }
          role="status"
        >
          {message}
        </div>
      ) : null}

      <section className="content-grid content-grid--two">
        <article className="panel-card">
          <h2>Dor pós-treino na semana</h2>
          <PainBars records={painRecords} showBefore={false} />
        </article>
        <article className="panel-card">
          <h2>Alertas de piora</h2>
          <p>
            Nenhum alerta crítico. Se houver dor aguda, travamento ou aumento
            persistente, interrompa e procure um profissional.
          </p>
          <ul className="chip-row" aria-label="Sinais monitorados">
            <li className="soft-chip">Força: melhorando</li>
            <li className="soft-chip">Equilíbrio: estável</li>
            <li className="soft-chip">Mobilidade: monitorar</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
