-- Catálogo de exercícios importado da wger (https://wger.de), CC-BY-SA 4.
--
-- Fica no nosso banco em vez de ser consultado ao vivo por três motivos: o
-- app não pode depender do uptime de terceiros no meio de um treino, precisa
-- funcionar offline, e queremos curadoria (só entra o que tem tradução,
-- imagem e músculo mapeado).

CREATE TABLE IF NOT EXISTS exercises (
  id              TEXT PRIMARY KEY,   -- uuid do wger, estável entre importações
  wger_id         INTEGER,
  language        TEXT NOT NULL,      -- 'pt' ou 'en'
  name            TEXT NOT NULL,
  description     TEXT,
  -- Vocabulário já traduzido para o do app, não o da wger.
  category        TEXT,
  muscles         TEXT NOT NULL DEFAULT '[]',   -- JSON
  muscles_secondary TEXT NOT NULL DEFAULT '[]', -- JSON
  equipment       TEXT NOT NULL DEFAULT '[]',   -- JSON
  image_url       TEXT,
  -- Exigência da CC-BY-SA: crédito e link para a origem.
  license         TEXT,
  license_author  TEXT,
  source_url      TEXT,
  -- Texto achatado e sem acento, para busca com LIKE sair barata.
  search_blob     TEXT NOT NULL DEFAULT '',
  updated_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercises_lang_cat ON exercises (language, category);
CREATE INDEX IF NOT EXISTS idx_exercises_search ON exercises (search_blob);
