import { Filter, RefreshCw, Search } from 'lucide-react'
import { TASK_STATUS_LABELS, TASK_STATUS_OPTIONS, type TaskStatus } from '../types/task'
import type { Project } from '../services/projectService'
import type { Category } from '../types/category'
import { MultiSelectChips } from './MultiSelectChips'
import { CategoryIcon } from './CategoryIcon'
import { MultiSelectDropdown } from './MultiSelectDropdown'
import type { TaskFilters } from './taskFilters'
import type { TaskAssignee } from '../types/task'
import { UserAvatar } from './UserAvatar'

const STATUS_CHIP_COLORS: Record<TaskStatus, string> = {
  NOT_STARTED: '#94a3b8',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#10b981',
  CANCELED: '#ef4444',
}

interface TaskFilterBarProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  projects: Project[]
  categories: Category[]
  assignees: TaskAssignee[]
  isLoading?: boolean
  onRefresh?: () => void
}

export function TaskFilterBar({
  filters,
  onFiltersChange,
  projects,
  categories,
  assignees,
  isLoading,
  onRefresh,
}: TaskFilterBarProps) {
  const update = (partial: Partial<TaskFilters>) =>
    onFiltersChange({ ...filters, ...partial })

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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

      {projects.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter size={16} className="shrink-0 text-text-muted" />
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted whitespace-nowrap">Projetos</span>
          <MultiSelectChips
            options={projects.map((p) => ({
              value: p.id,
              label: p.name,
              color: p.color ?? undefined,
              icon: p.icon ? <CategoryIcon iconName={p.icon} size={14} /> : undefined,
            }))}
            selected={filters.projectIds}
            onChange={(projectIds) => update({ projectIds })}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Filter size={16} className="shrink-0 text-text-muted" />
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted whitespace-nowrap">Status</span>
        <MultiSelectChips
          options={TASK_STATUS_OPTIONS.map((s) => ({
            value: s,
            label: TASK_STATUS_LABELS[s],
            color: STATUS_CHIP_COLORS[s],
          }))}
          selected={filters.statuses}
          onChange={(statuses) => update({ statuses })}
        />
      </div>

      {assignees.length > 0 && (
        <div className="grid gap-3">
          <MultiSelectDropdown
            label="Funcionario"
            allLabel="Todos os funcionarios"
            options={assignees.map((assignee) => ({
              value: assignee.id,
              label: assignee.name,
              icon: <UserAvatar name={assignee.name} photo={assignee.photo} size="sm" />,
            }))}
            selected={filters.userIds}
            onChange={(userIds) => update({ userIds })}
          />
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter size={16} className="shrink-0 text-text-muted" />
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted whitespace-nowrap">Categorias</span>
          <MultiSelectChips
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
              color: c.color,
              icon: <CategoryIcon iconName={c.icon} size={14} />,
            }))}
            selected={filters.categoryIds}
            onChange={(categoryIds) => update({ categoryIds })}
          />
        </div>
      )}
    </div>
  )
}
