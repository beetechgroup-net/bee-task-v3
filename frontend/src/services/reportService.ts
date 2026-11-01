import { apiFetch, getAuthToken, buildUrl } from '../lib/api'

export interface ReportSectionOutput {
  id: number
  sectionKey: string
  title: string
  sectionType: 'FREE_TEXT' | 'FIXED_TEXT' | 'DATE' | 'TASK_LIST' | 'SIGNATURE' | 'AI_TEXT'
  defaultValue?: string
  dateFormat?: string
  aiPrompt?: string
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

export interface GenerateAiSummaryPayload {
  templateId?: number
  sectionKey?: string
  startDate?: string
  endDate?: string
  customPrompt?: string
}

export const reportService = {
  async listTemplates(orgId: number, projectId?: number): Promise<ReportTemplateOutput[]> {
    const query = projectId ? `?projectId=${projectId}` : ''
    return apiFetch<ReportTemplateOutput[]>(`/organizations/${orgId}/reports/templates${query}`)
  },

  async createTemplate(orgId: number, formData: FormData): Promise<ReportTemplateOutput> {
    return apiFetch<ReportTemplateOutput>(`/organizations/${orgId}/reports/templates`, {
      method: 'POST',
      body: formData,
    })
  },

  async updateTemplate(orgId: number, templateId: number, formData: FormData): Promise<ReportTemplateOutput> {
    return apiFetch<ReportTemplateOutput>(`/organizations/${orgId}/reports/templates/${templateId}`, {
      method: 'PUT',
      body: formData,
    })
  },

  async deleteTemplate(orgId: number, templateId: number): Promise<void> {
    return apiFetch<void>(`/organizations/${orgId}/reports/templates/${templateId}`, {
      method: 'DELETE',
    })
  },

  async generateReport(orgId: number, payload: GenerateReportPayload): Promise<{ blob: Blob; fileName: string }> {
    const token = getAuthToken()

    const res = await fetch(buildUrl(`/organizations/${orgId}/reports/generate`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      let message = text || 'Erro ao gerar relatório'
      try {
        const err = JSON.parse(text)
        if (err.message) message = err.message
        if (err.error) message = err.error
      } catch {
        // Ignora erro de parsing
      }
      throw new Error(message)
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

  async generateAiSummary(orgId: number, payload: GenerateAiSummaryPayload): Promise<{ summary: string }> {
    return apiFetch<{ summary: string }>(`/organizations/${orgId}/reports/ai-summary`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
