import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption<T = string | number> {
  value: T
  label: string
  icon?: ReactNode
  color?: string
  badgeClass?: string
  description?: string
}

export interface CustomSelectProps<T = string | number> {
  value: T | undefined
  onChange: (value: T) => void
  options: SelectOption<T>[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
  leftIcon?: ReactNode
  size?: 'sm' | 'md'
}

export function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  className = '',
  triggerClassName = '',
  disabled = false,
  leftIcon,
  size = 'md',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value)

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = (optValue: T) => {
    onChange(optValue)
    setIsOpen(false)
  }

  const isSmall = size === 'sm'

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border border-border-soft bg-surface-raised/90 backdrop-blur-md text-foreground transition-all duration-200 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          isOpen
            ? 'border-brand ring-2 ring-brand/20 shadow-xs'
            : 'hover:border-brand/40 hover:bg-surface-raised'
        } ${isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2.5 text-xs'} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {/* Custom Left Icon if supplied */}
          {leftIcon && <span className="text-muted shrink-0">{leftIcon}</span>}

          {/* Option's custom icon or colored dot */}
          {selectedOption?.color && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}

          {/* Label or Placeholder */}
          {selectedOption ? (
            <span className="truncate font-medium text-foreground">
              {selectedOption.label}
            </span>
          ) : (
            <span className="truncate text-muted">{placeholder}</span>
          )}
        </div>

        {/* Chevron Indicator */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-brand' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 min-w-[200px] max-h-64 overflow-y-auto rounded-2xl border border-border-soft bg-surface/95 backdrop-blur-xl p-1.5 shadow-panel animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand/12 text-brand font-semibold'
                      : 'text-foreground hover:bg-surface-raised hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {/* Colored dot */}
                    {option.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: option.color }}
                      />
                    )}

                    {/* Icon */}
                    {option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}

                    {/* Label and optional description */}
                    <div className="truncate">
                      <p className="truncate leading-tight">{option.label}</p>
                      {option.description && (
                        <p className="text-[10px] text-muted truncate mt-0.5 font-normal">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checkmark indicator */}
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
