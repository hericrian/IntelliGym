import { useMemo } from "react";
import { Link } from "react-router-dom";

import { SyncBadge } from "../components/SyncBadge";
import { useUserData } from "../hooks/useUserData";
import { workouts } from "../mocks/intelligym";

export function WorkoutsPage() {
  const { plans: customPlans, removePlan } = useUserData();
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
        <div className="page-title-row__actions">
          <SyncBadge />
          <Link className="hero-button" to="/app/gerar-treino">
            Gerar treino
          </Link>
        </div>
      </div>

      <section className="content-grid content-grid--two u-stagger">
        {allPlans.map((workout) => (
          <article className="panel-card" key={workout.id}>
            <div className="chip-row">
              <span className="hero-pill">{workout.focus}</span>
              {customIds.has(workout.id) ? (
                <button
                  className="soft-chip soft-chip--button"
                  type="button"
                  onClick={() => void removePlan(workout.id)}
                  aria-label={`Remover ${workout.title}`}
                >
                  Seu plano <span aria-hidden="true">&times;</span>
                </button>
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
