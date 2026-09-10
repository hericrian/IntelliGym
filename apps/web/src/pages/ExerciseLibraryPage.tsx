import { useEffect, useMemo, useRef, useState } from "react";

import { Dialog } from "../components/Dialog";
import { IconSearch } from "../components/Icons";
import {
  fetchExercises,
  fetchFacets,
  isCatalogAvailable,
  type CatalogExercise,
  type CatalogFacets
} from "../lib/catalog";
import { exerciseLibrary } from "../mocks/intelligym";

const PAGE_SIZE = 24;
const ALL = "";

/** Os exercícios embutidos viram o mesmo formato do catálogo remoto. */
function mocksAsCatalog(): CatalogExercise[] {
  return exerciseLibrary.map((exercise) => ({
    id: exercise.id,
    language: "pt",
    name: exercise.name,
    description: exercise.description,
    category: null,
    muscles: exercise.muscles,
    musclesSecondary: [],
    equipment: exercise.equipment,
    imageUrl: null,
    license: null,
    licenseAuthor: null,
    sourceUrl: null
  }));
}

export function ExerciseLibraryPage() {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState(ALL);
  const [equipment, setEquipment] = useState(ALL);
  const [withImage, setWithImage] = useState(false);
  const [page, setPage] = useState(0);

  const [facets, setFacets] = useState<CatalogFacets | null>(null);
  const [items, setItems] = useState<CatalogExercise[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"loading" | "ok" | "offline">("loading");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fallback = useMemo(mocksAsCatalog, []);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  // Filtro novo recomeça da primeira página; sem isto a busca pode cair numa
  // página que não existe no resultado novo.
  useEffect(() => {
    setPage(0);
  }, [search, muscle, equipment, withImage]);

  useEffect(() => {
    if (!isCatalogAvailable()) {
      setItems(fallback);
      setTotal(fallback.length);
      setStatus("offline");
      return;
    }

    const controller = new AbortController();
    // A busca dispara a cada tecla; esperar um pouco evita uma requisição
    // por caractere digitado.
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const result = await fetchExercises(
          {
            search,
            muscle,
            equipment,
            withImage,
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE
          },
          controller.signal
        );
        setItems(result.exercises);
        setTotal(result.total);
        setStatus("ok");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        // Sem catálogo, a biblioteca embutida mantém a tela utilizável.
        setItems(fallback);
        setTotal(fallback.length);
        setStatus("offline");
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [search, muscle, equipment, withImage, page, fallback]);

  const facetsLoaded = useRef(false);
  useEffect(() => {
    if (!isCatalogAvailable() || facetsLoaded.current) return;
    facetsLoaded.current = true;
    fetchFacets()
      .then(setFacets)
      .catch(() => setFacets(null));
  }, []);

  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Biblioteca</span>
          <h1>Exercícios recomendados e adaptáveis</h1>
          <p>
            {status === "offline"
              ? "Catálogo completo indisponível agora — mostrando os exercícios que vêm no app."
              : `${total} exercícios com descrição, músculos e equipamento.`}
          </p>
        </div>
      </div>

      <section className="panel-card">
        <div className="form-grid">
          <label className="field field--wide">
            <span>Buscar</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="glúteo, joelho, halter..."
            />
          </label>

          <label className="field">
            <span>Músculo</span>
            <select
              value={muscle}
              onChange={(event) => setMuscle(event.target.value)}
              disabled={!facets}
            >
              <option value={ALL}>Todos</option>
              {facets?.muscles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Equipamento</span>
            <select
              value={equipment}
              onChange={(event) => setEquipment(event.target.value)}
              disabled={!facets}
            >
              <option value={ALL}>Todos</option>
              {facets?.equipment.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="toggle-row">
          <span>Somente exercícios com ilustração</span>
          <input
            type="checkbox"
            checked={withImage}
            onChange={(event) => setWithImage(event.target.checked)}
          />
        </label>
      </section>

      {status === "loading" ? (
        <section
          className="content-grid content-grid--three"
          aria-label="Carregando exercícios"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div className="skeleton exercise-card__skeleton" key={index} />
          ))}
        </section>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <IconSearch />
          <strong>Nenhum exercício com esses filtros</strong>
          <p>Tente um termo mais curto ou volte os filtros para "Todos".</p>
        </div>
      ) : (
        <section className="content-grid content-grid--three">
          {items.map((exercise) => (
            <article className="panel-card exercise-card" key={exercise.id}>
              {exercise.imageUrl ? (
                <img
                  className="exercise-card__image"
                  src={exercise.imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : null}

              <div className="chip-row">
                {exercise.muscles.slice(0, 2).map((item) => (
                  <span className="hero-pill" key={item}>
                    {item}
                  </span>
                ))}
                {exercise.language === "en" ? (
                  <span className="soft-chip" title="Ainda sem tradução">
                    EN
                  </span>
                ) : null}
              </div>

              <h2>{exercise.name}</h2>
              <p className="exercise-card__excerpt">{exercise.description}</p>

              {exercise.equipment.length > 0 ? (
                <ul className="chip-row" aria-label="Equipamentos">
                  {exercise.equipment.map((item) => (
                    <li className="soft-chip" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

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

      {lastPage > 0 ? (
        <div className="pagination">
          <button
            className="ghost-button"
            type="button"
            disabled={page === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            Anterior
          </button>
          <span className="tabular">
            Página {page + 1} de {lastPage + 1}
          </span>
          <button
            className="ghost-button"
            type="button"
            disabled={page >= lastPage}
            onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
          >
            Próxima
          </button>
        </div>
      ) : null}

      <Dialog
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? ""}
        wide
      >
        {selected ? (
          <>
            {selected.imageUrl ? (
              <img
                className="exercise-detail__image"
                src={selected.imageUrl}
                alt=""
              />
            ) : null}

            <p style={{ whiteSpace: "pre-line" }}>{selected.description}</p>

            <div className="content-grid content-grid--two">
              <div>
                <h3>Músculos</h3>
                <ul className="chip-row">
                  {selected.muscles.map((item) => (
                    <li className="soft-chip" key={item}>
                      {item}
                    </li>
                  ))}
                  {selected.musclesSecondary.map((item) => (
                    <li className="soft-chip" key={item}>
                      {item} (secundário)
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Equipamento</h3>
                <ul className="chip-row">
                  {selected.equipment.length > 0 ? (
                    selected.equipment.map((item) => (
                      <li className="soft-chip" key={item}>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="soft-chip">Peso corporal</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Exigência da CC-BY-SA: crédito ao autor e link para a origem. */}
            {selected.license ? (
              <p className="exercise-detail__credit">
                Conteúdo de{" "}
                <a
                  href={selected.sourceUrl ?? "https://wger.de"}
                  target="_blank"
                  rel="noreferrer"
                >
                  wger
                </a>
                {selected.licenseAuthor
                  ? `, por ${selected.licenseAuthor}`
                  : null}
                , sob licença{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br"
                  target="_blank"
                  rel="noreferrer"
                >
                  {selected.license}
                </a>
                .
              </p>
            ) : null}
          </>
        ) : null}
      </Dialog>
    </div>
  );
}
