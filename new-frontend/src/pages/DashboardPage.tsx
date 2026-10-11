import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  FolderKanban,
  Play,
  Square,
  TrendingUp,
  Plus,
  Sparkles,
  ArrowRight,
  Flame,
  RefreshCw,
  Folder,
  Tag,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTimer } from '../contexts/TimerContext'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import type { Task, Project } from '../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman, formatSecondsToTimer } from '../lib/timeUtils'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'

export const DashboardPage: React.FC = () => {
  const { user, activeOrg } = useAuth()
  const { activeTask, activeSeconds, startTimer, stopTimer, syncWithTasks } = useTimer()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activeOrgId = activeOrg?.id

  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [tasksRes, projsRes] = await Promise.allSettled([
        taskService.listTasks({ organizationId: activeOrgId }),
        projectService.listProjects(activeOrgId),
      ])

      const loadedTasks = tasksRes.status === 'fulfilled' ? tasksRes.value || [] : []
      setTasks(loadedTasks)
      syncWithTasks(loadedTasks)

      if (projsRes.status === 'fulfilled') {
        setProjects(projsRes.value || [])
      }
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao atualizar dados do dashboard.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId, syncWithTasks])

  useEffect(() => {
    loadData()
  }, [loadData])

  // KPIs
  const stats = useMemo(() => {
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length
    const notStarted = tasks.filter((t) => t.status === 'NOT_STARTED').length
    const totalSeconds = tasks.reduce((acc, t) => acc + calculateTaskTotalSeconds(t), 0)

    return {
      inProgress,
      completed,
      notStarted,
      totalSeconds,
      projectsCount: projects.length,
    }
  }, [tasks, projects])

  // Recent 5 tasks
  const recentTasks = useMemo(() => {
    return [...tasks].slice(0, 5)
  }, [tasks])

  // Toggle timer on a task
  const handleToggleTimer = async (task: Task) => {
    try {
      if (activeTask?.id === task.id) {
        const stopped = await stopTimer(task)
        if (stopped) {
          setTasks((prev) => prev.map((t) => (t.id === stopped.id ? stopped : t)))
        }
      } else {
        const started = await startTimer(task)
        setTasks((prev) => prev.map((t) => (t.id === started.id ? started : t)))
      }
    } catch (err: unknown) {
      console.error(err)
      setError('Erro ao acionar cronômetro.')
    }
  }

  const handleModalSubmit = async (taskData: {
    title: string
    description: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
    projectId?: number
    categoryId?: number
    assigneeUserId?: number
  }) => {
    if (!activeOrgId) return
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

  // Priority task to focus on if none running
  const suggestedTask = useMemo(() => {
    return tasks.find((t) => t.status === 'IN_PROGRESS') || tasks.find((t) => t.status === 'NOT_STARTED') || tasks[0]
  }, [tasks])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Olá, {user?.name?.split(' ')[0] || 'Desenvolvedor'}! 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/25">
              {activeOrg?.name || 'Workspace'}
            </span>
          </div>
          <p className="text-xs text-muted">
            Visão geral da sua produtividade, metas e atividades recentes no workspace.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            title="Recarregar dashboard"
            className="p-2 rounded-xl border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-raised transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-foreground hover:bg-surface-raised transition-colors shadow-xs"
          >
            Quadro Kanban
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white font-semibold text-xs hover:bg-brand-hover shadow-md shadow-brand/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-border bg-surface-sunken/40 animate-pulse p-4"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* In Progress */}
          <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between shadow-xs hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted">Tarefas em Andamento</span>
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-teal-400 tracking-tight">
                {stats.inProgress}
              </p>
              <p className="text-[11px] text-muted mt-1">
                {stats.notStarted} no backlog para iniciar
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between shadow-xs hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted">Entregas Concluídas</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                {stats.completed}
              </p>
              <p className="text-[11px] text-muted mt-1">
                de {tasks.length} tarefas cadastradas
              </p>
            </div>
          </div>

          {/* Time Tracked */}
          <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between shadow-xs hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted">Tempo Total Dedicado</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-amber-400 tracking-tight font-mono">
                {formatSecondsToTimer(stats.totalSeconds)}
              </p>
              <p className="text-[11px] text-muted mt-1">
                {formatSecondsToHuman(stats.totalSeconds)} acumuladas
              </p>
            </div>
          </div>

          {/* Projects */}
          <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between shadow-xs hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted">Projetos Ativos</span>
              <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">
                {stats.projectsCount}
              </p>
              <p className="text-[11px] text-muted mt-1">
                Iniciativas no workspace
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Focus Session (Left) + Recent Tasks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Focus Session Card (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Sessão em Foco</h2>
                  <p className="text-xs text-muted">Cronômetro em tempo real</p>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  activeTask
                    ? 'bg-teal-500/15 text-teal-300 border-teal-500/30 animate-pulse'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {activeTask ? 'ATIVO' : 'EM ESPERA'}
              </span>
            </div>

            {/* Active or Suggested Task Info */}
            {activeTask ? (
              <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                <div className="flex items-center gap-2">
                  {activeTask.project && (
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                      style={{
                        backgroundColor: activeTask.project.color ? `${activeTask.project.color}15` : 'rgba(15,118,110,0.1)',
                        color: activeTask.project.color || '#0f766e',
                        borderColor: activeTask.project.color ? `${activeTask.project.color}30` : 'rgba(15,118,110,0.25)',
                      }}
                    >
                      {activeTask.project.name}
                    </span>
                  )}
                  {activeTask.category && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      {activeTask.category.name}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-foreground line-clamp-2">
                  {activeTask.title}
                </h3>
              </div>
            ) : suggestedTask ? (
              <div className="p-4 rounded-xl bg-surface-sunken/60 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                    Próxima da fila
                  </span>
                  {suggestedTask.project && (
                    <span className="text-[10px] text-muted truncate max-w-[120px]">
                      {suggestedTask.project.name}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                  {suggestedTask.title}
                </h3>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-surface-sunken/40 border border-dashed border-border text-center text-xs text-muted">
                Nenhuma tarefa pendente. Crie uma nova tarefa para iniciar o foco!
              </div>
            )}

            {/* Big Timer Display */}
            <div className="text-center py-4 rounded-xl bg-surface-sunken border border-border">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                {activeTask ? 'Tempo Decorrido na Tarefa' : 'Pronto para Cronometrar'}
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground mt-1">
                {activeTask ? formatSecondsToTimer(activeSeconds) : '00:00:00'}
              </p>
            </div>

            {/* Controls */}
            {activeTask ? (
              <button
                type="button"
                onClick={() => stopTimer(activeTask)}
                className="w-full py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4 fill-rose-300" />
                <span>Pausar Cronômetro</span>
              </button>
            ) : suggestedTask ? (
              <button
                type="button"
                onClick={() => handleToggleTimer(suggestedTask)}
                className="w-full py-2.5 rounded-xl bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand/20 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Iniciar Foco Nesta Tarefa</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-brand text-white hover:bg-brand-hover text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Tarefa para Iniciar</span>
              </button>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted">
              <span>Usuário ativo:</span>
              <span className="font-semibold text-foreground truncate max-w-[150px]">
                {user?.name || user?.email}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Atalhos de Gestão
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                to="/projects"
                className="p-3 rounded-xl bg-surface-raised hover:bg-brand/10 hover:text-brand border border-border transition-colors flex items-center gap-2 text-foreground"
              >
                <FolderKanban className="w-4 h-4 text-brand" />
                <span>Projetos</span>
              </Link>
              <Link
                to="/analytics"
                className="p-3 rounded-xl bg-surface-raised hover:bg-amber-500/10 hover:text-amber-400 border border-border transition-colors flex items-center gap-2 text-foreground"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Analytics</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Tasks List (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Tarefas Recentes
            </h2>
            <Link
              to="/tasks"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl border border-border bg-surface-sunken/40 animate-pulse p-4"
                />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-surface/50">
              <Activity className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-xs text-muted mb-4">
                Nenhuma tarefa encontrada neste workspace.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar Primeira Tarefa</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => {
                const isTracking = activeTask?.id === task.id
                const taskSec = isTracking ? activeSeconds : calculateTaskTotalSeconds(task)

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isTracking
                        ? 'border-brand/60 bg-brand/5 ring-1 ring-brand/30 shadow-md'
                        : 'border-border bg-surface hover:border-zinc-700 shadow-xs'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.project && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border"
                            style={{
                              backgroundColor: task.project.color ? `${task.project.color}15` : 'rgba(255,255,255,0.05)',
                              color: task.project.color || '#94a3b8',
                              borderColor: task.project.color ? `${task.project.color}30` : 'rgba(255,255,255,0.1)',
                            }}
                          >
                            <Folder className="w-2.5 h-2.5" />
                            {task.project.name}
                          </span>
                        )}
                        {task.category && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border"
                            style={{
                              backgroundColor: task.category.color ? `${task.category.color}15` : 'rgba(217,119,6,0.1)',
                              color: task.category.color || '#d97706',
                              borderColor: task.category.color ? `${task.category.color}30` : 'rgba(217,119,6,0.2)',
                            }}
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {task.category.name}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => navigate('/tasks')}
                        className="text-xs font-bold text-foreground hover:text-brand cursor-pointer truncate"
                      >
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[11px] ${
                          isTracking
                            ? 'bg-teal-500/20 text-teal-300 font-bold'
                            : 'bg-surface-sunken text-muted'
                        }`}
                      >
                        <Clock className={`w-3 h-3 ${isTracking ? 'animate-pulse text-brand' : ''}`} />
                        <span>{formatSecondsToTimer(taskSec)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleTimer(task)}
                        title={isTracking ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isTracking
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-brand/15 text-teal-300 hover:bg-brand/25'
                        }`}
                      >
                        {isTracking ? (
                          <Square className="w-3.5 h-3.5 fill-rose-300" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-teal-300" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {activeOrgId && (
        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          organizationId={activeOrgId}
          initialStatus="NOT_STARTED"
        />
      )}
    </div>
  )
}
