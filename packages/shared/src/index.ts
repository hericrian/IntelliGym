export type ApiStatus = "ok";

export interface HealthCheckResponse {
  status: ApiStatus;
  service: "intelligym-api";
  version: string;
  firebase_admin_ready?: boolean;
}
