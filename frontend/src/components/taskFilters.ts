import type { TaskStatus } from '../types/task'

export interface TaskFilters {
  searchQuery: string
  statuses: TaskStatus[]
  categoryIds: number[]
  projectIds: number[]
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  searchQuery: '',
  statuses: [],
  categoryIds: [],
  projectIds: [],
}
