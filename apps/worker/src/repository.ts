import type { AuthenticatedUser } from "./auth";

/* Formatos trocados com o app. Espelham o que a web já usa em localStorage,
   para o mesmo objeto servir online e offline. */

export type Profile = {
  uid: string;
  email: string | null;
  nome: string | null;
  foto: string | null;
  idade: number | null;
  altura: number | null;
  peso: number | null;
  objetivo: string | null;
  nivel: string | null;
  localTreino: string | null;
  diasTreino: string[];
  duracaoPreferida: number | null;
  limitacoes: string[];
  onboardingDone: boolean;
  updatedAt: string;
};

export type PainRecord = {
  id: string;
  score: number;
  region: string;
  trigger: string | null;
  note: string | null;
  createdAt: string;
};

export type StoredPlan = {
  id: string;
  title: string;
  focus: string | null;
  duration: number | null;
  payload: unknown;
  createdAt: string;
};

const now = () => new Date().toISOString();

function parseList(value: unknown): string[] {
  if (typeof value !== "string" || value.length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ perfil */

export async function getProfile(
  db: D1Database,
  uid: string
): Promise<Profile | null> {
  const row = await db
    .prepare("SELECT * FROM profiles WHERE uid = ?")
    .bind(uid)
    .first();
  if (!row) return null;

  return {
    uid: String(row.uid),
    email: (row.email as string) ?? null,
    nome: (row.nome as string) ?? null,
    foto: (row.foto as string) ?? null,
    idade: (row.idade as number) ?? null,
    altura: (row.altura as number) ?? null,
    peso: (row.peso as number) ?? null,
    objetivo: (row.objetivo as string) ?? null,
    nivel: (row.nivel as string) ?? null,
    localTreino: (row.local_treino as string) ?? null,
    diasTreino: parseList(row.dias_treino),
    duracaoPreferida: (row.duracao_preferida as number) ?? null,
    limitacoes: parseList(row.limitacoes),
    onboardingDone: Boolean(row.onboarding_done),
    updatedAt: String(row.updated_at)
  };
}

export async function upsertProfile(
  db: D1Database,
  user: AuthenticatedUser,
  patch: Partial<Profile>
): Promise<Profile> {
  const current = await getProfile(db, user.uid);
  const timestamp = now();

  const merged = {
    email: patch.email ?? current?.email ?? user.email,
    nome: patch.nome ?? current?.nome ?? user.name,
    foto: patch.foto ?? current?.foto ?? null,
    idade: patch.idade ?? current?.idade ?? null,
    altura: patch.altura ?? current?.altura ?? null,
    peso: patch.peso ?? current?.peso ?? null,
    objetivo: patch.objetivo ?? current?.objetivo ?? null,
    nivel: patch.nivel ?? current?.nivel ?? null,
    localTreino: patch.localTreino ?? current?.localTreino ?? null,
    diasTreino: patch.diasTreino ?? current?.diasTreino ?? [],
    duracaoPreferida:
      patch.duracaoPreferida ?? current?.duracaoPreferida ?? null,
    limitacoes: patch.limitacoes ?? current?.limitacoes ?? [],
    onboardingDone: patch.onboardingDone ?? current?.onboardingDone ?? false
  };

  await db
    .prepare(
      `INSERT INTO profiles (
         uid, email, nome, foto, idade, altura, peso, objetivo, nivel,
         local_treino, dias_treino, duracao_preferida, limitacoes,
         onboarding_done, created_at, updated_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(uid) DO UPDATE SET
         email = excluded.email,
         nome = excluded.nome,
         foto = excluded.foto,
         idade = excluded.idade,
         altura = excluded.altura,
         peso = excluded.peso,
         objetivo = excluded.objetivo,
         nivel = excluded.nivel,
         local_treino = excluded.local_treino,
         dias_treino = excluded.dias_treino,
         duracao_preferida = excluded.duracao_preferida,
         limitacoes = excluded.limitacoes,
         onboarding_done = excluded.onboarding_done,
         updated_at = excluded.updated_at`
    )
    .bind(
      user.uid,
      merged.email,
      merged.nome,
      merged.foto,
      merged.idade,
      merged.altura,
      merged.peso,
      merged.objetivo,
      merged.nivel,
      merged.localTreino,
      JSON.stringify(merged.diasTreino),
      merged.duracaoPreferida,
      JSON.stringify(merged.limitacoes),
      merged.onboardingDone ? 1 : 0,
      current ? current.updatedAt : timestamp,
      timestamp
    )
    .run();

  return { uid: user.uid, ...merged, updatedAt: timestamp };
}

/* ------------------------------------------------------------ equipamentos */

export async function listEquipment(
  db: D1Database,
  uid: string
): Promise<string[]> {
  const { results } = await db
    .prepare("SELECT item FROM equipment WHERE uid = ? ORDER BY created_at")
    .bind(uid)
    .all<{ item: string }>();

  return results.map((row) => row.item);
}

export async function replaceEquipment(
  db: D1Database,
  uid: string,
  items: string[]
): Promise<string[]> {
  const unique = [
    ...new Set(items.map((item) => item.trim()).filter(Boolean))
  ].slice(0, 60);
  const timestamp = now();

  // D1 aplica o batch numa transação: a lista nunca fica pela metade.
  await db.batch([
    db.prepare("DELETE FROM equipment WHERE uid = ?").bind(uid),
    ...unique.map((item) =>
      db
        .prepare("INSERT INTO equipment (uid, item, created_at) VALUES (?,?,?)")
        .bind(uid, item, timestamp)
    )
  ]);

  return unique;
}

/* ------------------------------------------------------------------ planos */

export async function listPlans(
  db: D1Database,
  uid: string,
  limit = 30
): Promise<StoredPlan[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM plans WHERE uid = ? ORDER BY created_at DESC LIMIT ?"
    )
    .bind(uid, limit)
    .all();

  return results.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    focus: (row.focus as string) ?? null,
    duration: (row.duration as number) ?? null,
    payload: JSON.parse(String(row.payload)),
    createdAt: String(row.created_at)
  }));
}

