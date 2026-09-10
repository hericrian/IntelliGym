import type {
  CoachSuggestion,
  EquipmentOption,
  ExerciseLibraryItem,
  InjuryRecoveryPlan,
  OnboardingAnswers,
  RecoveryPhase,
  UserProfile,
  WeeklyProgressSummary,
  WorkoutExercise,
  WorkoutPlan
} from "../../domain/models";

const equipments: EquipmentOption[] = [
  "bicicleta ergometrica",
  "halteres",
  "faixas elasticas"
];

const profile: UserProfile = {
  firstName: "Rafael",
  age: 27,
  heightCm: 178,
  weightKg: 79,
  goal: "Voltar ao futebol com joelho mais estavel",
  trainingLocation: "home",
  availableDays: 4,
  sessionDurationMin: 45,
  experienceLevel: "intermediate",
  equipments,
  limitations: [
    {
      bodyRegion: "Joelho",
      side: "right",
      type: "Ruptura de menisco lateral em recuperacao",
      painTriggers: ["movimentos laterais", "rotacao do joelho", "corrida"],
      painLevel: 4,
      professionalGuidance:
        "Evitar corrida, saltos e mudancas bruscas de direcao nesta fase.",
      exercisesToAvoid: ["tiros de corrida", "agachamento com salto"]
    }
  ]
};

const exercises: WorkoutExercise[] = [
  {
    id: "bike-warmup",
    name: "Bicicleta ergometrica leve",
    sets: 1,
    reps: "8 min",
    restSec: 0,
    targetLoad: "leve",
    focus: "aquecimento",
    instructions: "Pedale em ritmo confortavel, sem dor aguda.",
    commonMistakes: ["resistencia alta demais no inicio"],
    muscles: ["quadriceps", "panturrilha"],
    alternatives: ["caminhada leve"],
    safetyNote: "Interrompa se houver aumento rapido da dor."
  },
  {
    id: "terminal-knee-extension",
    name: "Extensao terminal com faixa",
    sets: 3,
    reps: "12 repeticoes",
    restSec: 45,
    targetLoad: "faixa leve a moderada",
    focus: "fortalecimento",
    instructions: "Controle a extensao e mantenha o quadril alinhado.",
    commonMistakes: ["travar o joelho com agressividade"],
    muscles: ["quadriceps", "vasto medial"],
    alternatives: ["isometria de quadriceps"],
    safetyNote: "Use amplitude confortavel."
  },
  {
    id: "single-leg-balance",
    name: "Equilibrio unilateral assistido",
    sets: 3,
    reps: "30 segundos",
    restSec: 40,
    targetLoad: "peso corporal",
    focus: "estabilidade",
    instructions: "Apoie-se levemente numa parede se necessario.",
    commonMistakes: ["deixar o joelho cair para dentro"],
    muscles: ["gluteos", "core", "estabilizadores do joelho"],
    alternatives: ["equilibrio bipodal em superficie macia"],
    safetyNote: "Pare se houver instabilidade importante."
  },
  {
    id: "romanian-deadlift",
    name: "Levantamento romeno com halteres",
    sets: 3,
    reps: "10 repeticoes",
    restSec: 75,
    targetLoad: "halteres moderados",
    focus: "cadeia posterior",
    instructions: "Mantenha coluna neutra e joelhos semiflexionados.",
    commonMistakes: ["compensar na lombar"],
    muscles: ["posterior de coxa", "gluteos"],
    alternatives: ["ponte de gluteo com pausa"],
    safetyNote: "Nao force amplitude se houver desconforto no joelho."
  }
];

export const todayWorkout: WorkoutPlan = {
  id: "workout-demo-01",
  title: "Fortalecimento de joelho e retorno ao futebol",
  estimatedDurationMin: 44,
  difficulty: "moderate",
  objective: "Controle de dor, estabilidade lateral e forca funcional",
  safetyAlert:
    "Se a dor subir acima de 6/10, interrompa o exercicio e troque por uma alternativa mais leve.",
  exercises,
  weeklyFocus: ["controle da dor", "estabilidade", "fortalecimento basico"],
  weeklyPainAverage: 3,
  weeklyTrainedDays: 2
};

