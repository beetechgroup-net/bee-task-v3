import React from 'react'
import {
  Clock,
  CheckCircle2,
  Play,
  Square,
  TrendingUp,
  Flame,
  Target,
  BarChart3,
  PieChart,
  ListOrdered,
  Layers,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  GripVertical,
  User,
  Users,
} from 'lucide-react'
import type { DashboardV2Card } from '../../lib/userPreferences'
import type { Task, Project, Category } from '../../types/task'
import {
  calculateTaskTotalSeconds,
  formatSecondsToHuman,
  formatSecondsToTimer,
} from '../../lib/timeUtils'
import {
  calculateUserPeriodWorkedSeconds,
  isSameDay,
  isSameWeek,
  isSameMonth,
  type WorkGoal,
} from '../../lib/userGoals'
import { useAuth } from '../../contexts/AuthContext'

interface BiUniformCardProps {
  card: DashboardV2Card
  index: number
  totalCards: number
  tasks: Task[]
  projects: Project[]
  categories: Category[]
  activeTask: Task | null
  activeSeconds: number
  workGoal: WorkGoal
  globalScope?: 'mine' | 'team'
  isBeingDragged?: boolean
  isDragOver?: boolean
  onToggleTimer: (task: Task) => void
  onMoveCard: (id: string, direction: 'prev' | 'next') => void
  onEditCard: (card: DashboardV2Card) => void
  onDeleteCard: (id: string) => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragOver: (e: React.DragEvent, id: string) => void
  onDragLeave: (e: React.DragEvent, id: string) => void
  onDrop: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
}

const THEME_STYLES: Record<
  NonNullable<DashboardV2Card['colorTheme']>,
  {
    iconBg: string
    iconText: string
    borderHover: string
    badge: string
    bar: string
  }
