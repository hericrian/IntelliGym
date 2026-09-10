import { useMemo } from "react";

import { usePoseCoach } from "../hooks/usePoseCoach";
import { describeAnalyzer } from "../lib/pose/exercises";
import { IconAlert, IconCamera, IconCheck, IconClose } from "./Icons";

type FormCoachProps = {
  exerciseId?: string;
  exerciseName: string;
};

const severityIcon = {
  error: <IconAlert />,
  warn: <IconAlert />,
  ok: <IconCheck />
};

/**
 * Correção de movimento em tempo real. Roda inteira no aparelho: o vídeo nunca
 * sai do navegador, não há upload e nada é gravado.
 */
export function FormCoach({ exerciseId, exerciseName }: FormCoachProps) {
  const {
    videoRef,
    canvasRef,
    status,
    error,
    analysis,
    analyzerKey,
    facingMode,
    start,
    stop,
    switchCamera
  } = usePoseCoach(exerciseId, exerciseName);

  const { supported, setup } = useMemo(
    () => describeAnalyzer(analyzerKey),
    [analyzerKey]
  );

  const running = status === "running";
  const loading = status === "loading";
  const worst = analysis.cues.some((cue) => cue.severity === "error")
    ? "error"
    : analysis.cues.some((cue) => cue.severity === "warn")
      ? "warn"
      : "ok";

  return (
    <section className="form-coach">
      <div className="form-coach__head">
        <div>
          <span className="section-kicker">Coach de movimento</span>
          <h3>
            {supported
              ? `Correção em tempo real: ${exerciseName}`
              : `Câmera de apoio: ${exerciseName}`}
          </h3>
          <p>{setup}</p>
        </div>
        <span className="hero-pill">Beta</span>
      </div>

      <div
        className={`form-coach__stage ${running ? "form-coach__stage--live" : ""}`}
      >
        <div
          className="form-coach__media"
          // Só a câmera frontal é espelhada — é assim que a pessoa se vê no espelho.
          data-mirrored={facingMode === "user" ? "true" : undefined}
        >
          <video ref={videoRef} playsInline muted autoPlay />
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>

        {running ? (
          <div className="form-coach__hud">
            <div className="form-coach__reps">
              <strong className="tabular">{analysis.reps}</strong>
              <span>repetições</span>
            </div>
            <div className="form-coach__meter">
              <span className="form-coach__phase">{analysis.phase}</span>
              <div className="form-coach__bar" aria-hidden="true">
                <span
                  style={{ transform: `scaleX(${analysis.progress / 100})` }}
                />
              </div>
            </div>
            <div className={`form-coach__score form-coach__score--${worst}`}>
              <strong className="tabular">{Math.round(analysis.score)}</strong>
              <span>técnica</span>
            </div>
          </div>
        ) : null}

        {!running ? (
          <div className="form-coach__placeholder">
            <IconCamera />
            <p>
              {loading
                ? "Preparando o modelo de análise..."
                : "A câmera fica desligada até você tocar em iniciar."}
            </p>
          </div>
        ) : null}
      </div>

      <div
        className="form-coach__cues"
        role="status"
        aria-live="polite"
        aria-label="Correções da execução"
      >
        {running && analysis.cues.length === 0 && analysis.framing === "ok" ? (
          <p className="form-coach__cue form-coach__cue--ok">
            <IconCheck />
            Execução dentro do padrão. Mantenha o ritmo.
          </p>
        ) : null}

        {analysis.cues.map((cue) => (
          <p
            className={`form-coach__cue form-coach__cue--${cue.severity}`}
            key={cue.id}
          >
            {severityIcon[cue.severity]}
            {cue.message}
          </p>
        ))}
      </div>

      {error ? (
        <p className="feedback feedback--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="form-coach__actions">
        <button
          className={running ? "ghost-button" : "hero-button"}
          type="button"
          disabled={loading}
          onClick={running ? stop : () => void start()}
        >
          {running ? (
            <>
              <IconClose />
              Desligar câmera
            </>
          ) : loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Carregando...
            </>
          ) : (
            <>
              <IconCamera />
              Ligar câmera e analisar
            </>
          )}
        </button>

        {running ? (
          <button className="ghost-button" type="button" onClick={switchCamera}>
            Trocar câmera
          </button>
        ) : null}
      </div>

      <small>
        Tudo é processado no seu aparelho: nenhuma imagem é enviada, gravada ou
        compartilhada. O coach observa ângulos das articulações e não substitui
        a avaliação de um profissional — pare se sentir dor.
      </small>
    </section>
  );
}
