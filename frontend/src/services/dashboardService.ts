import { apiFetch } from '../lib/api'
import type { TaskResponse } from '../types/task'
import type { BarDataPoint } from '../components/DashboardCharts'

export interface ProjectStats {
  projectId: number
  projectName: string
  totalMinutes: number
}

export interface CategoryStats {
  categoryId: number
  categoryName: string
  color: string
  icon: string
  totalMinutes: number
}

export interface DashboardData {
  totalMinutesWorked: number
  projectStats: ProjectStats[]
  categoryStats: CategoryStats[]
  yesterdayTasks: TaskResponse[]
  finishedTasksInPeriod: TaskResponse[]
  periodStats: BarDataPoint[]
  groupedBy: 'DAY' | 'MONTH'
}

export const dashboardService = {
  async getDashboard(startDate?: string, endDate?: string): Promise<DashboardData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    return apiFetch<DashboardData>(`/dashboard?${params.toString()}`)
  }
}
