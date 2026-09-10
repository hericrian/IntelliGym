import { requireUser } from "./auth";
import { corsHeaders, fail, HttpError, json, readJson } from "./http";
import {
  deletePlan,
  getProfile,
  listEquipment,
  listPainRecords,
  listPlans,
  replaceEquipment,
  savePainRecord,
  savePlan,
  saveSession,
  summarizeSessions,
  upsertProfile,
  type Profile
} from "./repository";
import { createWorkout, type WorkoutRequest } from "./workouts";

export type Env = {
  DB: D1Database;
  /** Projeto do Firebase usado para validar a claim `aud` do ID token. */
  FIREBASE_PROJECT_ID?: string;
};

const VERSION = "2.0.0";

/**
 * API do IntelliGym.
 *
 * Tudo abaixo de /api/me exige um ID token válido do Firebase e só enxerga as
 * linhas do próprio uid — não há endpoint que devolva dados de outra pessoa.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      return await route(request, env, path, origin);
    } catch (error) {
      if (error instanceof HttpError) {
        return fail(error.status, error.message, origin);
      }

      console.error("erro não tratado", error);
      return fail(500, "Erro inesperado na API.", origin);
    }
  }
} satisfies ExportedHandler<Env>;

async function route(
  request: Request,
  env: Env,
  path: string,
  origin: string | null
): Promise<Response> {
  const { method } = request;

  /* --------------------------------------------------------- público */

  if (method === "GET" && path === "/health") {
    return json(
      {
        status: "ok",
        service: "intelligym-api",
        version: VERSION,
        runtime: "cloudflare-workers",
        database: env.DB ? "d1" : "não configurado",
        auth: env.FIREBASE_PROJECT_ID ? "firebase" : "não configurado"
      },
      {},
      origin
    );
  }

  // Gerar treino não depende de conta: dá para experimentar antes de entrar.
  if (method === "POST" && path === "/api/workouts/generate") {
    const body = await readJson<WorkoutRequest>(request);
    return json({ workout: createWorkout(body) }, { status: 201 }, origin);
  }

  /* ------------------------------------------------------ autenticado */

  if (!path.startsWith("/api/")) {
    return fail(404, "Rota não encontrada.", origin);
  }

  const user = await requireUser(request, env.FIREBASE_PROJECT_ID);
  const db = requireDatabase(env);

  if (path === "/api/me") {
    if (method === "GET") {
      const [profile, equipment, summary] = await Promise.all([
        getProfile(db, user.uid),
        listEquipment(db, user.uid),
        summarizeSessions(db, user.uid)
      ]);

      // Primeiro login: cria o perfil a partir das claims do token.
      const ensured = profile ?? (await upsertProfile(db, user, {}));
      return json({ profile: ensured, equipment, summary }, {}, origin);
    }

    if (method === "PUT") {
      const patch = await readJson<Partial<Profile>>(request);
      return json(
        { profile: await upsertProfile(db, user, patch) },
        {},
        origin
      );
    }
  }

  if (path === "/api/equipment") {
    if (method === "GET") {
      return json({ equipment: await listEquipment(db, user.uid) }, {}, origin);
    }

    if (method === "PUT") {
      const body = await readJson<{ equipment?: unknown }>(request);
      const items = Array.isArray(body.equipment)
        ? body.equipment.filter(
            (item): item is string => typeof item === "string"
          )
        : [];
      return json(
        { equipment: await replaceEquipment(db, user.uid, items) },
        {},
        origin
      );
    }
  }

  if (path === "/api/plans") {
    if (method === "GET") {
      return json({ plans: await listPlans(db, user.uid) }, {}, origin);
    }

    if (method === "POST") {
      const plan = await readJson<Record<string, unknown>>(request);
      return json(
        { plan: await savePlan(db, user.uid, plan) },
        { status: 201 },
        origin
      );
    }
  }

  const planMatch = /^\/api\/plans\/([\w-]{1,64})$/.exec(path);
  if (planMatch && method === "DELETE") {
    const removed = await deletePlan(db, user.uid, planMatch[1]);
    return removed
      ? json({ deleted: true }, {}, origin)
      : fail(404, "Plano não encontrado.", origin);
  }

  if (path === "/api/pain-records") {
    if (method === "GET") {
      return json({ records: await listPainRecords(db, user.uid) }, {}, origin);
    }

    if (method === "POST") {
      const body =
        await readJson<Parameters<typeof savePainRecord>[2]>(request);
      const record = await savePainRecord(db, user.uid, body);
      return json(
        {
          record,
          note: "Registro salvo. Isso não substitui avaliação profissional."
        },
        { status: 201 },
        origin
      );
    }
  }

  if (path === "/api/sessions" && method === "POST") {
    const body = await readJson<Parameters<typeof saveSession>[2]>(request);
    return json(
      { session: await saveSession(db, user.uid, body) },
      { status: 201 },
      origin
    );
  }

  return fail(404, "Rota não encontrada.", origin);
}

function requireDatabase(env: Env): D1Database {
  if (!env.DB) {
    throw new HttpError(
      503,
      "Banco de dados não configurado. Crie o D1 e ligue o binding DB no Worker."
    );
  }

  return env.DB;
}
