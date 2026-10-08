import { RefreshCw, Search } from 'lucide-react'
import { TASK_STATUS_LABELS, TASK_STATUS_OPTIONS, type TaskStatus } from '../types/task'
import type { Project } from '../services/projectService'
import type { Category } from '../types/category'
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
  currentUserId?: number
  isLoading?: boolean
  onRefresh?: () => void
}

export function TaskFilterBar({
  filters,
  onFiltersChange,
  projects,
  categories,
  assignees,
  currentUserId,
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projects.length > 0 && (
          <MultiSelectDropdown
            label="Projetos"
            allLabel="Todos os projetos"
            options={projects.map((p) => ({
              value: p.id,
              label: p.name,
              icon: p.icon ? <CategoryIcon iconName={p.icon} size={14} /> : undefined,
            }))}
            selected={filters.projectIds}
            onChange={(projectIds) => update({ projectIds })}
          />
        )}

        <MultiSelectDropdown
          label="Status"
          allLabel="Todos os status"
          options={TASK_STATUS_OPTIONS.map((s) => ({
            value: s,
            label: TASK_STATUS_LABELS[s],
            icon: (
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_CHIP_COLORS[s] }}
              />
            ),
          }))}
          selected={filters.statuses}
          onChange={(statuses) => update({ statuses })}
        />

        {categories.length > 0 && (
          <MultiSelectDropdown
            label="Categorias"
            allLabel="Todas as categorias"
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
              icon: <CategoryIcon iconName={c.icon} size={14} />,
            }))}
            selected={filters.categoryIds}
            onChange={(categoryIds) => update({ categoryIds })}
          />
        )}

        {assignees.length > 0 && (
          <div className="flex flex-col gap-2">
            <MultiSelectDropdown
              label="Funcionário"
              allLabel="Todos os funcionários"
              options={assignees.map((assignee) => ({
                value: assignee.id,
                label: assignee.name,
                icon: <UserAvatar name={assignee.name} photo={assignee.photo} size="sm" />,
              }))}
              selected={filters.userIds}
              onChange={(userIds) => update({ userIds })}
            />
            {currentUserId !== undefined && (
              <label className="flex cursor-pointer items-center gap-2 self-start">
                <input
                  type="checkbox"
                  checked={filters.userIds.length === 1 && filters.userIds[0] === currentUserId}
                  onChange={(e) =>
                    update({ userIds: e.target.checked ? [currentUserId] : [] })
                  }
                  className="h-4 w-4 accent-brand"
                />
                <span className="text-xs font-semibold text-text-muted">
                  Mostrar apenas as minhas
                </span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
