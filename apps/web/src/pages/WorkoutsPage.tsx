import { useMemo } from "react";
import { Link } from "react-router-dom";

import { getCustomPlans } from "../lib/trainingStore";
import { workouts } from "../mocks/intelligym";

export function WorkoutsPage() {
  const customPlans = useMemo(() => getCustomPlans(), []);
  const allPlans = useMemo(() => [...customPlans, ...workouts], [customPlans]);
  const customIds = useMemo(
    () => new Set(customPlans.map((plan) => plan.id)),
    [customPlans]
  );

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Treinos</span>
          <h1>Planos ativos e recomendados</h1>
          <p>Os planos que você gerou aparecem primeiro.</p>
        </div>
        <Link className="hero-button" to="/app/gerar-treino">
          Gerar treino
        </Link>
      </div>

      <section className="content-grid content-grid--two u-stagger">
        {allPlans.map((workout) => (
          <article className="panel-card" key={workout.id}>
            <div className="chip-row">
              <span className="hero-pill">{workout.focus}</span>
              {customIds.has(workout.id) ? (
                <span className="soft-chip">Seu plano</span>
              ) : null}
            </div>
            <h2>{workout.title}</h2>
            <p>
              {workout.duration} min · {workout.location} · intensidade{" "}
              {workout.intensity}
            </p>
            <ul
              className="chip-row"
              aria-label={`Exercícios de ${workout.title}`}
            >
              {workout.exercises.map((exercise) => (
                <li className="soft-chip" key={exercise.id}>
                  {exercise.name}
                </li>
              ))}
            </ul>
            <Link
              className="hero-button hero-button--secondary"
              to={`/app/treino/${workout.id}`}
            >
              Abrir treino
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
