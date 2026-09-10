import { requireUser } from "./auth";
import { createResponder, HttpError, readJson, type Responder } from "./http";
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
  /** Origens autorizadas, separadas por vírgula. */
  ALLOWED_ORIGINS: string;
  ENVIRONMENT?: string;
  /** Projeto do Firebase usado para validar a claim `aud` do ID token. */
  FIREBASE_PROJECT_ID?: string;
};

const VERSION = "2.0.0";

/**
 * API do IntelliGym.
 *
 * Tudo abaixo de /api (exceto a geração de treino) exige um ID token válido do
 * Firebase e só enxerga as linhas do próprio uid — não há rota capaz de
 * devolver dados de outra conta.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const res = createResponder(origin, env.ALLOWED_ORIGINS ?? "");
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") return res.preflight();

    try {
      return await route(request, env, path, res);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.fail(error.status, error.message);
      }

      console.error(
        JSON.stringify({
          event: "unhandled_error",
          method: request.method,
          path,
          message: error instanceof Error ? error.message : String(error)
        })
      );
      return res.fail(500, "Erro inesperado na API.");
    }
  }
} satisfies ExportedHandler<Env>;

async function route(
  request: Request,
  env: Env,
  path: string,
  res: Responder
): Promise<Response> {
  const { method } = request;

  /* --------------------------------------------------------- público */

  if (method === "GET" && path === "/health") {
    return res.json({
      status: "ok",
      service: "intelligym-api",
      version: VERSION,
      runtime: "cloudflare-workers",
      environment: env.ENVIRONMENT ?? "development",
      database: env.DB ? "d1" : "não configurado",
      auth: env.FIREBASE_PROJECT_ID ? "firebase" : "não configurado"
    });
  }

  // Gerar treino não depende de conta: dá para experimentar antes de entrar.
  if (method === "POST" && path === "/api/workouts/generate") {
    const body = await readJson<WorkoutRequest>(request);
    return res.json({ workout: createWorkout(body) }, { status: 201 });
  }

  /* ------------------------------------------------------ autenticado */

  if (!path.startsWith("/api/")) {
    console.warn(JSON.stringify({ event: "route_not_found", method, path }));
    return res.fail(404, "Rota não encontrada.");
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
      return res.json({ profile: ensured, equipment, summary });
    }

    if (method === "PUT") {
      const patch = await readJson<Partial<Profile>>(request);
      return res.json({ profile: await upsertProfile(db, user, patch) });
    }
  }

  if (path === "/api/equipment") {
    if (method === "GET") {
      return res.json({ equipment: await listEquipment(db, user.uid) });
    }

    if (method === "PUT") {
      const body = await readJson<{ equipment?: unknown }>(request);
      const items = Array.isArray(body.equipment)
        ? body.equipment.filter(
            (item): item is string => typeof item === "string"
          )
        : [];
      return res.json({
        equipment: await replaceEquipment(db, user.uid, items)
      });
    }
  }

  if (path === "/api/plans") {
    if (method === "GET") {
      return res.json({ plans: await listPlans(db, user.uid) });
    }

    if (method === "POST") {
      const plan = await readJson<Record<string, unknown>>(request);
      return res.json(
        { plan: await savePlan(db, user.uid, plan) },
        { status: 201 }
      );
    }
  }

  const planMatch = /^\/api\/plans\/([\w-]{1,64})$/.exec(path);
  if (planMatch && method === "DELETE") {
    const removed = await deletePlan(db, user.uid, planMatch[1]);
    return removed
      ? res.json({ deleted: true })
      : res.fail(404, "Plano não encontrado.");
  }

  if (path === "/api/pain-records") {
    if (method === "GET") {
      return res.json({ records: await listPainRecords(db, user.uid) });
    }

    if (method === "POST") {
      const body =
        await readJson<Parameters<typeof savePainRecord>[2]>(request);
      const record = await savePainRecord(db, user.uid, body);
      return res.json(
        {
          record,
          note: "Registro salvo. Isso não substitui avaliação profissional."
        },
        { status: 201 }
      );
    }
  }

  if (path === "/api/sessions" && method === "POST") {
    const body = await readJson<Parameters<typeof saveSession>[2]>(request);
    return res.json(
      { session: await saveSession(db, user.uid, body) },
      { status: 201 }
    );
  }

  console.warn(JSON.stringify({ event: "route_not_found", method, path }));
  return res.fail(404, "Rota não encontrada.");
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
