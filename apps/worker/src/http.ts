const DEFAULT_ORIGIN = "https://intelligym.pages.dev";

/**
 * A lista de origens vem de ALLOWED_ORIGINS (wrangler.jsonc), para trocar de
 * domínio sem mexer no código. Previews do Cloudflare Pages ganham um
 * subdomínio por branch, então o sufixo também é aceito.
 */
function isAllowed(origin: string, allowList: string) {
  const allowed = new Set(allowList.split(",").map((value) => value.trim()));
  return allowed.has(origin) || origin.endsWith(".intelligym.pages.dev");
}

export function corsHeaders(origin: string | null, allowList = ""): Headers {
  const value =
    origin && isAllowed(origin, allowList) ? origin : DEFAULT_ORIGIN;

  return new Headers({
    "Access-Control-Allow-Origin": value,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    // Resposta de API não pode ser guardada por proxy nem navegador: o
    // conteúdo é por usuário e muda a cada escrita.
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff"
  });
}

export type Responder = {
  json(value: unknown, init?: ResponseInit): Response;
  /** Resposta pública e cacheável na borda (catálogo, não dado de usuário). */
  cached(value: unknown, seconds: number): Response;
  fail(status: number, message: string): Response;
  preflight(): Response;
};

/**
 * Prende origem e lista de permissões uma vez por request, para as rotas não
 * precisarem repassar CORS em toda chamada.
 */
export function createResponder(
  origin: string | null,
  allowList: string
): Responder {
  const headers = () => corsHeaders(origin, allowList);

  return {
    json(value, init = {}) {
      return new Response(JSON.stringify(value), {
        ...init,
        headers: headers()
      });
    },
    cached(value, seconds) {
      const withCache = headers();
      withCache.set(
        "Cache-Control",
        `public, max-age=${seconds}, s-maxage=${seconds}`
      );
      return new Response(JSON.stringify(value), { headers: withCache });
    },
    fail(status, message) {
      return this.json({ error: message }, { status });
    },
    preflight() {
      return new Response(null, { status: 204, headers: headers() });
    }
  };
}

/** Corpo JSON com limite de tamanho, para não aceitar payload arbitrário. */
export async function readJson<T>(
  request: Request,
  maxBytes = 64 * 1024
): Promise<T> {
  const text = await request.text();

  if (text.length > maxBytes) {
    throw new HttpError(413, "Conteúdo grande demais.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "Envie um JSON válido.");
  }
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}
