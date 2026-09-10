import { useCallback, useEffect, useRef, useState } from "react";

import {
  createAnalyzer,
  resolveAnalyzerKey,
  type Analysis,
  type Analyzer
} from "../lib/pose/exercises";
import { loadPoseLandmarker } from "../lib/pose/detector";
import { drawPose } from "../lib/pose/draw";

export type CoachStatus = "idle" | "loading" | "running" | "error";

/** Alvo de inferência. Acima disso o ganho é imperceptível e a bateria some. */
const TARGET_FPS = 22;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
/** O texto na tela não precisa acompanhar o vídeo quadro a quadro. */
const UI_INTERVAL = 130;

const IDLE_ANALYSIS: Analysis = {
  phase: "aguardando",
  progress: 0,
  reps: 0,
  cues: [],
  score: 100,
  framing: "parcial"
};

export function usePoseCoach(exerciseId?: string, exerciseName?: string) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const analyzerRef = useRef<Analyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const lastUiRef = useRef(0);
  const lastRepsRef = useRef(0);

  const [status, setStatus] = useState<CoachStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis>(IDLE_ANALYSIS);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  // A lente também vive num ref: `start` precisa do valor atual sem entrar
  // como dependência e recriar o callback a cada troca.
  const facingModeRef = useRef<"user" | "environment">("user");

  const analyzerKey = resolveAnalyzerKey(exerciseId, exerciseName);

  // Troca de exercício zera contador e histórico de dicas.
  useEffect(() => {
    analyzerRef.current = createAnalyzer(analyzerKey);
    lastRepsRef.current = 0;
    setAnalysis(IDLE_ANALYSIS);
  }, [analyzerKey]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const video = videoRef.current;
    if (video) video.srcObject = null;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    analyzerRef.current?.reset();
    lastRepsRef.current = 0;
    setAnalysis(IDLE_ANALYSIS);
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setStatus("loading");

    try {
      const [landmarker, stream] = await Promise.all([
        loadPoseLandmarker(),
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingModeRef.current,
            width: { ideal: 960 },
            height: { ideal: 720 }
          },
          audio: false
        })
      ]);

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("video-missing");

      video.srcObject = stream;
      await video.play();

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth || 960;
        canvas.height = video.videoHeight || 720;
      }

      analyzerRef.current ??= createAnalyzer(analyzerKey);
      analyzerRef.current.reset();
      lastRepsRef.current = 0;
      setStatus("running");

      const palette = getPalette();

      const loop = (now: number) => {
        rafRef.current = requestAnimationFrame(loop);

        if (now - lastFrameRef.current < FRAME_INTERVAL) return;
        lastFrameRef.current = now;

        const currentVideo = videoRef.current;
        if (!currentVideo || currentVideo.readyState < 2) return;

        const result = landmarker.detectForVideo(currentVideo, now);

        // Dois espaços diferentes, de propósito:
        // - `landmarks` são normalizados na imagem e servem para desenhar;
        // - `worldLandmarks` são métricos e centrados no quadril, então os
        //   ângulos medidos neles não mudam com a posição da câmera.
        const screen = result.landmarks?.[0] ?? [];
        const world = result.worldLandmarks?.[0] ?? [];

        // A visibilidade só vem nos pontos de imagem; é copiada para o mundo
        // para o teste de enquadramento continuar valendo.
        const measured = world.map((point, index) => ({
          ...point,
          visibility: screen[index]?.visibility ?? point.visibility
        }));

        const next = analyzerRef.current!.analyze(measured);

        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) drawPose(ctx, screen, next.cues, palette);

        // Repetição concluída vira feedback imediato; o resto pode esperar.
        const repChanged = next.reps !== lastRepsRef.current;
        if (repChanged) lastRepsRef.current = next.reps;

        if (repChanged || now - lastUiRef.current >= UI_INTERVAL) {
          lastUiRef.current = now;
          setAnalysis(next);
        }
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch (cause) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStatus("error");
      setError(describeError(cause));
    }
  }, [analyzerKey]);

  /** Alterna a lente e, se o coach estiver ligado, reabre a captura nela. */
  const switchCamera = useCallback(() => {
    const next = facingModeRef.current === "user" ? "environment" : "user";
    facingModeRef.current = next;
    setFacingMode(next);

    if (streamRef.current) {
      stop();
      void start();
    }
  }, [start, stop]);

  useEffect(() => stop, [stop]);

  return {
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
  };
}

function getPalette() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    line: read("--brand-strong", "#cdb6ff"),
    joint: read("--text", "#fbf9ff"),
    alert: read("--danger", "#ff8b9c"),
    warn: read("--warning", "#ffbe7a")
  };
}

function describeError(cause: unknown) {
  const name = cause instanceof DOMException ? cause.name : "";

  if (name === "NotAllowedError") {
    return "Permissão de câmera negada. Libere o acesso nas configurações do navegador e tente de novo.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "Nenhuma câmera compatível foi encontrada neste aparelho.";
  }
  if (name === "NotReadableError") {
    return "A câmera está em uso por outro aplicativo. Feche-o e tente de novo.";
  }

  return "Não foi possível iniciar a análise. Verifique a conexão — o modelo é baixado na primeira vez.";
}
