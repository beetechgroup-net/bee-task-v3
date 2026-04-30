import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus,
  RefreshCw,
  Tag,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { taskService } from '../services/taskService'
import { cn } from '../lib/utils'
import type { TaskResponse, TaskStatus } from '../types/task'

const COLUMNS: { id: TaskStatus; label: string; icon: any; color: string }[] = [
  {
    id: 'NOT_STARTED',
    label: 'Pendente',
    icon: AlertCircle,
    color: 'text-slate-400',
  },
  {
    id: 'IN_PROGRESS',
    label: 'Em Andamento',
    icon: Clock,
    color: 'text-amber-500',
  },
  {
    id: 'COMPLETED',
    label: 'Concluída',
    icon: CheckCircle2,
    color: 'text-emerald-500',
  },
  {
    id: 'CANCELED',
    label: 'Cancelada',
    icon: XCircle,
    color: 'text-rose-500',
  },
]

import { TaskTimer } from '../components/TaskTimer'

export function TaskBoardPage() {
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadTasks = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const response = await taskService.getTasks()
      setTasks(response)
    } catch (error) {
      console.error('Failed to load tasks', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTasks()
  }, [])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const taskId = Number.parseInt(draggableId)
    const newStatus = destination.droppableId as TaskStatus

    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t,
    )
    setTasks(updatedTasks)

    try {
      // Use the new generic status update endpoint
      await taskService.updateTaskStatus(taskId, newStatus)
    } catch (error) {
      console.error('Failed to update task status', error)
      void loadTasks(true) // Revert on error
    }
  }

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status)

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-main">
            Quadro Kanban
          </h1>
          <p className="text-text-muted">
            Arraste e solte as tarefas para atualizar o progresso.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void loadTasks()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface border border-border-soft text-text-muted transition-all hover:bg-surface-muted hover:text-brand"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-strong active:scale-95"
          >
            <Plus size={20} />
            Nova Tarefa
          </Link>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <column.icon size={18} className={column.color} />
                  <h2 className="text-sm font-black uppercase tracking-wider text-text-main">
                    {column.label}  
                  </h2>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-muted px-1.5 text-[10px] font-bold text-text-muted">
                    {tasksByStatus(column.id).length}
                  </span>
                </div>
                <button className="text-text-muted hover:text-text-main transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      'flex min-h-[500px] flex-col gap-3 rounded-[2rem] border-2 border-transparent p-3 transition-colors',
                      snapshot.isDraggingOver
                        ? 'bg-brand/5 border-dashed border-brand/20'
                        : 'bg-surface/50',
                    )}
                  >
                    {tasksByStatus(column.id).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              'group rounded-2xl border border-border-soft bg-surface p-4 shadow-sm transition-all',
                              snapshot.isDragging ? 'shadow-2xl ring-2 ring-brand/20' : 'hover:border-brand/30',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold leading-tight text-text-main group-hover:text-brand transition-colors">
                                {task.title}
                              </h3>
                            </div>
                            {task.description && (
                              <p className="mt-2 text-xs text-text-muted line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="mt-4 space-y-4">
                              <TaskTimer task={task} onUpdate={() => loadTasks(true)} />

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                  <Tag size={12} className="text-brand" />
                                  {task.project || 'Geral'}
                                </div>
                                <span className="font-mono text-[10px] font-bold text-text-muted/50">
                                  #{task.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
