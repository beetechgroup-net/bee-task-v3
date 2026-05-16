import { apiFetch } from "../lib/api";

export interface PublicStats {
  totalUsers: number;
  totalOrganizations: number;
  totalCompletedTasks: number;
  totalTrackedHours: number;
}

export const publicStatsService = {
  getStats: async (): Promise<PublicStats> => {
    const response = await apiFetch("/public/stats", {
      method: "GET",
    }) as Response;
    return response.json();
  },
};
