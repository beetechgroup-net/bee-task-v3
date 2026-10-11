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
  Zap,
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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Desenvolvedor'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner with Landing Page aesthetic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-2">
        <div className="space-y-1.5">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface/90 backdrop-blur-md border border-border-soft shadow-xs text-xs font-semibold text-brand">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span>Workspace: {activeOrg?.name || 'BeeTask'}</span>
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Olá, {firstName}!{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-strong to-accent">
              Bom trabalho hoje.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Acompanhe o ritmo de entregas da sua equipe, audite suas horas e mantenha o foco na próxima entrega.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            title="Recarregar dados"
            className="p-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-muted hover:text-foreground hover:bg-surface-raised transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          </button>

          <Link to="/tasks">
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-xs font-bold text-foreground hover:bg-surface-raised hover:border-brand/40 transition-all shadow-xs"
            >
              Quadro Kanban
            </button>
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-strong text-white font-bold text-xs shadow-lg shadow-brand/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
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

      {/* 4 Premium KPI Cards with shadow-panel & backdrop-blur */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-3xl border border-border-soft bg-surface/60 backdrop-blur-md animate-pulse p-5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* In Progress */}
          <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-5 shadow-panel hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted">Tarefas em Andamento</span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-teal-400 tracking-tight font-mono">
                {stats.inProgress}
              </p>
              <p className="text-[11px] text-muted font-medium mt-1">
                {stats.notStarted} tarefas aguardando no backlog
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-5 shadow-panel hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted">Entregas Concluídas</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
                {stats.completed}
              </p>
              <p className="text-[11px] text-muted font-medium mt-1">
                de {tasks.length} demandas cadastradas
              </p>
            </div>
          </div>

          {/* Time Tracked */}
          <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-5 shadow-panel hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted">Tempo Total Dedicado</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-400 tracking-tight font-mono">
                {formatSecondsToTimer(stats.totalSeconds)}
              </p>
              <p className="text-[11px] text-muted font-medium mt-1">
                {formatSecondsToHuman(stats.totalSeconds)} auditadas no time
              </p>
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-5 shadow-panel hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted">Projetos Ativos</span>
              <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand border border-brand/25 flex items-center justify-center shadow-xs">
                <FolderKanban className="w-4 h-4 text-brand" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground tracking-tight font-mono">
                {stats.projectsCount}
              </p>
              <p className="text-[11px] text-muted font-medium mt-1">
                Iniciativas ativas no workspace
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Focus Session (5 cols) + Recent Sprint Tasks (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Focus Session Hero Card (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-6 shadow-panel space-y-5 transition-all hover:shadow-2xl">
            {/* Header with macOS style dots */}
            <div className="flex items-center justify-between pb-4 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="text-xs font-bold text-foreground ml-1.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-accent" />
                  Sessão em Foco
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    activeTask ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    activeTask ? 'text-teal-400' : 'text-muted'
                  }`}
                >
                  {activeTask ? 'CRONOMETRANDO' : 'EM ESPERA'}
                </span>
              </div>
            </div>

            {/* Active or Suggested Task Info Box */}
            {activeTask ? (
              <div className="p-4 rounded-2xl bg-surface-raised border border-border-soft space-y-2 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {activeTask.project && (
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                      style={{
                        backgroundColor: activeTask.project.color ? `${activeTask.project.color}15` : 'rgba(15,118,110,0.1)',
                        color: activeTask.project.color || '#0f766e',
                        borderColor: activeTask.project.color ? `${activeTask.project.color}35` : 'rgba(15,118,110,0.25)',
                      }}
                    >
                      {activeTask.project.name}
                    </span>
                  )}
                  {activeTask.category && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent-soft text-accent border border-accent/25">
                      {activeTask.category.name}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                  {activeTask.title}
                </h3>
              </div>
            ) : suggestedTask ? (
              <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border-soft space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Sugerida para Focar
                  </span>
                  {suggestedTask.project && (
                    <span className="text-[11px] text-muted font-medium truncate max-w-[140px]">
                      {suggestedTask.project.name}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                  {suggestedTask.title}
                </h3>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-muted/40 border border-dashed border-border-soft text-center text-xs text-muted">
                Nenhuma tarefa ativa. Crie uma demanda para iniciar sua sessão produtiva!
              </div>
            )}

            {/* Big Bold Timer Display */}
            <div className="text-center py-5 rounded-2xl bg-surface border border-border-soft shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                {activeTask ? 'Tempo Decorrido na Tarefa' : 'Pronto para Iniciar'}
              </span>
              <p className="text-4xl sm:text-5xl font-extrabold font-mono text-foreground mt-1.5 tracking-tight">
                {activeTask ? formatSecondsToTimer(activeSeconds) : '00:00:00'}
              </p>
            </div>

            {/* Timer Actions */}
            {activeTask ? (
              <button
                type="button"
                onClick={() => stopTimer(activeTask)}
                className="w-full py-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Square className="w-4 h-4 fill-rose-300" />
                <span>Pausar Cronômetro</span>
              </button>
            ) : suggestedTask ? (
              <button
                type="button"
                onClick={() => handleToggleTimer(suggestedTask)}
                className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-strong text-white text-xs font-bold shadow-lg shadow-brand/25 transition-all flex items-center justify-center gap-2 duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Iniciar Tempo nesta Tarefa</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-strong text-white text-xs font-bold shadow-lg shadow-brand/25 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Tarefa para Focar</span>
              </button>
            )}

            <div className="pt-2 border-t border-border-soft flex items-center justify-between text-[11px] text-muted">
              <span>Usuário conectado</span>
              <span className="font-bold text-foreground truncate max-w-[160px]">
                {user?.name || user?.email}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts Card */}
          <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-5 shadow-panel space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
              Acesso Rápido ao Workspace
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                to="/projects"
                className="p-3.5 rounded-xl bg-surface-muted/60 hover:bg-brand-soft/50 hover:text-brand border border-border-soft transition-all flex items-center gap-2.5 text-foreground shadow-xs"
              >
                <FolderKanban className="w-4 h-4 text-brand" />
                <span>Ver Projetos</span>
              </Link>
              <Link
                to="/analytics"
                className="p-3.5 rounded-xl bg-surface-muted/60 hover:bg-accent-soft/50 hover:text-accent border border-border-soft transition-all flex items-center gap-2.5 text-foreground shadow-xs"
              >
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Analytics da Org</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Sprint Tasks (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Tarefas Recentes da Equipe
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
                  className="h-20 rounded-2xl border border-border-soft bg-surface/60 backdrop-blur-md animate-pulse p-4"
                />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-border-soft bg-surface/60 backdrop-blur-md">
              <Activity className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-xs text-muted mb-4 font-medium">
                Nenhuma tarefa encontrada neste workspace.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-strong shadow-md shadow-brand/20 transition-all"
              >
                <Plus className="w-4 h-4" />
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
                    className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-panel ${
                      isTracking
                        ? 'border-brand/60 bg-brand/5 ring-1 ring-brand/30 shadow-lg'
                        : 'border-border-soft bg-surface/90 backdrop-blur-md hover:border-brand/30 hover:shadow-xl'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.project && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                            style={{
                              backgroundColor: task.project.color ? `${task.project.color}15` : 'rgba(255,255,255,0.05)',
                              color: task.project.color || '#94a3b8',
                              borderColor: task.project.color ? `${task.project.color}30` : 'rgba(255,255,255,0.1)',
                            }}
                          >
                            <Folder className="w-3 h-3" />
                            {task.project.name}
                          </span>
                        )}
                        {task.category && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                            style={{
                              backgroundColor: task.category.color ? `${task.category.color}15` : 'rgba(217,119,6,0.1)',
                              color: task.category.color || '#d97706',
                              borderColor: task.category.color ? `${task.category.color}30` : 'rgba(217,119,6,0.2)',
                            }}
                          >
                            <Tag className="w-3 h-3" />
                            {task.category.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-teal-500/15 text-teal-400 border-teal-500/25'
                              : 'bg-surface-muted text-muted border-border-soft'
                          }`}
                        >
                          {task.status === 'COMPLETED'
                            ? 'Concluído'
                            : task.status === 'IN_PROGRESS'
                            ? 'Em Andamento'
                            : task.status === 'CANCELED'
                            ? 'Cancelado'
                            : 'A Fazer'}
                        </span>
                      </div>

                      <h3
                        onClick={() => navigate('/tasks')}
                        className="text-sm font-bold text-foreground hover:text-brand cursor-pointer truncate transition-colors"
                      >
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-[11px] font-bold ${
                          isTracking
                            ? 'bg-teal-500/20 text-teal-300'
                            : 'bg-surface-muted text-muted'
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 ${isTracking ? 'animate-pulse text-brand' : ''}`} />
                        <span>{formatSecondsToTimer(taskSec)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleTimer(task)}
                        title={isTracking ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
                        className={`p-2 rounded-xl transition-all shadow-xs ${
                          isTracking
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 ring-1 ring-rose-500/40'
                            : 'bg-brand/15 text-teal-300 hover:bg-brand/25 ring-1 ring-brand/30'
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
