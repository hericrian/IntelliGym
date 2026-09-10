import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { FormCoach } from "../components/FormCoach";
import { Dialog } from "../components/Dialog";
import { ExerciseFigure } from "../components/ExerciseFigure";
import { useUserData } from "../hooks/useUserData";
import { workouts } from "../mocks/intelligym";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function WorkoutSessionPage() {
  const { id } = useParams();
  const { plans, savePainLog } = useUserData();
  const workout = useMemo(
    () => [...plans, ...workouts].find((item) => item.id === id) ?? workouts[0],
    [id, plans]
  );
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setCount, setSetCount] = useState(1);
  const [showPainModal, setShowPainModal] = useState(false);
  const [finished, setFinished] = useState(false);
  const [painScore, setPainScore] = useState(3);
  const [painRegion, setPainRegion] = useState("Joelho direito");
  const [painType, setPainType] = useState("pontada");

  const current = workout.exercises[exerciseIndex];
  const totalSets = workout.exercises.reduce(
    (total, exercise) => total + exercise.sets,
    0
  );
  const doneSets =
    workout.exercises
      .slice(0, exerciseIndex)
      .reduce((total, exercise) => total + exercise.sets, 0) +
    (setCount - 1);

  // Cronômetro de descanso: parte do descanso do exercício atual e só corre
  // quando a série é concluída.
  const [restLeft, setRestLeft] = useState(current.restSeconds);
  const [resting, setResting] = useState(false);
  const restRef = useRef(current.restSeconds);

  useEffect(() => {
    restRef.current = current.restSeconds;
    setRestLeft(current.restSeconds);
    setResting(false);
  }, [current.restSeconds, exerciseIndex]);

  useEffect(() => {
    if (!resting) return;

    const timer = window.setInterval(() => {
      setRestLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setResting(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resting]);

  function completeSet() {
    if (setCount < current.sets) {
      setSetCount((value) => value + 1);
      setRestLeft(restRef.current);
      setResting(true);
      return;
    }

    if (exerciseIndex < workout.exercises.length - 1) {
      setExerciseIndex((value) => value + 1);
      setSetCount(1);
      return;
    }

    setFinished(true);
  }

  function registerPain(endSession: boolean) {
    void savePainLog({
      score: painScore,
      region: painRegion,
      trigger: `${current.name} (${painType})`,
      createdAt: new Date().toISOString()
    });
    setShowPainModal(false);

    if (endSession) {
      setFinished(true);
      return;
    }

    // Trocar por uma versão mais leve = seguir para o próximo exercício.
    setExerciseIndex((value) => (value + 1) % workout.exercises.length);
    setSetCount(1);
  }

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Execução</span>
          <h1>{workout.title}</h1>
        </div>
        <strong className="tabular">
          {exerciseIndex + 1}/{workout.exercises.length}
          <span className="u-visually-hidden"> exercícios</span>
        </strong>
      </div>

      <div
        className="session-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalSets}
        aria-valuenow={finished ? totalSets : doneSets}
        aria-label="Progresso do treino"
      >
        <span
          style={{
            transform: `scaleX(${finished ? 1 : doneSets / totalSets})`
          }}
        />
      </div>

      {finished ? (
        <section className="panel-card success-panel">
          <span className="section-kicker">Concluído</span>
          <h2>Treino finalizado</h2>
          <p>
            Bom trabalho. Registramos {workout.duration} minutos e {totalSets}{" "}
            séries planejadas nesta sessão.
          </p>
          <div className="hero-actions">
            <Link className="hero-button" to="/app/dashboard">
              Voltar ao dashboard
            </Link>
            <Link
              className="hero-button hero-button--secondary"
              to="/app/progresso"
            >
              Ver progresso
            </Link>
          </div>
        </section>
      ) : (
        <section className="session-grid">
          <article className="exercise-stage">
            <ExerciseFigure exerciseName={current.name} />
            <span className="section-kicker">Exercício atual</span>
            <h2>{current.name}</h2>
            <p>{current.description}</p>
            <ul className="chip-row" aria-label="Músculos trabalhados">
              {current.muscles.map((muscle) => (
                <li className="soft-chip" key={muscle}>
                  {muscle}
                </li>
              ))}
            </ul>
            <ol className="movement-steps">
              <li>Prepare a postura e contraia o core.</li>
              <li>Desça ou avance devagar, sem compensar.</li>
              <li>Retorne controlando a respiração.</li>
            </ol>
          </article>

          <aside className="panel-card session-panel">
            <h2>
              Série {setCount}/{current.sets}
            </h2>
            <div className="session-panel__meta">
              <span>
                {current.reps} repetições · descanso {current.restSeconds}s
              </span>
              <span>Carga: {current.load}</span>
            </div>

            <div className="timer-box" role="timer" aria-live="off">
              {formatClock(restLeft)}
            </div>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                if (resting) {
                  setResting(false);
                  return;
                }
                if (restLeft === 0) setRestLeft(restRef.current);
                setResting(true);
              }}
            >
              {resting
                ? "Pausar descanso"
                : restLeft === 0
                  ? "Reiniciar descanso"
                  : "Iniciar descanso"}
            </button>

            <div className="session-panel__actions">
              <button
                className="hero-button"
                type="button"
                onClick={completeSet}
              >
                Concluir série
              </button>
              <div className="session-panel__split">
                <button
                  className="ghost-button"
                  type="button"
                  disabled={exerciseIndex >= workout.exercises.length - 1}
                  onClick={() => {
                    setExerciseIndex((value) =>
                      Math.min(value + 1, workout.exercises.length - 1)
                    );
                    setSetCount(1);
                  }}
                >
                  Pular
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => {
                    setExerciseIndex(
                      (value) => (value + 1) % workout.exercises.length
                    );
                    setSetCount(1);
                  }}
                >
                  Trocar
                </button>
              </div>
              <button
                className="danger-button"
                type="button"
                onClick={() => setShowPainModal(true)}
              >
                Senti dor
              </button>
            </div>

            <small>{current.safetyNote}</small>
          </aside>
        </section>
      )}

      {!finished ? (
        <FormCoach exerciseId={current.id} exerciseName={current.name} />
      ) : null}

      <Dialog
        open={showPainModal}
        onClose={() => setShowPainModal(false)}
        title="Registrar desconforto"
        description="O registro ajuda a adaptar as próximas séries. Ele não diagnostica nem trata lesões."
        footer={
          <>
            <button
              className="danger-button"
              type="button"
              onClick={() => registerPain(true)}
            >
              Encerrar treino
            </button>
            <button
              className="hero-button"
              type="button"
              onClick={() => registerPain(false)}
            >
              Trocar por mais leve
            </button>
          </>
        }
      >
        <label className="field">
          <span>Intensidade: {painScore}/10</span>
          <input
            type="range"
            min="0"
            max="10"
            value={painScore}
            onChange={(event) => setPainScore(Number(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Região</span>
          <input
            value={painRegion}
            onChange={(event) => setPainRegion(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Tipo</span>
          <select
            value={painType}
            onChange={(event) => setPainType(event.target.value)}
          >
            <option value="pontada">Pontada</option>
            <option value="pressão">Pressão</option>
            <option value="travamento">Travamento</option>
          </select>
        </label>
        {painScore >= 7 ? (
          <p className="feedback feedback--warning">
            Dor alta. Interrompa o treino e procure avaliação profissional se
            ela persistir, houver travamento, inchaço ou perda de força.
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}
