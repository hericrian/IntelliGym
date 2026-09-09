import { useState } from "react";

import { painRecords } from "../mocks/intelligym";

export function RecoveryPage() {
  const [message, setMessage] = useState<string | null>(null);

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
          Contexto inicial informado: ruptura de menisco lateral direito. Isto nao substitui avaliacao profissional nem
          cria diagnostico novo; serve apenas para adaptar linguagem e intensidade dos mocks.
        </p>
      </section>
      <form
        className="form-grid panel-card"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("Registro diario salvo no modo mock.");
        }}
      >
        <label className="field"><span>Intensidade da dor</span><input type="range" min="0" max="10" defaultValue="2" /></label>
        <label className="field"><span>Regiao</span><input defaultValue="Joelho direito" /></label>
        <label className="field"><span>Movimento que causou desconforto</span><input defaultValue="Step-up acima de 20 cm" /></label>
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

