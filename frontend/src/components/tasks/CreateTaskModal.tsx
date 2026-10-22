import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Folder,
  Tag,
  User,
  Loader2,
  Sparkles,
  Clock,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Check,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import type { Task, TaskStatus, Project, Category, TaskHistoryItem, TaskHistoryItemInput } from '../../types/task'
import type { OrganizationMember } from '../../services/organizationService'
import { projectService } from '../../services/projectService'
import { categoryService } from '../../services/categoryService'
import { organizationService } from '../../services/organizationService'
import { CustomSelect } from '../ui/Select'
import { useAuth } from '../../contexts/AuthContext'
import { canDeleteTask } from '../../lib/taskPermissions'
import {
  calculateTaskTotalSeconds,
  formatSecondsToTimer,
  formatSecondsToHuman,
  formatIsoDateOnly,
  formatIsoTimeOnly,
  splitIsoToDateTime,
  combineDateAndTimeToIso,
} from '../../lib/timeUtils'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: {
    title: string
    description: string
    status: TaskStatus
    projectId?: number
    categoryId?: number
    assigneeUserId?: number
    history?: TaskHistoryItemInput[]
    externalUrl?: string
  }) => Promise<void>
  onDelete?: (task: Task) => void
  organizationId: number
  initialStatus?: TaskStatus
  initialTask?: Task | null
  initialTab?: 'details' | 'history'
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  organizationId,
  initialStatus = 'NOT_STARTED',
  initialTask = null,
  initialTab = 'details',
}) => {
  const { user, activeOrg } = useAuth()
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')

  // Task details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>(initialStatus)
  const [projectId, setProjectId] = useState<number | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [assigneeUserId, setAssigneeUserId] = useState<number | undefined>(undefined)
  const [externalUrl, setExternalUrl] = useState('')

  // Local history state (saved together with task)
  const [localHistory, setLocalHistory] = useState<TaskHistoryItem[]>([])

  // Inline history item edit / add states
  const [isHistoryFormOpen, setIsHistoryFormOpen] = useState(false)
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null)
  const [histStartDate, setHistStartDate] = useState('')
  const [histStartTime, setHistStartTime] = useState('')
  const [histEndDate, setHistEndDate] = useState('')
  const [histEndTime, setHistEndTime] = useState('')
  const [histIsOngoing, setHistIsOngoing] = useState(false)
  const [historyFormError, setHistoryFormError] = useState<string | null>(null)

  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<OrganizationMember[]>([])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quick inline creation states
  const [newProjectName, setNewProjectName] = useState('')
  const [showAddProject, setShowAddProject] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  // Populate data when modal opens
  useEffect(() => {
    if (!isOpen) return

    if (initialTask) {
      setTitle(initialTask.title)
      setDescription(initialTask.description || '')
      setStatus(initialTask.status)
      setProjectId(initialTask.project?.id)
      setCategoryId(initialTask.category?.id)
      setAssigneeUserId(initialTask.user?.id)
      setExternalUrl(initialTask.externalUrl || '')
      setLocalHistory(initialTask.history ? [...initialTask.history] : [])
      setActiveTab(initialTab)
    } else {
      setTitle('')
      setDescription('')
      setStatus(initialStatus)
      setProjectId(undefined)
      setCategoryId(undefined)
      setExternalUrl('')
      setLocalHistory([])
      setActiveTab('details')

      const currentMember = members.find(
        (m) => m.userEmail?.toLowerCase() === user?.email?.toLowerCase()
      )
      setAssigneeUserId(currentMember ? currentMember.userId : undefined)
    }

    setError(null)
    setShowAddProject(false)
    setShowAddCategory(false)
    setIsHistoryFormOpen(false)
    setEditingHistoryId(null)
    setHistoryFormError(null)

    // Load projects, categories, members
    const loadMetadata = async () => {
      setLoading(true)
      try {
        const [projRes, catRes, memRes] = await Promise.allSettled([
          projectService.listProjects(organizationId),
          categoryService.listCategories(organizationId),
          organizationService.listMembers(organizationId),
        ])

        if (projRes.status === 'fulfilled') setProjects(projRes.value || [])
        if (catRes.status === 'fulfilled') setCategories(catRes.value || [])
        if (memRes.status === 'fulfilled') {
          const memberList = memRes.value || []
          setMembers(memberList)
          if (!initialTask && user?.email) {
            const currentMember = memberList.find(
              (m) => m.userEmail?.toLowerCase() === user.email.toLowerCase()
            )
            if (currentMember) {
              setAssigneeUserId(currentMember.userId)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching metadata', err)
      } finally {
        setLoading(false)
      }
    }

    loadMetadata()
  }, [isOpen, organizationId, initialStatus, initialTask, initialTab, user?.email])

  // Total seconds calculated dynamically from localHistory
  const totalCalculatedSeconds = useMemo(() => {
    const dummyTask: Task = {
      id: initialTask?.id || 0,
      title: title,
      status: status,
      history: localHistory,
    }
    return calculateTaskTotalSeconds(dummyTask)
  }, [initialTask?.id, title, status, localHistory])

  // Duration preview for history form
  const historyFormPreview = useMemo(() => {
    if (!histStartDate || !histStartTime) return null
    if (histIsOngoing) return 'Em andamento (sem horário de término)'
    if (!histEndDate || !histEndTime) return null

    const startIso = combineDateAndTimeToIso(histStartDate, histStartTime)
    const endIso = combineDateAndTimeToIso(histEndDate, histEndTime)
    const diff = Math.floor((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000)
    if (diff < 0) return 'Horário final anterior ao inicial'
    return formatSecondsToHuman(diff) + ` (${formatSecondsToTimer(diff)})`
  }, [histStartDate, histStartTime, histEndDate, histEndTime, histIsOngoing])

  if (!isOpen) return null

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    try {
      const created = await projectService.createProject(organizationId, {
        name: newProjectName.trim(),
        color: '#0f766e',
      })
      setProjects((prev) => [...prev, created])
      setProjectId(created.id)
      setNewProjectName('')
      setShowAddProject(false)
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao criar projeto.')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    try {
      const created = await categoryService.createCategory(organizationId, {
        name: newCategoryName.trim(),
        color: '#d97706',
      })
      setCategories((prev) => [...prev, created])
      setCategoryId(created.id)
      setNewCategoryName('')
      setShowAddCategory(false)
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao criar categoria.')
    }
  }

  // History item helper methods
  const handleOpenAddHistory = () => {
    const { date, time } = splitIsoToDateTime()
    setHistStartDate(date)
    setHistStartTime(time)
    setHistEndDate(date)
    const [hh, mm] = time.split(':').map(Number)
    const endH = (hh + 1) % 24
    setHistEndTime(`${String(endH).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
    setHistIsOngoing(false)
    setEditingHistoryId(null)
    setHistoryFormError(null)
    setIsHistoryFormOpen(true)
  }

  const handleOpenEditHistory = (item: TaskHistoryItem) => {
    const start = splitIsoToDateTime(item.startAt)
    setHistStartDate(start.date)
    setHistStartTime(start.time)

    if (item.endAt) {
      const end = splitIsoToDateTime(item.endAt)
      setHistEndDate(end.date)
      setHistEndTime(end.time)
      setHistIsOngoing(false)
    } else {
      setHistEndDate(start.date)
      setHistEndTime(start.time)
      setHistIsOngoing(true)
    }

    setEditingHistoryId(item.id)
    setHistoryFormError(null)
    setIsHistoryFormOpen(true)
  }

  const handleSaveHistoryItemLocally = () => {
    if (!histStartDate || !histStartTime) {
      setHistoryFormError('Data e hora de início são obrigatórias.')
      return
    }

    const startIso = combineDateAndTimeToIso(histStartDate, histStartTime)
    let endIso: string | null = null

    if (!histIsOngoing) {
      if (!histEndDate || !histEndTime) {
        setHistoryFormError('Data e hora de término são obrigatórias.')
        return
      }
      endIso = combineDateAndTimeToIso(histEndDate, histEndTime)
      if (new Date(endIso).getTime() < new Date(startIso).getTime()) {
        setHistoryFormError('O horário de término não pode ser anterior ao início.')
        return
      }
    }

    let calculatedSec = 0
    if (endIso) {
      calculatedSec = Math.max(0, Math.floor((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000))
    }

    if (editingHistoryId !== null) {
      // Update existing item in local state
      setLocalHistory((prev) =>
        prev.map((item) =>
          item.id === editingHistoryId
            ? { ...item, startAt: startIso, endAt: endIso, elapsedSeconds: calculatedSec }
            : item
        )
      )
    } else {
      // Add new item to local state (with temporary negative ID to be recognized as new)
      const newItem: TaskHistoryItem = {
        id: -Date.now(),
        startAt: startIso,
        endAt: endIso,
        elapsedSeconds: calculatedSec,
      }
      setLocalHistory((prev) => [newItem, ...prev])
    }

    setIsHistoryFormOpen(false)
    setEditingHistoryId(null)
    setHistoryFormError(null)
  }

  const handleDeleteHistoryLocally = (itemId: number) => {
    setLocalHistory((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Submit all together via single endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('O título da tarefa é obrigatório.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Map local history items for backend
      const mappedHistory: TaskHistoryItemInput[] = localHistory.map((item) => ({
        id: item.id > 0 ? item.id : undefined,
        startAt: item.startAt,
        endAt: item.endAt,
      }))

      let effectiveAssigneeUserId = assigneeUserId
      if (!initialTask && effectiveAssigneeUserId === undefined) {
        const myMember = members.find((m) => m.userEmail?.toLowerCase() === user?.email?.toLowerCase())
        if (myMember) {
          effectiveAssigneeUserId = myMember.userId
        }
      }
      if (effectiveAssigneeUserId === -1) {
        effectiveAssigneeUserId = undefined
      }

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        projectId,
        categoryId,
        assigneeUserId: effectiveAssigneeUserId,
        history: initialTask ? mappedHistory : undefined,
        externalUrl: externalUrl.trim() || undefined,
      })
      onClose()
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface-raised shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <p className="text-xs text-muted">
                {initialTask
                  ? 'Atualize as informações e o histórico de tempo da demanda.'
                  : 'Preencha os campos para cadastrar no quadro de atividades.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs switcher when editing task */}
        {initialTask && (
          <div className="flex border-b border-border bg-surface/50 px-4 pt-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === 'details'
                  ? 'border-brand text-brand bg-surface'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Informações Gerais</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === 'history'
                  ? 'border-brand text-brand bg-surface'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Histórico de Tempo</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand/15 text-brand font-mono font-bold">
                {localHistory.length}
              </span>
            </button>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* TAB 1: General Details */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Título da Tarefa <span className="text-brand">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Implementar autenticação via OAuth2..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Descrição detalhada
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o escopo, critérios de aceite ou observações importantes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all resize-none"
                />
              </div>

              {/* Project & Category row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Project */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-brand" />
                      Projeto
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddProject(!showAddProject)}
                      className="text-[11px] text-brand hover:underline font-medium"
                    >
                      {showAddProject ? 'Cancelar' : '+ Novo'}
                    </button>
                  </div>

                  {showAddProject ? (
                    <div className="flex items-center gap-1.5 mb-1">
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Nome do projeto..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button
                        type="button"
                        onClick={handleCreateProject}
                        className="px-2.5 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-hover"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <CustomSelect
                      value={projectId ?? 0}
                      onChange={(val) => setProjectId(Number(val) === 0 ? undefined : Number(val))}
                      placeholder="Sem projeto"
                      leftIcon={<Folder className="w-3.5 h-3.5 text-brand" />}
                      options={[
                        { value: 0, label: 'Sem projeto' },
                        ...projects.map((p) => ({
                          value: p.id,
                          label: p.name,
                          color: p.color || '#0f766e',
                        })),
                      ]}
                    />
                  )}
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-accent" />
                      Categoria
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      className="text-[11px] text-accent hover:underline font-medium cursor-pointer"
                    >
                      {showAddCategory ? 'Cancelar' : '+ Nova'}
                    </button>
                  </div>

                  {showAddCategory ? (
                    <div className="flex items-center gap-1.5 mb-1">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nome da categoria..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-2.5 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <CustomSelect
                      value={categoryId ?? 0}
                      onChange={(val) => setCategoryId(Number(val) === 0 ? undefined : Number(val))}
                      placeholder="Sem categoria"
                      leftIcon={<Tag className="w-3.5 h-3.5 text-accent" />}
                      options={[
                        { value: 0, label: 'Sem categoria' },
                        ...categories.map((c) => ({
                          value: c.id,
                          label: c.name,
                          color: c.color || '#d97706',
                        })),
                      ]}
                    />
                  )}
                </div>
              </div>

              {/* Assignee & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Assignee */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted" />
                    Responsável
                  </label>
                  <CustomSelect
                    value={
                      assigneeUserId !== undefined
                        ? assigneeUserId
                        : (members.find((m) => m.userEmail?.toLowerCase() === user?.email?.toLowerCase())?.userId ?? -1)
                    }
                    onChange={(val) => setAssigneeUserId(Number(val) === -1 ? -1 : Number(val))}
                    placeholder="Selecione o responsável"
                    leftIcon={<User className="w-3.5 h-3.5 text-muted" />}
                    options={[
                      { value: -1, label: 'Sem responsável (Livre)' },
                      ...members.map((m) => ({
                        value: m.userId,
                        label: `${m.userName}${m.userEmail?.toLowerCase() === user?.email?.toLowerCase() ? ' (Você)' : ''}`,
                        description: m.userEmail,
                      })),
                    ]}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Status da Tarefa
                  </label>
                  <CustomSelect
                    value={status}
                    onChange={(val) => setStatus(val as TaskStatus)}
                    options={[
                      { value: 'NOT_STARTED', label: 'A Fazer', color: '#71717a' },
                      { value: 'IN_PROGRESS', label: 'Em Andamento', color: '#14b8a6' },
                      { value: 'COMPLETED', label: 'Concluído', color: '#10b981' },
                      { value: 'CANCELED', label: 'Cancelado', color: '#f43f5e' },
                    ]}
                  />
                </div>
              </div>

              {/* External Link (GitHub, Jira, etc.) */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-brand" />
                    Link de outra plataforma (GitHub, Jira, etc.)
                  </span>
                  <span className="text-[11px] text-muted font-normal">Opcional</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://github.com/org/repo/issues/123 ou link Jira"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all pr-9"
                  />
                  {externalUrl.trim() && (
                    <a
                      href={externalUrl.startsWith('http') ? externalUrl : `https://${externalUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-brand transition-colors"
                      title="Abrir link externo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: History & Time Sessions */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* KPI Header Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl border border-border-soft bg-surface/80 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand" />
                    Tempo Acumulado
                  </span>
                  <div className="mt-1">
                    <div className="text-base sm:text-lg font-bold font-mono text-foreground">
                      {formatSecondsToTimer(totalCalculatedSeconds)}
                    </div>
                    <div className="text-[10px] text-muted">
                      {formatSecondsToHuman(totalCalculatedSeconds)}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border-soft bg-surface/80 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    Sessões
                  </span>
                  <div className="mt-1">
                    <div className="text-base sm:text-lg font-bold text-foreground">
                      {localHistory.length}
                    </div>
                    <div className="text-[10px] text-muted">
                      {localHistory.length === 1 ? '1 lançamento' : `${localHistory.length} lançamentos`}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 rounded-xl border border-border-soft bg-surface/80 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-muted">Ação</span>
                  <div className="mt-1">
                    {!isHistoryFormOpen ? (
                      <button
                        type="button"
                        onClick={handleOpenAddHistory}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand/15 text-brand border border-brand/30 hover:bg-brand hover:text-white transition-all text-xs font-semibold shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Novo Registro</span>
                      </button>
                    ) : (
                      <span className="text-xs text-brand font-medium">Editando registro...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form to add/edit session in local state */}
              {isHistoryFormOpen && (
                <div className="p-3.5 rounded-xl border border-brand/40 bg-surface shadow-md space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand" />
                      {editingHistoryId !== null ? 'Editar Registro de Horário' : 'Novo Registro de Horário'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsHistoryFormOpen(false)
                        setEditingHistoryId(null)
                        setHistoryFormError(null)
                      }}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      Cancelar
                    </button>
                  </div>

                  {historyFormError && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{historyFormError}</span>
                    </div>
                  )}

                  {/* Start Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Data de Início <span className="text-brand">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={histStartDate}
                        onChange={(e) => setHistStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-raised text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Hora de Início <span className="text-brand">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={histStartTime}
                        onChange={(e) => setHistStartTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-raised text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  </div>

                  {/* Ongoing toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hist-ongoing-toggle"
                      checked={histIsOngoing}
                      onChange={(e) => setHistIsOngoing(e.target.checked)}
                      className="w-4 h-4 rounded text-brand border-border focus:ring-brand"
                    />
                    <label
                      htmlFor="hist-ongoing-toggle"
                      className="text-xs font-medium text-foreground cursor-pointer select-none"
                    >
                      Atividade em andamento (cronômetro em aberto)
                    </label>
                  </div>

                  {/* End Date & Time */}
                  {!histIsOngoing && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          Data de Término <span className="text-brand">*</span>
                        </label>
                        <input
                          type="date"
                          value={histEndDate}
                          onChange={(e) => setHistEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-raised text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          Hora de Término <span className="text-brand">*</span>
                        </label>
                        <input
                          type="time"
                          value={histEndTime}
                          onChange={(e) => setHistEndTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-raised text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </div>
                    </div>
                  )}

                  {historyFormPreview && (
                    <div className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-[11px] text-muted flex items-center justify-between">
                      <span>Duração Estimada:</span>
                      <span className="font-semibold text-brand font-mono">
                        {historyFormPreview}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsHistoryFormOpen(false)
                        setEditingHistoryId(null)
                        setHistoryFormError(null)
                      }}
                      className="px-2.5 py-1 rounded-lg border border-border bg-surface-raised text-xs text-muted hover:text-foreground"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveHistoryItemLocally}
                      className="px-3 py-1 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingHistoryId !== null ? 'Atualizar Linha' : 'Inserir Registro'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* History Items Table */}
              {localHistory.length === 0 ? (
                <div className="py-8 text-center rounded-xl border border-dashed border-border bg-surface/40 p-4">
                  <Clock className="w-7 h-7 text-muted/50 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">
                    Nenhum registro de tempo nesta tarefa
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Clique em "+ Novo Registro" para adicionar horários trabalhados.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border/60 shadow-xs max-h-60 overflow-y-auto">
                  {localHistory.map((item, idx) => {
                    const isRunning = !item.endAt
                    const durationText = item.elapsedSeconds
                      ? formatSecondsToHuman(item.elapsedSeconds)
                      : isRunning
                      ? 'Contando...'
                      : '0m'

                    return (
                      <div
                        key={item.id || idx}
                        className={`p-2.5 sm:px-3 flex items-center justify-between gap-2 transition-colors ${
                          isRunning ? 'bg-teal-500/5' : 'hover:bg-surface-raised/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-surface-raised border border-border flex items-center justify-center text-muted shrink-0">
                            <Calendar className="w-3 h-3" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <span>{formatIsoDateOnly(item.startAt)}</span>
                              {isRunning && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                  AGORA
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted font-mono flex items-center gap-1">
                              <span>{formatIsoTimeOnly(item.startAt)}</span>
                              <span>→</span>
                              <span>{item.endAt ? formatIsoTimeOnly(item.endAt) : 'Em aberto'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border bg-surface-raised text-foreground border-border">
                            <Clock className="w-3 h-3 text-muted" />
                            {durationText}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenEditHistory(item)}
                            title="Editar este registro"
                            className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryLocally(item.id)}
                            title="Remover este registro"
                            className="p-1 rounded-md text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              {initialTask && onDelete && canDeleteTask(initialTask, user, activeOrg) && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${initialTask.title}"?`)) {
                      onDelete(initialTask)
                      onClose()
                    }
                  }}
                  disabled={submitting}
                  className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              )}
              {initialTask && (
                <span className="text-[11px] text-muted">
                  Tempo total: <strong className="text-foreground font-mono">{formatSecondsToHuman(totalCalculatedSeconds)}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-raised transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || loading}
                className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {initialTask ? 'Salvar Alterações' : 'Criar Tarefa'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
