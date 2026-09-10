const STATIC_ORIGINS = new Set([
  "https://intelligym.pages.dev",
  "http://localhost:5173",
  "http://localhost:4173"
]);

/** Previews do Cloudflare Pages ganham um subdomínio por branch. */
function isAllowed(origin: string) {
  return STATIC_ORIGINS.has(origin) || origin.endsWith(".intelligym.pages.dev");
}

export function corsHeaders(origin: string | null): Headers {
  const value =
    origin && isAllowed(origin) ? origin : "https://intelligym.pages.dev";

  return new Headers({
    "Access-Control-Allow-Origin": value,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff"
  });
}

export function json(
  value: unknown,
  init: ResponseInit = {},
  origin: string | null = null
) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: corsHeaders(origin)
  });
}

export function fail(status: number, message: string, origin: string | null) {
  return json({ error: message }, { status }, origin);
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
