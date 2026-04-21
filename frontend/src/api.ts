import type { Task, TaskStatus } from './types'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const fallbackMessage = 'Something went wrong while talking to the API.'
    let message = fallbackMessage

    try {
      const error = (await response.json()) as { message?: string }
      message = error.message ?? fallbackMessage
    } catch {
      message = fallbackMessage
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}

export function listTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks')
}

export function createTask(input: { name: string; description?: string }): Promise<Task> {
  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  return request<Task>(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
