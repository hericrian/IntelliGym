export type WorkoutExercise = {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  restSeconds: number;
  load: string;
  muscles: string[];
  equipment: string[];
  safetyNote: string;
  alternatives: string[];
};

export type WorkoutPlan = {
  id: string;
  title: string;
  focus: string;
  duration: number;
  intensity: "leve" | "moderada" | "alta";
  location: string;
  warmup: string[];
  exercises: WorkoutExercise[];
  instructions: string[];
};

export type ExerciseLibraryItem = WorkoutExercise & {
  level: string;
  impact: string;
  goal: string;
  commonMistakes: string[];
  execution: string[];
};

export const weeklyStats = {
  streak: 6,
  completed: 4,
  trainedMinutes: 186,
  weeklyProgress: 78,
  painTrend: -22,
  goal: "Fortalecer membros inferiores com segurança",
  sequence: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(
    (day, index) => ({
      day,
      done: [0, 2, 4, 5].includes(index),
      planned: ![1, 6].includes(index)
    })
  )
};

export const workouts: WorkoutPlan[] = [
  {
    id: "lower-control",
    title: "Inferiores com controle de impacto",
    focus: "Fortalecimento e estabilidade",
    duration: 45,
    intensity: "moderada",
    location: "casa",
    warmup: [
      "Bike leve por 6 minutos",
      "Mobilidade de tornozelo",
      "Ativação de glúteo com mini band"
    ],
    instructions: [
      "Mantenha amplitude sem dor aguda.",
      "Priorize controle de joelho e quadril.",
      "Interrompa se a dor passar de 4/10."
    ],
    exercises: [
      {
        id: "box-squat",
        name: "Agachamento no banco",
        description:
          "Padrão de agachamento com alvo alto para reduzir impacto e controlar amplitude.",
        sets: 3,
        reps: "10-12",
        restSeconds: 75,
        load: "Peso corporal ou halter leve",
        muscles: ["quadriceps", "glúteos", "core"],
        equipment: ["banco", "halter"],
        safetyNote:
          "Evite queda rapida e mantenha joelho alinhado ao segundo dedo do pe.",
        alternatives: ["Leg press curto", "Ponte de glúteo"]
      },
      {
        id: "hip-bridge",
        name: "Ponte de glúteo",
        description:
          "Extensao de quadril no solo para fortalecer cadeia posterior com baixo impacto.",
        sets: 4,
        reps: "12-15",
        restSeconds: 60,
        load: "Mini band ou anilha leve",
        muscles: ["glúteos", "posterior", "core"],
        equipment: ["colchonete", "mini band"],
        safetyNote: "Não hiperestenda a lombar no topo.",
        alternatives: ["Hip thrust no banco", "Abducao lateral"]
      },
      {
        id: "step-up-low",
        name: "Step-up baixo",
        description:
          "Subida controlada em plataforma baixa para trabalhar estabilidade unilateral.",
        sets: 3,
        reps: "8 cada perna",
        restSeconds: 80,
        load: "Peso corporal",
        muscles: ["quadriceps", "glúteos", "panturrilha"],
        equipment: ["step baixo"],
        safetyNote:
          "Use altura baixa e reduza se houver desconforto no joelho direito.",
        alternatives: ["Cadeira extensora leve", "Marcha estacionaria"]
      }
    ]
  },
  {
    id: "upper-strength",
    title: "Superiores funcional",
    focus: "Forca e postura",
    duration: 38,
    intensity: "moderada",
    location: "academia",
    warmup: [
      "Remada leve",
      "Mobilidade toracica",
      "Rotacao externa com elastico"
    ],
    instructions: [
      "Controle a escapula.",
      "Não prenda a respiração.",
      "Use carga técnica."
    ],
    exercises: [
      {
        id: "incline-db-press",
        name: "Supino inclinado com halteres",
        description: "Press horizontal inclinado com amplitude controlada.",
        sets: 3,
        reps: "8-10",
        restSeconds: 90,
        load: "Halteres moderados",
        muscles: ["peitoral", "triceps", "deltoide anterior"],
        equipment: ["halteres", "banco inclinado"],
        safetyNote: "Desca ate manter ombros confortaveis.",
        alternatives: ["Flexao inclinada", "Chest press"]
      }
    ]
  }
];

export const exerciseLibrary: ExerciseLibraryItem[] = workouts.flatMap(
  (workout) =>
    workout.exercises.map((exercise) => ({
      ...exercise,
      level: workout.intensity === "alta" ? "avancado" : "intermediario",
      impact: exercise.id === "step-up-low" ? "baixo a moderado" : "baixo",
      goal: workout.focus,
      execution: [
        "Prepare a postura e estabilize o core.",
        "Execute a fase principal sem pressa.",
        "Retorne controlando a carga e respirando."
      ],
      commonMistakes: [
        "Compensar com velocidade",
        "Perder alinhamento articular",
        "Aumentar carga antes da técnica"
      ]
    }))
);

export function generateMockWorkout(input: {
  objective: string;
  location: string;
  duration: string;
  level: string;
  muscleGroup: string;
  equipment: string;
  limitations: string;
  intensity: string;
  notes: string;
}): WorkoutPlan {
  return {
    id: `mock-${Date.now()}`,
    title: `Treino ${input.muscleGroup || "full body"} para ${input.objective}`,
    focus: `${input.objective} com intensidade ${input.intensity}`,
    duration: Number(input.duration) || 45,
    intensity:
      input.intensity === "alta"
        ? "alta"
        : input.intensity === "leve"
          ? "leve"
          : "moderada",
    location: input.location,
    warmup: [
      "Respiração e mobilidade por 3 minutos",
      "Ativação específica do grupo alvo",
      "Série leve preparatória"
    ],
    instructions: [
      `Nível: ${input.level}.`,
      `Equipamentos considerados: ${input.equipment || "peso corporal"}.`,
      input.limitations
        ? `Adaptado para: ${input.limitations}.`
        : "Sem limitações informadas.",
      input.notes
        ? `Observação: ${input.notes}.`
        : "Ajuste carga pela qualidade do movimento."
    ],
    exercises: workouts[0].exercises
  };
}

export const painRecords = [
  { day: "Seg", before: 3, after: 2, note: "Sem piora após bike leve." },
  { day: "Ter", before: 2, after: 3, note: "Desconforto leve em escadas." },
  { day: "Qua", before: 2, after: 2, note: "Boa resposta ao fortalecimento." },
  { day: "Qui", before: 3, after: 3, note: "Mobilidade reduzida pela manhã." },
  {
    day: "Sex",
    before: 2,
    after: 1,
    note: "Melhor estabilidade no step baixo."
  }
];

export const achievements = [
  "Primeira semana completa",
  "4 treinos sem piora de dor",
  "Novo recorde de consistência"
];
