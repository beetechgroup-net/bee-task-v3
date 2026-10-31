import { apiFetch } from '../lib/api'

export interface ReportSectionOutput {
  id: number
  sectionKey: string
  title: string
  sectionType: 'FREE_TEXT' | 'FIXED_TEXT' | 'TASK_LIST'
  defaultValue?: string
  filterCategoryId?: number
  filterCategoryName?: string
  filterStatus?: 'ALL' | 'COMPLETED' | 'IN_PROGRESS'
  includeTime: boolean
  orderIndex: number
  createdAt: string
}

export interface ReportTemplateOutput {
  id: number
  organizationId: number
  organizationName?: string
  projectId?: number
  projectName?: string
  name: string
  description?: string
  scope: 'ORGANIZATION' | 'PROJECT'
  fileUrl: string
  fileName: string
  storageKey: string
  createdById?: number
  createdByName?: string
  managerName?: string
  customProjectName?: string
  dateFormatPattern?: string
  sections: ReportSectionOutput[]
  createdAt: string
  updatedAt: string
}

export interface GeneratedReportOutput {
  id: number
  reportTemplateId?: number
  organizationId: number
  projectId?: number
  projectName?: string
  userId?: number
  userName?: string
  title: string
  startDate: string
  endDate: string
  fileUrl: string
  fileName: string
  storageKey: string
  createdAt: string
}

export interface GenerateReportPayload {
  templateId: number
  projectId?: number
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  customFields?: Record<string, string>
}

export const reportService = {
  async listTemplates(orgId: number, projectId?: number): Promise<ReportTemplateOutput[]> {
    const query = projectId ? `?projectId=${projectId}` : ''
    return apiFetch<ReportTemplateOutput[]>(`/organizations/${orgId}/reports/templates${query}`)
  },

  async createTemplate(orgId: number, formData: FormData): Promise<ReportTemplateOutput> {
    const token = localStorage.getItem('token')
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api-task.beetech.dev'

    const res = await fetch(`${apiUrl}/organizations/${orgId}/reports/templates`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao criar modelo de relatório' }))
      throw new Error(err.message || 'Erro ao criar modelo de relatório')
    }

    return res.json()
  },

  async deleteTemplate(orgId: number, templateId: number): Promise<void> {
    return apiFetch<void>(`/organizations/${orgId}/reports/templates/${templateId}`, {
      method: 'DELETE',
    })
  },

  async generateReport(orgId: number, payload: GenerateReportPayload): Promise<{ blob: Blob; fileName: string }> {
    const token = localStorage.getItem('token')
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api-task.beetech.dev'

    const res = await fetch(`${apiUrl}/organizations/${orgId}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao gerar relatório' }))
      throw new Error(err.message || 'Erro ao gerar relatório')
    }

    // Obter nome do arquivo do header Content-Disposition ou gerar fallback
    const disposition = res.headers.get('content-disposition')
    let fileName = `Relatorio_${payload.startDate}_a_${payload.endDate}.docx`
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '')
      }
    }

    const blob = await res.blob()
    return { blob, fileName }
  },

  async listHistory(orgId: number): Promise<GeneratedReportOutput[]> {
    return apiFetch<GeneratedReportOutput[]>(`/organizations/${orgId}/reports/history`)
  },
}
