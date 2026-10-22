import React from 'react'
import { Play, Square, Clock, Folder, Tag, MoreVertical, CircleDot, ExternalLink, Trash2 } from 'lucide-react'
import type { Task } from '../../types/task'
import { isTaskRunning, calculateTaskTotalSeconds, formatSecondsToTimer } from '../../lib/timeUtils'
import { useAuth } from '../../contexts/AuthContext'
import { canDeleteTask } from '../../lib/taskPermissions'

interface TaskCardProps {
  task: Task
  onToggleTimer: (task: Task) => void
  onEdit?: (task: Task) => void
  onOpenHistory?: (task: Task) => void
  onDelete?: (task: Task) => void
  isTrackingThis?: boolean
  currentSeconds?: number
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleTimer,
  onEdit,
  onOpenHistory,
  onDelete,
  isTrackingThis,
  currentSeconds,
}) => {
  const { user, activeOrg } = useAuth()
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
      className={`group relative rounded-2xl border bg-surface/90 backdrop-blur-md p-4 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-xl hover:-translate-y-0.5 hover:border-brand/40 ${
        running
          ? 'border-brand/60 shadow-[0_0_25px_rgba(15,118,110,0.22)] ring-1 ring-brand/40 bg-brand/5'
          : 'border-border-soft shadow-panel'
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

          {task.externalUrl && (
            <a
              href={task.externalUrl.startsWith('http') ? task.externalUrl : `https://${task.externalUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={task.externalUrl}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border border-border bg-surface-raised text-muted hover:text-brand hover:border-brand/40 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-brand" />
              <span>Link</span>
            </a>
          )}
        </div>

        {/* More Actions Menu */}
        {(onEdit || onOpenHistory || (onDelete && canDeleteTask(task, user, activeOrg))) && (
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
                  {onEdit && (
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
                  )}

                  {onOpenHistory && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenHistory(task)
                        setMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left text-foreground/80 hover:bg-surface-sunken hover:text-foreground transition-colors"
                    >
                      <span>Histórico de Tempo</span>
                      <Clock className="w-3.5 h-3.5 text-muted" />
                    </button>
                  )}

                  {onDelete && canDeleteTask(task, user, activeOrg) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        if (window.confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
                          onDelete(task)
                        }
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <span>Excluir Tarefa</span>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
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
              className="w-6 h-6 rounded-full bg-surface-raised border border-border-soft flex items-center justify-center text-[10px] text-muted"
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
            onClick={(e) => {
              e.stopPropagation()
              onOpenHistory?.(task)
            }}
            title="Clique para ver o histórico de tempo"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer hover:opacity-85 ${
              running
                ? 'bg-teal-500/15 text-teal-700 dark:bg-brand/20 dark:text-teal-300 font-semibold'
                : 'bg-surface-sunken text-muted'
            }`}
          >
            <Clock className={`w-3 h-3 ${running ? 'animate-pulse text-teal-700 dark:text-brand' : ''}`} />
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
                : 'bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 dark:bg-brand/15 dark:text-teal-300 dark:hover:bg-brand/25 ring-1 ring-teal-600/20 dark:ring-brand/30'
            }`}
          >
            {running ? (
              <Square className="w-3.5 h-3.5 fill-rose-300" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-teal-700 dark:fill-teal-300" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
