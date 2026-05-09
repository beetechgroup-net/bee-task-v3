import { apiFetch } from '../lib/api'

export interface OrgProjectStats {
  projectId: number
  projectName: string
  totalMinutes: number
}

export interface OrgTopTask {
  taskId: number
  title: string
  projectName: string
  totalMinutes: number
}

export interface OrgMemberStats {
  userId: number
  userName: string
  userPhoto: string | null
  finishedTasksCount: number
  totalMinutesWorked: number
}

export interface OrgDashboardData {
  projectStats: OrgProjectStats[]
  topTasks: OrgTopTask[]
  memberStats: OrgMemberStats[]
}

export interface MonthlyStats {
  year: number
  month: number
  finishedTasksCount: number
  totalMinutesWorked: number
}

export interface MemberDetailData {
  userId: number
  userName: string
  userEmail: string
  userPhoto: string | null
  monthlyStats: MonthlyStats[]
}

export const orgDashboardService = {
  async getDashboard(orgId: number, startDate?: string, endDate?: string): Promise<OrgDashboardData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return apiFetch<OrgDashboardData>(`/organizations/${orgId}/dashboard?${params.toString()}`)
  },

  async getMemberStats(orgId: number, memberId: number): Promise<MemberDetailData> {
    return apiFetch<MemberDetailData>(`/organizations/${orgId}/members/${memberId}/stats`)
  }
}
