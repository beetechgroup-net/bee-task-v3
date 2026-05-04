import { apiFetch } from '../lib/api'
import type { TaskResponse } from '../types/task'

export interface ProjectStats {
  projectId: number
  projectName: string
  totalMinutes: number
}

export interface DashboardData {
  totalMinutesWorked: number
  projectStats: ProjectStats[]
  yesterdayTasks: TaskResponse[]
  finishedTasksInPeriod: TaskResponse[]
}

export const dashboardService = {
  async getDashboard(startDate?: string, endDate?: string): Promise<DashboardData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return apiFetch<DashboardData>(`/dashboard?${params.toString()}`)
  }
}
