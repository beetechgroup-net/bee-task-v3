import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Tag,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { taskService } from '../services/taskService'
import { cn } from '../lib/utils'
import { TASK_STATUS_LABELS } from '../types/task'
import type { TaskResponse } from '../types/task'

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

import { TaskTimer } from '../components/TaskTimer'

export function TaskListPage() {
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL')

  const loadTasks = async (silent = false) => {
    if (!silent) setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await taskService.getTasks()
      setTasks(response)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as tarefas.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTasks()
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tasks, searchQuery, statusFilter])



  return (
    <div className="space-y-8 pb-12">
      {/* Header & Action */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-main">
            Gerenciamento de Tarefas
          </h1>
          <p className="text-text-muted">
            Visualize e organize suas atividades em tempo real.
          </p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-strong active:scale-95"
        >
          <Plus size={20} />
          Criar Tarefa
        </Link>
      </div>



      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar tarefas por título, projeto ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-border-soft bg-app-bg pl-10 pr-4 text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          <Filter size={18} className="mr-2 text-text-muted shrink-0" />
          {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-all',
                  statusFilter === status
                    ? 'bg-brand text-white'
                    : 'bg-app-bg text-text-muted hover:bg-surface-muted hover:text-text-main',
                )}
              >
                {status === 'ALL' ? 'Todos' : TASK_STATUS_LABELS[status]}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => void loadTasks()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-app-bg text-text-muted transition-all hover:bg-surface-muted hover:text-brand"
          title="Recarregar"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Task List */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, i) => {
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
                className="group relative flex flex-col rounded-[2rem] border border-border-soft bg-surface p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-brand/5"
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
                  <span className="font-mono text-[10px] font-bold text-text-muted group-hover:text-brand transition-colors">
                    #{task.id}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold leading-tight text-text-main group-hover:text-brand transition-colors text-ellipsis overflow-hidden">
                  {task.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted line-clamp-3">
                  {task.description || 'Sem descrição informada.'}
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <TaskTimer task={task} onUpdate={() => loadTasks(true)} />

                  <div className="flex flex-wrap items-center gap-3 border-t border-border-soft/50 pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                      <Tag size={14} className="text-brand" />
                      {task.project || 'Geral'}
                    </div>
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

      {/* Empty States */}
      {!isLoading && filteredTasks.length === 0 && (
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
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('ALL')
            }}
            className="mt-6 text-sm font-bold text-brand hover:underline"
          >
            Limpar todos os filtros
          </button>
        </motion.div>
      )}

      {/* Loading State */}
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
