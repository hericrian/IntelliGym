import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { CameraCoach } from "../components/CameraCoach";
import { getCustomPlans } from "../lib/trainingStore";
import { workouts } from "../mocks/intelligym";

export function WorkoutSessionPage() {
  const { id } = useParams();
  const workout = useMemo(() => [...getCustomPlans(), ...workouts].find((item) => item.id === id) ?? workouts[0], [id]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setCount, setSetCount] = useState(1);
  const [showPainModal, setShowPainModal] = useState(false);
  const [finished, setFinished] = useState(false);
  const current = workout.exercises[exerciseIndex];

  function completeSet() {
    if (setCount < current.sets) {
      setSetCount((value) => value + 1);
      return;
    }

    if (exerciseIndex < workout.exercises.length - 1) {
      setExerciseIndex((value) => value + 1);
      setSetCount(1);
      return;
    }

    setFinished(true);
  }

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Execucao</span>
          <h1>{workout.title}</h1>
        </div>
        <strong>{exerciseIndex + 1}/{workout.exercises.length}</strong>
      </div>

      {finished ? (
        <section className="panel-card success-panel">
          <h2>Treino finalizado</h2>
          <p>Bom trabalho. Registramos a sessao mock com {workout.duration} minutos e sem piora informada.</p>
        </section>
      ) : (
        <section className="session-grid">
          <article className="exercise-stage">
            <div className="exercise-illustration" aria-label={`Guia visual de ${current.name}`}>
              <span className="exercise-illustration__figure">●</span><span className="exercise-illustration__bar">↕</span>
            </div>
            <span className="section-kicker">Exercicio atual</span>
            <h2>{current.name}</h2>
            <p>{current.description}</p>
            <div className="chip-row">
              {current.muscles.map((muscle) => <span className="soft-chip" key={muscle}>{muscle}</span>)}
            </div>
            <ol className="movement-steps"><li>Prepare a postura e contraia o core.</li><li>Desça ou avance devagar, sem compensar.</li><li>Retorne controlando a respiração.</li></ol>
          </article>
          <aside className="panel-card session-panel">
            <h2>Serie {setCount}/{current.sets}</h2>
            <p>{current.reps} repeticoes · descanso {current.restSeconds}s</p>
            <p>Carga: {current.load}</p>
            <div className="timer-box">00:{String(current.restSeconds).padStart(2, "0")}</div>
            <button className="hero-button" onClick={completeSet}>Concluir serie</button>
            <button className="ghost-button" onClick={() => setExerciseIndex((value) => Math.min(value + 1, workout.exercises.length - 1))}>
              Pular
            </button>
            <button className="ghost-button" onClick={() => setExerciseIndex((value) => (value + 1) % workout.exercises.length)}>
              Trocar exercicio
            </button>
            <button className="danger-button" onClick={() => setShowPainModal(true)}>Senti dor</button>
            <small>{current.safetyNote}</small>
          </aside>
        </section>
      )}

      {!finished ? <CameraCoach exerciseName={current.name} /> : null}

      {showPainModal ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Registrar desconforto</h2>
            <label className="field">
              <span>Intensidade 0 a 10</span>
              <input type="range" min="0" max="10" defaultValue="3" />
            </label>
            <label className="field">
              <span>Regiao</span>
              <input defaultValue="Joelho direito" />
            </label>
            <label className="field">
              <span>Tipo</span>
              <select defaultValue="pontada">
                <option value="pontada">Pontada</option>
                <option value="pressao">Pressao</option>
                <option value="travamento">Travamento</option>
              </select>
            </label>
            <div className="hero-actions">
              <button className="danger-button" onClick={() => setFinished(true)}>Encerrar treino</button>
              <button className="hero-button" onClick={() => setShowPainModal(false)}>Trocar por mais leve</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