export const demoWeeklyProgress: WeeklyProgressSummary = {
  currentPhase: "Fase 3 - estabilidade e equilibrio",
  weeklySessions: 2,
  completedSessions: 7,
  weeklyMinutes: 138,
  painTrend: "down",
  painAverage: 3,
  effortAverage: 6.5,
  adherencePercent: 83,
  metrics: [
    {
      label: "Dor media",
      value: "3/10",
      highlight: "melhor que semana passada"
    },
    {
      label: "Tempo total",
      value: "138 min",
      highlight: "consistencia mantida"
    },
    { label: "Frequencia", value: "4x/sem", highlight: "meta quase completa" }
  ]
};

const phases: RecoveryPhase[] = [
  { id: "phase-1", title: "Controle da dor", status: "completed" },
  { id: "phase-2", title: "Fortalecimento basico", status: "completed" },
  { id: "phase-3", title: "Estabilidade e equilibrio", status: "current" },
  { id: "phase-4", title: "Forca avancada", status: "upcoming" },
  { id: "phase-5", title: "Corrida leve", status: "upcoming" },
  { id: "phase-6", title: "Mudanca de direcao", status: "upcoming" },
  { id: "phase-7", title: "Retorno gradual ao esporte", status: "upcoming" }
];

export const demoInjuryJourney: InjuryRecoveryPlan = {
  affectedRegion: "Joelho direito",
  summary:
    "Programa focado em recuperar estabilidade lateral, forca e confianca para retorno progressivo ao futebol.",
  phases
};

const coachSuggestions: CoachSuggestion[] = [
  {
    title: "Ajuste automatico sugerido",
    body: "Seu ultimo treino teve dor leve no plano lateral. A sugestao de hoje reduz impactos e reforca controle de joelho."
  },
  {
    title: "Alternativa pronta",
    body: "Se a extensao terminal incomodar, troque por isometria de quadriceps por 20 a 30 segundos."
  },
  {
    title: "Aviso de seguranca",
    body: "Dor forte, inchaço, travamento ou perda de forca exigem avaliacao de um profissional."
  }
];

export const coachPreviewMessages = coachSuggestions.map(
  (item) => `${item.title}: ${item.body}`
);

export const exerciseLibrary: ExerciseLibraryItem[] = [
  {
    id: "exercise-1",
    name: "Ponte de gluteo com pausa",
    category: "forca",
    equipment: "nenhum equipamento",
    level: "beginner",
    location: "home",
    impact: "baixo",
    targetRegion: "quadril e joelho",
    safety: "Boa opcao quando o joelho precisa de menor impacto."
  },
  {
    id: "exercise-2",
    name: "Agachamento para caixa",
    category: "fortalecimento",
    equipment: "halteres",
    level: "intermediate",
    location: "home",
    impact: "medio",
    targetRegion: "membros inferiores",
    safety: "Controle a amplitude e interrompa se houver dor aguda."
  },
  {
    id: "exercise-3",
    name: "Caminhada lateral com faixa",
    category: "estabilidade",
    equipment: "faixas elasticas",
    level: "intermediate",
    location: "home",
    impact: "baixo",
    targetRegion: "quadril",
    safety: "Mantenha joelhos alinhados para evitar compensacoes."
  }
];

export const demoOnboarding: {
  answers: OnboardingAnswers;
  profile: UserProfile;
} = {
  answers: {
    goal: "Recuperacao e fortalecimento",
    trainingLocation: "home",
    equipments,
    availableDays: 4,
    sessionDurationMin: 45,
    experienceLevel: "intermediate",
    limitations: profile.limitations
  },
  profile
};
