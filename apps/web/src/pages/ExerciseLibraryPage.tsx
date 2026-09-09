import { useMemo, useState } from "react";

import { exerciseLibrary } from "../mocks/intelligym";

export function ExerciseLibraryPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = exerciseLibrary.find((exercise) => exercise.id === selectedId);
  const filtered = useMemo(
    () => exerciseLibrary.filter((exercise) => `${exercise.name} ${exercise.muscles.join(" ")}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Biblioteca</span>
          <h1>Exercicios recomendados e adaptaveis</h1>
        </div>
      </div>
      <section className="panel-card">
        <div className="form-grid">
          <label className="field field--wide"><span>Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="gluteo, joelho, halter..." /></label>
          <label className="field"><span>Nivel</span><select><option>Todos</option><option>Iniciante</option><option>Intermediario</option></select></label>
          <label className="field"><span>Impacto</span><select><option>Todos</option><option>Baixo</option><option>Moderado</option></select></label>
        </div>
      </section>
      <section className="content-grid content-grid--three">
        {filtered.map((exercise) => (
          <article className="panel-card" key={exercise.id}>
            <span className="hero-pill">{exercise.impact}</span>
            <h2>{exercise.name}</h2>
            <p>{exercise.description}</p>
            <div className="chip-row">{exercise.equipment.map((item) => <span className="soft-chip" key={item}>{item}</span>)}</div>
            <button className="ghost-button" onClick={() => setSelectedId(exercise.id)}>Ver detalhes</button>
          </article>
        ))}
      </section>
      {selected ? (
        <div className="modal-backdrop">
          <div className="modal-card modal-card--wide">
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            <h3>Execucao</h3>
            <ul>{selected.execution.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>Erros comuns</h3>
            <ul>{selected.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul>
            <p>Series sugeridas: {selected.sets} · Musculos: {selected.muscles.join(", ")}</p>
            <button className="hero-button" onClick={() => setSelectedId(null)}>Fechar</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