> = {
  brand: {
    iconBg: 'bg-teal-500/15',
    iconText: 'text-teal-700 dark:text-teal-400',
    borderHover: 'hover:border-teal-500/40',
    badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
    bar: 'bg-gradient-to-r from-teal-500 to-teal-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-700 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  },
  accent: {
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-500',
    borderHover: 'hover:border-amber-500/40',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
  },
  indigo: {
    iconBg: 'bg-indigo-500/15',
    iconText: 'text-indigo-400',
    borderHover: 'hover:border-indigo-500/40',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    bar: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
  },
  cyan: {
    iconBg: 'bg-cyan-500/15',
    iconText: 'text-cyan-400',
    borderHover: 'hover:border-cyan-500/40',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    bar: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
  },
  rose: {
    iconBg: 'bg-rose-500/15',
    iconText: 'text-rose-400',
    borderHover: 'hover:border-rose-500/40',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    bar: 'bg-gradient-to-r from-rose-500 to-rose-400',
  },
}

export const BiUniformCard: React.FC<BiUniformCardProps> = ({
  card,
  index,
  totalCards,
  tasks,
  projects,
  categories,
  activeTask,
  activeSeconds,
  workGoal,
  globalScope = 'team',
  isBeingDragged = false,
  isDragOver = false,
  onToggleTimer,
  onMoveCard,
  onEditCard,
  onDeleteCard,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const { user } = useAuth()
  const theme = THEME_STYLES[card.colorTheme || 'brand']
  const now = new Date()

  // Resolve scope: Card's specific scope takes precedence, otherwise fallback to page's globalScope
  const effectiveScope: 'mine' | 'team' =
    card.scope && card.scope !== 'INHERIT'
      ? card.scope === 'MINE'
        ? 'mine'
        : 'team'
      : globalScope

  // 1. Filter Tasks based on scope and card's combined dimensions
  const filteredTasks = tasks.filter((t) => {
    // Scope filter (if 'mine', only user's tasks)
    if (effectiveScope === 'mine') {
      const isMine = Boolean(
        t.user?.email &&
          user?.email &&
          t.user.email.toLowerCase() === user.email.toLowerCase()
      )
      if (!isMine) return false
    }

    if (card.projectId && t.project?.id !== card.projectId) return false
    if (card.categoryId && t.category?.id !== card.categoryId) return false
    if (card.statusFilter && card.statusFilter !== 'ALL') {
      if (t.status !== card.statusFilter) return false
    }
    return true
  })

  // Period-aware seconds calculation
  const periodSeconds = filteredTasks.reduce((acc, t) => {
    let taskSec = 0
    if (card.period === 'ALL') {
      taskSec = calculateTaskTotalSeconds(t)
    } else {
      for (const item of t.history || []) {
        if (!item.startAt) continue
        const itemDate = new Date(item.startAt)
        let matches = false
        if (card.period === 'TODAY') matches = isSameDay(itemDate, now)
        else if (card.period === 'WEEK') matches = isSameWeek(itemDate, now)
        else if (card.period === 'MONTH') matches = isSameMonth(itemDate, now)

        if (matches) {
          const startMs = itemDate.getTime()
          const endMs = item.endAt ? new Date(item.endAt).getTime() : startMs
          const duration = Math.max(0, Math.floor((endMs - startMs) / 1000))
          taskSec += duration
        }
      }
    }

    if (activeTask?.id === t.id && card.period !== 'ALL') {
      taskSec += activeSeconds
    }

    return acc + taskSec
  }, 0)

  // Associated names
  const projectName = projects.find((p) => p.id === card.projectId)?.name
  const categoryName = categories.find((c) => c.id === card.categoryId)?.name

  const periodLabels: Record<string, string> = {
    ALL: 'Total',
    TODAY: 'Hoje',
    WEEK: 'Esta Semana',
    MONTH: 'Este Mês',
  }

  // Render Body based on metricType
  const renderCardBody = () => {
    switch (card.metricType) {
      case 'HOURS_TRACKED': {
        return (
          <div className="my-auto">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight leading-none">
              {formatSecondsToTimer(periodSeconds)}
            </p>
            <p className="text-[10px] text-muted font-medium mt-1 truncate">
              ≈ {formatSecondsToHuman(periodSeconds)} dedicadas
            </p>
          </div>
        )
      }

      case 'TASK_COUNT': {
        const completedCount = filteredTasks.filter((t) => t.status === 'COMPLETED').length
        const inProgressCount = filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length
        return (
          <div className="my-auto">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                {filteredTasks.length}
              </span>
              <span className="text-[11px] text-muted font-medium">demandas</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted mt-1 truncate">
              <span>
                <strong className="text-teal-700 dark:text-teal-400">{inProgressCount}</strong> andamento
              </span>
              <span>•</span>
              <span>
                <strong className="text-emerald-700 dark:text-emerald-400">{completedCount}</strong> entregues
              </span>
            </div>
          </div>
        )
      }

      case 'COMPLETION_RATE': {
        const total = filteredTasks.length
        const completed = filteredTasks.filter((t) => t.status === 'COMPLETED').length
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0

        return (
          <div className="space-y-1.5 my-auto">
            <div className="flex items-baseline justify-between leading-none">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                {rate}%
              </span>
              <span className="text-[10px] text-muted font-medium">
                {completed}/{total} concluídas
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-sunken overflow-hidden p-0.5 border border-border-soft">
              <div
                className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        )
      }

      case 'STATUS_DISTRIBUTION': {
        const notStarted = filteredTasks.filter((t) => t.status === 'NOT_STARTED').length
        const inProgress = filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length
        const completed = filteredTasks.filter((t) => t.status === 'COMPLETED').length
        const total = Math.max(1, filteredTasks.length)

        return (
          <div className="space-y-1.5 my-auto">
            <div className="flex h-2 w-full rounded-full overflow-hidden gap-0.5 bg-surface-sunken p-0.5 border border-border-soft">
              <div
                style={{ width: `${(completed / total) * 100}%` }}
                className="bg-emerald-500 rounded-full"
                title={`Concluídas: ${completed}`}
              />
              <div
                style={{ width: `${(inProgress / total) * 100}%` }}
                className="bg-teal-500 rounded-full"
                title={`Em Andamento: ${inProgress}`}
              />
              <div
                style={{ width: `${(notStarted / total) * 100}%` }}
                className="bg-zinc-400 rounded-full"
                title={`A Fazer: ${notStarted}`}
              />
            </div>
            <div className="grid grid-cols-3 gap-1 text-[9px] text-muted text-center pt-0.5 font-medium">
              <div>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{completed}</span> Feitas
              </div>
              <div>
                <span className="text-teal-700 dark:text-teal-400 font-bold">{inProgress}</span> Andam.
              </div>
              <div>
                <span className="text-foreground font-bold">{notStarted}</span> Fazer
              </div>
            </div>
          </div>
        )
      }

      case 'PROJECT_BREAKDOWN': {
        const projsWithCounts = projects.map((p) => {
          const count = tasks.filter((t) => t.project?.id === p.id).length
          return { project: p, count }
        }).filter((item) => item.count > 0).slice(0, 2)

        return (
          <div className="space-y-1 my-auto">
            {projsWithCounts.length === 0 ? (
              <p className="text-[11px] text-muted italic">Nenhum projeto com tarefas.</p>
            ) : (
              projsWithCounts.map(({ project, count }) => (
                <div key={project.id} className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground truncate max-w-[130px] flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || '#0f766e' }}
                    />
                    {project.name}
                  </span>
                  <span className="font-mono text-muted text-[10px] font-bold">
                    {count} tasks
                  </span>
                </div>
              ))
            )}
          </div>
        )
      }

      case 'WORK_GOAL': {
        const targetSeconds = (workGoal?.targetHours || 8) * 3600
        const workedSeconds = calculateUserPeriodWorkedSeconds(
          tasks,
          workGoal?.period || 'DAILY',
          activeTask?.id,
          activeSeconds
        )
        const percent = Math.min(100, Math.round((workedSeconds / targetSeconds) * 100))

        return (
          <div className="space-y-1.5 my-auto">
            <div className="flex items-baseline justify-between leading-none">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">
                {formatSecondsToTimer(workedSeconds)}
              </span>
              <span className="text-[10px] font-bold text-muted">
                / {workGoal.targetHours}h ({percent}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-sunken overflow-hidden p-0.5 border border-border-soft">
              <div
                className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      }

      case 'ACTIVE_TIMER': {
        const isMyActiveTask = Boolean(
          activeTask &&
          user?.email &&
          activeTask.user?.email &&
          activeTask.user.email.toLowerCase() === user.email.toLowerCase()
        )
        const currentActive = isMyActiveTask ? activeTask : null
        const myTasks = tasks.filter((t) => {
          if (!user?.email || !t.user?.email) return false
          return t.user.email.toLowerCase() === user.email.toLowerCase()
        })
        const targetTask = currentActive || myTasks.find((t) => t.status === 'IN_PROGRESS') || myTasks.find((t) => t.status === 'NOT_STARTED') || myTasks[0]
        return (
          <div className="space-y-1 my-auto">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">
                {currentActive ? formatSecondsToTimer(activeSeconds) : '00:00:00'}
              </span>
              {targetTask && (
                <button
                  type="button"
                  onClick={() => onToggleTimer(targetTask)}
                  className={`p-1.5 rounded-lg transition-all shadow-xs cursor-pointer ${
                    currentActive
                      ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                      : 'bg-teal-500/10 text-teal-700 hover:bg-teal-500/20'
                  }`}
                >
                  {currentActive ? (
                    <Square className="w-3 h-3 fill-rose-300" />
                  ) : (
                    <Play className="w-3 h-3 fill-teal-700 dark:fill-teal-300" />
                  )}
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted truncate">
              {currentActive ? currentActive.title : targetTask ? targetTask.title : 'Nenhuma tarefa pronta'}
            </p>
          </div>
        )
      }

      case 'TOP_TASKS': {
        const top2 = [...filteredTasks]
          .sort((a, b) => calculateTaskTotalSeconds(b) - calculateTaskTotalSeconds(a))
          .slice(0, 2)

        return (
          <div className="space-y-1 my-auto">
            {top2.length === 0 ? (
              <p className="text-[11px] text-muted italic">Nenhuma tarefa encontrada.</p>
            ) : (
              top2.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between text-[10px] gap-2">
                  <span className="truncate text-foreground font-semibold">
                    <strong className="text-muted mr-1">#{i + 1}</strong> {t.title}
                  </span>
                  <span className="font-mono text-muted shrink-0">
                    {formatSecondsToTimer(calculateTaskTotalSeconds(t))}
                  </span>
                </div>
              ))
            )}
          </div>
        )
      }

      default:
        return null
    }
  }

  const getMetricIcon = () => {
    switch (card.metricType) {
      case 'HOURS_TRACKED':
        return Clock
      case 'TASK_COUNT':
        return Layers
      case 'COMPLETION_RATE':
        return CheckCircle2
      case 'STATUS_DISTRIBUTION':
        return PieChart
      case 'PROJECT_BREAKDOWN':
        return BarChart3
      case 'WORK_GOAL':
        return Target
      case 'ACTIVE_TIMER':
        return Flame
      case 'TOP_TASKS':
        return ListOrdered
      default:
        return TrendingUp
    }
  }

  const IconComponent = getMetricIcon()

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragOver={(e) => onDragOver(e, card.id)}
      onDragLeave={(e) => onDragLeave(e, card.id)}
      onDrop={(e) => onDrop(e, card.id)}
      onDragEnd={onDragEnd}
      className={`h-[185px] min-h-[185px] max-h-[185px] rounded-2xl border border-border-soft bg-surface/90 backdrop-blur-md p-4 shadow-panel flex flex-col justify-between transition-all duration-200 ${
        theme.borderHover
      } hover:shadow-lg hover:-translate-y-0.5 relative group cursor-grab active:cursor-grabbing select-none ${
        isBeingDragged ? 'opacity-30 scale-95 border-dashed border-brand' : ''
      } ${isDragOver ? 'ring-2 ring-brand scale-[1.02] bg-brand/5 shadow-2xl' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-border-soft/60">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {/* Drag Handle indicator */}
          <GripVertical className="w-3.5 h-3.5 text-muted opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />

          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-border-soft ${theme.iconBg} ${theme.iconText}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-foreground truncate" title={card.title}>
            {card.title}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation()
              onMoveCard(card.id, 'prev')
            }}
            title="Mover para esquerda"
            className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-sunken disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            disabled={index === totalCards - 1}
            onClick={(e) => {
              e.stopPropagation()
              onMoveCard(card.id, 'next')
            }}
            title="Mover para direita"
            className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-sunken disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEditCard(card)
            }}
            title="Editar configurações"
            className="p-1 rounded text-muted hover:text-brand hover:bg-surface-sunken transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteCard(card.id)
            }}
            title="Remover card"
            className="p-1 rounded text-muted hover:text-rose-500 hover:bg-surface-sunken transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Metric / Graph Body */}
      {renderCardBody()}

      {/* Footer: Compact Dimension Tags */}
      <div className="pt-1.5 border-t border-border-soft/60 flex items-center gap-1.5 flex-wrap text-[9px] truncate">
        {/* Scope Icon (only icon, without background color) */}
        <span
          className="text-muted/70 hover:text-foreground transition-colors shrink-0 inline-flex items-center px-0.5"
          title={
            card.scope && card.scope !== 'INHERIT'
              ? `Escopo fixado: ${effectiveScope === 'mine' ? 'Individual' : 'Equipe'}`
              : `Escopo: ${effectiveScope === 'mine' ? 'Individual' : 'Equipe'}`
          }
        >
          {effectiveScope === 'mine' ? (
            <User className="w-3.5 h-3.5 text-brand" />
          ) : (
            <Users className="w-3.5 h-3.5 text-muted" />
          )}
        </span>

        <span className={`px-1.5 py-0.2 rounded font-semibold border ${theme.badge}`}>
          {periodLabels[card.period]}
        </span>

        {projectName && (
          <span className="px-1.5 py-0.2 rounded font-medium bg-surface-sunken text-muted border border-border-soft truncate max-w-[100px]">
            {projectName}
          </span>
        )}

        {categoryName && (
          <span className="px-1.5 py-0.2 rounded font-medium bg-surface-sunken text-muted border border-border-soft truncate max-w-[90px]">
            {categoryName}
          </span>
        )}

        {card.statusFilter && card.statusFilter !== 'ALL' && (
          <span className="px-1.5 py-0.2 rounded font-medium bg-surface-sunken text-muted border border-border-soft">
            {card.statusFilter === 'COMPLETED'
              ? 'Concluídas'
              : card.statusFilter === 'IN_PROGRESS'
              ? 'Andamento'
              : 'A Fazer'}
          </span>
        )}
      </div>
    </div>
  )
}