export async function savePlan(
  db: D1Database,
  uid: string,
  plan: {
    id?: string;
    title?: string;
    focus?: string;
    duration?: number;
    [key: string]: unknown;
  }
): Promise<StoredPlan> {
  const id =
    typeof plan.id === "string" && plan.id ? plan.id : crypto.randomUUID();
  const record: StoredPlan = {
    id,
    title: plan.title ?? "Treino personalizado",
    focus: plan.focus ?? null,
    duration: typeof plan.duration === "number" ? plan.duration : null,
    payload: { ...plan, id },
    createdAt: now()
  };

  await db
    .prepare(
      `INSERT INTO plans (id, uid, title, focus, duration, payload, created_at)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         focus = excluded.focus,
         duration = excluded.duration,
         payload = excluded.payload`
    )
    .bind(
      record.id,
      uid,
      record.title,
      record.focus,
      record.duration,
      JSON.stringify(record.payload),
      record.createdAt
    )
    .run();

  return record;
}

export async function deletePlan(
  db: D1Database,
  uid: string,
  id: string
): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM plans WHERE id = ? AND uid = ?")
    .bind(id, uid)
    .run();

  return (result.meta.changes ?? 0) > 0;
}

/* ------------------------------------------------------------ registros de dor */

export async function listPainRecords(
  db: D1Database,
  uid: string,
  limit = 60
): Promise<PainRecord[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM pain_records WHERE uid = ? ORDER BY created_at DESC LIMIT ?"
    )
    .bind(uid, limit)
    .all();

  return results.map((row) => ({
    id: String(row.id),
    score: Number(row.score),
    region: String(row.region),
    trigger: (row.trigger as string) ?? null,
    note: (row.note as string) ?? null,
    createdAt: String(row.created_at)
  }));
}

export async function savePainRecord(
  db: D1Database,
  uid: string,
  input: {
    score?: number;
    region?: string;
    trigger?: string;
    note?: string;
    createdAt?: string;
  }
): Promise<PainRecord> {
  const record: PainRecord = {
    id: crypto.randomUUID(),
    score: Math.min(10, Math.max(0, Math.round(Number(input.score) || 0))),
    region: (input.region ?? "").trim().slice(0, 120) || "não informada",
    trigger: input.trigger?.trim().slice(0, 240) ?? null,
    note: input.note?.trim().slice(0, 500) ?? null,
    createdAt: input.createdAt ?? now()
  };

  await db
    .prepare(
      `INSERT INTO pain_records (id, uid, score, region, trigger, note, created_at)
       VALUES (?,?,?,?,?,?,?)`
    )
    .bind(
      record.id,
      uid,
      record.score,
      record.region,
      record.trigger,
      record.note,
      record.createdAt
    )
    .run();

  return record;
}

/* -------------------------------------------------------------- sessões de treino */

export async function saveSession(
  db: D1Database,
  uid: string,
  input: {
    planId?: string;
    completed?: boolean;
    setsDone?: number;
    durationMin?: number;
  }
) {
  const record = {
    id: crypto.randomUUID(),
    planId: input.planId ?? null,
    completed: Boolean(input.completed),
    setsDone: Math.max(0, Math.round(Number(input.setsDone) || 0)),
    durationMin:
      typeof input.durationMin === "number"
        ? Math.round(input.durationMin)
        : null,
    createdAt: now()
  };

  await db
    .prepare(
      `INSERT INTO workout_sessions (id, uid, plan_id, completed, sets_done, duration_min, created_at)
       VALUES (?,?,?,?,?,?,?)`
    )
    .bind(
      record.id,
      uid,
      record.planId,
      record.completed ? 1 : 0,
      record.setsDone,
      record.durationMin,
      record.createdAt
    )
    .run();

  return record;
}

export async function summarizeSessions(db: D1Database, uid: string) {
  const row = await db
    .prepare(
      `SELECT
         COUNT(*)                                   AS total,
         COALESCE(SUM(completed), 0)                AS completed,
         COALESCE(SUM(duration_min), 0)             AS minutes
       FROM workout_sessions
       WHERE uid = ? AND created_at >= datetime('now', '-30 days')`
    )
    .bind(uid)
    .first();

  return {
    total: Number(row?.total ?? 0),
    completed: Number(row?.completed ?? 0),
    minutes: Number(row?.minutes ?? 0)
  };
}
