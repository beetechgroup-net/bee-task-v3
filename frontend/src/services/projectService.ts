import { apiFetch } from '../lib/api'

export interface Project {
  id: number
  name: string
}

export const projectService = {
  listByOrganization: async (orgId: number): Promise<Project[]> => {
    return apiFetch<Project[]>(`/organizations/${orgId}/projects`)
  },

  create: async (orgId: number, name: string): Promise<Project> => {
    return apiFetch<Project>(`/organizations/${orgId}/projects`, {
      method: 'POST',
      body: { name },
    })
  },
}
