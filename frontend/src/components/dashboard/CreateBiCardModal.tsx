import React, { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle2,
  PieChart,
  Target,
  Flame,
  ListOrdered,
  Layers,
} from 'lucide-react'
import type { DashboardV2Card, BiMetricType, BiPeriodFilter, BiCardScope } from '../../lib/userPreferences'
import type { Project, Category } from '../../types/task'
import { CustomSelect } from '../ui/Select'

interface CreateBiCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: DashboardV2Card) => void
  editingCard?: DashboardV2Card | null
  projects: Project[]
  categories: Category[]
}

const METRIC_OPTIONS: {
  type: BiMetricType
  label: string
  desc: string
  icon: React.FC<{ className?: string }>
}[] = [
  {
    type: 'HOURS_TRACKED',
    label: 'Horas Dedicadas',
    desc: 'Total de tempo cronometrado nas tarefas com os filtros selecionados.',
    icon: Clock,
  },
  {
    type: 'TASK_COUNT',
    label: 'Quantidade de Tarefas',
    desc: 'Total numérico de tarefas criadas ou filtradas.',
    icon: Layers,
  },
  {
    type: 'COMPLETION_RATE',
    label: 'Taxa de Conclusão (%)',
    desc: 'Percentual de demandas entregues em relação ao total.',
    icon: CheckCircle2,
  },
  {
    type: 'PROJECT_BREAKDOWN',
    label: 'Distribuição por Projeto',
    desc: 'Comparativo visual de horas e tarefas por iniciativa.',
    icon: BarChart3,
  },
  {
    type: 'STATUS_DISTRIBUTION',
    label: 'Distribuição por Status',
    desc: 'Divisão entre A Fazer, Em Andamento e Concluído.',
    icon: PieChart,
  },
  {
    type: 'WORK_GOAL',
    label: 'Meta de Trabalho & Jornada',
    desc: 'Progresso frente à meta diária, semanal ou mensal de horas.',
    icon: Target,
  },
  {
    type: 'ACTIVE_TIMER',
    label: 'Cronômetro & Foco Atual',
    desc: 'Monitor do tempo ativo com botão de controle direto no card.',
    icon: Flame,
  },
  {
    type: 'TOP_TASKS',
    label: 'Demandas Mais Dedicadas',
    desc: 'Top 3 tarefas com maior volume de horas acumuladas.',
    icon: ListOrdered,
  },
]

