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
  organizationId: number
  projectId: number | null
  categoryId: number | null
  assigneeUserId: number | null
}

export type TaskHistoryItem = {
  id?: number
  startAt: string
  endAt: string | null
}

export type TaskProject = {
  id: number
  name: string
  color?: string | null
  icon?: string | null
}

export type TaskCategory = {
  id: number
  name: string
  color: string
  icon: string
}

export type TaskAssignee = {
  id: number
  name: string
  email: string
  photo: string | null
}

export type TaskResponse = {
  id: number
  title: string
  description: string
  status: TaskStatus
  project: TaskProject | null
  category: TaskCategory | null
  user: TaskAssignee | null
  finishedAt?: string
  history?: TaskHistoryItem[]
}
