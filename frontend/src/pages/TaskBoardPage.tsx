import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  List,
  MoreVertical,
  Plus,
  XCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import type { Project } from '../services/projectService'
import { categoryService } from '../services/categoryService'
import type { Category } from '../types/category'
import { cn } from '../lib/utils'
import type { TaskResponse, TaskStatus } from '../types/task'
import { TaskTimer } from '../components/TaskTimer'
import { TaskFilterBar, DEFAULT_TASK_FILTERS } from '../components/TaskFilterBar'
import type { TaskFilters } from '../components/TaskFilterBar'
import { CategoryBadge } from '../components/CategoryBadge'
import { useAuth } from '../contexts/AuthContext'

const COLUMNS: { id: TaskStatus; label: string; icon: any; color: string }[] = [
  { id: 'NOT_STARTED', label: 'Pendente', icon: AlertCircle, color: 'text-text-muted' },
  { id: 'IN_PROGRESS', label: 'Em Andamento', icon: Clock, color: 'text-warning' },
  { id: 'COMPLETED', label: 'Concluída', icon: CheckCircle2, color: 'text-success' },
  { id: 'CANCELED', label: 'Cancelada', icon: XCircle, color: 'text-danger' },
]

export function TaskBoardPage() {
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS)
  const navigate = useNavigate()
  const { activeOrg } = useAuth()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadTasks = async (currentFilters: TaskFilters, silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const response = await taskService.getMyTasks({
        text: currentFilters.searchQuery || undefined,
        projectId: currentFilters.projectId !== 'ALL' ? currentFilters.projectId : undefined,
        statuses: currentFilters.statuses.length > 0 ? currentFilters.statuses : undefined,
        categoryIds: currentFilters.categoryIds.length > 0 ? currentFilters.categoryIds : undefined,
      })
      setTasks(response)
    } catch (error) {
      console.error('Erro ao carregar tarefas', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTasks(filters)
    if (activeOrg) {
      projectService.listByOrganization(activeOrg.id).then(setProjects).catch(() => {})
      categoryService.listByOrganization(activeOrg.id).then(setCategories).catch(() => {})
    }
  }, [])

  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void loadTasks(newFilters)
    }, 300)
  }

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

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t,
    )
    setTasks(updatedTasks)

    try {
      await taskService.updateTaskStatus(taskId, newStatus)
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa', error)
      void loadTasks(filters, true)
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
          <div className="flex items-center rounded-xl border border-border-soft bg-surface p-1 shadow-sm">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-text-muted transition-all hover:bg-surface-muted hover:text-text-main"
            >
              <List size={14} />
              Lista
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white">
              <AlertCircle size={14} />
              Quadro
            </span>
          </div>
          <Link
            to="/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-strong active:scale-95"
          >
            <Plus size={20} />
            Nova Tarefa
          </Link>
        </div>
      </div>

      <TaskFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        projects={projects}
        categories={categories}
        isLoading={isLoading}
        onRefresh={() => void loadTasks(filters)}
      />

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
                <button className="text-text-muted transition-colors hover:text-text-main">
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
                        ? 'border-dashed border-brand/20 bg-brand/5'
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
                            onClick={() => navigate(`/edit/${task.id}`)}
                            className={cn(
                              'group cursor-pointer rounded-2xl border border-border-soft bg-surface p-4 shadow-sm transition-all',
                              snapshot.isDragging
                                ? 'shadow-2xl ring-2 ring-brand/20'
                                : 'hover:border-brand/30',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold leading-tight text-text-main transition-colors group-hover:text-brand">
                                {task.title}
                              </h3>
                            </div>
                            {task.description && (
                              <p className="mt-2 line-clamp-2 text-xs text-text-muted">
                                {task.description}
                              </p>
                            )}

                            <div className="mt-4 space-y-4">
                              <TaskTimer task={task} onUpdate={() => loadTasks(filters, true)} />

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                    <AlertCircle size={12} className="text-brand" />
                                    {task.project?.name || 'Geral'}
                                  </div>
                                  <CategoryBadge category={task.category} />
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
