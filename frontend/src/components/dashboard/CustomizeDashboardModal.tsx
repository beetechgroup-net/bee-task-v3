import React, { useState, useEffect } from 'react'
import {
  X,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  TrendingUp,
  Flame,
  Target,
  Zap,
  FolderKanban,
  Sparkles,
} from 'lucide-react'
import type { DashboardCardConfig, DashboardWidgetId } from '../../lib/userPreferences'

interface CustomizeDashboardModalProps {
  isOpen: boolean
  onClose: () => void
  currentCards: DashboardCardConfig[]
  onSave: (cards: DashboardCardConfig[]) => Promise<void>
  onReset: () => Promise<void>
}

const WIDGET_ICONS: Record<DashboardWidgetId, React.FC<{ className?: string }>> = {
  kpis: TrendingUp,
  focus_session: Flame,
  work_goal: Target,
  recent_tasks: Zap,
  quick_shortcuts: FolderKanban,
}

export const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({
  isOpen,
  onClose,
  currentCards,
  onSave,
  onReset,
}) => {
  const [cards, setCards] = useState<DashboardCardConfig[]>([])
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCards([...currentCards])
      setSavedSuccess(false)
    }
  }, [isOpen, currentCards])

  if (!isOpen) return null

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const next = [...cards]
    const temp = next[index - 1]
    next[index - 1] = next[index]
    next[index] = temp
    setCards(next)
  }

  const handleMoveDown = (index: number) => {
    if (index === cards.length - 1) return
    const next = [...cards]
    const temp = next[index + 1]
    next[index + 1] = next[index]
    next[index] = temp
    setCards(next)
  }

  const handleToggleVisible = (id: DashboardWidgetId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(cards)
      setSavedSuccess(true)
      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      setResetting(true)
      await onReset()
      setSavedSuccess(true)
      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err) {
      console.error(err)
    } finally {
      setResetting(false)
    }
  }

  const visibleCount = cards.filter((c) => c.visible).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-surface border border-border-soft rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                Personalizar Dashboard
                <Sparkles className="w-4 h-4 text-accent" />
              </h2>
              <p className="text-xs text-muted">
                Escolha a ordem e a visibilidade dos cards para sua rotina.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 bg-surface-muted/50 border-b border-border-soft flex items-center justify-between text-xs text-muted">
          <span>
            Exibindo <strong className="text-foreground">{visibleCount}</strong> de {cards.length} cards no painel
          </span>
          <span className="text-[11px] text-muted font-medium">
            Salvo na sua conta (Banco de Dados)
          </span>
        </div>

        {/* Card List with Order Controls */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {cards.map((card, idx) => {
            const IconComponent = WIDGET_ICONS[card.id] || TrendingUp
            const isFirst = idx === 0
            const isLast = idx === cards.length - 1

            return (
              <div
                key={card.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                  card.visible
                    ? 'bg-surface-raised/90 border-border-soft shadow-xs hover:border-brand/30'
                    : 'bg-surface-muted/30 border-border-soft/60 opacity-60'
                }`}
              >
                {/* Left: Reorder Controls + Icon + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  {/* Order & Steppers */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMoveUp(idx)}
                      title="Mover para cima"
                      className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-sunken disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold font-mono text-muted">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMoveDown(idx)}
                      title="Mover para baixo"
                      className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-sunken disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      card.visible
                        ? 'bg-brand/10 text-brand border-brand/20'
                        : 'bg-surface-sunken text-muted border-border-soft'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Texts */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs font-bold truncate ${
                          card.visible ? 'text-foreground' : 'text-muted line-through'
                        }`}
                      >
                        {card.title}
                      </h4>
                      {card.visible ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-600/20">
                          Visível
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-surface-sunken text-muted border border-border-soft">
                          Oculto
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Right: Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleVisible(card.id)}
                  title={card.visible ? 'Ocultar card' : 'Exibir card'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                    card.visible
                      ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-600/25 hover:bg-teal-500/20'
                      : 'bg-surface-sunken text-muted border-border-soft hover:text-foreground hover:bg-surface-raised'
                  }`}
                >
                  {card.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                      <span>Exibido</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-muted" />
                      <span>Ocultado</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border-soft bg-surface-muted/30">
          <button
            type="button"
            disabled={saving || resetting}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface hover:bg-surface-raised text-muted hover:text-foreground text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Restaurar Padrão</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-border-soft bg-surface hover:bg-surface-raised text-foreground text-xs font-bold transition-colors shadow-xs"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={saving || resetting}
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-strong text-white text-xs font-bold shadow-lg shadow-brand/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : saving ? (
                <span>Salvando no Banco...</span>
              ) : (
                <span>Salvar Personalização</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
