import { apiFetch } from '../lib/api'

export interface OrgProjectStats {
  projectId: number | null
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

export interface PeriodStats {
  year: number
  month: number
  day: number | null
  finishedTasksCount: number
  totalMinutesWorked: number
}

export interface MemberProjectStats {
  projectId: number | null
  projectName: string
  totalMinutes: number
}

export interface MemberDetailData {
  userId: number
  userName: string
  userEmail: string
  userPhoto: string | null
  groupedBy: 'DAY' | 'MONTH'
  periodStats: PeriodStats[]
  projectStats: MemberProjectStats[]
}

export const orgDashboardService = {
  async getDashboard(orgId: number, startDate?: string, endDate?: string): Promise<OrgDashboardData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return apiFetch<OrgDashboardData>(`/organizations/${orgId}/dashboard?${params.toString()}`)
  },

  async getMemberStats(orgId: number, memberId: number, startDate: string, endDate: string): Promise<MemberDetailData> {
    const params = new URLSearchParams({ startDate, endDate })
    return apiFetch<MemberDetailData>(`/organizations/${orgId}/members/${memberId}/stats?${params.toString()}`)
  }
}
