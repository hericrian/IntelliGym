import type { HealthCheckResponse } from "@intelligym/shared";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${apiBaseUrl}/health`);

  if (!response.ok) {
    throw new Error("Nao foi possivel consultar a API.");
  }

  return (await response.json()) as HealthCheckResponse;
}
