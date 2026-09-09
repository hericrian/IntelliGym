import { Link } from "react-router-dom";

import { workouts } from "../mocks/intelligym";

export function WorkoutsPage() {
  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Treinos</span>
          <h1>Planos ativos e recomendados</h1>
        </div>
        <Link className="hero-button" to="/app/gerar-treino">Gerar treino</Link>
      </div>
      <section className="content-grid content-grid--two">
        {workouts.map((workout) => (
          <article className="panel-card workout-card" key={workout.id}>
            <span className="hero-pill">{workout.focus}</span>
            <h2>{workout.title}</h2>
            <p>{workout.duration} min · {workout.location} · intensidade {workout.intensity}</p>
            <div className="chip-row">
              {workout.exercises.map((exercise) => <span className="soft-chip" key={exercise.id}>{exercise.name}</span>)}
            </div>
            <Link className="hero-button hero-button--secondary" to={`/app/treino/${workout.id}`}>
              Abrir treino
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

