import { HttpError } from "./http";

/**
 * Verificação do ID token do Firebase dentro do Worker.
 *
 * Não dá para usar o Admin SDK aqui (não há Node), então a validação é feita
 * na mão com WebCrypto: assinatura RS256 contra as chaves públicas do Google
 * e conferência das claims. As chaves ficam em cache pelo tempo que o próprio
 * Google manda no Cache-Control.
 */

const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

export type AuthenticatedUser = {
  uid: string;
  email: string | null;
  name: string | null;
};

type JwtHeader = { alg: string; kid: string };
type JwtPayload = {
  aud: string;
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  auth_time?: number;
  email?: string;
  name?: string;
};

let keyCache: { keys: Map<string, CryptoKey>; expiresAt: number } | null = null;

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(
    padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "=")
  );
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function decodeSegment<T>(segment: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment))) as T;
}

async function loadKeys(): Promise<Map<string, CryptoKey>> {
  if (keyCache && keyCache.expiresAt > Date.now()) {
    return keyCache.keys;
  }

  const response = await fetch(JWKS_URL);
  if (!response.ok) {
    throw new HttpError(503, "Não foi possível validar a sessão agora.");
  }

  // O tipo JsonWebKey da lib padrão não declara `kid`, que é o que liga a
  // chave ao cabeçalho do token.
  const { keys: jwks } = (await response.json()) as {
    keys: Array<JsonWebKey & { kid?: string }>;
  };
  const keys = new Map<string, CryptoKey>();

  for (const jwk of jwks) {
    if (!jwk.kid) continue;
    keys.set(
      jwk.kid,
      await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      )
    );
  }

  // O Google devolve max-age nas chaves; respeitá-lo evita buscar a cada request.
  const maxAge = Number(
    /max-age=(\d+)/.exec(response.headers.get("Cache-Control") ?? "")?.[1] ??
      3600
  );
  keyCache = { keys, expiresAt: Date.now() + maxAge * 1000 };

  return keys;
}

/** Valida o token e devolve o usuário, ou lança HttpError 401. */
export async function verifyIdToken(
  token: string,
  projectId: string
): Promise<AuthenticatedUser> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new HttpError(401, "Sessão inválida.");
  }

  const [headerPart, payloadPart, signaturePart] = parts;

  let header: JwtHeader;
  let payload: JwtPayload;
  try {
    header = decodeSegment<JwtHeader>(headerPart);
    payload = decodeSegment<JwtPayload>(payloadPart);
  } catch {
    throw new HttpError(401, "Sessão inválida.");
  }

  if (header.alg !== "RS256") {
    throw new HttpError(401, "Sessão inválida.");
  }

  const keys = await loadKeys();
  const key = keys.get(header.kid);
  if (!key) {
    throw new HttpError(401, "Sessão expirada. Entre novamente.");
  }

  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlToBytes(signaturePart),
    new TextEncoder().encode(`${headerPart}.${payloadPart}`)
  );

  if (!verified) {
    throw new HttpError(401, "Sessão inválida.");
  }

  const now = Math.floor(Date.now() / 1000);
  const validClaims =
    payload.aud === projectId &&
    payload.iss === `https://securetoken.google.com/${projectId}` &&
    typeof payload.sub === "string" &&
    payload.sub.length > 0 &&
    payload.exp > now &&
    payload.iat <= now + 60;

  if (!validClaims) {
    throw new HttpError(401, "Sessão expirada. Entre novamente.");
  }

  return {
    uid: payload.sub,
    email: payload.email ?? null,
    name: payload.name ?? null
  };
}

/** Extrai e valida o Bearer token do cabeçalho Authorization. */
export async function requireUser(
  request: Request,
  projectId?: string
): Promise<AuthenticatedUser> {
  if (!projectId) {
    throw new HttpError(
      503,
      "A API ainda não está ligada ao Firebase. Defina FIREBASE_PROJECT_ID no Worker."
    );
  }

  const header = request.headers.get("Authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Faça login para sincronizar seus dados.");
  }

  return verifyIdToken(token, projectId);
}
