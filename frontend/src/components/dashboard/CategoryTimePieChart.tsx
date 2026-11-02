import React, { useState, useMemo } from 'react'
import { Tag, Clock, PieChart, Sparkles } from 'lucide-react'
import type { Task, Category } from '../../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman, formatSecondsToTimer } from '../../lib/timeUtils'
import { calculateTaskSecondsInRange } from '../../lib/periodUtils'

export interface CategoryTimeData {
  id: number | 'uncategorized'
  name: string
  color: string
  seconds: number
  percentage: number
  taskCount: number
}

interface CategoryTimePieChartProps {
  tasks: Task[]
  categories?: Category[]
  startDate: Date
  endDate: Date
  isAllPeriod?: boolean
  activeTaskId?: number
  activeSeconds?: number
  viewScope: 'mine' | 'team'
  periodLabel: string
}

const DEFAULT_CATEGORY_COLORS = [
  '#0f766e', // Teal / Brand
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#a855f7', // Purple
  '#64748b', // Slate
]

export const CategoryTimePieChart: React.FC<CategoryTimePieChartProps> = ({
  tasks,
  startDate,
  endDate,
  isAllPeriod = false,
  activeTaskId,
  activeSeconds,
  viewScope,
  periodLabel,
}) => {
  const [hoveredId, setHoveredId] = useState<number | 'uncategorized' | null>(null)

  // Aggregate worked time by category for the given tasks & period
  const { categoryList, totalSeconds } = useMemo(() => {
    const catMap = new Map<
      number | 'uncategorized',
      { id: number | 'uncategorized'; name: string; color: string; seconds: number; taskCount: number }
    >()

    let total = 0
    let colorIdx = 0

    for (const t of tasks) {
      const sec = isAllPeriod
        ? calculateTaskTotalSeconds(t)
        : calculateTaskSecondsInRange(t, startDate, endDate, activeTaskId, activeSeconds)

      if (sec <= 0) continue

      total += sec

      const catId = t.category?.id ?? 'uncategorized'
      const catName = t.category?.name ?? 'Sem Categoria'
      const catColor =
        t.category?.color ||
        (catId === 'uncategorized'
          ? '#64748b'
          : DEFAULT_CATEGORY_COLORS[colorIdx++ % DEFAULT_CATEGORY_COLORS.length])

      const existing = catMap.get(catId)
      if (existing) {
        existing.seconds += sec
        existing.taskCount += 1
      } else {
        catMap.set(catId, {
          id: catId,
          name: catName,
          color: catColor,
          seconds: sec,
          taskCount: 1,
        })
      }
    }

    const list: CategoryTimeData[] = Array.from(catMap.values())
      .map((item) => ({
        ...item,
        percentage: total > 0 ? (item.seconds / total) * 100 : 0,
      }))
      .sort((a, b) => b.seconds - a.seconds)

    return { categoryList: list, totalSeconds: total }
  }, [tasks, startDate, endDate, isAllPeriod, activeTaskId, activeSeconds])

  // SVG Donut geometry
  const size = 190
  const center = size / 2
  const radius = 68
  const strokeWidth = 24
  const circumference = 2 * Math.PI * radius

  const hoveredItem = categoryList.find((c) => c.id === hoveredId) || null

  let accumulatedLength = 0

  return (
    <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-5 sm:p-6 shadow-panel space-y-5 transition-all hover:shadow-xl">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border-soft/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent border border-accent/25 flex items-center justify-center shadow-xs">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>Tempo Trabalhado por Categoria</span>
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </h3>
            <p className="text-[11px] text-muted">
              {viewScope === 'mine'
                ? 'Distribuição das suas horas no período'
                : 'Distribuição das horas de toda a equipe no período'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-sunken border border-border-soft text-[11px] font-semibold text-muted self-start sm:self-auto">
          <Clock className="w-3 h-3 text-brand" />
          <span>{periodLabel}</span>
        </span>
      </div>

      {/* Main Content Area */}
      {totalSeconds === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border-soft bg-surface-muted/30 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-surface-sunken border border-border-soft flex items-center justify-center text-muted mx-auto">
            <Tag className="w-5 h-5 opacity-50" />
          </div>
          <h4 className="text-xs font-bold text-foreground">
            Nenhum tempo registrado para categorias neste período
          </h4>
          <p className="text-[11px] text-muted max-w-sm mx-auto">
            Inicie o cronômetro em demandas com categorias atribuídas para visualizar a distribuição visual de tempo aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart (Left 5 cols) */}
          <div className="md:col-span-5 flex items-center justify-center py-2">
            <div
              className="relative shrink-0 flex items-center justify-center select-none"
              style={{ width: size, height: size }}
            >
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90 block"
              >
                {/* Background Track Circle */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-surface-sunken"
                />

                {/* Slices */}
                {categoryList.map((item) => {
                  const sliceRatio = item.seconds / totalSeconds
                  const sliceLength = sliceRatio * circumference
                  const gap = categoryList.length > 1 ? 2.5 : 0
                  const actualLength = Math.max(0, sliceLength - gap)
                  const offset = -accumulatedLength
                  accumulatedLength += sliceLength

                  const isHovered = hoveredId === item.id
                  const currentStrokeWidth = isHovered ? strokeWidth + 4 : strokeWidth

                  return (
                    <circle
                      key={item.id}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={currentStrokeWidth}
                      strokeDasharray={`${actualLength} ${circumference}`}
                      strokeDashoffset={offset}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        opacity: hoveredId !== null && !isHovered ? 0.35 : 1,
                        filter: isHovered ? 'drop-shadow(0px 0px 4px rgba(0,0,0,0.35))' : undefined,
                      }}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                  )
                })}
              </svg>

              {/* Donut Hole Center Content (Absolute & Dead Centered) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2"
              >
                {hoveredItem ? (
                  <div className="flex flex-col items-center justify-center space-y-0.5 max-w-[105px] animate-in fade-in zoom-in-95 duration-150">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider truncate w-full text-center block"
                      style={{ color: hoveredItem.color }}
                      title={hoveredItem.name}
                    >
                      {hoveredItem.name}
                    </span>
                    <p className="text-sm sm:text-base font-extrabold font-mono text-foreground leading-none">
                      {formatSecondsToTimer(hoveredItem.seconds)}
                    </p>
                    <span className="text-[10px] font-semibold text-muted block leading-none pt-0.5">
                      {hoveredItem.percentage.toFixed(1)}% do tempo
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-0.5 max-w-[105px] animate-in fade-in duration-150">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted block leading-none">
                      Total Auditado
                    </span>
                    <p className="text-sm sm:text-base font-extrabold font-mono text-foreground leading-none">
                      {formatSecondsToTimer(totalSeconds)}
                    </p>
                    <span className="text-[10px] font-semibold text-muted block leading-none pt-0.5">
                      {categoryList.length} {categoryList.length === 1 ? 'categoria' : 'categorias'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Legend & Bars (Right 7 cols) */}
          <div className="md:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-wider pb-1 border-b border-border-soft/60">
              <span>Categoria</span>
              <span>Horas / %</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {categoryList.map((item) => {
                const isHovered = hoveredId === item.id

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`p-2 rounded-xl transition-all duration-150 cursor-pointer space-y-1.5 ${
                      isHovered
                        ? 'bg-surface-raised ring-1 ring-border-soft shadow-xs'
                        : 'hover:bg-surface-raised/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-150"
                          style={{
                            backgroundColor: item.color,
                            transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                          }}
                        />
                        <span
                          className={`font-semibold truncate transition-colors ${
                            isHovered ? 'text-brand font-bold' : 'text-foreground'
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="text-[10px] text-muted font-normal shrink-0">
                          ({item.taskCount} {item.taskCount === 1 ? 'demanda' : 'demandas'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className="font-bold text-foreground">
                          {formatSecondsToHuman(item.seconds)}
                        </span>
                        <span className="text-muted w-11 text-right font-sans font-semibold">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for the slice */}
                    <div className="w-full h-1.5 rounded-full bg-surface-sunken overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
