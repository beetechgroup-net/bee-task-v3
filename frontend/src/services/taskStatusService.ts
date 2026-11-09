import { apiFetch } from '../lib/api'
import type { TaskStatus } from '../types/task'

export interface CreateTaskStatusData {
  name: string
  color?: string
  position?: number
  isDefault?: boolean
  isCompleted?: boolean
  isCanceled?: boolean
}

export interface UpdateTaskStatusData {
  name: string
  color?: string
  position?: number
  isDefault?: boolean
  isCompleted?: boolean
  isCanceled?: boolean
}

export const taskStatusService = {
  async listStatuses(orgId: number): Promise<TaskStatus[]> {
    return apiFetch<TaskStatus[]>(`/organizations/${orgId}/task-statuses`)
  },

  async createStatus(orgId: number, data: CreateTaskStatusData): Promise<TaskStatus> {
    return apiFetch<TaskStatus>(`/organizations/${orgId}/task-statuses`, {
      method: 'POST',
      body: data,
    })
  },

  async updateStatus(orgId: number, id: number, data: UpdateTaskStatusData): Promise<TaskStatus> {
    return apiFetch<TaskStatus>(`/organizations/${orgId}/task-statuses/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deleteStatus(orgId: number, id: number, moveToStatusId?: number): Promise<void> {
    const url = moveToStatusId
      ? `/organizations/${orgId}/task-statuses/${id}?moveToStatusId=${moveToStatusId}`
      : `/organizations/${orgId}/task-statuses/${id}`
    return apiFetch<void>(url, {
      method: 'DELETE',
    })
  },

  async reorderStatuses(orgId: number, statusIds: number[]): Promise<TaskStatus[]> {
    return apiFetch<TaskStatus[]>(`/organizations/${orgId}/task-statuses/reorder`, {
      method: 'PUT',
      body: statusIds,
    })
  },
}
