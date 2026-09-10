/**
 * Importa o catálogo de exercícios da wger (CC-BY-SA 4) para um seed SQL.
 *
 *   node scripts/import-exercises.mjs
 *
 * Gera seeds/exercises.sql, que é versionado no repositório de propósito:
 * assim a semeadura é reproduzível sem depender da wger estar no ar, e a
 * curadoria fica revisável no diff em vez de acontecer em silêncio.
 *
 * Regra de entrada: só passa exercício com nome, descrição e um grupo
 * muscular (do campo de músculos ou, na falta dele, da categoria). Traduzido
 * para português quando existe; em inglês quando não existe — a wger só tem
 * ~64 verbetes em PT, que não sustentam uma biblioteca sozinhos.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const API = "https://wger.de/api/v2";
const PT_LANGUAGE_ID = 7;
const EN_LANGUAGE_ID = 2;

/* -------------------------------------------------------------------------
   De-para: vocabulário da wger -> vocabulário do app, em português.
   ------------------------------------------------------------------------- */

const CATEGORIES = {
  Abs: "core",
  Arms: "braços",
  Back: "costas",
  Calves: "panturrilhas",
  Cardio: "cardio",
  Chest: "peito",
  Legs: "pernas",
  Shoulders: "ombros"
};

const MUSCLES = {
  Shoulders: "ombros",
  Biceps: "bíceps",
  Hamstrings: "posteriores de coxa",
  Brachialis: "braquial",
  Calves: "panturrilhas",
  Glutes: "glúteos",
  Lats: "dorsais",
  Chest: "peito",
  Quads: "quadríceps",
  Abs: "abdômen",
  Triceps: "tríceps",
  // Sem name_en na API: caem no nome latino.
  "Obliquus externus abdominis": "oblíquos",
  "Serratus anterior": "serrátil",
  Soleus: "sóleo",
  Trapezius: "trapézio",
  "Anterior deltoid": "ombros",
  "Biceps brachii": "bíceps",
  "Biceps femoris": "posteriores de coxa",
  Gastrocnemius: "panturrilhas",
  "Gluteus maximus": "glúteos",
  "Latissimus dorsi": "dorsais",
  "Pectoralis major": "peito",
  "Quadriceps femoris": "quadríceps",
  "Rectus abdominis": "abdômen",
  "Triceps brachii": "tríceps"
};

const EQUIPMENT = {
  Barbell: "Barra",
  Bench: "Banco",
  "Cable machine": "Máquina de cabo",
  Dumbbell: "Halteres",
  "Gym mat": "Colchonete",
  "Incline bench": "Banco inclinado",
  Kettlebell: "Kettlebell",
  "Pull-up bar": "Barra fixa",
  "Resistance band": "Elástico",
  "SZ-Bar": "Barra W",
  "Swiss Ball": "Bola suíça",
  "none (bodyweight exercise)": "Peso corporal"
};

/* ------------------------------------------------------------------------- */

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error(`${response.status} em ${url}`);
  return response.json();
}

async function fetchAll(path) {
  const items = [];
  let url = `${API}/${path}?format=json&limit=100`;

  while (url) {
    const page = await fetchJson(url);
    items.push(...page.results);
    url = page.next;
    process.stdout.write(`\r  ${items.length} registros...`);
  }

  process.stdout.write("\n");
  return items;
}

