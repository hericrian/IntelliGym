import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import worker, { type Env } from "../src/index";
import { createTestDatabase } from "./d1";
import { createIssuer, stubJwks, type TestIssuer } from "./token";

const ORIGIN = "http://localhost:5173";

let issuer: TestIssuer;
let restoreFetch: () => void;
let env: Env;
let token: string;

beforeAll(async () => {
  issuer = await createIssuer();
  restoreFetch = stubJwks(issuer);
  token = await issuer.sign();
});

afterAll(() => restoreFetch());

beforeEach(() => {
  env = {
    DB: createTestDatabase() as unknown as D1Database,
    ALLOWED_ORIGINS: `${ORIGIN},https://intelligym.pages.dev`,
    ENVIRONMENT: "test",
    FIREBASE_PROJECT_ID: issuer.projectId
  };
});

function call(
  path: string,
  init: RequestInit & { auth?: boolean | string } = {}
): Promise<Response> {
  const { auth, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Origin", ORIGIN);
  if (rest.body) headers.set("Content-Type", "application/json");

  if (auth) {
    headers.set(
      "Authorization",
      `Bearer ${typeof auth === "string" ? auth : token}`
    );
  }

  return worker.fetch(
    new Request(`https://api.test${path}`, { ...rest, headers }),
    env
  );
}

const post = (path: string, body: unknown, auth: boolean | string = true) =>
  call(path, { method: "POST", body: JSON.stringify(body), auth });

const put = (path: string, body: unknown) =>
  call(path, { method: "PUT", body: JSON.stringify(body), auth: true });

describe("rotas públicas", () => {
  it("responde o health sem autenticação", async () => {
    const response = await call("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      database: "d1",
      auth: "firebase"
    });
  });

  it("devolve CORS para a origem conhecida", async () => {
    const response = await call("/health");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);
  });

  it("não ecoa origem desconhecida", async () => {
    const response = await worker.fetch(
      new Request("https://api.test/health", {
        headers: { Origin: "https://site-malicioso.com" }
      }),
      env
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://intelligym.pages.dev"
    );
  });

  it("gera treino sem exigir conta", async () => {
    const response = await call("/api/workouts/generate", {
      method: "POST",
      body: JSON.stringify({ location: "casa", duration: 45 })
    });
    const body = (await response.json()) as {
      workout: { exercises: unknown[]; duration: number };
    };

    expect(response.status).toBe(201);
    expect(body.workout.duration).toBe(45);
    expect(body.workout.exercises.length).toBeGreaterThan(0);
  });

  it("recusa corpo que não é JSON", async () => {
    const response = await call("/api/workouts/generate", {
      method: "POST",
      body: "isto não é json"
    });
    expect(response.status).toBe(400);
  });
});

describe("autenticação", () => {
  it("bloqueia rota privada sem token", async () => {
    const response = await call("/api/me");
    expect(response.status).toBe(401);
  });

  it("bloqueia token com assinatura de outra chave", async () => {
    const outro = await createIssuer();
    const response = await call("/api/me", { auth: await outro.sign() });
    expect(response.status).toBe(401);
  });

  it("bloqueia token de outro projeto", async () => {
    const response = await call("/api/me", {
      auth: await issuer.sign({ aud: "projeto-alheio" })
    });
    expect(response.status).toBe(401);
  });

  it("bloqueia token expirado", async () => {
    const expirado = await issuer.sign({
      exp: Math.floor(Date.now() / 1000) - 60
    });
    const response = await call("/api/me", { auth: expirado });
    expect(response.status).toBe(401);
  });

  it("aceita token válido e cria o perfil no primeiro acesso", async () => {
    const response = await call("/api/me", { auth: true });
    const body = (await response.json()) as {
      profile: { uid: string; email: string; nome: string };
    };

    expect(response.status).toBe(200);
    expect(body.profile.uid).toBe("user-1");
    expect(body.profile.email).toBe("atleta@intelligym.app");
    expect(body.profile.nome).toBe("Atleta de Teste");
  });
});

describe("perfil", () => {
  it("salva e relê os dados do perfil", async () => {
    await put("/api/me", {
      idade: 31,
      altura: 178,
      peso: 86.5,
      objetivo: "reabilitação",
      diasTreino: ["segunda", "quarta", "sexta"],
      limitacoes: ["menisco lateral direito"],
      onboardingDone: true
    });

    const body = (await (await call("/api/me", { auth: true })).json()) as {
      profile: Record<string, unknown>;
    };

    expect(body.profile).toMatchObject({
      idade: 31,
      altura: 178,
      peso: 86.5,
      objetivo: "reabilitação",
      onboardingDone: true
    });
    expect(body.profile.diasTreino).toEqual(["segunda", "quarta", "sexta"]);
    expect(body.profile.limitacoes).toEqual(["menisco lateral direito"]);
  });

  it("atualização parcial não apaga o que já estava salvo", async () => {
    await put("/api/me", { idade: 31, objetivo: "reabilitação" });
    await put("/api/me", { peso: 84 });

    const body = (await (await call("/api/me", { auth: true })).json()) as {
      profile: { idade: number; objetivo: string; peso: number };
    };

    expect(body.profile).toMatchObject({
      idade: 31,
      objetivo: "reabilitação",
      peso: 84
    });
  });
});

