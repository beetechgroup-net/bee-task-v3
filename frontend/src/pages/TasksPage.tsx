import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LayoutGrid,
  List as ListIcon,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Folder,
  Users,
  Sparkles,
  AlertCircle,
  CircleDot,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Trash2,
  Check,
  X,
  Loader2,
  User as UserIcon,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTimer } from '../contexts/TimerContext'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import { taskStatusService } from '../services/taskStatusService'
import type { Task, TaskStatus, Project, ParsedAiTask } from '../types/task'
import { TaskKanbanView, DEFAULT_COLUMNS } from '../components/tasks/TaskKanbanView'
import { TaskListView } from '../components/tasks/TaskListView'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'
import { CreateWithAiModal } from '../components/tasks/CreateWithAiModal'
import { CustomSelect } from '../components/ui/Select'
import {
  getLocalPreferences,
  syncPreferencesFromBackend,
  savePreferencesToBackend,
} from '../lib/userPreferences'

const COLOR_PRESETS = [
  '#71717a',
  '#0f766e',
  '#10b981',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f59e0b',
  '#64748b',
]

export const TasksPage: React.FC = () => {
  const { activeOrg, user } = useAuth()
  const { activeTask, activeSeconds, startTimer, stopTimer, syncWithTasks } = useTimer()

  const syncWithTasksRef = useRef(syncWithTasks)
  useEffect(() => {
    syncWithTasksRef.current = syncWithTasks
  }, [syncWithTasks])

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  // Kanban column visibility preferences
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])
  const [showAllColumns, setShowAllColumns] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | 'ALL'>('ALL')
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'ALL'>('ALL')

  // Scope Toggle State: 'mine' (Individual) vs 'team' (Equipe)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialScope =
    (searchParams.get('scope') as 'mine' | 'team') ||
    (localStorage.getItem('beetask_tasks_scope') as 'mine' | 'team') ||
    'mine'
  const [viewScope, setViewScope] = useState<'mine' | 'team'>(initialScope)

  const handleScopeChange = (newScope: 'mine' | 'team') => {
    setViewScope(newScope)
    try {
      localStorage.setItem('beetask_tasks_scope', newScope)
    } catch (_) {}
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('scope', newScope)
        return next
      },
      { replace: true }
    )
  }

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialStatus, setModalInitialStatus] = useState<string>('A Fazer')
  const [modalInitialTab, setModalInitialTab] = useState<'details' | 'history'>('details')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiDraftTask, setAiDraftTask] = useState<ParsedAiTask | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Status Quick Create / Edit Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<TaskStatus | null>(null)
  const [statusName, setStatusName] = useState('')
  const [statusColor, setStatusColor] = useState(COLOR_PRESETS[0])
  const [statusIsDefault, setStatusIsDefault] = useState(false)
  const [statusIsCompleted, setStatusIsCompleted] = useState(false)
  const [statusIsCanceled, setStatusIsCanceled] = useState(false)
  const [statusSubmitting, setStatusSubmitting] = useState(false)

  // Status Delete Modal State
  const [deletingStatus, setDeletingStatus] = useState<TaskStatus | null>(null)
  const [moveToStatusId, setMoveToStatusId] = useState<number | undefined>(undefined)
  const [deletingStatusLoading, setDeletingStatusLoading] = useState(false)

  // Load user preferences for hidden columns from backend
  useEffect(() => {
    if (!user?.email) return
    const local = getLocalPreferences(user.email)
    if (local.kanban?.hiddenColumns) {
      setHiddenColumns(local.kanban.hiddenColumns)
    }

    syncPreferencesFromBackend(user.email)
      .then((prefs) => {
        if (prefs.kanban?.hiddenColumns) {
          setHiddenColumns(prefs.kanban.hiddenColumns)
        }
      })
      .catch((err) => console.warn('Could not load kanban preferences', err))
  }, [user?.email])

  // Save hidden columns to backend
  const updateHiddenColumns = useCallback(
    (newHidden: string[]) => {
      setHiddenColumns(newHidden)
      if (!user?.email) return
      const current = getLocalPreferences(user.email)
      const updated = {
        ...current,
        kanban: {
          ...current.kanban,
          hiddenColumns: newHidden,
        },
      }
      savePreferencesToBackend(user.email, updated).catch((err) =>
        console.error('Failed to save hidden columns to backend', err)
      )
    },
    [user?.email]
  )

  const handleHideColumn = useCallback(
    (status: string) => {
      if (!hiddenColumns.includes(status)) {
        updateHiddenColumns([...hiddenColumns, status])
      }
    },
    [hiddenColumns, updateHiddenColumns]
  )

  const handleUnhideColumn = useCallback(
    (status: string) => {
      updateHiddenColumns(hiddenColumns.filter((s) => s !== status))
    },
    [hiddenColumns, updateHiddenColumns]
  )

  const handleUnhideAllColumns = useCallback(() => {
    updateHiddenColumns([])
  }, [updateHiddenColumns])

  const activeOrgId = activeOrg?.id

  // Load tasks, projects & statuses for current organization
  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [tasksRes, projsRes, statusesRes] = await Promise.all([
        taskService.listTasks({ organizationId: activeOrgId }),
        projectService.listProjects(activeOrgId).catch(() => []),
        taskStatusService.listStatuses(activeOrgId).catch(() => []),
      ])

      setTasks(tasksRes || [])
      setProjects(projsRes || [])
      setTaskStatuses(statusesRes || [])
      syncWithTasksRef.current(tasksRes || [])
    } catch (err) {
      console.error('Failed to load tasks', err)
      setActionError('Falha ao carregar tarefas. Tente atualizar a página.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // User's own tasks
  const myTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!user?.email) return false
      return Boolean(
        t.user?.email &&
          t.user.email.toLowerCase() === user.email.toLowerCase()
      )
    })
  }, [tasks, user])

  // Scope tasks based on viewScope
  const scopeTasks = viewScope === 'mine' ? myTasks : tasks

  // Effective columns for preferences & board
  const effectiveColumns = useMemo(() => {
    if (taskStatuses && taskStatuses.length > 0) {
      return [...taskStatuses]
        .sort((a, b) => a.position - b.position)
        .map((s) => ({
          id: s.id,
          status: s.name,
          label: s.name,
          color: s.color || '#71717a',
          rawStatus: s,
        }))
    }
    return DEFAULT_COLUMNS
  }, [taskStatuses])

  // Filter tasks client-side for ultra-responsive search
  const filteredTasks = useMemo(() => {
    return scopeTasks.filter((task) => {
      // Status filter
      if (selectedStatus !== 'ALL') {
        const tStatus = task.taskStatus?.name || task.status
        const matchesStatus =
          tStatus === selectedStatus ||
          task.status === selectedStatus ||
          (selectedStatus === 'A Fazer' && (task.status === 'NOT_STARTED' || task.taskStatus?.isDefault)) ||
          (selectedStatus === 'Em Andamento' && task.status === 'IN_PROGRESS') ||
          (selectedStatus === 'Concluído' && (task.status === 'COMPLETED' || task.taskStatus?.isCompleted)) ||
          (selectedStatus === 'Cancelado' && (task.status === 'CANCELED' || task.taskStatus?.isCanceled))
        if (!matchesStatus) {
          return false
        }
      }
      // Project filter
      if (selectedProjectId !== 'ALL' && task.project?.id !== selectedProjectId) {
        return false
      }
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDesc = task.description?.toLowerCase().includes(query)
        const matchesProject = task.project?.name.toLowerCase().includes(query)
        const matchesCategory = task.category?.name.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDesc && !matchesProject && !matchesCategory) {
          return false
        }
      }
      return true
    })
  }, [scopeTasks, selectedStatus, selectedProjectId, searchQuery])

  // Timer play/pause handler
  const handleToggleTimer = async (task: Task) => {
    setActionError(null)
    const isCurrentlyRunning = activeTask?.id === task.id
    try {
      if (isCurrentlyRunning) {
        const stopped = await stopTimer(task)
        if (stopped) {
          setTasks((prev) => prev.map((t) => (t.id === stopped.id ? stopped : t)))
        }
      } else {
        const started = await startTimer(task)
        setTasks((prev) => prev.map((t) => (t.id === started.id ? started : t)))
      }
    } catch (err: unknown) {
      console.error('Timer action failed', err)
      setActionError(
        err instanceof Error ? err.message : 'Falha ao acionar cronômetro da tarefa.'
      )
    }
  }

  // Status change handler
  const handleStatusChange = async (task: Task, newStatus: string, newStatusId?: number) => {
    setActionError(null)
    const matchedStatus = taskStatuses.find((s) => s.id === newStatusId || s.name === newStatus)

    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: newStatus,
                taskStatus: matchedStatus || t.taskStatus,
              }
            : t
        )
      )
      const updated = await taskService.updateStatus(task.id, newStatus, newStatusId)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err: unknown) {
      console.error('Failed to update status', err)
      setActionError('Falha ao atualizar status da tarefa.')
      loadData() // Revert to server state
    }
  }

  // Create or Update task modal submit
  const handleModalSubmit = async (taskData: {
    title: string
    description: string
    status: string
    statusId?: number
    projectId?: number
    categoryId?: number
    assigneeUserId?: number
    history?: import('../types/task').TaskHistoryItemInput[]
    externalUrl?: string
  }) => {
    if (!activeOrgId) return
    setActionError(null)

    if (editingTask) {
      const updated = await taskService.updateTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        statusId: taskData.statusId,
        projectId: taskData.projectId,
        categoryId: taskData.categoryId,
        assigneeUserId: taskData.assigneeUserId,
        organizationId: activeOrgId,
        history: taskData.history,
        externalUrl: taskData.externalUrl,
      })
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      syncWithTasks([updated])
      setEditingTask(null)
    } else {
      const created = await taskService.createTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        statusId: taskData.statusId,
        projectId: taskData.projectId,
        categoryId: taskData.categoryId,
        assigneeUserId: taskData.assigneeUserId,
        organizationId: activeOrgId,
        externalUrl: taskData.externalUrl,
      })
      setTasks((prev) => [created, ...prev])
    }
  }

  const handleOpenCreateModal = (initialStatus: string = 'A Fazer') => {
    setEditingTask(null)
    setModalInitialStatus(initialStatus)
    setModalInitialTab('details')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = useCallback((task: Task) => {
    setEditingTask(task)
    setModalInitialTab('details')
    setIsModalOpen(true)
  }, [])

  const handleOpenHistoryModal = useCallback((task: Task) => {
    setEditingTask(task)
    setModalInitialTab('history')
    setIsModalOpen(true)
  }, [])

  const handleDeleteTask = useCallback(
    async (task: Task) => {
      setActionError(null)
      try {
        if (activeTask?.id === task.id) {
          await stopTimer(task)
        }
        await taskService.deleteTask(task.id)
        setTasks((prev) => prev.filter((t) => t.id !== task.id))
        if (editingTask?.id === task.id) {
          setEditingTask(null)
          setIsModalOpen(false)
        }
      } catch (err: unknown) {
        console.error('Failed to delete task', err)
        setActionError(
          err instanceof Error ? err.message : 'Falha ao excluir a tarefa.'
        )
      }
    },
    [activeTask, stopTimer, editingTask]
  )

  // Status modal handlers
  const handleOpenStatusModal = (st: TaskStatus | null) => {
    if (st) {
      setEditingStatus(st)
      setStatusName(st.name)
      setStatusColor(st.color || COLOR_PRESETS[0])
      setStatusIsDefault(Boolean(st.isDefault))
      setStatusIsCompleted(Boolean(st.isCompleted))
      setStatusIsCanceled(Boolean(st.isCanceled))
    } else {
      setEditingStatus(null)
      setStatusName('')
      setStatusColor(COLOR_PRESETS[0])
      setStatusIsDefault(false)
      setStatusIsCompleted(false)
      setStatusIsCanceled(false)
    }
    setIsStatusModalOpen(true)
  }

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrgId || !statusName.trim()) return

    setStatusSubmitting(true)
    try {
      if (editingStatus) {
        await taskStatusService.updateStatus(activeOrgId, editingStatus.id, {
          name: statusName.trim(),
          color: statusColor,
          isDefault: statusIsDefault,
          isCompleted: statusIsCompleted,
          isCanceled: statusIsCanceled,
        })
      } else {
        await taskStatusService.createStatus(activeOrgId, {
          name: statusName.trim(),
          color: statusColor,
          isDefault: statusIsDefault,
          isCompleted: statusIsCompleted,
          isCanceled: statusIsCanceled,
        })
      }
      setIsStatusModalOpen(false)
      const updatedStatuses = await taskStatusService.listStatuses(activeOrgId)
      setTaskStatuses(updatedStatuses || [])
    } catch (err: unknown) {
      console.error(err)
      setActionError(err instanceof Error ? err.message : 'Falha ao salvar status.')
    } finally {
      setStatusSubmitting(false)
    }
  }

  const handleOpenDeleteStatusModal = (st: TaskStatus) => {
    const others = taskStatuses.filter((s) => s.id !== st.id)
    setMoveToStatusId(others.length > 0 ? others[0].id : undefined)
    setDeletingStatus(st)
  }

  const handleConfirmDeleteStatus = async () => {
    if (!activeOrgId || !deletingStatus) return
    setDeletingStatusLoading(true)
    try {
      await taskStatusService.deleteStatus(activeOrgId, deletingStatus.id, moveToStatusId)
      setDeletingStatus(null)
      loadData()
    } catch (err: unknown) {
      console.error(err)
      setActionError(err instanceof Error ? err.message : 'Falha ao excluir status.')
    } finally {
      setDeletingStatusLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand via-brand-strong to-accent bg-clip-text text-transparent">
              Quadro de Tarefas
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
              {activeOrg?.name || 'Workspace'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Monitore seu fluxo ágil, lance tempos de dedicação e entregue valor contínuo.
          </p>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh button */}
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-border-soft bg-surface hover:bg-surface-raised text-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Atualizar tarefas"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* View toggle (Kanban vs List) */}
          <div className="inline-flex p-1 rounded-xl bg-surface-sunken border border-border-soft">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
              title="Visualização em Quadro (Kanban)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
              title="Visualização em Lista"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Kanban Columns Settings (Only in Kanban Mode) */}
          {viewMode === 'kanban' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  hiddenColumns.length > 0
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30'
                    : 'border-border-soft bg-surface text-muted hover:text-foreground hover:bg-surface-raised'
                }`}
                title="Personalizar visualização das colunas"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Colunas</span>
                {hiddenColumns.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                    {hiddenColumns.length}
                  </span>
                )}
              </button>

              {/* Column Settings Dropdown */}
              {showColumnSettings && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowColumnSettings(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-border bg-surface-raised p-3 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-border-soft pb-2">
                      <div className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
                        <h4 className="text-xs font-bold text-foreground">Colunas do Quadro</h4>
                      </div>
                      <span className="text-[10px] text-muted font-medium">
                        {effectiveColumns.length - hiddenColumns.length} de {effectiveColumns.length} ativas
                      </span>
                    </div>

                    {/* Master toggle */}
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-muted text-[11px]">Exibir todas as colunas:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (showAllColumns) {
                            setShowAllColumns(false)
                          } else {
                            handleUnhideAllColumns()
                            setShowAllColumns(false)
                          }
                        }}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        {hiddenColumns.length === 0 ? 'Todas visíveis' : 'Reexibir todas'}
                      </button>
                    </div>

                    {/* Individual columns list */}
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {effectiveColumns.map((col) => {
                        const isHidden = hiddenColumns.includes(col.status)
                        return (
                          <button
                            key={col.id ? `col-${col.id}` : col.status}
                            type="button"
                            onClick={() => {
                              if (isHidden) {
                                handleUnhideColumn(col.status)
                              } else {
                                handleHideColumn(col.status)
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors text-left ${
                              isHidden
                                ? 'bg-surface/50 text-muted hover:bg-surface'
                                : 'bg-surface hover:bg-surface-sunken text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: col.color || '#71717a' }}
                              />
                              <span className="truncate">{col.label}</span>
                            </div>

                            {isHidden ? (
                              <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium shrink-0">
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Oculta</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] text-brand font-medium shrink-0">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Visível</span>
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <div className="pt-2 border-t border-border-soft flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setShowColumnSettings(false)
                          handleOpenStatusModal(null)
                        }}
                        className="text-xs text-brand hover:underline font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Novo Status</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Create with AI Button */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-300 font-semibold text-xs hover:bg-purple-600/25 hover:text-purple-200 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            title="Criar tarefa em linguagem natural com inteligência artificial"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Criar com IA</span>
          </button>

          {/* New Task Button */}
          <button
            type="button"
            onClick={() => {
              setAiDraftTask(null)
              const defaultCol = taskStatuses.find((s) => s.isDefault)?.name || 'A Fazer'
              handleOpenCreateModal(defaultCol)
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs hover:bg-brand-hover shadow-md shadow-brand/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {actionError && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs shadow-panel backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Scope Selector: Individual (Minhas Tarefas) vs Equipe (Workspace) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-3xl bg-surface/90 border border-border-soft backdrop-blur-md shadow-panel">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted uppercase tracking-wider hidden sm:inline">
            Modo de Visualização:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-surface-sunken border border-border-soft shadow-inner">
            <button
              type="button"
              onClick={() => handleScopeChange('mine')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'mine'
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Minhas Tarefas</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  viewScope === 'mine' ? 'bg-white/20 text-white' : 'bg-surface text-muted'
                }`}
              >
                {myTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleScopeChange('team')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'team'
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Equipe (Workspace Completo)</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  viewScope === 'team' ? 'bg-white/20 text-white' : 'bg-surface text-muted'
                }`}
              >
                {tasks.length}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] truncate">
            {viewScope === 'mine'
              ? 'Exibindo tarefas atribuídas diretamente a você'
              : 'Exibindo tarefas de todos os integrantes do workspace'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar with embedded status stats */}
      <div className="p-3 sm:p-4 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-panel">
        {/* Left side: Search Input & Quick Status Counts */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, projeto, categoria..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-soft bg-surface-raised/80 text-xs text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Status Statistics (Dynamic Pills) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap py-1">
            {/* Total / All */}
            <button
              type="button"
              onClick={() => setSelectedStatus('ALL')}
              title="Todas as tarefas do escopo ativo"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedStatus === 'ALL'
                  ? 'bg-surface-sunken border-border text-foreground shadow-xs'
                  : 'bg-surface-raised/60 border-border-soft text-muted hover:text-foreground hover:bg-surface-raised'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="font-mono text-xs">{scopeTasks.length}</span>
            </button>

            {/* Dynamic Status Pills */}
            {effectiveColumns.map((col) => {
              const count = scopeTasks.filter((t) => {
                if (col.id && t.taskStatus?.id) return t.taskStatus.id === col.id
                const tStatus = t.status || ''
                if (tStatus === col.status || tStatus === col.label) return true
                if ((col.status === 'A Fazer' || col.status === 'NOT_STARTED') && (tStatus === 'NOT_STARTED' || tStatus === 'A Fazer' || t.taskStatus?.isDefault)) return true
                if ((col.status === 'Em Andamento' || col.status === 'IN_PROGRESS') && (tStatus === 'IN_PROGRESS' || tStatus === 'Em Andamento')) return true
                if ((col.status === 'Concluído' || col.status === 'COMPLETED') && (tStatus === 'COMPLETED' || tStatus === 'Concluído' || t.taskStatus?.isCompleted)) return true
                if ((col.status === 'Cancelado' || col.status === 'CANCELED') && (tStatus === 'CANCELED' || tStatus === 'Cancelado' || t.taskStatus?.isCanceled)) return true
                return false
              }).length

              const isSelected = selectedStatus === col.status

              return (
                <button
                  key={col.id ? `pill-${col.id}` : `pill-${col.status}`}
                  type="button"
                  onClick={() => setSelectedStatus(isSelected ? 'ALL' : col.status)}
                  title={col.label}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${col.color}25`,
                          borderColor: col.color,
                          color: col.color,
                        }
                      : undefined
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'shadow-xs ring-1'
                      : 'bg-surface-raised/60 border-border-soft text-muted hover:text-foreground hover:bg-surface-raised'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color || '#71717a' }}
                  />
                  <span>{col.label}</span>
                  <span className="font-mono text-xs">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          {/* Project Filter */}
          {projects.length > 0 && (
            <div className="w-48">
              <CustomSelect
                value={selectedProjectId}
                onChange={(val) => setSelectedProjectId(val)}
                leftIcon={<Folder className="w-3.5 h-3.5 text-brand" />}
                options={[
                  { value: 'ALL', label: 'Todos os Projetos' },
                  ...projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                    color: p.color || '#0f766e',
                  })),
                ]}
              />
            </div>
          )}

          {/* Status Filter */}
          <div className="w-44">
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as string | 'ALL')}
              options={[
                { value: 'ALL', label: 'Todos os Status' },
                ...effectiveColumns.map((c) => ({
                  value: c.status,
                  label: c.label,
                  color: c.color,
                })),
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl border border-border bg-surface-sunken/40 animate-pulse p-4 space-y-3"
            >
              <div className="h-4 bg-surface-raised rounded-md w-1/3" />
              <div className="h-28 bg-surface-raised rounded-xl" />
              <div className="h-28 bg-surface-raised rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border bg-surface/50">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            Nenhuma tarefa encontrada
          </h3>
          <p className="text-xs text-muted max-w-sm mb-5 leading-relaxed">
            {searchQuery || selectedStatus !== 'ALL' || selectedProjectId !== 'ALL'
              ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar os filtros para ver mais.'
              : 'Você ainda não possui tarefas criadas nesta organização. Comece agora mesmo organizando sua primeira entrega!'}
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreateModal('A Fazer')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-md shadow-brand/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Tarefa</span>
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        <TaskKanbanView
          tasks={filteredTasks}
          taskStatuses={taskStatuses}
          onToggleTimer={handleToggleTimer}
          onStatusChange={handleStatusChange}
          onEditTask={handleOpenEditModal}
          onOpenHistory={handleOpenHistoryModal}
          onDeleteTask={handleDeleteTask}
          onAddTaskToStatus={handleOpenCreateModal}
          onOpenCreateStatus={() => handleOpenStatusModal(null)}
          onEditStatus={(st) => handleOpenStatusModal(st)}
          onDeleteStatus={(st) => handleOpenDeleteStatusModal(st)}
          activeTaskId={activeTask?.id}
          activeTaskSeconds={activeSeconds}
          hiddenColumns={hiddenColumns}
          showAllColumns={showAllColumns}
          onHideColumn={handleHideColumn}
          onUnhideColumn={handleUnhideColumn}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          taskStatuses={taskStatuses}
          onToggleTimer={handleToggleTimer}
          onStatusChange={handleStatusChange}
          onEditTask={handleOpenEditModal}
          onOpenHistory={handleOpenHistoryModal}
          onDeleteTask={handleDeleteTask}
          activeTaskId={activeTask?.id}
          activeTaskSeconds={activeSeconds}
        />
      )}

      {/* Task Creation & Edit Modal */}
      {activeOrgId && (
        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
            setAiDraftTask(null)
          }}
          onSubmit={handleModalSubmit}
          onDelete={handleDeleteTask}
          organizationId={activeOrgId}
          initialStatus={modalInitialStatus}
          initialTask={editingTask}
          initialTab={modalInitialTab}
          initialDraft={aiDraftTask}
          taskStatuses={taskStatuses}
        />
      )}

      {/* Create with AI Modal */}
      {activeOrgId && (
        <CreateWithAiModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          organizationId={activeOrgId}
          onSuccess={(parsed) => {
            setAiDraftTask(parsed)
            setEditingTask(null)
            setModalInitialStatus(parsed.status || 'A Fazer')
            setIsModalOpen(true)
          }}
        />
      )}

      {/* Status Modal (Create / Edit from Kanban) */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-soft pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-brand" />
                <span>{editingStatus ? 'Editar Status' : 'Novo Status do Quadro'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="w-7 h-7 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Nome do Status</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Em Teste, Homologação, Bloqueado"
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-raised text-foreground text-xs focus:outline-hidden focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Cor da Coluna</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStatusColor(preset)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        statusColor === preset ? 'border-foreground scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset }}
                    >
                      {statusColor === preset && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Behavior Flags */}
              <div className="space-y-2 pt-2 border-t border-border-soft">
                <label className="block text-xs font-semibold text-foreground mb-1">Comportamento</label>

                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={statusIsDefault}
                    onChange={(e) => setStatusIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded-md border-border text-brand focus:ring-brand"
                  />
                  <span>Status inicial padrão para novas tarefas</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={statusIsCompleted}
                    onChange={(e) => {
                      setStatusIsCompleted(e.target.checked)
                      if (e.target.checked) setStatusIsCanceled(false)
                    }}
                    className="w-4 h-4 rounded-md border-border text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Indica que a tarefa foi concluída</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={statusIsCanceled}
                    onChange={(e) => {
                      setStatusIsCanceled(e.target.checked)
                      if (e.target.checked) setStatusIsCompleted(false)
                    }}
                    className="w-4 h-4 rounded-md border-border text-rose-500 focus:ring-rose-500"
                  />
                  <span>Indica que a tarefa foi cancelada</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-border-soft text-xs text-muted hover:text-foreground hover:bg-surface-raised"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting || !statusName.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-brand text-accent-foreground font-semibold text-xs shadow-md shadow-accent/20 hover:opacity-95 disabled:opacity-50"
                >
                  {statusSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingStatus ? 'Salvar Alterações' : 'Criar Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Excluir Status com Reatribuição */}
      {deletingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Excluir Status "{deletingStatus.name}"?</h3>
                <p className="text-xs text-muted">Esta ação remove o status e a coluna correspondente no Kanban.</p>
              </div>
            </div>

            {(() => {
              const otherStatuses = taskStatuses.filter((s) => s.id !== deletingStatus.id)
              return (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
                    Se houver tarefas vinculadas a este status, selecione para qual coluna elas serão movidas:
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Mover tarefas para:</label>
                    <select
                      value={moveToStatusId}
                      onChange={(e) => setMoveToStatusId(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface-raised text-foreground text-xs"
                    >
                      {otherStatuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })()}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setDeletingStatus(null)}
                className="px-3.5 py-2 rounded-xl border border-border-soft text-xs text-muted hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingStatusLoading}
                onClick={handleConfirmDeleteStatus}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50"
              >
                {deletingStatusLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Excluir Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
