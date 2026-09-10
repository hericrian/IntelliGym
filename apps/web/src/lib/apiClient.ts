import { firebaseAuth } from "../config/firebase";

const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

/** A API só entra em cena se houver endereço configurado e sessão do Firebase. */
export function isRemoteEnabled() {
  return baseUrl.length > 0 && firebaseAuth !== null;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Erro de rede/servidor indisponível — vale tentar de novo depois. */
export function isTransient(error: unknown) {
  return (
    !(error instanceof ApiError) || error.status >= 500 || error.status === 429
  );
}

async function authHeader(): Promise<HeadersInit> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new ApiError(401, "Faça login para sincronizar seus dados.");

  return { Authorization: `Bearer ${await user.getIdToken()}` };
}

export async function apiRequest<T>(
  path: string,
  // O body é serializado aqui, então aceita objeto — daí o Omit sobre RequestInit.
  init: Omit<RequestInit, "body"> & { body?: unknown } = {}
): Promise<T> {
  const { body, ...rest } = init;

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      ...(await authHeader()),
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...rest.headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (!response.ok) {
    const detail = await response
      .json()
      .then((payload: { error?: string }) => payload.error)
      .catch(() => undefined);

    throw new ApiError(
      response.status,
      detail ?? "Não foi possível falar com o servidor."
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Health check público — não exige sessão. */
export async function fetchHealth() {
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) throw new ApiError(response.status, "API indisponível.");
  return (await response.json()) as {
    status: string;
    service: string;
    version: string;
    database?: string;
    auth?: string;
  };
}
