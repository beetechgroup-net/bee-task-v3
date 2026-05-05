export const TASK_STATUS_OPTIONS = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELED',
] as const

export type TaskStatus = (typeof TASK_STATUS_OPTIONS)[number]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: 'Nao iniciada',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluida',
  CANCELED: 'Cancelada',
}

export type CreateTaskPayload = {
  title: string
  description: string
  status: TaskStatus
  projectId: number | null
}

export type TaskHistoryItem = {
  id?: number
  startAt: string
  endAt: string | null
}

export type TaskResponse = {
  id: number
  title: string
  description: string
  status: TaskStatus
  projectName: string
  projectId?: number
  finishedAt?: string
  history?: TaskHistoryItem[]
}
