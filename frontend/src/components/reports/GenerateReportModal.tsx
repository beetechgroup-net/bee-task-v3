import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  FileDown,
  Calendar,
  AlertCircle,
  Folder,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Tag,
  PenTool,
  Sparkles,
} from 'lucide-react'
import { CustomSelect } from '../ui/Select'
import { reportService, type ReportTemplateOutput, type ReportSectionOutput } from '../../services/reportService'
import type { Project } from '../../types/task'

interface GenerateReportModalProps {
  isOpen: boolean
  onClose: () => void
  orgId: number
  templates: ReportTemplateOutput[]
  projects: Project[]
  initialTemplateId?: number
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  isOpen,
  onClose,
  orgId,
  templates,
  projects,
  initialTemplateId,
}) => {
  // Inicializar datas com o mês atual (do 1º ao último dia do mês)
  const defaultDates = useMemo(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
    }
  }, [])

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>(
    initialTemplateId || (templates[0]?.id)
  )
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined)
  const [startDate, setStartDate] = useState(defaultDates.start)
  const [endDate, setEndDate] = useState(defaultDates.end)
  const [periodPreset, setPeriodPreset] = useState<'current_month' | 'last_month' | 'custom'>('current_month')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [aiError, setAiError] = useState<Record<string, string | null>>({})

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Atualizar template selecionado se initialTemplateId mudar ou templates carregarem
  useEffect(() => {
    if (initialTemplateId) {
      setSelectedTemplateId(initialTemplateId)
    } else if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id)
    }
  }, [initialTemplateId, templates, selectedTemplateId])

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId)
  }, [templates, selectedTemplateId])

  // Ajustar projeto selecionado e preencher valores padrão das seções
  useEffect(() => {
    if (selectedTemplate) {
      if (selectedTemplate.projectId) {
        setSelectedProjectId(selectedTemplate.projectId)
      }

      // Preencher campos com os valores padrão configurados no modelo
      const initialFields: Record<string, string> = {}
      selectedTemplate.sections?.forEach((sec) => {
        if (sec.defaultValue) {
          initialFields[sec.sectionKey] = sec.defaultValue
        }
      })
      setCustomFields(initialFields)
    }
  }, [selectedTemplate])

  // Seções de texto (livre ou fixo) do template selecionado
  const textSections = useMemo(() => {
    if (!selectedTemplate) return []
    return selectedTemplate.sections.filter(
      (s) => s.sectionType === 'FREE_TEXT' || s.sectionType === 'FIXED_TEXT'
    )
  }, [selectedTemplate])

  // Seções de data do template selecionado
  const dateSections = useMemo(() => {
    if (!selectedTemplate) return []
    return selectedTemplate.sections.filter((s) => s.sectionType === 'DATE')
  }, [selectedTemplate])

  // Lista de seções de tarefas do template selecionado
  const taskListSections = useMemo(() => {
    if (!selectedTemplate) return []
    return selectedTemplate.sections.filter((s) => s.sectionType === 'TASK_LIST')
  }, [selectedTemplate])

  // Lista de seções de assinatura do template selecionado
  const signatureSections = useMemo(() => {
    if (!selectedTemplate) return []
    return selectedTemplate.sections.filter((s) => s.sectionType === 'SIGNATURE')
  }, [selectedTemplate])

  // Seções com Inteligência Artificial (Ollama / Qwen)
  const aiSections = useMemo(() => {
    if (!selectedTemplate) return []
    return selectedTemplate.sections.filter((s) => s.sectionType === 'AI_TEXT')
  }, [selectedTemplate])

  const handleGenerateAi = async (section: ReportSectionOutput) => {
    if (!selectedTemplateId) return
    try {
      setAiLoading((prev) => ({ ...prev, [section.sectionKey]: true }))
      setAiError((prev) => ({ ...prev, [section.sectionKey]: null }))
      const res = await reportService.generateAiSummary(orgId, {
        templateId: selectedTemplateId,
        sectionKey: section.sectionKey,
        startDate,
        endDate,
      })
      if (res.summary) {
        setCustomFields((prev) => ({ ...prev, [section.sectionKey]: res.summary }))
      }
    } catch (err: unknown) {
      console.error(err)
      setAiError((prev) => ({
        ...prev,
        [section.sectionKey]: err instanceof Error ? err.message : 'Falha ao gerar resumo com IA',
      }))
    } finally {
      setAiLoading((prev) => ({ ...prev, [section.sectionKey]: false }))
    }
  }

  // Preset Handlers
  const handlePresetChange = (preset: 'current_month' | 'last_month' | 'custom') => {
    setPeriodPreset(preset)
    const now = new Date()

    if (preset === 'current_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setStartDate(firstDay.toISOString().split('T')[0])
      setEndDate(lastDay.toISOString().split('T')[0])
    } else if (preset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      setStartDate(firstDay.toISOString().split('T')[0])
      setEndDate(lastDay.toISOString().split('T')[0])
    }
  }

  const handleCustomFieldChange = (key: string, value: string) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplateId) {
      setError('Selecione um modelo de relatório')
      return
    }
    if (!startDate || !endDate) {
      setError('Defina o período (data de início e término)')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('A data de início não pode ser posterior à data de término')
      return
    }

    try {
      setGenerating(true)
      setError(null)
      setSuccess(false)

      const { blob, fileName } = await reportService.generateReport(orgId, {
        templateId: selectedTemplateId,
        projectId: selectedProjectId,
        startDate,
        endDate,
        customFields,
      })

      // Download do arquivo gerado
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Falha ao gerar relatório')
    } finally {
      setGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-surface border border-border-soft rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shadow-xs">
              <FileDown className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">
                Gerar Relatório de Atividades (.DOCX)
              </h2>
              <p className="text-xs text-muted">
                Selecione o modelo, o período de vigência e preencha as informações do relatório.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Relatório gerado e baixado com sucesso!</span>
            </div>
          )}

          {/* Seleção do Template */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Modelo de Relatório (.docx) <span className="text-rose-500">*</span>
            </label>
            {templates.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-border-soft text-center text-xs text-muted">
                Nenhum modelo cadastrado ainda. Cadastre um modelo antes de gerar o relatório.
              </div>
            ) : (
              <CustomSelect
                value={selectedTemplateId}
                onChange={(val) => setSelectedTemplateId(Number(val))}
                placeholder="Selecione um modelo..."
                leftIcon={<FileText className="w-3.5 h-3.5 text-brand" />}
                options={templates.map((t) => ({
                  value: t.id,
                  label: t.name,
                  description: t.scope === 'PROJECT' && t.projectName ? `Projeto: ${t.projectName}` : 'Nível Organização',
                }))}
              />
            )}
          </div>

          {/* Seleção de Projeto (se o template não for restrito) */}
          {selectedTemplate?.scope !== 'PROJECT' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Iniciativa / Projeto <span className="text-muted font-normal">(Opcional)</span>
              </label>
              <CustomSelect
                value={selectedProjectId ?? 0}
                onChange={(val) => setSelectedProjectId(Number(val) === 0 ? undefined : Number(val))}
                placeholder="Todos os Projetos (Consolidado)"
                leftIcon={<Folder className="w-3.5 h-3.5 text-brand" />}
                options={[
                  { value: 0, label: 'Todos os Projetos (Consolidado)' },
                  ...projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                    color: p.color || '#0f766e',
                  })),
                ]}
              />
            </div>
          )}

          {/* Período de Vigência com Atalhos Rápidos */}
          <div className="space-y-2.5 p-4 rounded-2xl border border-border-soft bg-surface-raised/40">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                Período de Vigência do Relatório
              </label>

              {/* Botões de Atalho */}
              <div className="inline-flex rounded-xl p-0.5 bg-surface-sunken/60 border border-border-soft text-[11px]">
                <button
                  type="button"
                  onClick={() => handlePresetChange('current_month')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    periodPreset === 'current_month'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Mês Atual
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('last_month')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    periodPreset === 'last_month'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Mês Anterior
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('custom')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    periodPreset === 'custom'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Personalizado
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setPeriodPreset('custom')
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setPeriodPreset('custom')
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                  required
                />
              </div>
            </div>

            <div className="text-[11px] text-muted flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>
                Refletirá nas tags: <code className="text-brand font-semibold">{'{{data_inicio}}'}</code> e{' '}
                <code className="text-brand font-semibold">{'{{data_fim}}'}</code>.
              </span>
            </div>
          </div>

          {/* Campos de Data Customizados do Modelo */}
          {dateSections.length > 0 && (
            <div className="space-y-3 p-4 rounded-2xl border border-border-soft bg-surface-raised/40">
              <div className="border-b border-border-soft pb-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  Datas Configuradas no Modelo
                </h4>
                <p className="text-[11px] text-muted">
                  Campos formatados de acordo com as regras definidas no modelo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dateSections.map((sec) => {
                  const isPeriod =
                    sec.dateFormat?.includes('até') ||
                    sec.dateFormat?.includes(' a ') ||
                    sec.dateFormat?.includes(' - ') ||
                    sec.sectionKey.includes('periodo') ||
                    sec.sectionKey.includes('vigencia')

                  return (
                    <div key={sec.sectionKey} className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                        <span>{sec.title}</span>
                        <code className="text-[10px] text-brand font-mono font-bold">{`{{${sec.sectionKey}}}`}</code>
                      </label>

                      {isPeriod ? (
                        <div className="px-3 py-2 rounded-xl border border-border-soft bg-surface/70 text-xs text-foreground/80 flex items-center justify-between">
                          <span className="truncate">Período de Vigência</span>
                          <span className="text-[10px] font-mono text-brand font-bold bg-brand/10 px-1.5 py-0.5 rounded">
                            {sec.dateFormat || 'DD/MM/AAAA'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="date"
                            value={
                              customFields[sec.sectionKey] ||
                              (sec.sectionKey.includes('inicio')
                                ? startDate
                                : sec.sectionKey.includes('fim')
                                ? endDate
                                : endDate)
                            }
                            onChange={(e) => handleCustomFieldChange(sec.sectionKey, e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand shadow-xs"
                          />
                          <span className="text-[10px] text-muted block mt-0.5">
                            Formato no Word:{' '}
                            <strong className="font-mono text-brand">{sec.dateFormat || 'DD/MM/AAAA'}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Seções de Texto (Livre ou Pré-preenchido) Dinâmicas */}
          {textSections.length > 0 && (
            <div className="space-y-3.5">
              <div className="border-b border-border-soft pb-1">
                <h4 className="text-xs font-bold text-foreground">
                  Informações Descritivas do Relatório
                </h4>
                <p className="text-[11px] text-muted">
                  Campos que serão inseridos no documento Word. Valores fixos foram pré-preenchidos automaticamente pelo modelo.
                </p>
              </div>

              {textSections.map((sec) => (
                <div key={sec.sectionKey} className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {sec.sectionType === 'FIXED_TEXT' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand/10 text-brand">
                          <Lock className="w-2.5 h-2.5" /> Pré-preenchido
                        </span>
                      )}
                      <span>{sec.title}</span>
                    </span>
                    <span className="text-[10px] text-muted font-mono">{`{{${sec.sectionKey}}}`}</span>
                  </label>

                  {sec.sectionType === 'FIXED_TEXT' ? (
                    <input
                      type="text"
                      value={customFields[sec.sectionKey] || ''}
                      onChange={(e) => handleCustomFieldChange(sec.sectionKey, e.target.value)}
                      placeholder={`Valor para "${sec.title}"...`}
                      className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand shadow-xs"
                    />
                  ) : (
                    <textarea
                      rows={3}
                      value={customFields[sec.sectionKey] || ''}
                      onChange={(e) => handleCustomFieldChange(sec.sectionKey, e.target.value)}
                      placeholder={`Escreva aqui o conteúdo para "${sec.title}"...`}
                      className="w-full p-3 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand shadow-xs resize-y"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Seções com Inteligência Artificial (Ollama / Qwen) */}
          {aiSections.length > 0 && (
            <div className="space-y-4">
              <div className="border-b border-border-soft pb-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Campos com Inteligência Artificial
                </h4>
                <p className="text-[11px] text-muted">
                  Gere o resumo de atividades com IA local (Ollama). Você pode revisar e editar o texto livremente antes de gerar o Word.
                </p>
              </div>

              {aiSections.map((sec) => {
                const isLoading = Boolean(aiLoading[sec.sectionKey])
                const hasValue = Boolean(customFields[sec.sectionKey]?.trim())
                const errorMsg = aiError[sec.sectionKey]

                return (
                  <div
                    key={sec.sectionKey}
                    className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{sec.title}</span>
                        <code className="text-[10px] text-purple-700 dark:text-purple-300 font-mono bg-purple-500/10 px-1.5 py-0.5 rounded">
                          {`{{${sec.sectionKey}}}`}
                        </code>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGenerateAi(sec)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Gerando resumo...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{hasValue ? 'Regerar com IA' : 'Gerar com IA'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {errorMsg && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <textarea
                      rows={4}
                      value={customFields[sec.sectionKey] || ''}
                      onChange={(e) => handleCustomFieldChange(sec.sectionKey, e.target.value)}
                      placeholder="Clique em 'Gerar com IA' para produzir o resumo a partir das tarefas do período, ou digite aqui..."
                      className="w-full p-3 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-xs resize-y"
                    />

                    <p className="text-[10px] text-muted">
                      💡 Caso não clique em "Gerar com IA" e deixe este campo vazio, o backend tentará gerá-lo automaticamente ao compor o documento .DOCX.
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Listagens de Tarefas Configuradas no Modelo */}
          {taskListSections.length > 0 && (
            <div className="p-4 rounded-2xl bg-surface-raised/40 border border-border-soft space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Listagens de Tarefas Configuradas
                </span>
                <span className="text-[10px] text-muted font-mono font-semibold">
                  {taskListSections.map((s) => `{{${s.sectionKey}}}`).join(', ')}
                </span>
              </div>

              <p className="text-[11px] text-muted leading-relaxed">
                O BeeTask busca as tarefas trabalhadas ou concluídas no período de acordo com as seções e filtros configurados neste modelo.
              </p>

              <div className="pt-2 border-t border-border-soft/60 space-y-1.5">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Seções de listagem presentes no relatório:
                </span>
                <div className="flex flex-wrap gap-2">
                  {taskListSections.map((sec) => (
                    <span
                      key={sec.sectionKey}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand border border-brand/20"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{sec.title}</span>
                      <code className="text-[10px] text-muted font-mono">{`{{${sec.sectionKey}}}`}</code>
                      {sec.filterCategoryName && (
                        <span className="text-[10px] text-muted">({sec.filterCategoryName})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seções de Assinatura Digital do Modelo */}
          {signatureSections.length > 0 && (
            <div className="p-4 rounded-2xl bg-surface-raised/40 border border-border-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-brand" />
                  Assinatura Digital no Relatório
                </span>
                <span className="text-[10px] text-muted font-mono font-semibold">
                  {signatureSections.map((s) => `{{${s.sectionKey}}}`).join(', ')}
                </span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Este modelo contém campo de assinatura ({signatureSections.map((s) => s.title).join(', ')}). O BeeTask incluirá automaticamente a assinatura padrão cadastrada no seu perfil. Caso não possua assinatura cadastrada, o campo ficará em branco.
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border-soft bg-surface-raised/40">
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || templates.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-teal-700 hover:from-brand-hover hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-brand/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preenchendo e Gerando .DOCX...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Gerar e Baixar (.DOCX)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
