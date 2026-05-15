import { Filter, RefreshCw, Search } from 'lucide-react'
import { cn } from '../lib/utils'
import type { TaskStatus } from '../types/task'
import { TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from '../types/task'
import type { Project } from '../services/projectService'

export interface TaskFilters {
  searchQuery: string
  statusFilter: TaskStatus | 'ALL'
  projectId: number | 'ALL'
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  searchQuery: '',
  statusFilter: 'ALL',
  projectId: 'ALL',
}

interface TaskFilterBarProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  projects: Project[]
  isLoading?: boolean
  onRefresh?: () => void
}

export function TaskFilterBar({
  filters,
  onFiltersChange,
  projects,
  isLoading,
  onRefresh,
}: TaskFilterBarProps) {
  const update = (partial: Partial<TaskFilters>) =>
    onFiltersChange({ ...filters, ...partial })

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-4 shadow-sm lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por título ou descrição..."
          value={filters.searchQuery}
          onChange={(e) => update({ searchQuery: e.target.value })}
          className="h-11 w-full rounded-xl border border-border-soft bg-app-bg pl-10 pr-4 text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
        />
      </div>

      {projects.length > 0 && (
        <select
          value={filters.projectId}
          onChange={(e) =>
            update({
              projectId: e.target.value === 'ALL' ? 'ALL' : Number(e.target.value),
            })
          }
          className="h-11 rounded-xl border border-border-soft bg-app-bg px-3 text-sm text-text-main outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
        >
          <option value="ALL">Todos os projetos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
        <Filter size={18} className="mr-2 shrink-0 text-text-muted" />
        {(['ALL', ...TASK_STATUS_OPTIONS] as const).map((status) => (
          <button
            key={status}
            onClick={() => update({ statusFilter: status })}
            className={cn(
              'whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-all',
              filters.statusFilter === status
                ? 'bg-brand text-white'
                : 'bg-app-bg text-text-muted hover:bg-surface-muted hover:text-text-main',
            )}
          >
            {status === 'ALL' ? 'Todos' : TASK_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-app-bg text-text-muted transition-all hover:bg-surface-muted hover:text-brand"
          title="Recarregar"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  )
}