describe("equipamentos", () => {
  it("substitui a lista inteira e remove duplicados", async () => {
    const response = await put("/api/equipment", {
      equipment: ["Halteres", "Mini band", "Halteres", "  ", "Bike"]
    });
    const body = (await response.json()) as { equipment: string[] };

    expect(body.equipment).toEqual(["Halteres", "Mini band", "Bike"]);
  });

  it("lista o que foi salvo", async () => {
    await put("/api/equipment", { equipment: ["Colchonete"] });
    const body = (await (
      await call("/api/equipment", { auth: true })
    ).json()) as {
      equipment: string[];
    };

    expect(body.equipment).toEqual(["Colchonete"]);
  });
});

describe("planos", () => {
  it("salva, lista e remove um plano", async () => {
    const created = (await (
      await post("/api/plans", {
        title: "Inferiores",
        focus: "força",
        duration: 45
      })
    ).json()) as { plan: { id: string } };

    const listed = (await (
      await call("/api/plans", { auth: true })
    ).json()) as {
      plans: Array<{ id: string; title: string }>;
    };
    expect(listed.plans).toHaveLength(1);
    expect(listed.plans[0].title).toBe("Inferiores");

    const removed = await call(`/api/plans/${created.plan.id}`, {
      method: "DELETE",
      auth: true
    });
    expect(removed.status).toBe(200);

    const afterDelete = (await (
      await call("/api/plans", { auth: true })
    ).json()) as {
      plans: unknown[];
    };
    expect(afterDelete.plans).toHaveLength(0);
  });

  it("não remove plano de outra pessoa", async () => {
    const created = (await (
      await post("/api/plans", { title: "Meu plano" })
    ).json()) as {
      plan: { id: string };
    };

    const intruso = await issuer.sign({ sub: "user-2" });
    const response = await call(`/api/plans/${created.plan.id}`, {
      method: "DELETE",
      auth: intruso
    });

    expect(response.status).toBe(404);
  });

  it("não vaza planos entre contas", async () => {
    await post("/api/plans", { title: "Plano do user-1" });

    const outraConta = await issuer.sign({ sub: "user-2" });
    const body = (await (
      await call("/api/plans", { auth: outraConta })
    ).json()) as {
      plans: unknown[];
    };

    expect(body.plans).toHaveLength(0);
  });
});

describe("registros de dor", () => {
  it("salva o registro e limita a nota a 0–10", async () => {
    const response = await post("/api/pain-records", {
      score: 42,
      region: "Joelho direito",
      trigger: "Step-up alto"
    });
    const body = (await response.json()) as {
      record: { score: number; region: string };
    };

    expect(response.status).toBe(201);
    expect(body.record.score).toBe(10);
    expect(body.record.region).toBe("Joelho direito");
  });

  it("lista do mais recente para o mais antigo", async () => {
    await post("/api/pain-records", {
      score: 3,
      region: "Joelho",
      createdAt: "2026-01-01T10:00:00.000Z"
    });
    await post("/api/pain-records", {
      score: 5,
      region: "Lombar",
      createdAt: "2026-02-01T10:00:00.000Z"
    });

    const body = (await (
      await call("/api/pain-records", { auth: true })
    ).json()) as {
      records: Array<{ region: string }>;
    };

    expect(body.records.map((record) => record.region)).toEqual([
      "Lombar",
      "Joelho"
    ]);
  });
});

describe("banco ausente", () => {
  it("explica que o D1 não está configurado em vez de estourar 500", async () => {
    env = {
      DB: undefined as unknown as D1Database,
      ALLOWED_ORIGINS: ORIGIN,
      ENVIRONMENT: "test",
      FIREBASE_PROJECT_ID: issuer.projectId
    };
    const response = await call("/api/me", { auth: true });

    expect(response.status).toBe(503);
    expect((await response.json()) as { error: string }).toMatchObject({
      error: expect.stringContaining("Banco de dados")
    });
  });
});

