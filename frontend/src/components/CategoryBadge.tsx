import type { TaskCategory } from '../types/task'
import { CategoryIcon } from './CategoryIcon'

interface CategoryBadgeProps {
  category: TaskCategory | null | undefined
  size?: number
  showLabel?: boolean
}

export function CategoryBadge({ category, size = 14, showLabel = false }: CategoryBadgeProps) {
  if (!category) return null
  return (
    <span
      title={category.name}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold"
      style={{ background: `${category.color}15`, color: category.color }}
    >
      <CategoryIcon iconName={category.icon} color={category.color} size={size} />
      {showLabel && category.name}
    </span>
  )
}
