import { apiFetch } from '../lib/api'
import type { TaskResponse, TaskStatus } from '../types/task'

export const taskService = {
  async getTasks(): Promise<TaskResponse[]> {
    return apiFetch<TaskResponse[]>('/tasks')
  },

  async createTask(task: { title: string; description?: string; project?: string }): Promise<TaskResponse> {
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
}