const COLOR_OPTIONS: { id: DashboardV2Card['colorTheme']; label: string; bg: string }[] = [
  { id: 'brand', label: 'Teal (Brand)', bg: 'bg-teal-500' },
  { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500' },
  { id: 'accent', label: 'Âmbar', bg: 'bg-amber-500' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-500' },
  { id: 'cyan', label: 'Ciano', bg: 'bg-cyan-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
]

export const CreateBiCardModal: React.FC<CreateBiCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCard,
  projects,
  categories,
}) => {
  const [title, setTitle] = useState('')
  const [metricType, setMetricType] = useState<BiMetricType>('HOURS_TRACKED')
  const [period, setPeriod] = useState<BiPeriodFilter>('WEEK')
  const [projectId, setProjectId] = useState<number | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL')
  const [colorTheme, setColorTheme] = useState<DashboardV2Card['colorTheme']>('brand')
  const [scope, setScope] = useState<BiCardScope>('INHERIT')

  useEffect(() => {
    if (editingCard) {
      setTitle(editingCard.title)
      setMetricType(editingCard.metricType)
      setPeriod(editingCard.period)
      setProjectId(editingCard.projectId)
      setCategoryId(editingCard.categoryId)
      setStatusFilter(editingCard.statusFilter || 'ALL')
      setColorTheme(editingCard.colorTheme || 'brand')
      setScope(editingCard.scope || 'INHERIT')
    } else {
      setTitle('')
      setMetricType('HOURS_TRACKED')
      setPeriod('WEEK')
      setProjectId(undefined)
      setCategoryId(undefined)
      setStatusFilter('ALL')
      setColorTheme('brand')
      setScope('INHERIT')
    }
  }, [editingCard, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalTitle = title.trim() || getDefaultTitleForMetric(metricType)
    const card: DashboardV2Card = {
      id: editingCard?.id || `card-${Date.now()}`,
      title: finalTitle,
      metricType,
      period,
      projectId,
      categoryId,
      statusFilter,
      colorTheme,
      scope,
    }
    onSave(card)
    onClose()
  }

  function getDefaultTitleForMetric(type: BiMetricType): string {
    const found = METRIC_OPTIONS.find((m) => m.type === type)
    return found ? found.label : 'Novo Indicador'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-surface border border-border-soft rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">
                {editingCard ? 'Editar Card de BI' : 'Criar Card de BI do Zero'}
              </h2>
              <p className="text-xs text-muted">
                Combine métricas, filtros de projeto e períodos no mesmo card.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Card Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Título do Card <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getDefaultTitleForMetric(metricType)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-soft bg-surface text-xs text-foreground focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
            />
          </div>

          {/* Metric Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">
              Tipo de Indicador / Métrica
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {METRIC_OPTIONS.map((opt) => {
                const IconComponent = opt.icon
                const isSelected = metricType === opt.type

                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setMetricType(opt.type)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-brand bg-brand/10 ring-1 ring-brand/30 shadow-xs'
                        : 'border-border-soft bg-surface-raised/60 hover:bg-surface-raised hover:border-brand/30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-brand text-white border-brand'
                          : 'bg-surface text-muted border-border-soft'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground leading-tight">
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-muted line-clamp-2 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Combined Filters (BI Dimensions) */}
          <div className="pt-2 border-t border-border-soft space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
              Filtros Combináveis (Dimensões de BI)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Period Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Período</label>
                <CustomSelect
                  value={period}
                  onChange={(val) => setPeriod(val as BiPeriodFilter)}
                  options={[
                    { value: 'ALL', label: 'Todo o Histórico' },
                    { value: 'TODAY', label: 'Apenas Hoje' },
                    { value: 'WEEK', label: 'Esta Semana' },
                    { value: 'MONTH', label: 'Este Mês' },
                  ]}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Filtro por Status</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val as any)}
                  options={[
                    { value: 'ALL', label: 'Todos os Status' },
                    { value: 'COMPLETED', label: 'Apenas Concluídas', color: '#10b981' },
                    { value: 'IN_PROGRESS', label: 'Apenas Em Andamento', color: '#14b8a6' },
                    { value: 'NOT_STARTED', label: 'Apenas A Fazer', color: '#71717a' },
                  ]}
                />
              </div>

              {/* Project Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Iniciativa / Projeto</label>
                <CustomSelect
                  value={projectId ?? 0}
                  onChange={(val) => setProjectId(Number(val) === 0 ? undefined : Number(val))}
                  placeholder="Todos os Projetos"
                  options={[
                    { value: 0, label: 'Todos os Projetos' },
                    ...projects.map((p) => ({
                      value: p.id,
                      label: p.name,
                      color: p.color,
                    })),
                  ]}
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Categoria / Tag</label>
                <CustomSelect
                  value={categoryId ?? 0}
                  onChange={(val) => setCategoryId(Number(val) === 0 ? undefined : Number(val))}
                  placeholder="Todas as Categorias"
                  options={[
                    { value: 0, label: 'Todas as Categorias' },
                    ...categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                      color: c.color,
                    })),
                  ]}
                />
              </div>

              {/* Data Scope Filter */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Escopo dos Dados (Atribuição)</span>
                  <span className="text-[11px] text-muted font-normal">Individual vs Equipe</span>
                </label>
                <CustomSelect
                  value={scope}
                  onChange={(val) => setScope(val as BiCardScope)}
                  options={[
                    {
                      value: 'INHERIT',
                      label: '🔗 Seguir filtro global da página (Padrão)',
                      description: 'Acompanha a alternância da tela',
                    },
                    {
                      value: 'MINE',
                      label: '👤 Sempre Apenas Minhas Tarefas (Individual)',
                      description: 'Fixo nas suas demandas',
                    },
                    {
                      value: 'TEAM',
                      label: '👥 Sempre Toda a Equipe (Workspace Geral)',
                      description: 'Fixo em todo o time',
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Color Theme Selector */}
          <div className="pt-2 border-t border-border-soft space-y-2">
            <label className="text-xs font-bold text-foreground block">
              Cor de Destaque do Card
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = colorTheme === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorTheme(c.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-brand bg-surface shadow-xs ring-2 ring-brand/40 text-foreground font-bold'
                        : 'border-border-soft bg-surface-raised text-muted hover:text-foreground'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                    <span>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-soft bg-surface-muted/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border-soft bg-surface hover:bg-surface-raised text-foreground text-xs font-bold transition-colors shadow-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-strong text-white text-xs font-bold shadow-lg shadow-brand/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {editingCard ? 'Salvar Alterações' : 'Adicionar ao Painel'}
          </button>
        </div>
      </div>
    </div>
  )
}
