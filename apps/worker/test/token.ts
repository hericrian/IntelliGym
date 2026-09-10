/**
 * Emissor de ID tokens para os testes.
 *
 * Gera um par de chaves RSA de verdade, assina o token com RS256 e devolve o
 * JWKS correspondente. Assim a verificação do Worker roda inteira — assinatura
 * e claims — em vez de ser contornada por um mock.
 */

const PROJECT_ID = "intelligym-test";

function toBase64Url(input: string | Uint8Array) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export type TestIssuer = {
  projectId: string;
  jwks: { keys: unknown[] };
  sign(claims?: Record<string, unknown>): Promise<string>;
};

export async function createIssuer(
  projectId = PROJECT_ID
): Promise<TestIssuer> {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );

  const kid = "test-key";
  const jwk = await crypto.subtle.exportKey("jwk", publicKey);

  return {
    projectId,
    jwks: { keys: [{ ...jwk, kid, alg: "RS256", use: "sig" }] },
    async sign(claims: Record<string, unknown> = {}) {
      const now = Math.floor(Date.now() / 1000);
      const header = toBase64Url(
        JSON.stringify({ alg: "RS256", kid, typ: "JWT" })
      );
      const payload = toBase64Url(
        JSON.stringify({
          aud: projectId,
          iss: `https://securetoken.google.com/${projectId}`,
          sub: "user-1",
          iat: now,
          exp: now + 3600,
          email: "atleta@intelligym.app",
          name: "Atleta de Teste",
          ...claims
        })
      );

      const signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        privateKey,
        new TextEncoder().encode(`${header}.${payload}`)
      );

      return `${header}.${payload}.${toBase64Url(new Uint8Array(signature))}`;
    }
  };
}

/** Substitui o fetch global para servir o JWKS do emissor de teste. */
export function stubJwks(issuer: TestIssuer) {
  const original = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("securetoken@system.gserviceaccount.com")) {
      return new Response(JSON.stringify(issuer.jwks), {
        headers: { "Cache-Control": "public, max-age=3600" }
      });
    }
    throw new Error(`fetch inesperado nos testes: ${url}`);
  }) as typeof fetch;

  return () => {
    globalThis.fetch = original;
  };
}
