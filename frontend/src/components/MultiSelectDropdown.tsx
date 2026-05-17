import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '../lib/utils'

export interface MultiSelectDropdownOption<T extends string | number> {
  value: T
  label: string
  icon?: ReactNode
}

interface MultiSelectDropdownProps<T extends string | number> {
  label: string
  allLabel: string
  options: MultiSelectDropdownOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
  className?: string
}

export function MultiSelectDropdown<T extends string | number>({
  label,
  allLabel,
  options,
  selected,
  onChange,
  className,
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen])

  const toggleValue = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
      return
    }

    onChange([...selected, value])
  }

  const getSummaryLabel = () => {
    if (selected.length === 0) return allLabel
    if (selected.length === 1) {
      return options.find((option) => option.value === selected[0])?.label ?? allLabel
    }
    return `${selected.length} selecionados`
  }

  return (
    <div ref={containerRef} className={cn('relative min-w-0', className)}>
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-text-muted">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border-soft bg-app-bg px-3 text-left text-sm text-text-main outline-none transition-all',
          'focus:border-brand focus:ring-2 focus:ring-brand/10',
          isOpen && 'border-brand ring-2 ring-brand/10',
        )}
      >
        <span className="truncate">{getSummaryLabel()}</span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-text-muted transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border-soft bg-surface p-2 shadow-xl">
          <button
            type="button"
            onClick={() => onChange([])}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
              selected.length === 0
                ? 'bg-brand/10 font-bold text-brand'
                : 'text-text-muted hover:bg-app-bg hover:text-text-main',
            )}
          >
            <span className="truncate">{allLabel}</span>
            {selected.length > 0 && <X size={14} className="shrink-0" />}
          </button>

          <div className="mt-2 max-h-64 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value)

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                    isSelected
                      ? 'bg-brand text-white'
                      : 'text-text-main hover:bg-app-bg',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </span>
                  <Check
                    size={14}
                    className={cn('shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
