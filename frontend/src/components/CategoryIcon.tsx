import * as LucideIcons from 'lucide-react'
import { Tag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CategoryIconProps {
  iconName?: string | null
  color?: string | null
  size?: number
  className?: string
}

export function CategoryIcon({ iconName, color, size = 16, className }: CategoryIconProps) {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  const IconComponent = (iconName && icons[iconName]) || Tag
  return <IconComponent size={size} color={color ?? undefined} className={className} />
}
