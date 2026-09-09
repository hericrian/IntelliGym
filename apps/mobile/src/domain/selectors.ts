import type { WorkoutPlan } from "./models";

export function totalRestSeconds(workout: WorkoutPlan): number {
  return workout.exercises.reduce((sum, exercise) => {
    const restBlocks = Math.max(exercise.sets - 1, 0);
    return sum + restBlocks * exercise.restSec;
  }, 0);
}

export function totalSets(workout: WorkoutPlan): number {
  return workout.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
}

export function painBadge(painAverage: number): string {
  if (painAverage >= 7) {
    return "alto";
  }

  if (painAverage >= 4) {
    return "moderado";
  }

  return "controlado";
}
