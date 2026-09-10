-- IntelliGym — esquema inicial (Cloudflare D1 / SQLite)
--
-- Toda tabela é indexada pelo uid do Firebase. Não guardamos senha nem
-- credencial: a identidade vem do ID token, que é verificado a cada request.

CREATE TABLE IF NOT EXISTS profiles (
  uid                TEXT PRIMARY KEY,
  email              TEXT,
  nome               TEXT,
  foto               TEXT,
  idade              INTEGER,
  altura             INTEGER,
  peso               REAL,
  objetivo           TEXT,
  nivel              TEXT,
  local_treino       TEXT,
  dias_treino        TEXT,          -- JSON: ["segunda","quarta"]
  duracao_preferida  INTEGER,
  limitacoes         TEXT,          -- JSON: ["menisco lateral direito"]
  onboarding_done    INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS equipment (
  uid        TEXT NOT NULL,
  item       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (uid, item)
);

CREATE TABLE IF NOT EXISTS plans (
  id         TEXT PRIMARY KEY,
  uid        TEXT NOT NULL,
  title      TEXT NOT NULL,
  focus      TEXT,
  duration   INTEGER,
  -- O plano inteiro fica em JSON: o formato ainda muda com frequência e não
  -- vale normalizar exercícios em tabela antes de o produto estabilizar.
  payload    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plans_uid_created ON plans (uid, created_at DESC);

CREATE TABLE IF NOT EXISTS pain_records (
  id         TEXT PRIMARY KEY,
  uid        TEXT NOT NULL,
  score      INTEGER NOT NULL,
  region     TEXT NOT NULL,
  trigger    TEXT,
  note       TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pain_uid_created ON pain_records (uid, created_at DESC);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id           TEXT PRIMARY KEY,
  uid          TEXT NOT NULL,
  plan_id      TEXT,
  completed    INTEGER NOT NULL DEFAULT 0,
  sets_done    INTEGER NOT NULL DEFAULT 0,
  duration_min INTEGER,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_uid_created ON workout_sessions (uid, created_at DESC);
