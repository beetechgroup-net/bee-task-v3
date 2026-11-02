import React, { useState, useRef, useEffect } from 'react'
import {
  Calendar,
  ChevronDown,
  Clock,
  Check,
  CalendarRange,
} from 'lucide-react'
import {
  type PeriodPreset,
  type DateRange,
  PERIOD_PRESET_LABELS,
  getDateRangeForPreset,
  formatDatePtBr,
  formatDateYmd,
} from '../../lib/periodUtils'

interface PeriodSelectorProps {
  value: PeriodPreset
  customStart?: string
  customEnd?: string
  onChange: (preset: PeriodPreset, customStart?: string, customEnd?: string) => void
  className?: string
}

const PRIMARY_PRESETS: PeriodPreset[] = ['today', 'this_week', 'this_month', 'last_3_months', 'this_year']

const SECONDARY_PRESETS: PeriodPreset[] = [
  'yesterday',
  'last_week',
  'last_month',
  'last_6_months',
  'all',
]

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  customStart,
  customEnd,
  onChange,
  className = '',
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [customModalOpen, setCustomModalOpen] = useState(false)

  // Local state for custom dates
  const defaultDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      start: customStart || formatDateYmd(firstDay),
      end: customEnd || formatDateYmd(lastDay),
    }
  }

  const [tempStart, setTempStart] = useState(defaultDates().start)
  const [tempEnd, setTempEnd] = useState(defaultDates().end)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const currentRange: DateRange = getDateRangeForPreset(value, customStart, customEnd)

  const handleSelectPreset = (preset: PeriodPreset) => {
    if (preset === 'custom') {
      setCustomModalOpen(true)
      setDropdownOpen(false)
      return
    }
    setDropdownOpen(false)
    onChange(preset)
  }

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempStart || !tempEnd) return
    onChange('custom', tempStart, tempEnd)
    setCustomModalOpen(false)
  }

  const isSecondaryActive = SECONDARY_PRESETS.includes(value)

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-surface/90 border border-border-soft backdrop-blur-md shadow-panel ${className}`}>
      {/* Left: Buttons & Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 text-xs font-bold text-muted mr-1">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          <span className="hidden md:inline">Período:</span>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-surface-sunken border border-border-soft shadow-inner flex-wrap gap-1">
          {PRIMARY_PRESETS.map((p) => {
            const active = value === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-brand text-white shadow-md shadow-brand/25'
                    : 'text-muted hover:text-foreground hover:bg-surface/60'
                }`}
              >
                {PERIOD_PRESET_LABELS[p]}
              </button>
            )
          })}

          {/* More Presets Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isSecondaryActive
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'text-muted hover:text-foreground hover:bg-surface/60'
              }`}
            >
              <span>{isSecondaryActive ? PERIOD_PRESET_LABELS[value] : 'Outros'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-48 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border-soft p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                {SECONDARY_PRESETS.map((p) => {
                  const active = value === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-brand/10 text-brand font-bold'
                          : 'text-foreground hover:bg-surface-raised'
                      }`}
                    >
                      <span>{PERIOD_PRESET_LABELS[p]}</span>
                      {active && <Check className="w-3.5 h-3.5 text-brand" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Custom Date Range Button */}
          <button
            type="button"
            onClick={() => {
              setTempStart(customStart || defaultDates().start)
              setTempEnd(customEnd || defaultDates().end)
              setCustomModalOpen(true)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              value === 'custom'
                ? 'bg-accent text-accent-foreground shadow-md shadow-accent/25'
                : 'text-muted hover:text-foreground hover:bg-surface/60'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Personalizado</span>
          </button>
        </div>
      </div>

      {/* Right: Active Date Range Badge */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-raised border border-border-soft text-xs font-mono font-semibold text-foreground/90 shadow-2xs">
          <Clock className="w-3 h-3 text-brand shrink-0" />
          <span>
            {value === 'all'
              ? 'Todo o Histórico'
              : value === 'today'
              ? `Hoje (${formatDatePtBr(currentRange.startDate)})`
              : value === 'yesterday'
              ? `Ontem (${formatDatePtBr(currentRange.startDate)})`
              : `${formatDatePtBr(currentRange.startDate)} até ${formatDatePtBr(currentRange.endDate)}`}
          </span>
        </span>
      </div>

      {/* Modal / Dialog for Custom Date Range */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-surface border border-border-soft rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
          >
            <div className="flex items-center justify-between p-5 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-accent/15 text-accent border border-accent/25 flex items-center justify-center">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    Definir Período Personalizado
                  </h3>
                  <p className="text-[11px] text-muted">
                    Selecione a data de início e término desejadas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomModalOpen(false)}
                className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Data Inicial</label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Data Final</label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand shadow-xs"
                  />
                </div>
              </div>

              {/* Quick shortcut pills inside modal */}
              <div className="pt-2 border-t border-border-soft/60 space-y-1.5">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Atalhos de Meses:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      label: 'Últimos 30 dias',
                      days: 30,
                    },
                    {
                      label: 'Últimos 60 dias',
                      days: 60,
                    },
                    {
                      label: 'Últimos 90 dias',
                      days: 90,
                    },
                    {
                      label: 'Últimos 180 dias',
                      days: 180,
                    },
                  ].map((shortcut) => (
                    <button
                      key={shortcut.label}
                      type="button"
                      onClick={() => {
                        const now = new Date()
                        const s = new Date(now.getTime() - shortcut.days * 24 * 60 * 60 * 1000)
                        setTempStart(formatDateYmd(s))
                        setTempEnd(formatDateYmd(now))
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface-raised hover:bg-brand/10 hover:text-brand border border-border-soft transition-colors cursor-pointer"
                    >
                      {shortcut.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-strong text-white text-xs font-bold shadow-md shadow-brand/20 transition-all cursor-pointer"
                >
                  Aplicar Período
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
