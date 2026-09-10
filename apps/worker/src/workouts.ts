export type WorkoutRequest = {
  objective?: string;
  location?: "casa" | "academia";
  duration?: number;
  level?: string;
  equipment?: string[];
  limitations?: string;
};

const HOME_EXERCISES = [
  {
    name: "Agachamento para banco",
    sets: 3,
    reps: "8-12",
    equipment: ["banco"],
    cue: "Controle a descida e mantenha os joelhos alinhados."
  },
  {
    name: "Ponte de glúteo",
    sets: 3,
    reps: "10-15",
    equipment: ["colchonete"],
    cue: "Suba sem hiperestender a lombar."
  },
  {
    name: "Remada com elástico ou mochila",
    sets: 3,
    reps: "10-12",
    equipment: ["elástico ou mochila"],
    cue: "Aproxime as escápulas sem elevar os ombros."
  }
];

const GYM_EXERCISES = [
  {
    name: "Leg press com amplitude confortável",
    sets: 3,
    reps: "10-12",
    equipment: ["leg press"],
    cue: "Não force amplitude que cause dor."
  },
  {
    name: "Remada sentada",
    sets: 3,
    reps: "10-12",
    equipment: ["máquina ou cabo"],
    cue: "Mantenha peito aberto e pescoço neutro."
  },
  {
    name: "Chest press",
    sets: 3,
    reps: "8-12",
    equipment: ["máquina"],
    cue: "Controle a volta, sem projetar os ombros."
  }
];

export function createWorkout(input: WorkoutRequest) {
  const location = input.location === "academia" ? "academia" : "casa";
  const equipment = Array.isArray(input.equipment)
    ? input.equipment.filter((item) => typeof item === "string").slice(0, 20)
    : [];

  return {
    id: crypto.randomUUID(),
    title: `Plano ${location === "casa" ? "em casa" : "na academia"} — ${input.objective || "fortalecimento"}`,
    location,
    duration: Math.max(20, Math.min(Number(input.duration) || 45, 90)),
    level: input.level || "intermediário",
    equipmentConsidered: equipment,
    warmup: [
      "3 a 5 minutos de movimento leve",
      "Mobilidade da região a treinar",
      "1 série leve do primeiro exercício"
    ],
    exercises: location === "casa" ? HOME_EXERCISES : GYM_EXERCISES,
    safety: input.limitations
      ? "Limitação informada: reduza carga e amplitude. Pare diante de dor aguda, travamento, formigamento ou piora persistente."
      : "Mantenha a técnica e interrompa se houver dor aguda ou mal-estar."
  };
}
