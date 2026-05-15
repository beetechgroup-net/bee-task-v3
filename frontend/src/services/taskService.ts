import { apiFetch } from '../lib/api'
import type { TaskResponse, TaskStatus } from '../types/task'

export interface GetMyTasksFilters {
  text?: string
  projectId?: number
  statuses?: TaskStatus[]
  categoryIds?: number[]
}

export const taskService = {
  async getTasks(): Promise<TaskResponse[]> {
    return apiFetch<TaskResponse[]>('/tasks')
  },

  async getMyTasks(filters?: GetMyTasksFilters): Promise<TaskResponse[]> {
    const params = new URLSearchParams()
    if (filters?.text) params.set('text', filters.text)
    if (filters?.projectId) params.set('projectId', String(filters.projectId))
    filters?.statuses?.forEach((s) => params.append('status', s))
    filters?.categoryIds?.forEach((id) => params.append('categoryId', String(id)))
    const query = params.toString()
    return apiFetch<TaskResponse[]>(`/tasks/mine${query ? `?${query}` : ''}`)
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
