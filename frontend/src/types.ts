export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: string
  name: string
  description: string | null
  status: TaskStatus
  createdAt: string
}
