import { apiFetch } from '../lib/api'
import type { Project } from '../types/task'

export const projectService = {
  async listProjects(orgId: number): Promise<Project[]> {
    return apiFetch<Project[]>(`/organizations/${orgId}/projects`)
  },

  async createProject(orgId: number, data: { name: string; color?: string; icon?: string }): Promise<Project> {
    return apiFetch<Project>(`/organizations/${orgId}/projects`, {
      method: 'POST',
      body: data,
    })
  },
}
