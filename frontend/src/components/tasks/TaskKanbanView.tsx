import React, { useState } from 'react'
import { Plus, CheckCircle2, Clock, CircleDot, AlertCircle, Ban, Eye, EyeOff, MoreVertical } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { TaskCard } from './TaskCard'
import { calculateTaskTotalSeconds, formatSecondsToHuman } from '../../lib/timeUtils'

interface TaskKanbanViewProps {
  tasks: Task[]
  onToggleTimer: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
  onEditTask: (task: Task) => void
  onOpenHistory?: (task: Task) => void
  onAddTaskToStatus: (status: TaskStatus) => void
  activeTaskId?: number | null
  activeTaskSeconds?: number
  hiddenColumns?: TaskStatus[]
  showAllColumns?: boolean
  onHideColumn?: (status: TaskStatus) => void
  onUnhideColumn?: (status: TaskStatus) => void
}

export interface ColumnDef {
  status: TaskStatus
  label: string
  icon: React.ElementType
  colorClass: string
  bgLightClass: string
  borderColor: string
}

export const COLUMNS: ColumnDef[] = [
  {
    status: 'NOT_STARTED',
    label: 'A Fazer',
    icon: CircleDot,
    colorClass: 'text-muted',
    bgLightClass: 'bg-surface-sunken',
    borderColor: 'border-border-soft',
  },
  {
    status: 'IN_PROGRESS',
    label: 'Em Andamento',
    icon: Clock,
    colorClass: 'text-teal-700 dark:text-teal-400',
    bgLightClass: 'bg-teal-500/10 dark:bg-teal-500/15',
    borderColor: 'border-teal-600/25 dark:border-teal-500/20',
  },
  {
    status: 'COMPLETED',
    label: 'Concluído',
    icon: CheckCircle2,
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    bgLightClass: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    borderColor: 'border-emerald-600/25 dark:border-emerald-500/20',
  },
  {
    status: 'CANCELED',
    label: 'Cancelado',
    icon: Ban,
    colorClass: 'text-rose-700 dark:text-rose-400',
    bgLightClass: 'bg-rose-500/10 dark:bg-rose-500/15',
    borderColor: 'border-rose-600/25 dark:border-rose-500/20',
  },
]

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onToggleTimer,
  onStatusChange,
  onEditTask,
  onOpenHistory,
  onAddTaskToStatus,
  activeTaskId,
  activeTaskSeconds,
  hiddenColumns = [],
  showAllColumns = false,
  onHideColumn,
  onUnhideColumn,
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const [columnMenuOpen, setColumnMenuOpen] = useState<TaskStatus | null>(null)

  // Visible columns based on hidden state unless showAllColumns is active
  const visibleColumns = COLUMNS.filter((col) => {
    if (showAllColumns) return true
    return !hiddenColumns.includes(col.status)
  })

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== status) {
      setDragOverColumn(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const taskIdStr = e.dataTransfer.getData('text/plain')
    if (!taskIdStr) return

    const taskId = Number(taskIdStr)
    const targetTask = tasks.find((t) => t.id === taskId)
    if (targetTask && targetTask.status !== targetStatus) {
      onStatusChange(targetTask, targetStatus)
    }
  }

  const getGridColsClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    if (count === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  if (visibleColumns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-border-soft bg-surface/50 backdrop-blur-md">
        <EyeOff className="w-10 h-10 text-muted/60 mb-3" />
        <h3 className="text-sm font-semibold text-foreground mb-1">Todas as colunas estão ocultas</h3>
        <p className="text-xs text-muted mb-4 max-w-sm">
          Você ocultou todas as colunas do quadro. Ative a exibição de colunas ocultas ou reative as colunas desejadas.
        </p>
      </div>
    )
  }

  return (
    <div className={`grid ${getGridColsClass(visibleColumns.length)} gap-4 items-start pb-6`}>
      {visibleColumns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status)
        const isHidden = hiddenColumns.includes(col.status)
        const colTotalSeconds = columnTasks.reduce(
          (acc, t) =>
            acc +
            (t.id === activeTaskId && activeTaskSeconds !== undefined
              ? activeTaskSeconds
              : calculateTaskTotalSeconds(t)),
          0
        )
        const Icon = col.icon
        const isOver = dragOverColumn === col.status
        const isMenuOpen = columnMenuOpen === col.status

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col rounded-3xl border transition-all duration-200 h-[680px] lg:h-[calc(100vh-270px)] lg:min-h-[520px] overflow-hidden bg-surface/60 backdrop-blur-md shadow-xs ${
              isHidden ? 'opacity-70 ring-1 ring-amber-500/30' : ''
            } ${
              isOver
                ? 'border-brand ring-2 ring-brand/30 bg-brand/5'
                : col.borderColor
            }`}
          >
            {/* Column Header */}
            <div className="shrink-0 flex items-center justify-between p-3.5 border-b border-border-soft bg-surface/40">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg ${col.bgLightClass} flex items-center justify-center shrink-0 ${col.colorClass}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs tracking-tight text-foreground flex items-center gap-1.5 truncate">
                    <span>{col.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-raised border border-border-soft text-muted shrink-0">
                      {columnTasks.length}
                    </span>
                    {isHidden && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                        Oculta
                      </span>
                    )}
                  </h3>
                  {colTotalSeconds > 0 && (
                    <span className="text-[10px] text-muted font-mono truncate block">
                      {formatSecondsToHuman(colTotalSeconds)} investidos
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onAddTaskToStatus(col.status)}
                  title={`Adicionar tarefa em ${col.label}`}
                  className="w-7 h-7 rounded-lg border border-border-soft bg-surface flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Column options menu (hide/unhide) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setColumnMenuOpen(isMenuOpen ? null : col.status)
                    }}
                    title="Opções da coluna"
                    className="w-7 h-7 rounded-lg border border-border-soft bg-surface flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation()
                          setColumnMenuOpen(null)
                        }}
                      />
                      <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-border bg-surface-raised p-1 shadow-xl text-left">
                        {isHidden ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUnhideColumn?.(col.status)
                              setColumnMenuOpen(null)
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-surface-sunken transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand" />
                            <span>Reexibir coluna</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onHideColumn?.(col.status)
                              setColumnMenuOpen(null)
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-surface-sunken transition-colors"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar coluna</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Column Body / Cards List */}
            <div className="flex-1 p-3 flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleTimer={onToggleTimer}
                  onEdit={onEditTask}
                  onOpenHistory={onOpenHistory}
                  isTrackingThis={activeTaskId === task.id}
                  currentSeconds={activeTaskId === task.id ? activeTaskSeconds : undefined}
                />
              ))}

              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border-soft">
                  <AlertCircle className="w-6 h-6 text-muted/60 mb-2" />
                  <p className="text-xs text-muted">Nenhuma tarefa nesta coluna</p>
                  <button
                    type="button"
                    onClick={() => onAddTaskToStatus(col.status)}
                    className="mt-2 text-xs font-medium text-brand hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Criar tarefa
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