describe("catálogo de exercícios", () => {
  const catalogo = [
    {
      id: "ex-1",
      language: "pt",
      name: "Agachamento livre",
      description:
        "Desça controlando o movimento, sem deixar o joelho passar do pé.",
      category: "pernas",
      muscles: '["quadríceps","glúteos"]',
      secondary: '["core"]',
      equipment: '["Barra"]',
      image: "https://wger.de/media/agachamento.png",
      blob: "agachamento livre quadriceps gluteos core barra"
    },
    {
      id: "ex-2",
      language: "en",
      name: "Bench Press",
      description:
        "Lower the bar to the chest and press it back up under control.",
      category: "peito",
      muscles: '["peito"]',
      secondary: '["tríceps"]',
      equipment: '["Barra","Banco"]',
      image: null,
      blob: "bench press peito triceps barra banco"
    },
    {
      id: "ex-3",
      language: "pt",
      name: "Ponte de glúteo",
      description:
        "Suba o quadril até alinhar joelho, quadril e ombro, sem arquear a lombar.",
      category: "pernas",
      muscles: '["glúteos"]',
      secondary: "[]",
      equipment: '["Colchonete"]',
      image: "https://wger.de/media/ponte.png",
      blob: "ponte de gluteo gluteos colchonete"
    }
  ];

  beforeEach(async () => {
    for (const e of catalogo) {
      await env.DB.prepare(
        `INSERT INTO exercises (id, language, name, description, category, muscles,
           muscles_secondary, equipment, image_url, license, license_author,
           source_url, search_blob, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      )
        .bind(
          e.id,
          e.language,
          e.name,
          e.description,
          e.category,
          e.muscles,
          e.secondary,
          e.equipment,
          e.image,
          "CC-BY-SA 4",
          "wger.de",
          `https://wger.de/en/exercise/${e.id}/view/`,
          e.blob,
          "2026-09-10T00:00:00.000Z"
        )
        .run();
    }
  });

  it("é público: lista sem exigir login", async () => {
    const response = await call("/api/exercises");
    const body = (await response.json()) as {
      total: number;
      exercises: unknown[];
    };

    expect(response.status).toBe(200);
    expect(body.total).toBe(3);
    expect(body.exercises).toHaveLength(3);
  });

  it("ordena português com imagem primeiro", async () => {
    const body = (await (await call("/api/exercises")).json()) as {
      exercises: Array<{ name: string; language: string }>;
    };

    expect(body.exercises[0].language).toBe("pt");
    expect(body.exercises.at(-1)?.name).toBe("Bench Press");
  });

  it("busca ignorando acento e caixa", async () => {
    const body = (await (
      await call("/api/exercises?search=GLUTEO")
    ).json()) as {
      exercises: Array<{ name: string }>;
    };

    expect(body.exercises.map((e) => e.name)).toContain("Ponte de glúteo");
  });

  it("filtra por músculo sem casar prefixo de outro", async () => {
    const body = (await (
      await call("/api/exercises?muscle=gl%C3%BAteos")
    ).json()) as {
      total: number;
      exercises: Array<{ name: string }>;
    };

    expect(body.total).toBe(2);
    expect(body.exercises.map((e) => e.name).sort()).toEqual([
      "Agachamento livre",
      "Ponte de glúteo"
    ]);
  });

  it("filtra por equipamento", async () => {
    const body = (await (
      await call("/api/exercises?equipment=Colchonete")
    ).json()) as {
      total: number;
    };
    expect(body.total).toBe(1);
  });

  it("filtra só os que têm imagem", async () => {
    const body = (await (
      await call("/api/exercises?withImage=true")
    ).json()) as {
      total: number;
    };
    expect(body.total).toBe(2);
  });

  it("pagina mantendo o total real", async () => {
    const body = (await (
      await call("/api/exercises?limit=1&offset=1")
    ).json()) as {
      total: number;
      exercises: unknown[];
    };

    expect(body.total).toBe(3);
    expect(body.exercises).toHaveLength(1);
  });

  it("devolve um exercício com o crédito da licença", async () => {
    const body = (await (await call("/api/exercises/ex-1")).json()) as {
      exercise: {
        name: string;
        license: string;
        licenseAuthor: string;
        sourceUrl: string;
      };
    };

    expect(body.exercise.name).toBe("Agachamento livre");
    expect(body.exercise.license).toBe("CC-BY-SA 4");
    expect(body.exercise.licenseAuthor).toBe("wger.de");
    expect(body.exercise.sourceUrl).toContain("wger.de");
  });

  it("responde 404 para exercício inexistente", async () => {
    expect((await call("/api/exercises/nao-existe")).status).toBe(404);
  });

  it("monta os filtros a partir do que existe no catálogo", async () => {
    const body = (await (await call("/api/exercises/facets")).json()) as {
      muscles: string[];
      equipment: string[];
      categories: string[];
    };

    expect(body.muscles).toContain("glúteos");
    expect(body.equipment).toEqual(["Banco", "Barra", "Colchonete"]);
    expect(body.categories).toEqual(["peito", "pernas"]);
  });

  it("marca o catálogo como cacheável, ao contrário dos dados do usuário", async () => {
    const catalogo = await call("/api/exercises");
    const usuario = await call("/api/me", { auth: true });

    expect(catalogo.headers.get("Cache-Control")).toContain("max-age=3600");
    expect(usuario.headers.get("Cache-Control")).toBe("no-store");
  });
});
