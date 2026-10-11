import React from 'react'
import { Play, Square, Clock, Folder, Tag, MoreVertical, CheckCircle2, CircleDot } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { isTaskRunning, calculateTaskTotalSeconds, formatSecondsToTimer } from '../../lib/timeUtils'

interface TaskCardProps {
  task: Task
  onToggleTimer: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
  onEdit?: (task: Task) => void
  isTrackingThis?: boolean
  currentSeconds?: number
}

const statusConfig: Record<TaskStatus, { label: string; badgeClass: string }> = {
  NOT_STARTED: {
    label: 'Não Iniciado',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
  COMPLETED: {
    label: 'Concluído',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  CANCELED: {
    label: 'Cancelado',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleTimer,
  onStatusChange,
  onEdit,
  isTrackingThis,
  currentSeconds,
}) => {
  const running = isTrackingThis ?? isTaskRunning(task)
  const totalSeconds = currentSeconds !== undefined ? currentSeconds : calculateTaskTotalSeconds(task)
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(task.id))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`group relative rounded-xl border bg-surface p-4 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-zinc-700 ${
        running
          ? 'border-brand/60 shadow-[0_0_20px_rgba(15,118,110,0.18)] ring-1 ring-brand/40'
          : 'border-border shadow-xs'
      }`}
    >
      {/* Top Row: Project & Quick Status Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.project ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border"
              style={{
                backgroundColor: task.project.color ? `${task.project.color}15` : 'rgba(255,255,255,0.05)',
                color: task.project.color || '#94a3b8',
                borderColor: task.project.color ? `${task.project.color}35` : 'rgba(255,255,255,0.1)',
              }}
            >
              <Folder className="w-3 h-3" />
              {task.project.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-muted border border-border bg-surface-raised">
              Geral
            </span>
          )}

          {task.category && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border"
              style={{
                backgroundColor: task.category.color ? `${task.category.color}15` : 'rgba(217,119,6,0.1)',
                color: task.category.color || '#d97706',
                borderColor: task.category.color ? `${task.category.color}35` : 'rgba(217,119,6,0.2)',
              }}
            >
              <Tag className="w-3 h-3" />
              {task.category.name}
            </span>
          )}
        </div>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
            title="Ações"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                }}
              />
              <div className="absolute right-0 top-6 z-50 w-44 rounded-xl border border-border bg-surface-raised p-1.5 shadow-xl">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Alterar Status
                </div>
                {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStatusChange(task, st)
                      setMenuOpen(false)
                    }}
                    className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${
                      task.status === st
                        ? 'bg-brand/15 text-brand font-medium'
                        : 'text-foreground/80 hover:bg-surface-sunken hover:text-foreground'
                    }`}
                  >
                    <span>{statusConfig[st].label}</span>
                    {task.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-brand" />}
                  </button>
                ))}

                {onEdit && (
                  <>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(task)
                        setMenuOpen(false)
                      }}
                      className="w-full px-2 py-1.5 rounded-lg text-xs text-left text-foreground/80 hover:bg-surface-sunken hover:text-foreground transition-colors"
                    >
                      Editar Detalhes
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        onClick={() => onEdit?.(task)}
        className="font-semibold text-sm text-foreground hover:text-brand transition-colors cursor-pointer line-clamp-2 mb-1.5"
      >
        {task.title}
      </h3>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: User Avatar & Live Timer Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-2">
        {/* Assignee / Creator */}
        <div className="flex items-center gap-1.5">
          {task.user ? (
            <div
              className="w-6 h-6 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-[10px] font-bold text-brand uppercase"
              title={task.user.name || task.user.email}
            >
              {task.user.name ? task.user.name.charAt(0) : task.user.email.charAt(0)}
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-muted"
              title="Sem responsável"
            >
              <CircleDot className="w-3 h-3" />
            </div>
          )}
          <span className="text-[11px] text-muted max-w-[90px] truncate">
            {task.user?.name || task.user?.email?.split('@')[0] || 'Livre'}
          </span>
        </div>

        {/* Timer button & display */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
              running
                ? 'bg-brand/20 text-teal-300 font-semibold'
                : 'bg-surface-sunken text-muted'
            }`}
          >
            <Clock className={`w-3 h-3 ${running ? 'animate-pulse text-brand' : ''}`} />
            <span>{formatSecondsToTimer(totalSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleTimer(task)
            }}
            title={running ? 'Parar cronômetro' : 'Iniciar cronômetro'}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              running
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 ring-1 ring-rose-500/40'
                : 'bg-brand/15 text-teal-300 hover:bg-brand/25 ring-1 ring-brand/30'
            }`}
          >
            {running ? (
              <Square className="w-3.5 h-3.5 fill-rose-300" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-teal-300" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
