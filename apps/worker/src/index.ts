type WorkoutRequest = {
  objective?: string;
  location?: "casa" | "academia";
  duration?: number;
  level?: string;
  equipment?: string[];
  limitations?: string;
};
const defaultOrigin = "https://intelligym.pages.dev";

function responseHeaders(request: Request, env: Env): Headers {
  const origin = request.headers.get("Origin");
  const allowed = new Set(
    env.ALLOWED_ORIGINS.split(",").map((value) => value.trim())
  );
  return new Headers({
    "Access-Control-Allow-Origin":
      origin && allowed.has(origin) ? origin : defaultOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff"
  });
}

function json(request: Request, env: Env, value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: responseHeaders(request, env)
  });
}

function createWorkout(input: WorkoutRequest) {
  const location = input.location === "academia" ? "academia" : "casa";
  const equipment = Array.isArray(input.equipment)
    ? input.equipment
        .filter((item): item is string => typeof item === "string")
        .slice(0, 20)
    : [];
  const homeExercises = [
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
  const gymExercises = [
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
    exercises: location === "casa" ? homeExercises : gymExercises,
    safety: input.limitations
      ? "Limitação informada: reduza carga e amplitude. Pare diante de dor aguda, travamento, formigamento ou piora persistente."
      : "Mantenha a técnica e interrompa se houver dor aguda ou mal-estar."
  };
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS")
      return new Response(null, {
        status: 204,
        headers: responseHeaders(request, env)
      });
    if (request.method === "GET" && url.pathname === "/health")
      return json(request, env, {
        status: "ok",
        service: "intelligym-api",
        version: "1.1.0",
        environment: env.ENVIRONMENT
      });
    if (request.method === "GET" && url.pathname === "/api/workouts")
      return json(request, env, { workouts: [] });
    if (
      request.method === "POST" &&
      url.pathname === "/api/workouts/generate"
    ) {
      try {
        return json(
          request,
          env,
          { workout: createWorkout((await request.json()) as WorkoutRequest) },
          201
        );
      } catch {
        return json(
          request,
          env,
          { error: "Envie um JSON válido para gerar o treino." },
          400
        );
      }
    }
    console.warn(
      JSON.stringify({
        event: "route_not_found",
        method: request.method,
        path: url.pathname
      })
    );
    return json(request, env, { error: "Rota não encontrada." }, 404);
  }
} satisfies ExportedHandler<Env>;
