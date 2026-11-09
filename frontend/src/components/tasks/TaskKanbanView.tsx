import React, { useState } from 'react'
import { Plus, CheckCircle2, Clock, CircleDot, AlertCircle, Ban, Eye, EyeOff, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { TaskCard } from './TaskCard'
import { calculateTaskTotalSeconds, formatSecondsToHuman } from '../../lib/timeUtils'

interface TaskKanbanViewProps {
  tasks: Task[]
  taskStatuses?: TaskStatus[]
  onToggleTimer: (task: Task) => void
  onStatusChange: (task: Task, newStatus: string, newStatusId?: number) => void
  onEditTask: (task: Task) => void
  onOpenHistory?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onAddTaskToStatus: (status: string, statusId?: number) => void
  onOpenCreateStatus?: () => void
  onEditStatus?: (status: TaskStatus) => void
  onDeleteStatus?: (status: TaskStatus) => void
  activeTaskId?: number | null
  activeTaskSeconds?: number
  hiddenColumns?: string[]
  showAllColumns?: boolean
  onHideColumn?: (status: string) => void
  onUnhideColumn?: (status: string) => void
}

export interface ColumnDef {
  id?: number
  status: string
  label: string
  icon: React.ElementType
  color: string
  colorClass?: string
  bgLightClass?: string
  borderColor?: string
  rawStatus?: TaskStatus
}

export const DEFAULT_COLUMNS: ColumnDef[] = [
  {
    status: 'A Fazer',
    label: 'A Fazer',
    icon: CircleDot,
    color: '#71717a',
    colorClass: 'text-muted',
    bgLightClass: 'bg-surface-sunken',
    borderColor: 'border-border-soft',
  },
  {
    status: 'Em Andamento',
    label: 'Em Andamento',
    icon: Clock,
    color: '#14b8a6',
    colorClass: 'text-teal-700 dark:text-teal-400',
    bgLightClass: 'bg-teal-500/10 dark:bg-teal-500/15',
    borderColor: 'border-teal-600/25 dark:border-teal-500/20',
  },
  {
    status: 'Concluído',
    label: 'Concluído',
    icon: CheckCircle2,
    color: '#10b981',
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    bgLightClass: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    borderColor: 'border-emerald-600/25 dark:border-emerald-500/20',
  },
  {
    status: 'Cancelado',
    label: 'Cancelado',
    icon: Ban,
    color: '#f43f5e',
    colorClass: 'text-rose-700 dark:text-rose-400',
    bgLightClass: 'bg-rose-500/10 dark:bg-rose-500/15',
    borderColor: 'border-rose-600/25 dark:border-rose-500/20',
  },
]

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  taskStatuses = [],
  onToggleTimer,
  onStatusChange,
  onEditTask,
  onOpenHistory,
  onDeleteTask,
  onAddTaskToStatus,
  onOpenCreateStatus,
  onEditStatus,
  onDeleteStatus,
  activeTaskId,
  activeTaskSeconds,
  hiddenColumns = [],
  showAllColumns = false,
  onHideColumn,
  onUnhideColumn,
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [columnMenuOpen, setColumnMenuOpen] = useState<string | null>(null)

  // Build columns dynamically from taskStatuses if available, else use default 4
  const columns: ColumnDef[] = React.useMemo(() => {
    if (taskStatuses && taskStatuses.length > 0) {
      return [...taskStatuses]
        .sort((a, b) => a.position - b.position)
        .map((s) => {
          let icon = Clock
          if (s.isCompleted) icon = CheckCircle2
          else if (s.isCanceled) icon = Ban
          else if (s.isDefault) icon = CircleDot

          return {
            id: s.id,
            status: s.name,
            label: s.name,
            icon,
            color: s.color || '#71717a',
            rawStatus: s,
          }
        })
    }
    return DEFAULT_COLUMNS
  }, [taskStatuses])

  // Visible columns based on hidden state unless showAllColumns is active
  const visibleColumns = columns.filter((col) => {
    if (showAllColumns) return true
    return !hiddenColumns.includes(col.status) && (!col.id || !hiddenColumns.includes(String(col.id)))
  })

  const handleDragOver = (e: React.DragEvent, statusKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== statusKey) {
      setDragOverColumn(statusKey)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetCol: ColumnDef) => {
    e.preventDefault()
    setDragOverColumn(null)
    const taskIdStr = e.dataTransfer.getData('text/plain')
    if (!taskIdStr) return

    const taskId = Number(taskIdStr)
    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask) return

    const isSameStatus =
      (targetCol.id && targetTask.taskStatus?.id === targetCol.id) ||
      targetTask.status === targetCol.status

    if (!isSameStatus) {
      onStatusChange(targetTask, targetCol.status, targetCol.id)
    }
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

  const isWideBoard = visibleColumns.length > 4

  return (
    <div
      className={
        isWideBoard
          ? 'flex gap-4 overflow-x-auto pb-6 items-start scrollbar-thin'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-6'
      }
    >
      {visibleColumns.map((col) => {
        const columnTasks = tasks.filter((t) => {
          if (col.id && t.taskStatus?.id) {
            return t.taskStatus.id === col.id
          }
          if (col.id && t.status === String(col.id)) {
            return true
          }
          const tStatus = t.status || ''
          if (tStatus === col.status || tStatus === col.label) return true
          if ((col.status === 'A Fazer' || col.status === 'NOT_STARTED') && (tStatus === 'NOT_STARTED' || tStatus === 'A Fazer' || t.taskStatus?.isDefault)) {
            return true
          }
          if ((col.status === 'Em Andamento' || col.status === 'IN_PROGRESS') && (tStatus === 'IN_PROGRESS' || tStatus === 'Em Andamento')) {
            return true
          }
          if ((col.status === 'Concluído' || col.status === 'COMPLETED') && (tStatus === 'COMPLETED' || tStatus === 'Concluído' || t.taskStatus?.isCompleted)) {
            return true
          }
          if ((col.status === 'Cancelado' || col.status === 'CANCELED') && (tStatus === 'CANCELED' || tStatus === 'Cancelado' || t.taskStatus?.isCanceled)) {
            return true
          }
          return false
        })

        const isHidden = hiddenColumns.includes(col.status) || (col.id ? hiddenColumns.includes(String(col.id)) : false)
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
            key={col.id ? `col-${col.id}` : `col-${col.status}`}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            style={{
              borderColor: isOver ? col.color : `${col.color}35`,
            }}
            className={`flex flex-col rounded-3xl border transition-all duration-200 h-[680px] lg:h-[calc(100vh-270px)] lg:min-h-[520px] overflow-hidden bg-surface/60 backdrop-blur-md shadow-xs ${
              isWideBoard ? 'w-80 shrink-0' : 'w-full'
            } ${isHidden ? 'opacity-70 ring-1 ring-amber-500/30' : ''} ${
              isOver ? 'ring-2 ring-brand/30 bg-brand/5' : ''
            }`}
          >
            {/* Column Header */}
            <div className="shrink-0 flex items-center justify-between p-3.5 border-b border-border-soft bg-surface/40">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${col.color}20`,
                    color: col.color,
                  }}
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
                  onClick={() => onAddTaskToStatus(col.status, col.id)}
                  title={`Adicionar tarefa em ${col.label}`}
                  className="w-7 h-7 rounded-lg border border-border-soft bg-surface flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Column options menu */}
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
                        {col.rawStatus && onEditStatus && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setColumnMenuOpen(null)
                              onEditStatus(col.rawStatus!)
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-surface-sunken transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted" />
                            <span>Editar Status</span>
                          </button>
                        )}

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
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-amber-500 hover:bg-surface-sunken transition-colors"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar coluna</span>
                          </button>
                        )}

                        {col.rawStatus && onDeleteStatus && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setColumnMenuOpen(null)
                              onDeleteStatus(col.rawStatus!)
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-surface-sunken transition-colors border-t border-border-soft mt-1 pt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir Status</span>
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
                  onDelete={onDeleteTask}
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
                    onClick={() => onAddTaskToStatus(col.status, col.id)}
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

      {/* Add new column button */}
      {onOpenCreateStatus && (
        <button
          type="button"
          onClick={onOpenCreateStatus}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border-soft hover:border-brand/50 hover:bg-brand/5 text-muted hover:text-brand transition-all duration-200 h-[680px] lg:h-[calc(100vh-270px)] lg:min-h-[520px] w-72 shrink-0 p-6 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border-soft flex items-center justify-center text-muted group-hover:text-brand group-hover:border-brand/40 group-hover:scale-110 transition-all mb-3 shadow-xs">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-semibold text-sm">Novo Status</span>
          <span className="text-xs text-muted text-center mt-1">
            Adicione uma nova coluna ao quadro da sua organização
          </span>
        </button>
      )}
    </div>
  )
}