/** As descrições vêm em HTML editorial; a UI mostra texto puro. */
function stripHtml(value) {
  return (value ?? "")
    .replace(/<li>/gi, "\n• ")
    .replace(/<\/(p|div|li|ul|ol|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Busca com LIKE não deve depender de acento nem de caixa. */
function normalize(value) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function muscleName(muscle) {
  const key = muscle.name_en?.trim() || muscle.name?.trim() || "";
  return MUSCLES[key] ?? null;
}

function pickTranslation(translations) {
  const usable = (language) =>
    translations.find(
      (t) =>
        t.language === language &&
        (t.name ?? "").trim() &&
        (t.description ?? "").trim()
    );

  const pt = usable(PT_LANGUAGE_ID);
  if (pt) return { translation: pt, language: "pt" };

  const en = usable(EN_LANGUAGE_ID);
  if (en) return { translation: en, language: "en" };

  return null;
}

function toRow(exercise) {
  const picked = pickTranslation(exercise.translations ?? []);
  if (!picked) return null;

  let muscles = (exercise.muscles ?? []).map(muscleName).filter(Boolean);
  const secondary = (exercise.muscles_secondary ?? [])
    .map(muscleName)
    .filter(Boolean);
  const category = CATEGORIES[exercise.category?.name] ?? null;

  // Muita entrada boa vem sem músculo preenchido. As categorias da wger já
  // são grupos musculares (menos Cardio), então servem de fallback — melhor
  // que descartar um verbete traduzido por causa de um campo vazio.
  if (muscles.length === 0 && secondary.length === 0) {
    if (!category || category === "cardio") return null;
    muscles = [category];
  }

  const name = picked.translation.name.trim();
  const description = stripHtml(picked.translation.description);
  if (description.length < 20) return null;

  const equipment = (exercise.equipment ?? [])
    .map((item) => EQUIPMENT[item.name] ?? null)
    .filter(Boolean);

  const image =
    (exercise.images ?? []).find((i) => i.is_main) ??
    (exercise.images ?? [])[0];

  return {
    id: exercise.uuid,
    wger_id: exercise.id,
    language: picked.language,
    name,
    description,
    category,
    muscles,
    muscles_secondary: secondary,
    equipment,
    image_url: image?.image ?? null,
    license: exercise.license?.short_name ?? "CC-BY-SA 4",
    license_author: exercise.license_author ?? null,
    source_url: `https://wger.de/en/exercise/${exercise.id}/view/`,
    search_blob: normalize(
      [name, ...muscles, ...secondary, ...equipment].join(" ")
    )
  };
}

const sql = (value) =>
  value === null || value === undefined
    ? "NULL"
    : `'${String(value).replace(/'/g, "''")}'`;

async function main() {
  console.log("Baixando exercícios da wger...");
  const raw = await fetchAll("exerciseinfo/");

  const rows = raw.map(toRow).filter(Boolean);
  // Português primeiro: quando dois verbetes descrevem o mesmo movimento, o
  // traduzido é o que a pessoa deve ver.
  rows.sort((a, b) =>
    a.language === b.language
      ? a.name.localeCompare(b.name, "pt")
      : a.language === "pt"
        ? -1
        : 1
  );

  const stats = {
    baixados: raw.length,
    aproveitados: rows.length,
    portugues: rows.filter((r) => r.language === "pt").length,
    comImagem: rows.filter((r) => r.image_url).length
  };

  const lines = [
    "-- GERADO POR scripts/import-exercises.mjs — não editar à mão.",
    `-- Origem: wger.de · licença CC-BY-SA 4 · importado em ${new Date().toISOString().slice(0, 10)}`,
    `-- ${stats.aproveitados} exercícios (${stats.portugues} em português, ${stats.comImagem} com imagem)`,
    "",
    "DELETE FROM exercises;",
    ""
  ];

  const now = new Date().toISOString();
  for (const row of rows) {
    lines.push(
      "INSERT INTO exercises (id, wger_id, language, name, description, category, muscles, " +
        "muscles_secondary, equipment, image_url, license, license_author, source_url, " +
        "search_blob, updated_at) VALUES (" +
        [
          sql(row.id),
          row.wger_id ?? "NULL",
          sql(row.language),
          sql(row.name),
          sql(row.description),
          sql(row.category),
          sql(JSON.stringify(row.muscles)),
          sql(JSON.stringify(row.muscles_secondary)),
          sql(JSON.stringify(row.equipment)),
          sql(row.image_url),
          sql(row.license),
          sql(row.license_author),
          sql(row.source_url),
          sql(row.search_blob),
          sql(now)
        ].join(", ") +
        ");"
    );
  }

  const out = join(dirname(fileURLToPath(import.meta.url)), "..", "seeds");
  await mkdir(out, { recursive: true });
  await writeFile(join(out, "exercises.sql"), lines.join("\n") + "\n", "utf8");

  console.log(
    `\n${stats.baixados} baixados -> ${stats.aproveitados} aproveitados\n` +
      `  em português : ${stats.portugues}\n` +
      `  com imagem   : ${stats.comImagem}\n` +
      `  descartados  : ${stats.baixados - stats.aproveitados} (sem tradução, descrição ou músculo mapeado)\n\n` +
      "Gravado em seeds/exercises.sql"
  );
}

main().catch((error) => {
  console.error("Falha na importação:", error.message);
  process.exit(1);
});
