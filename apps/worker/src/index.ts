type WorkoutRequest = {
  objective?: string;
  location?: "casa" | "academia";
  duration?: number;
  level?: string;
  equipment?: string[];
  limitations?: string;
};

const allowedOrigins = new Set(["https://intelligym.pages.dev", "http://localhost:5173"]);

function headers(origin: string | null): Headers {
  const value = origin && (allowedOrigins.has(origin) || origin.endsWith(".intelligym.pages.dev")) ? origin : "https://intelligym.pages.dev";
  return new Headers({
    "Access-Control-Allow-Origin": value,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  });
}

function json(value: unknown, init: ResponseInit = {}, origin: string | null = null) {
  return new Response(JSON.stringify(value), { ...init, headers: headers(origin) });
}

function createWorkout(input: WorkoutRequest) {
  const location = input.location === "academia" ? "academia" : "casa";
  const equipment = Array.isArray(input.equipment) ? input.equipment.filter((item) => typeof item === "string").slice(0, 20) : [];
  const homeExercises = [
    { name: "Agachamento para banco", sets: 3, reps: "8-12", equipment: ["banco"], cue: "Controle a descida e mantenha os joelhos alinhados." },
    { name: "Ponte de glúteo", sets: 3, reps: "10-15", equipment: ["colchonete"], cue: "Suba sem hiperestender a lombar." },
    { name: "Remada com elástico ou mochila", sets: 3, reps: "10-12", equipment: ["elástico ou mochila"], cue: "Aproxime as escápulas sem elevar os ombros." }
  ];
  const gymExercises = [
    { name: "Leg press com amplitude confortável", sets: 3, reps: "10-12", equipment: ["leg press"], cue: "Não force amplitude que cause dor." },
    { name: "Remada sentada", sets: 3, reps: "10-12", equipment: ["máquina ou cabo"], cue: "Mantenha peito aberto e pescoço neutro." },
    { name: "Chest press", sets: 3, reps: "8-12", equipment: ["máquina"], cue: "Controle a volta, sem projetar os ombros." }
  ];

  return {
    id: crypto.randomUUID(),
    title: `Plano ${location === "casa" ? "em casa" : "na academia"} — ${input.objective || "fortalecimento"}`,
    location,
    duration: Math.max(20, Math.min(Number(input.duration) || 45, 90)),
    level: input.level || "intermediário",
    equipmentConsidered: equipment,
    warmup: ["3 a 5 minutos de movimento leve", "Mobilidade da região a treinar", "1 série leve do primeiro exercício"],
    exercises: location === "casa" ? homeExercises : gymExercises,
    safety: input.limitations
      ? "Limitação informada: reduza carga e amplitude. Pare diante de dor aguda, travamento, formigamento ou piora persistente."
      : "Mantenha a técnica e interrompa se houver dor aguda ou mal-estar."
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin) });
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok", service: "intelligym-api", version: "1.0.0", runtime: "cloudflare-workers" }, {}, origin);
    }
    if (request.method === "GET" && url.pathname === "/api/workouts") {
      return json({ workouts: [] }, {}, origin);
    }
    if (request.method === "POST" && url.pathname === "/api/workouts/generate") {
      try {
        return json({ workout: createWorkout((await request.json()) as WorkoutRequest) }, { status: 201 }, origin);
      } catch {
        return json({ error: "Envie um JSON válido para gerar o treino." }, { status: 400 }, origin);
      }
    }
    if (request.method === "POST" && url.pathname === "/api/pain-records") {
      return json({ id: `pain-${crypto.randomUUID()}`, saved: true, note: "Registro recebido. Isso não substitui avaliação profissional." }, { status: 201 }, origin);
    }
    return json({ error: "Rota não encontrada." }, { status: 404 }, origin);
  }
} satisfies ExportedHandler;
