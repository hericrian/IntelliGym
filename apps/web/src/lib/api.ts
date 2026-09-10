import type { HealthCheckResponse } from "@intelligym/shared";

import type { WorkoutPlan } from "../mocks/intelligym";

const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${apiBaseUrl}/health`);

  if (!response.ok) {
    throw new Error("Não foi possível consultar a API.");
  }

  return (await response.json()) as HealthCheckResponse;
}

export async function generateWorkoutFromApi(input: {
  objective: string;
  location: string;
  duration: string;
  level: string;
  equipment: string;
  limitations: string;
}): Promise<WorkoutPlan> {
  const response = await fetch(`${apiBaseUrl}/api/workouts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      duration: Number(input.duration),
      equipment: input.equipment
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    })
  });

  if (!response.ok) throw new Error("Não foi possível gerar o plano na API.");
  const payload = (await response.json()) as {
    workout: {
      id: string;
      title: string;
      location: string;
      duration: number;
      safety: string;
      warmup: string[];
      exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        equipment: string[];
        cue: string;
      }>;
    };
  };

  return {
    id: payload.workout.id,
    title: payload.workout.title,
    focus: input.objective,
    duration: payload.workout.duration,
    intensity: "moderada",
    location: payload.workout.location,
    warmup: payload.workout.warmup,
    instructions: [payload.workout.safety],
    exercises: payload.workout.exercises.map((exercise, index) => ({
      id: `${payload.workout.id}-${index}`,
      name: exercise.name,
      description: exercise.cue,
      sets: exercise.sets,
      reps: exercise.reps,
      restSeconds: 60,
      load: "Carga confortável e técnica",
      muscles: [input.objective],
      equipment: exercise.equipment,
      safetyNote: payload.workout.safety,
      alternatives: ["Reduzir carga", "Trocar por versão assistida"]
    }))
  };
}
