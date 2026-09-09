export type BottomTabId = "home" | "workout" | "progress" | "coach" | "profile";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type TrainingLocation = "home" | "gym" | "hybrid";
export type DifficultyLevel = "light" | "moderate" | "challenging";
export type EquipmentOption =
  | "nenhum equipamento"
  | "bicicleta ergometrica"
  | "esteira"
  | "halteres"
  | "barra"
  | "anilhas"
  | "banco"
  | "faixas elasticas"
  | "caneleiras"
  | "colchonete"
  | "bola"
  | "academia completa";

export interface PhysicalLimitation {
  bodyRegion: string;
  side: "left" | "right" | "center";
  type: string;
  painTriggers: string[];
  painLevel: number;
  professionalGuidance: string;
  exercisesToAvoid: string[];
}

export interface UserProfile {
  firstName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: string;
  trainingLocation: TrainingLocation;
  availableDays: number;
  sessionDurationMin: number;
  experienceLevel: ExperienceLevel;
  equipments: EquipmentOption[];
  limitations: PhysicalLimitation[];
}

export interface OnboardingAnswers {
  goal: string;
  trainingLocation: TrainingLocation;
  equipments: EquipmentOption[];
  availableDays: number;
  sessionDurationMin: number;
  experienceLevel: ExperienceLevel;
  limitations: PhysicalLimitation[];
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  targetLoad: string;
  focus: string;
  instructions: string;
  commonMistakes: string[];
  muscles: string[];
  alternatives: string[];
  safetyNote: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  estimatedDurationMin: number;
  difficulty: DifficultyLevel;
  objective: string;
  safetyAlert: string;
  exercises: WorkoutExercise[];
  weeklyFocus: string[];
  weeklyPainAverage: number;
  weeklyTrainedDays: number;
}

export interface MetricCardData {
  label: string;
  value: string;
  highlight: string;
}

export interface WeeklyProgressSummary {
  currentPhase: string;
  weeklySessions: number;
  completedSessions: number;
  weeklyMinutes: number;
  painTrend: "up" | "down" | "stable";
  painAverage: number;
  effortAverage: number;
  adherencePercent: number;
  metrics: MetricCardData[];
}

export interface RecoveryPhase {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
}

export interface InjuryRecoveryPlan {
  affectedRegion: string;
  summary: string;
  phases: RecoveryPhase[];
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: string;
  equipment: string;
  level: ExperienceLevel;
  location: TrainingLocation;
  impact: string;
  targetRegion: string;
  safety: string;
}

export interface CoachSuggestion {
  title: string;
  body: string;
}
