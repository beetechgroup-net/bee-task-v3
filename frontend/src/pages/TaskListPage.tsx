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
import { Link, useNavigate } from 'react-router-dom'

import type { TaskResponse } from '../types/task'
import { cn } from '../lib/utils'
import { TaskTimer } from '../components/TaskTimer'
import { TaskFilterBar } from '../components/TaskFilterBar'
import { DEFAULT_TASK_FILTERS } from '../components/taskFilters'
import { CategoryBadge } from '../components/CategoryBadge'
import { UserAvatar } from '../components/UserAvatar'
import { useAuth } from '../contexts/AuthContext'
import { useTaskPage } from '../hooks/useTaskPage'

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
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    tasks,
    isLoading,
    projects,
    categories,
    assignees,
    filters,
    currentUserAssigneeId,
    loadTasks,
    handleFiltersChange,
  } = useTaskPage({ fetchProjects: true })

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
        assignees={assignees}
        currentUserId={currentUserAssigneeId ?? undefined}
        isLoading={isLoading}
        onRefresh={() => void loadTasks(filters)}
      />

      <div className="flex border-b border-border-soft overflow-x-auto hide-scrollbar mb-4">
        {[
          { label: 'Todas', value: null },
          { label: 'Pendente', value: 'NOT_STARTED' },
          { label: 'Em andamento', value: 'IN_PROGRESS' },
          { label: 'Finalizada', value: 'COMPLETED' },
          { label: 'Cancelada', value: 'CANCELED' },
        ].map((tab) => {
          const isActive =
            tab.value === null
              ? filters.statuses.length === 0
              : filters.statuses.includes(tab.value as any) && filters.statuses.length === 1

          return (
            <button
              key={tab.label}
              onClick={() =>
                handleFiltersChange({
                  ...filters,
                  statuses: tab.value ? [tab.value as any] : [],
                })
              }
              className={cn(
                'px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-muted hover:text-text-main hover:border-border-soft'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => {
            const config = getStatusConfig(task.status)
            const StatusIcon = config.icon
            const canControlTimer = Boolean(user?.email && task.user?.email === user.email)

            return (
              <motion.article
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={task.id}
                onClick={() => navigate(`/edit/${task.id}`)}
                className="group relative flex cursor-pointer flex-col md:flex-row md:items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 shadow-sm transition-all hover:shadow-md hover:border-brand/30"
              >
                <div className="flex items-center gap-3 md:w-48 shrink-0">
                  <div
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider',
                      config.tone,
                    )}
                    title={config.label}
                  >
                    <StatusIcon size={12} />
                    <span className="hidden md:inline">{config.label}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-text-muted transition-colors group-hover:text-brand">
                    #{task.id}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-base font-bold text-text-main transition-colors group-hover:text-brand">
                    {task.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-medium">
                      <Tag size={12} className="text-brand" />
                      {task.project?.name || 'Geral'}
                    </span>
                    {task.category && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-border-soft" />
                        <CategoryBadge category={task.category} />
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-border-soft" />
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar size={12} className="text-accent" />
                      {task.history?.length ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 md:ml-auto">
                  <div onClick={(e) => e.stopPropagation()}>
                    <TaskTimer
                      task={task}
                      canControl={canControlTimer}
                      onUpdate={() => loadTasks(filters, true)}
                    />
                  </div>

                  {task.user && (
                    <div className="flex items-center justify-end gap-2 text-xs font-bold text-text-muted">
                      <UserAvatar name={task.user.name} photo={task.user.photo} size="sm" />
                    </div>
                  )}
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
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-border-soft bg-surface-muted"
            />
          ))}
        </div>
      )}
    </div>
  )
}
