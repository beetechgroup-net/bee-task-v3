import { useState, useRef, useEffect, useLayoutEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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
  label?: string
}

/**
 * CustomSelect com estética e tokens do HeroUI v3:
 * - Acabamento bordered com backdrop-blur suave
 * - Foco dinâmico com ring colorido e leve elevação
 * - Popover em glassmorphism com animação de zoom/fade
 * - Itens com highlight de hover e seleção com checkmark
 * - Renderização via Portal (document.body) com z-index de nível superior (z-[9999]),
 *   evitando que o menu fique atrás de outros componentes, cards, modais ou tabelas.
 */
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
  label,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{
    top?: number
    bottom?: number
    left: number
    width: number
    openUpwards: boolean
  } | null>(null)

  // Opção atualmente selecionada
  const selectedOption = options.find((opt) => opt.value === value)

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()

    // Elemento oculto ou desmontado
    if (rect.width === 0 && rect.height === 0) return

    // Se saiu completamente da viewport ao rolar
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false)
      return
    }

    const estimatedHeight = Math.min(options.length * 44 + 20, 260)
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    const openUpwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow

    const width = Math.max(rect.width, 180)
    let left = rect.left

    // Evitar transbordar para fora da tela no mobile / resoluções estreitas
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8)
    }

    if (openUpwards) {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        width,
        openUpwards: true,
      })
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        width,
        openUpwards: false,
      })
    }
  }, [options.length])

  // Atualizar posição antes do primeiro paint ao abrir
  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition()
    }
  }, [isOpen, updatePosition])

  // Acompanhar resize e scroll de qualquer elemento pai (modal, window, tabela)
  useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => {
      updatePosition()
    }

    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('scroll', handleScrollOrResize, true)

    return () => {
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
    }
  }, [isOpen, updatePosition])

  // Fechar ao clicar fora (verificando tanto o container quanto o portal)
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
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

  // Fechar ao pressionar Escape
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
    <div
      ref={containerRef}
      className={`relative w-full text-left ${isOpen ? 'z-30' : ''} ${className}`}
    >
      {/* Label opcional no estilo HeroUI */}
      {label && (
        <label className="block text-xs font-bold text-foreground mb-1.5 tracking-tight">
          {label}
        </label>
      )}

      {/* Trigger Button - Estilo HeroUI v3 Bordered / Faint */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl sm:rounded-2xl border bg-surface/80 dark:bg-zinc-900/60 backdrop-blur-md text-foreground transition-all duration-200 outline-hidden select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-brand ring-2 ring-brand/25 shadow-sm shadow-brand/10 bg-surface'
            : 'border-border-soft hover:border-brand/40 hover:bg-surface-raised active:scale-[0.995]'
        } ${isSmall ? 'min-h-[34px] px-3 py-1 text-xs' : 'min-h-[42px] px-3.5 py-2 text-xs sm:text-sm'} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
          {/* Custom Left Icon */}
          {leftIcon && <span className="text-muted shrink-0 flex items-center">{leftIcon}</span>}

          {/* Option's custom dot color */}
          {selectedOption?.color && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-2 ring-surface"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}

          {/* Option's custom icon */}
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center">{selectedOption.icon}</span>
          )}

          {/* Label or Placeholder */}
          {selectedOption ? (
            <span className="truncate font-semibold text-foreground tracking-tight">
              {selectedOption.label}
            </span>
          ) : (
            <span className="truncate text-muted/80 font-normal">{placeholder}</span>
          )}
        </div>

        {/* Chevron Icon - HeroUI animated rotation */}
        <div className="shrink-0 pl-1">
          <ChevronDown
            className={`w-4 h-4 text-muted transition-transform duration-250 ease-out ${
              isOpen ? 'rotate-180 text-brand' : 'group-hover:text-foreground'
            }`}
          />
        </div>
      </button>

      {/* Popover ListBox - Renderizado no body via createPortal para z-index absoluto */}
      {isOpen &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            role="listbox"
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : 'auto',
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
            className={`max-h-64 overflow-y-auto rounded-2xl border border-border-soft bg-surface/95 dark:bg-zinc-900/95 backdrop-blur-xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ease-out ${
              coords.openUpwards ? 'origin-bottom' : 'origin-top'
            }`}
          >
            <div className="space-y-0.5">
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-brand/15 text-brand font-bold shadow-xs'
                        : 'text-foreground hover:bg-brand/10 hover:text-brand'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                      {/* Colored dot */}
                      {option.color && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-surface"
                          style={{ backgroundColor: option.color }}
                        />
                      )}

                      {/* Icon */}
                      {option.icon && (
                        <span className="shrink-0 flex items-center">{option.icon}</span>
                      )}

                      {/* Label and description */}
                      <div className="truncate flex-1 min-w-0">
                        <p className="truncate leading-tight">{option.label}</p>
                        {option.description && (
                          <p className="text-[10px] text-muted truncate mt-0.5 font-normal">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Checkmark indicator for selected item */}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-brand shrink-0 ml-1.5" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
