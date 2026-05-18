import { apiFetch } from "../lib/api";

export interface PublicStats {
  totalUsers: number;
  totalOrganizations: number;
  totalCompletedTasks: number;
  totalTrackedHours: number;
}

export const publicStatsService = {
  getStats: async (): Promise<PublicStats> => {
    return apiFetch<PublicStats>("/public/stats", {
      method: "GET",
    });
  },
};
