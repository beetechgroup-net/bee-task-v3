import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LayoutGrid,
  List as ListIcon,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Folder,
  UserCheck,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  CircleDot,
  Ban,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTimer } from '../contexts/TimerContext'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import type { Task, TaskStatus, Project } from '../types/task'
import { TaskKanbanView, COLUMNS } from '../components/tasks/TaskKanbanView'
import { TaskListView } from '../components/tasks/TaskListView'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'
import { CustomSelect } from '../components/ui/Select'
import {
  getLocalPreferences,
  syncPreferencesFromBackend,
  savePreferencesToBackend,
} from '../lib/userPreferences'

export const TasksPage: React.FC = () => {
  const { activeOrg, user } = useAuth()
  const { activeTask, activeSeconds, startTimer, stopTimer, syncWithTasks } = useTimer()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  // Kanban column visibility preferences
  const [hiddenColumns, setHiddenColumns] = useState<TaskStatus[]>([])
  const [showAllColumns, setShowAllColumns] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'ALL'>('ALL')
  const [onlyMyTasks, setOnlyMyTasks] = useState(false)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialStatus, setModalInitialStatus] = useState<TaskStatus>('NOT_STARTED')
  const [modalInitialTab, setModalInitialTab] = useState<'details' | 'history'>('details')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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
    (newHidden: TaskStatus[]) => {
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
    (status: TaskStatus) => {
      if (!hiddenColumns.includes(status)) {
        updateHiddenColumns([...hiddenColumns, status])
      }
    },
    [hiddenColumns, updateHiddenColumns]
  )

  const handleUnhideColumn = useCallback(
    (status: TaskStatus) => {
      updateHiddenColumns(hiddenColumns.filter((s) => s !== status))
    },
    [hiddenColumns, updateHiddenColumns]
  )

  const handleUnhideAllColumns = useCallback(() => {
    updateHiddenColumns([])
  }, [updateHiddenColumns])

  const activeOrgId = activeOrg?.id

  // Load tasks & projects for current organization
  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [tasksRes, projsRes] = await Promise.all([
        onlyMyTasks
          ? taskService.listMyTasks({ organizationId: activeOrgId })
          : taskService.listTasks({ organizationId: activeOrgId }),
        projectService.listProjects(activeOrgId).catch(() => []),
      ])

      setTasks(tasksRes || [])
      setProjects(projsRes || [])
      syncWithTasks(tasksRes || [])
    } catch (err) {
      console.error('Failed to load tasks', err)
      setActionError('Falha ao carregar tarefas. Tente atualizar a página.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId, onlyMyTasks, syncWithTasks])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter tasks client-side for ultra-responsive search
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (selectedStatus !== 'ALL' && task.status !== selectedStatus) {
        return false
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
  }, [tasks, selectedStatus, selectedProjectId, searchQuery])

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
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    setActionError(null)
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      )
      const updated = await taskService.updateStatus(task.id, newStatus)
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
    status: TaskStatus
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
        projectId: taskData.projectId,
        categoryId: taskData.categoryId,
        assigneeUserId: taskData.assigneeUserId,
        organizationId: activeOrgId,
        externalUrl: taskData.externalUrl,
      })
      setTasks((prev) => [created, ...prev])
    }
  }

  const handleOpenCreateModal = (initialStatus: TaskStatus = 'NOT_STARTED') => {
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

  // Summary counts
  const notStartedCount = tasks.filter((t) => t.status === 'NOT_STARTED').length
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length
  const canceledCount = tasks.filter((t) => t.status === 'CANCELED').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand via-brand-strong to-accent bg-clip-text text-transparent">
              Quadro de Tarefas
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/25 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              {activeOrg?.name || 'Workspace'}
            </span>
          </div>
          <p className="text-xs text-muted">
            Planeje, execute e rastreie o tempo investido em cada entrega da equipe.
          </p>
        </div>

        {/* View Switcher & New Task Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh */}
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            title="Recarregar tarefas"
            className="p-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-muted hover:text-foreground hover:bg-surface-raised transition-all shadow-panel disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          </button>

          {/* Kanban / List Toggle */}
          <div className="flex items-center p-1 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md shadow-panel">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {/* Kanban Columns Visibility Control */}
          {viewMode === 'kanban' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                title="Gerenciar colunas do Kanban"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-panel ${
                  hiddenColumns.length > 0
                    ? 'border-brand/40 bg-brand/10 text-brand'
                    : 'border-border-soft bg-surface/90 text-muted hover:text-foreground hover:bg-surface-raised'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Colunas</span>
                {hiddenColumns.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand text-white font-bold">
                    {hiddenColumns.length} oculta{hiddenColumns.length > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {showColumnSettings && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowColumnSettings(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-border bg-surface-raised p-3 shadow-2xl space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-bold text-foreground">Visibilidade de Colunas</span>
                      {hiddenColumns.length > 0 && (
                        <button
                          type="button"
                          onClick={handleUnhideAllColumns}
                          className="text-[11px] text-brand hover:underline font-medium"
                        >
                          Restaurar todas
                        </button>
                      )}
                    </div>

                    {/* Toggle show all columns temporarily */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border-soft">
                      <div className="flex items-center gap-2">
                        {showAllColumns ? (
                          <Eye className="w-3.5 h-3.5 text-brand" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-muted" />
                        )}
                        <span className="text-xs font-medium text-foreground">Mostrar ocultas</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={showAllColumns}
                        onChange={(e) => setShowAllColumns(e.target.checked)}
                        className="w-4 h-4 rounded text-brand border-border focus:ring-brand"
                      />
                    </div>

                    {/* Individual columns list */}
                    <div className="space-y-1">
                      {COLUMNS.map((col) => {
                        const isHidden = hiddenColumns.includes(col.status)
                        return (
                          <button
                            key={col.status}
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
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isHidden ? 'bg-zinc-500' : 'bg-brand'
                                }`}
                              />
                              <span>{col.label}</span>
                            </div>

                            {isHidden ? (
                              <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Oculta</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] text-brand font-medium">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Visível</span>
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* New Task Button */}
          <button
            type="button"
            onClick={() => handleOpenCreateModal('NOT_STARTED')}
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

          {/* Status Statistics (Icon + Number) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap py-1">
            {/* Total / All */}
            <button
              type="button"
              onClick={() => setSelectedStatus('ALL')}
              title="Todas as tarefas"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedStatus === 'ALL'
                  ? 'bg-surface-sunken border-border text-foreground shadow-xs'
                  : 'bg-surface-raised/60 border-border-soft text-muted hover:text-foreground hover:bg-surface-raised'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="font-mono text-xs">{tasks.length}</span>
            </button>

            {/* A Fazer (NOT_STARTED) */}
            <button
              type="button"
              onClick={() => setSelectedStatus(selectedStatus === 'NOT_STARTED' ? 'ALL' : 'NOT_STARTED')}
              title="A Fazer"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedStatus === 'NOT_STARTED'
                  ? 'bg-zinc-500/15 border-zinc-500/40 text-foreground ring-1 ring-zinc-500/30'
                  : 'bg-surface-raised/60 border-border-soft text-muted hover:text-foreground hover:bg-surface-raised'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="font-mono text-xs text-foreground">{notStartedCount}</span>
            </button>

            {/* Em Andamento (IN_PROGRESS) */}
            <button
              type="button"
              onClick={() => setSelectedStatus(selectedStatus === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
              title="Em Andamento"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedStatus === 'IN_PROGRESS'
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/30'
                  : 'bg-surface-raised/60 border-border-soft text-teal-700 dark:text-teal-400 hover:bg-surface-raised'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
              <span className="font-mono text-xs">{inProgressCount}</span>
            </button>

            {/* Concluído (COMPLETED) */}
            <button
              type="button"
              onClick={() => setSelectedStatus(selectedStatus === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
              title="Concluído"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedStatus === 'COMPLETED'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-surface-raised/60 border-border-soft text-emerald-700 dark:text-emerald-400 hover:bg-surface-raised'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="font-mono text-xs">{completedCount}</span>
            </button>

            {/* Cancelado (CANCELED) */}
            <button
              type="button"
              onClick={() => setSelectedStatus(selectedStatus === 'CANCELED' ? 'ALL' : 'CANCELED')}
              title="Cancelado"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedStatus === 'CANCELED'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30'
                  : 'bg-surface-raised/60 border-border-soft text-rose-700 dark:text-rose-400 hover:bg-surface-raised'
              }`}
            >
              <Ban className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400 shrink-0" />
              <span className="font-mono text-xs">{canceledCount}</span>
            </button>
          </div>
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          {/* Mine vs All toggle */}
          <button
            type="button"
            onClick={() => setOnlyMyTasks(!onlyMyTasks)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              onlyMyTasks
                ? 'bg-brand/15 text-brand border-brand/40 font-semibold shadow-xs'
                : 'bg-surface-raised/80 border-border-soft text-muted hover:text-foreground'
            }`}
          >
            {onlyMyTasks ? <UserCheck className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span>{onlyMyTasks ? 'Minhas Tarefas' : 'Todas'}</span>
          </button>

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
              onChange={(val) => setSelectedStatus(val as TaskStatus | 'ALL')}
              options={[
                { value: 'ALL', label: 'Todos os Status' },
                { value: 'NOT_STARTED', label: 'A Fazer', color: '#71717a' },
                { value: 'IN_PROGRESS', label: 'Em Andamento', color: '#14b8a6' },
                { value: 'COMPLETED', label: 'Concluído', color: '#10b981' },
                { value: 'CANCELED', label: 'Cancelado', color: '#f43f5e' },
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
            onClick={() => handleOpenCreateModal('NOT_STARTED')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-md shadow-brand/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Tarefa</span>
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        <TaskKanbanView
          tasks={filteredTasks}
          onToggleTimer={handleToggleTimer}
          onStatusChange={handleStatusChange}
          onEditTask={handleOpenEditModal}
          onOpenHistory={handleOpenHistoryModal}
          onAddTaskToStatus={handleOpenCreateModal}
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
          onToggleTimer={handleToggleTimer}
          onStatusChange={handleStatusChange}
          onEditTask={handleOpenEditModal}
          onOpenHistory={handleOpenHistoryModal}
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
          }}
          onSubmit={handleModalSubmit}
          organizationId={activeOrgId}
          initialStatus={modalInitialStatus}
          initialTask={editingTask}
          initialTab={modalInitialTab}
        />
      )}
    </div>
  )
}
