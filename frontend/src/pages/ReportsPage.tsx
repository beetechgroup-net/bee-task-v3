import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Plus,
  FileDown,
  Sparkles,
  Download,
  Trash2,
  Tag,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Pencil,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  reportService,
  type ReportTemplateOutput,
  type GeneratedReportOutput,
} from '../services/reportService'
import { projectService } from '../services/projectService'
import { categoryService } from '../services/categoryService'
import type { Project, Category } from '../types/task'
import { CreateTemplateModal } from '../components/reports/CreateTemplateModal'
import { EditTemplateModal } from '../components/reports/EditTemplateModal'
import { GenerateReportModal } from '../components/reports/GenerateReportModal'

export const ReportsPage: React.FC = () => {
  const { activeOrg } = useAuth()
  const orgId = activeOrg?.id

  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'guide'>('templates')
  const [templates, setTemplates] = useState<ReportTemplateOutput[]>([])
  const [history, setHistory] = useState<GeneratedReportOutput[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedTag, setCopiedTag] = useState<string | null>(null)

  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplateOutput | null>(null)
  const [generateInitialTemplateId, setGenerateInitialTemplateId] = useState<number | undefined>(undefined)

  const loadData = useCallback(async () => {
    if (!orgId) return
    try {
      setLoading(true)
      setError(null)
      const [tpls, hist, projs, cats] = await Promise.all([
        reportService.listTemplates(orgId),
        reportService.listHistory(orgId).catch(() => []),
        projectService.listProjects(orgId).catch(() => []),
        categoryService.listCategories(orgId).catch(() => []),
      ])
      setTemplates(tpls)
      setHistory(hist)
      setProjects(projs)
      setCategories(cats)
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao carregar modelos e relatórios')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeleteTemplate = async (templateId: number) => {
    if (!orgId) return
    if (!window.confirm('Tem certeza de que deseja excluir este modelo de relatório?')) return
    try {
      await reportService.deleteTemplate(orgId, templateId)
      setTemplates((prev) => prev.filter((t) => t.id !== templateId))
    } catch (err: unknown) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Erro ao excluir modelo')
    }
  }

  const handleOpenGenerate = (templateId?: number) => {
    setGenerateInitialTemplateId(templateId)
    setIsGenerateOpen(true)
  }

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    setCopiedTag(tag)
    setTimeout(() => setCopiedTag(null), 2000)
  }

  const standardTags = [
    { tag: '{{nome}}', desc: 'Nome do colaborador (pega automaticamente do usuário logado)' },
    { tag: '{{periodo}}', desc: 'Período formatado no padrão escolhido no modelo (ex.: 01/10/2026 até 31/10/2026)' },
    { tag: '{{data_inicio}}', desc: 'Data inicial do período escolhido (ex: 01/10/2026)' },
    { tag: '{{data_fim}}', desc: 'Data final do período escolhido (ex: 31/10/2026)' },
    { tag: '{{periodo_vigencia}}', desc: 'Intervalo formatado no modelo (ex: 01/10/2026 até 31/10/2026)' },
    { tag: '{{mes_ano}}', desc: 'Mês e ano por extenso (ex: Outubro/2026)' },
    { tag: '{{email_usuario}}', desc: 'E-mail do usuário logado' },
    { tag: '{{organizacao}}', desc: 'Nome da organização / workspace ativo' },
    { tag: '{{total_horas}}', desc: 'Total de horas trabalhadas no período (ex: 142h 30m)' },
    { tag: '{{data_emissao}}', desc: 'Data de geração do relatório (ex: 31/10/2026)' },
  ]

  const tableItemTags = [
    { tag: '{{item.titulo}}', desc: 'Título da tarefa (em linhas repetidas de tabelas)' },
    { tag: '{{item.data}}', desc: 'Data da tarefa / conclusão' },
    { tag: '{{item.tempo}}', desc: 'Duração / horas trabalhadas' },
    { tag: '{{item.status}}', desc: 'Status da tarefa (Concluído, Em Andamento)' },
    { tag: '{{item.categoria}}', desc: 'Nome da categoria (ex: Reunião, Feature)' },
    { tag: '{{item.projeto}}', desc: 'Nome do projeto da tarefa' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-xs font-semibold text-brand">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span>Workspace: {activeOrg?.name || 'BeeTask'}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-amber-700 dark:text-amber-300 border border-accent/25 text-[11px] font-bold">
              Templates .DOCX
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Central de Relatórios
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Cadastre seus modelos corporativos em Word e gere relatórios de atividades e reuniões com preenchimento 100% automático.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-soft hover:border-brand/40 bg-surface/80 hover:bg-surface-raised text-foreground text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brand" />
            <span>Novo Modelo .DOCX</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenGenerate()}
            disabled={templates.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-teal-700 hover:from-brand-hover hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-brand/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>Gerar Relatório</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-soft">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`py-3 px-1 border-b-2 font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Modelos de Relatório ({templates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-1 border-b-2 font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Histórico de Emissões ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-1 border-b-2 font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Guia de Tags do Word</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Modelos de Relatório */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-3xl border border-border-soft bg-surface-sunken/40 animate-pulse p-6"
                />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border-soft bg-surface/60 backdrop-blur-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Nenhum modelo de relatório cadastrado
                </h3>
                <p className="text-xs text-muted">
                  Faça o upload do seu primeiro template em formato Word (.docx) com a identidade visual da sua organização.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeiro Modelo</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-5 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md shadow-panel hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-raised border border-border-soft text-muted">
                        {tpl.scope === 'PROJECT' && tpl.projectName
                          ? `Projeto: ${tpl.projectName}`
                          : 'Organização'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-1">{tpl.name}</h3>
                      {tpl.description && (
                        <p className="text-xs text-muted line-clamp-2 mt-1">{tpl.description}</p>
                      )}
                    </div>

                    {/* Informações adicionais se houver */}
                    {(tpl.managerName || tpl.customProjectName || tpl.projectName) && (
                      <div className="p-2.5 rounded-xl bg-surface-raised/60 border border-border-soft text-[11px] space-y-1">
                        {tpl.managerName && (
                          <div className="flex items-center justify-between gap-1 text-muted">
                            <span>Gestor:</span>
                            <span className="font-semibold text-foreground truncate">{tpl.managerName}</span>
                          </div>
                        )}
                        {(tpl.customProjectName || tpl.projectName) && (
                          <div className="flex items-center justify-between gap-1 text-muted">
                            <span>Projeto:</span>
                            <span className="font-semibold text-foreground truncate">{tpl.customProjectName || tpl.projectName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags configuradas */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                        Campos e Seções ({tpl.sections.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {tpl.sections.map((s) => (
                          <span
                            key={s.sectionKey}
                            title={`${s.title} (${s.sectionType}${s.dateFormat ? ` — Formato: ${s.dateFormat}` : ''}${s.defaultValue ? ` — Valor fixo: ${s.defaultValue}` : ''})`}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-surface-raised border border-border-soft text-foreground/80 inline-flex items-center gap-1"
                          >
                            <span>{`{{${s.sectionKey}}}`}</span>
                            {s.sectionType === 'DATE' && (
                              <span className="text-[9px] text-brand font-sans font-bold">[{s.dateFormat || 'data'}]</span>
                            )}
                            {s.defaultValue && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand" title="Valor pré-preenchido" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border-soft/60">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingTemplate(tpl)}
                        className="p-1.5 rounded-xl text-muted hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                        title="Editar Modelo"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-1.5 rounded-xl text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Excluir Modelo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={tpl.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                        title="Baixar Template Original (.docx)"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenGenerate(tpl.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand text-brand hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Gerar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Histórico de Emissões */}
      {activeTab === 'history' && (
        <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md shadow-panel overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted">
              Nenhum relatório foi emitido neste workspace ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-soft bg-surface-raised/60 text-muted font-bold">
                    <th className="py-3 px-4">Relatório / Período</th>
                    <th className="py-3 px-4">Período de Vigência</th>
                    <th className="py-3 px-4">Emitido por</th>
                    <th className="py-3 px-4">Data de Emissão</th>
                    <th className="py-3 px-4 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft/60">
                  {history.map((rep) => (
                    <tr key={rep.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand shrink-0" />
                        <span>{rep.title}</span>
                      </td>
                      <td className="py-3.5 px-4 text-muted font-mono">
                        {rep.startDate} até {rep.endDate}
                      </td>
                      <td className="py-3.5 px-4 text-foreground/90">
                        {rep.userName || 'Você'}
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {new Date(rep.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={rep.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand/10 hover:bg-brand text-brand hover:text-white text-xs font-bold transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar (.DOCX)</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Guia de Tags do Word */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-6 shadow-panel space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Como preparar seu Template no Microsoft Word (.docx)
                </h3>
                <p className="text-xs text-muted">
                  Basta abrir seu arquivo Word habitual e digitar as tags com chaves duplas nos locais onde deseja que as informações apareçam.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {/* Tags Globais de Período e Usuário */}
              <div className="p-4 rounded-2xl border border-border-soft bg-surface-raised/40 space-y-3">
                <span className="text-xs font-bold text-foreground block">
                  Tags Globais de Período e Cabeçalho
                </span>
                <div className="space-y-2">
                  {standardTags.map((t) => (
                    <div
                      key={t.tag}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface border border-border-soft text-xs"
                    >
                      <div className="truncate">
                        <code className="text-brand font-mono font-bold">{t.tag}</code>
                        <p className="text-[11px] text-muted truncate">{t.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyTag(t.tag)}
                        className="p-1.5 rounded-lg text-muted hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer shrink-0"
                        title="Copiar Tag"
                      >
                        {copiedTag === t.tag ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags em Tabelas Dinâmicas */}
              <div className="p-4 rounded-2xl border border-border-soft bg-surface-raised/40 space-y-3">
                <span className="text-xs font-bold text-foreground block">
                  Tags para Tabelas com Repetição de Linhas
                </span>
                <p className="text-[11px] text-muted leading-relaxed">
                  Crie uma tabela no Word com um cabeçalho e 1 linha contendo as tags abaixo. O BeeTask multiplicará as linhas para cada tarefa encontrada no período!
                </p>

                <div className="space-y-2">
                  {tableItemTags.map((t) => (
                    <div
                      key={t.tag}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface border border-border-soft text-xs"
                    >
                      <div className="truncate">
                        <code className="text-accent font-mono font-bold">{t.tag}</code>
                        <p className="text-[11px] text-muted truncate">{t.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyTag(t.tag)}
                        className="p-1.5 rounded-lg text-muted hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer shrink-0"
                        title="Copiar Tag"
                      >
                        {copiedTag === t.tag ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modais */}
      {orgId && (
        <>
          <CreateTemplateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={(newTemplate) => {
              setTemplates((prev) => [newTemplate, ...prev])
            }}
            orgId={orgId}
            projects={projects}
            categories={categories}
          />

          {editingTemplate && (
            <EditTemplateModal
              isOpen={true}
              onClose={() => setEditingTemplate(null)}
              template={editingTemplate}
              onSuccess={(updated) => {
                setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
              }}
              orgId={orgId}
              projects={projects}
              categories={categories}
            />
          )}

          <GenerateReportModal
            isOpen={isGenerateOpen}
            onClose={() => setIsGenerateOpen(false)}
            orgId={orgId}
            templates={templates}
            projects={projects}
            initialTemplateId={generateInitialTemplateId}
          />
        </>
      )}
    </div>
  )
}
