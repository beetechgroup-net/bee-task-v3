import React from 'react'
import { Plus, CheckCircle2, Clock, CircleDot, AlertCircle, Ban } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { TaskCard } from './TaskCard'
import { calculateTaskTotalSeconds, formatSecondsToHuman } from '../../lib/timeUtils'

interface TaskKanbanViewProps {
  tasks: Task[]
  onToggleTimer: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
  onEditTask: (task: Task) => void
  onAddTaskToStatus: (status: TaskStatus) => void
  activeTaskId?: number | null
  activeTaskSeconds?: number
}

interface ColumnDef {
  status: TaskStatus
  label: string
  icon: React.ElementType
  colorClass: string
  bgLightClass: string
  borderColor: string
}

const COLUMNS: ColumnDef[] = [
  {
    status: 'NOT_STARTED',
    label: 'A Fazer',
    icon: CircleDot,
    colorClass: 'text-zinc-400',
    bgLightClass: 'bg-zinc-500/10',
    borderColor: 'border-zinc-800',
  },
  {
    status: 'IN_PROGRESS',
    label: 'Em Andamento',
    icon: Clock,
    colorClass: 'text-teal-400',
    bgLightClass: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
  },
  {
    status: 'COMPLETED',
    label: 'Concluído',
    icon: CheckCircle2,
    colorClass: 'text-emerald-400',
    bgLightClass: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    status: 'CANCELED',
    label: 'Cancelado',
    icon: Ban,
    colorClass: 'text-rose-400',
    bgLightClass: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
]

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onToggleTimer,
  onStatusChange,
  onEditTask,
  onAddTaskToStatus,
  activeTaskId,
  activeTaskSeconds,
}) => {
  const [dragOverColumn, setDragOverColumn] = React.useState<TaskStatus | null>(null)

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-6">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status)
        const colTotalSeconds = columnTasks.reduce(
          (acc, t) => acc + calculateTaskTotalSeconds(t),
          0
        )
        const Icon = col.icon
        const isOver = dragOverColumn === col.status

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[480px] bg-surface-sunken/40 ${
              isOver
                ? 'border-brand ring-2 ring-brand/30 bg-brand/5'
                : col.borderColor
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg ${col.bgLightClass} flex items-center justify-center ${col.colorClass}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs tracking-tight text-foreground flex items-center gap-2">
                    {col.label}
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-raised border border-border text-muted">
                      {columnTasks.length}
                    </span>
                  </h3>
                  {colTotalSeconds > 0 && (
                    <span className="text-[10px] text-muted font-mono">
                      {formatSecondsToHuman(colTotalSeconds)} investidos
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddTaskToStatus(col.status)}
                title={`Adicionar tarefa em ${col.label}`}
                className="w-7 h-7 rounded-lg border border-border bg-surface flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Body / Cards List */}
            <div className="flex-1 p-3 flex flex-col gap-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleTimer={onToggleTimer}
                  onStatusChange={onStatusChange}
                  onEdit={onEditTask}
                  isTrackingThis={activeTaskId === task.id}
                  currentSeconds={activeTaskId === task.id ? activeTaskSeconds : undefined}
                />
              ))}

              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/60">
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
