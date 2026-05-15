import { useMemo, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'

interface IconPickerProps {
  value: string
  onChange: (iconName: string) => void
  color?: string
}

const EXCLUDED = new Set(['createLucideIcon', 'icons', 'default', 'Icon', 'LucideIcon'])

function getAllIconNames(): string[] {
  const icons = LucideIcons as unknown as Record<string, unknown>
  return Object.keys(icons)
    .filter((name) => /^[A-Z]/.test(name))
    .filter((name) => !EXCLUDED.has(name))
    .filter((name) => !name.endsWith('Icon'))
    .sort()
}

const ALL_ICON_NAMES = getAllIconNames()
const MAX_VISIBLE = 144

export function IconPicker({ value, onChange, color }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const icons = LucideIcons as unknown as Record<string, LucideIcon>

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ALL_ICON_NAMES.slice(0, MAX_VISIBLE)
    return ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(q)).slice(0, MAX_VISIBLE)
  }, [search])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          size={16}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ícone..."
          className="h-10 w-full rounded-xl border border-border-soft bg-app-bg pl-10 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
        />
      </div>
      <div className="grid grid-cols-8 gap-1.5 max-h-60 overflow-y-auto rounded-xl border border-border-soft bg-app-bg p-2">
        {filtered.map((name) => {
          const Icon = icons[name]
          if (!Icon) return null
          const selected = value === name
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              title={name}
              className={cn(
                'flex items-center justify-center rounded-lg p-2 transition-all',
                selected
                  ? 'bg-brand text-white shadow-md shadow-brand/30'
                  : 'text-text-muted hover:bg-surface-muted hover:text-text-main',
              )}
              style={selected && color ? { background: color, color: '#fff' } : undefined}
            >
              <Icon size={18} />
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="col-span-8 py-6 text-center text-xs font-bold text-text-muted">
            Nenhum ícone encontrado.
          </p>
        )}
      </div>
      {value && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Selecionado: <span className="text-text-main">{value}</span>
        </p>
      )}
    </div>
  )
}
