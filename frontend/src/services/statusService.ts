import { apiFetch } from "../lib/api";

type HealthData = Record<string, string | number | boolean | null>;

type HealthCheck = {
  name: string;
  status: string;
  data?: HealthData;
};

export type BackendHealthResponse = {
  status: string;
  checks?: HealthCheck[];
};

export async function getBackendStatus() {
  return apiFetch<BackendHealthResponse>("/q/status", {
    method: "GET",
    skipAuth: true,
  });
}
