import { apiFetch } from '../lib/api'
import type { Task, TaskStatus, CreateTaskPayload, ListTasksFilter } from '../types/task'

function buildQueryParams(filter?: ListTasksFilter): string {
  if (!filter) return ''
  const params = new URLSearchParams()

  if (filter.organizationId !== undefined) {
    params.set('organizationId', String(filter.organizationId))
  }
  if (filter.text && filter.text.trim()) {
    params.set('text', filter.text.trim())
  }
  if (filter.status && filter.status.length > 0) {
    filter.status.forEach((st) => params.append('status', st))
  }
  if (filter.projectId && filter.projectId.length > 0) {
    filter.projectId.forEach((pid) => params.append('projectId', String(pid)))
  }
  if (filter.categoryId && filter.categoryId.length > 0) {
    filter.categoryId.forEach((cid) => params.append('categoryId', String(cid)))
  }
  if (filter.userId && filter.userId.length > 0) {
    filter.userId.forEach((uid) => params.append('userId', String(uid)))
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const taskService = {
  async listTasks(filter?: ListTasksFilter): Promise<Task[]> {
    const qs = buildQueryParams(filter)
    return apiFetch<Task[]>(`/tasks${qs}`)
  },

  async listMyTasks(filter?: ListTasksFilter): Promise<Task[]> {
    const qs = buildQueryParams(filter)
    return apiFetch<Task[]>(`/tasks/mine${qs}`)
  },

  async getTask(id: number): Promise<Task> {
    return apiFetch<Task>(`/tasks/${id}`)
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    return apiFetch<Task>('/tasks', {
      method: 'POST',
      body: payload,
    })
  },

  async updateTask(id: number, payload: Partial<CreateTaskPayload>): Promise<Task> {
    return apiFetch<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: payload,
    })
  },

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    return apiFetch<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: status,
    })
  },

  async startTask(id: number): Promise<Task> {
    return apiFetch<Task>(`/tasks/${id}/start`, {
      method: 'PUT',
    })
  },

  async stopTask(id: number): Promise<Task> {
    return apiFetch<Task>(`/tasks/${id}/stop`, {
      method: 'PUT',
    })
  },
}
