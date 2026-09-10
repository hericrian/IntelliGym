import { firebaseAuth } from "../config/firebase";

const productionApiUrl = "https://intelligym-api-fastapi.onrender.com";
const apiBaseUrl =
  window.location.hostname === "intelligym.pages.dev"
    ? productionApiUrl
    : (import.meta.env.VITE_API_URL ?? "http://localhost:8000");

async function buildHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  const token = await firebaseAuth?.currentUser?.getIdToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...(await buildHeaders()),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(
      payload?.detail ?? "Nao foi possivel concluir a solicitacao."
    );
  }

  return (await response.json()) as T;
}
