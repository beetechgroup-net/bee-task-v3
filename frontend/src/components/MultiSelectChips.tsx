import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

export interface MultiSelectOption<T extends string | number> {
  value: T
  label: string
  icon?: ReactNode
  color?: string
}

interface MultiSelectChipsProps<T extends string | number> {
  options: MultiSelectOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
  emptyLabel?: string
}

export function MultiSelectChips<T extends string | number>({
  options,
  selected,
  onChange,
  emptyLabel = 'Todos',
}: MultiSelectChipsProps<T>) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const allSelected = selected.length === 0

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onChange([])}
        className={cn(
          'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
          allSelected
            ? 'bg-brand text-white'
            : 'bg-app-bg text-text-muted hover:bg-surface-muted hover:text-text-main',
        )}
      >
        {emptyLabel}
      </button>
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => toggle(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              isSelected
                ? 'bg-brand text-white'
                : 'bg-app-bg text-text-muted hover:bg-surface-muted hover:text-text-main',
            )}
            style={isSelected && option.color ? { background: option.color, color: '#fff' } : undefined}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
