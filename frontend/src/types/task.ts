export const TASK_STATUS_OPTIONS = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELED',
] as const

export type TaskStatus = (typeof TASK_STATUS_OPTIONS)[number]

export type CreateTaskPayload = {
  title: string
  description: string
  status: TaskStatus
  project: string
}

export type TaskResponse = {
  id: number
  title: string
  description: string
  status: TaskStatus
  project: string
}
