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
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTimer } from '../contexts/TimerContext'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import type { Task, TaskStatus, Project } from '../types/task'
import { TaskKanbanView } from '../components/tasks/TaskKanbanView'
import { TaskListView } from '../components/tasks/TaskListView'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'
import { CustomSelect } from '../components/ui/Select'

export const TasksPage: React.FC = () => {
  const { activeOrg } = useAuth()
  const { activeTask, activeSeconds, startTimer, stopTimer, syncWithTasks } = useTimer()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'ALL'>('ALL')
  const [onlyMyTasks, setOnlyMyTasks] = useState(false)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialStatus, setModalInitialStatus] = useState<TaskStatus>('NOT_STARTED')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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
      })
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
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
      })
      setTasks((prev) => [created, ...prev])
    }
  }

  const handleOpenCreateModal = (initialStatus: TaskStatus = 'NOT_STARTED') => {
    setEditingTask(null)
    setModalInitialStatus(initialStatus)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Summary counts
  const notStartedCount = tasks.filter((t) => t.status === 'NOT_STARTED').length
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length

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

      {/* Quick KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex items-center gap-3.5 shadow-panel hover:-translate-y-0.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-surface-sunken border border-border-soft flex items-center justify-center text-muted">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-medium">Total de Tarefas</p>
            <p className="text-lg font-bold text-foreground">{tasks.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex items-center gap-3.5 shadow-panel hover:-translate-y-0.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-medium">Em Andamento</p>
            <p className="text-lg font-bold text-teal-400">{inProgressCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex items-center gap-3.5 shadow-panel hover:-translate-y-0.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-medium">A Fazer</p>
            <p className="text-lg font-bold text-foreground">{notStartedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex items-center gap-3.5 shadow-panel hover:-translate-y-0.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-medium">Concluídas</p>
            <p className="text-lg font-bold text-emerald-400">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3 shadow-panel">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
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
          onAddTaskToStatus={handleOpenCreateModal}
          activeTaskId={activeTask?.id}
          activeTaskSeconds={activeSeconds}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          onToggleTimer={handleToggleTimer}
          onStatusChange={handleStatusChange}
          onEditTask={handleOpenEditModal}
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
        />
      )}
    </div>
  )
}
