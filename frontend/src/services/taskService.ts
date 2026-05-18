import { apiFetch } from '../lib/api'
import type { TaskResponse, TaskStatus } from '../types/task'

export interface GetTasksFilters {
  organizationId: number
  text?: string
  projectIds?: number[]
  statuses?: TaskStatus[]
  categoryIds?: number[]
  userIds?: number[]
}

export const taskService = {
  async getTasks(filters: GetTasksFilters): Promise<TaskResponse[]> {
    const params = new URLSearchParams()
    params.set('organizationId', String(filters.organizationId))
    if (filters?.text) params.set('text', filters.text)
    filters?.projectIds?.forEach((id) => params.append('projectId', String(id)))
    filters?.statuses?.forEach((s) => params.append('status', s))
    filters?.categoryIds?.forEach((id) => params.append('categoryId', String(id)))
    filters?.userIds?.forEach((id) => params.append('userId', String(id)))
    const query = params.toString()
    return apiFetch<TaskResponse[]>(`/tasks${query ? `?${query}` : ''}`)
  },

  async createTask(task: {
    title: string
    description?: string
    projectId?: number | null
    categoryId?: number | null
    status?: TaskStatus
  }): Promise<TaskResponse> {
    return apiFetch<TaskResponse>('/tasks', {
      method: 'POST',
      body: task,
    })
  },

  async updateTaskStatus(taskId: number, status: TaskStatus): Promise<void> {
    await apiFetch(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: status,
    })
  },

  async startTask(taskId: number): Promise<void> {
    await apiFetch(`/tasks/${taskId}/start`, {
      method: 'PUT',
    })
  },

  async stopTask(taskId: number): Promise<void> {
    await apiFetch(`/tasks/${taskId}/stop`, {
      method: 'PUT',
    })
  },

  async getTask(id: number): Promise<TaskResponse> {
    return apiFetch<TaskResponse>(`/tasks/${id}`)
  },

  async updateTask(id: number, task: Partial<TaskResponse> & { projectId?: number | null; categoryId?: number | null }): Promise<TaskResponse> {
    return apiFetch<TaskResponse>(`/tasks/${id}`, {
      method: 'PUT',
      body: task,
    })
  },
}
