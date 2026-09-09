import type {
  WeeklyProgressSummary,
  WorkoutPlan
} from "../../../domain/models";

export interface HeroMetric {
  label: string;
  value: number;
  accent: string;
  subtitle: string;
}

function queryParamForcesFallback(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("webgl") === "0";
}

export function supportsWebGL({
  disableAnimations = false
}: {
  disableAnimations?: boolean;
} = {}): boolean {
  if (
    disableAnimations ||
    typeof window === "undefined" ||
    queryParamForcesFallback() ||
    window.innerWidth < 820
  ) {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function getHeroMetrics(
  progress: WeeklyProgressSummary,
  workout: WorkoutPlan
): HeroMetric[] {
  return [
    {
      label: "Aderencia semanal",
      value: progress.adherencePercent,
      accent: "#33E6A5",
      subtitle: `${progress.weeklySessions} de 4 sessoes planejadas`
    },
    {
      label: "Conforto articular",
      value: Math.max(0, 100 - progress.painAverage * 10),
      accent: "#FFB366",
      subtitle: `Dor media ${progress.painAverage}/10`
    },
    {
      label: "Conclusao do treino",
      value: Math.min(100, workout.weeklyTrainedDays * 28),
      accent: "#B9C6D3",
      subtitle: `${workout.weeklyTrainedDays} dias treinados nesta semana`
    }
  ];
}
