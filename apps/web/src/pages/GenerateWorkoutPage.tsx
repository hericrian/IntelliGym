import { useState } from "react";
import { Link } from "react-router-dom";

import { generateMockWorkout, type WorkoutPlan } from "../mocks/intelligym";

const initialForm = {
  objective: "fortalecimento",
  location: "casa",
  duration: "45",
  level: "intermediario",
  muscleGroup: "inferiores",
  equipment: "halteres, mini band, bike",
  limitations: "menisco lateral direito",
  intensity: "moderada",
  notes: "evitar impacto alto e priorizar controle"
};

export function GenerateWorkoutPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<WorkoutPlan | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Gerador</span>
          <h1>Criar treino personalizado</h1>
        </div>
      </div>
      <form
        className="form-grid panel-card"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(generateMockWorkout(form));
        }}
      >
        {Object.entries(form).map(([key, value]) => (
          <label className={key === "notes" ? "field field--wide" : "field"} key={key}>
            <span>{key}</span>
            {key === "notes" ? (
              <textarea value={value} onChange={(event) => update(key as keyof typeof form, event.target.value)} rows={4} />
            ) : (
              <input value={value} onChange={(event) => update(key as keyof typeof form, event.target.value)} />
            )}
          </label>
        ))}
        <button className="hero-button" type="submit">Gerar treino</button>
      </form>

      {result ? (
        <section className="panel-card generated-plan">
          <span className="section-kicker">Resultado mock preparado para IA</span>
          <h2>{result.title}</h2>
          <p>{result.focus} · {result.duration} minutos</p>
          <h3>Aquecimento</h3>
          <ul>{result.warmup.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Exercicios</h3>
          <div className="content-grid content-grid--two">
            {result.exercises.map((exercise) => (
              <article className="mini-card" key={exercise.id}>
                <strong>{exercise.name}</strong>
                <p>{exercise.sets} series · {exercise.reps} reps · {exercise.restSeconds}s descanso</p>
                <p>{exercise.description}</p>
                <small>Alternativas: {exercise.alternatives.join(", ")}</small>
              </article>
            ))}
          </div>
          <h3>Avisos de seguranca</h3>
          <ul>{result.instructions.map((item) => <li key={item}>{item}</li>)}</ul>
          <Link className="hero-button hero-button--secondary" to={`/app/treino/${result.id}`}>Abrir execucao simulada</Link>
        </section>
      ) : null}
    </div>
  );
}

