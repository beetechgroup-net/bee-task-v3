import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Columns,
  List,
  Plus,
  Search,
  Tag,
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
import type { TaskResponse } from '../types/task'
import { TaskTimer } from '../components/TaskTimer'
import { TaskFilterBar } from '../components/TaskFilterBar'
import { DEFAULT_TASK_FILTERS, type TaskFilters } from '../components/taskFilters'
import { CategoryBadge } from '../components/CategoryBadge'
import { useAuth } from '../contexts/AuthContext'

function getStatusConfig(status: TaskResponse['status']) {
  switch (status) {
    case 'COMPLETED':
      return {
        tone: 'bg-success-soft text-success border-success/20',
        icon: CheckCircle2,
        label: 'Concluído',
      }
    case 'IN_PROGRESS':
      return {
        tone: 'bg-warning-soft text-warning border-warning/20',
        icon: Clock,
        label: 'Em Andamento',
      }
    case 'CANCELED':
      return {
        tone: 'bg-danger-soft text-danger border-danger/20',
        icon: XCircle,
        label: 'Cancelado',
      }
    default:
      return {
        tone: 'bg-surface-muted text-text-muted border-border-soft',
        icon: AlertCircle,
        label: 'Pendente',
      }
  }
}

export function TaskListPage() {
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
        projectIds: currentFilters.projectIds.length > 0 ? currentFilters.projectIds : undefined,
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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-main">
            Gerenciamento de Tarefas
          </h1>
          <p className="text-text-muted">
            Visualize e organize suas atividades em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-border-soft bg-surface p-1 shadow-sm">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white">
              <List size={14} />
              Lista
            </span>
            <Link
              to="/board"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-text-muted transition-all hover:bg-surface-muted hover:text-text-main"
            >
              <Columns size={14} />
              Quadro
            </Link>
          </div>
          <Link
            to="/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-strong active:scale-95"
          >
            <Plus size={20} />
            Criar Tarefa
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => {
            const config = getStatusConfig(task.status)
            const StatusIcon = config.icon

            return (
              <motion.article
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={task.id}
                onClick={() => navigate(`/edit/${task.id}`)}
                className="group relative flex cursor-pointer flex-col rounded-[2rem] border border-border-soft bg-surface p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-brand/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider',
                      config.tone,
                    )}
                  >
                    <StatusIcon size={12} />
                    {config.label}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-text-muted transition-colors group-hover:text-brand">
                    #{task.id}
                  </span>
                </div>

                <h3 className="mt-4 overflow-hidden text-ellipsis text-lg font-bold leading-tight text-text-main transition-colors group-hover:text-brand">
                  {task.title}
                </h3>

                <p className="mt-2 flex-1 line-clamp-3 text-sm leading-relaxed text-text-muted">
                  {task.description || 'Sem descrição informada.'}
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <TaskTimer task={task} onUpdate={() => loadTasks(filters, true)} />

                  <div className="flex flex-wrap items-center gap-3 border-t border-border-soft/50 pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                      <Tag size={14} className="text-brand" />
                      {task.project?.name || 'Geral'}
                    </div>
                    {task.category && (
                      <>
                        <div className="h-4 w-px bg-border-soft" />
                        <CategoryBadge category={task.category} />
                      </>
                    )}
                    <div className="h-4 w-px bg-border-soft" />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                      <Calendar size={14} className="text-accent" />
                      {task.history?.length ?? 0} registros
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>
      </div>

      {!isLoading && tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border-soft bg-surface/50 py-20 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-app-bg text-text-muted">
            <Search size={40} />
          </div>
          <h3 className="mt-6 text-xl font-bold text-text-main">
            Nenhuma tarefa encontrada
          </h3>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            Tente ajustar seus filtros ou busque por outro termo para encontrar o que
            procura.
          </p>
          <button
            onClick={() => handleFiltersChange(DEFAULT_TASK_FILTERS)}
            className="mt-6 text-sm font-bold text-brand hover:underline"
          >
            Limpar todos os filtros
          </button>
        </motion.div>
      )}

      {isLoading && tasks.length === 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-[2rem] border border-border-soft bg-surface-muted"
            />
          ))}
        </div>
      )}
    </div>
  )
}
