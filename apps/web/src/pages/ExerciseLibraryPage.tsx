import { useMemo, useState } from "react";

import { Dialog } from "../components/Dialog";
import { exerciseLibrary } from "../mocks/intelligym";

const allValue = "todos";

export function ExerciseLibraryPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState(allValue);
  const [impact, setImpact] = useState(allValue);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected =
    exerciseLibrary.find((exercise) => exercise.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return exerciseLibrary.filter((exercise) => {
      const haystack = `${exercise.name} ${exercise.muscles.join(" ")} ${exercise.equipment.join(" ")}`;
      const matchesTerm = !term || haystack.toLowerCase().includes(term);
      const matchesLevel = level === allValue || exercise.level === level;
      const matchesImpact =
        impact === allValue || exercise.impact.startsWith(impact);
      return matchesTerm && matchesLevel && matchesImpact;
    });
  }, [query, level, impact]);

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Biblioteca</span>
          <h1>Exercícios recomendados e adaptáveis</h1>
          <p>
            Filtre por nível e impacto para encontrar uma versão que respeite
            suas limitações.
          </p>
        </div>
      </div>

      <section className="panel-card">
        <div className="form-grid">
          <label className="field field--wide">
            <span>Buscar</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="glúteo, joelho, halter..."
            />
          </label>
          <label className="field">
            <span>Nível</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value={allValue}>Todos</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </label>
          <label className="field">
            <span>Impacto</span>
            <select
              value={impact}
              onChange={(event) => setImpact(event.target.value)}
            >
              <option value={allValue}>Todos</option>
              <option value="baixo">Baixo</option>
            </select>
          </label>
        </div>
      </section>

      <p className="equipment-note" role="status">
        {filtered.length}{" "}
        {filtered.length === 1
          ? "exercício encontrado"
          : "exercícios encontrados"}
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <strong>Nenhum exercício com esses filtros</strong>
          <p>
            Tente um termo mais curto ou volte o nível e o impacto para "Todos".
          </p>
        </div>
      ) : (
        <section className="content-grid content-grid--three">
          {filtered.map((exercise) => (
            <article className="panel-card library-card" key={exercise.id}>
              <span className="hero-pill">impacto {exercise.impact}</span>
              <h2>{exercise.name}</h2>
              <p>{exercise.description}</p>
              <ul className="chip-row" aria-label="Equipamentos necessários">
                {exercise.equipment.map((item) => (
                  <li className="soft-chip" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                className="ghost-button"
                type="button"
                onClick={() => setSelectedId(exercise.id)}
              >
                Ver detalhes
              </button>
            </article>
          ))}
        </section>
      )}

      <Dialog
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? ""}
        wide
      >
        {selected ? (
          <>
            <p>{selected.description}</p>
            <div>
              <h3>Execução</h3>
              <ul>
                {selected.execution.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Erros comuns</h3>
              <ul>
                {selected.commonMistakes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="equipment-note">
              Séries sugeridas: {selected.sets} · Músculos:{" "}
              {selected.muscles.join(", ")}
            </p>
          </>
        ) : null}
      </Dialog>
    </div>
  );
}
