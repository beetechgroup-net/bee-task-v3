import { apiFetch } from '../lib/api'

export interface Project {
  id: number
  name: string
  color?: string | null
  icon?: string | null
}

export const projectService = {
  listByOrganization: async (orgId: number): Promise<Project[]> => {
    return apiFetch<Project[]>(`/organizations/${orgId}/projects`)
  },

  create: async (orgId: number, payload: { name: string; color: string; icon: string }): Promise<Project> => {
    return apiFetch<Project>(`/organizations/${orgId}/projects`, {
      method: 'POST',
      body: payload,
    })
  },
}
