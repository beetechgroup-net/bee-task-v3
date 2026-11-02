import type { Task } from '../types/task'

export type PeriodPreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom'
  | 'all'

export interface DateRange {
  startDate: Date
  endDate: Date
  label: string
}

export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  today: 'Hoje',
  yesterday: 'Ontem',
  this_week: 'Esta Semana',
  last_week: 'Semana Passada',
  this_month: 'Este Mês',
  last_month: 'Mês Passado',
  last_3_months: 'Últimos 3 Meses',
  last_6_months: 'Últimos 6 Meses',
  this_year: 'Este Ano',
  custom: 'Personalizado',
  all: 'Todo o Histórico',
}

/**
 * Returns startDate and endDate boundaries for a given preset.
 */
export function getDateRangeForPreset(
  preset: PeriodPreset,
  customStartStr?: string,
  customEndStr?: string
): DateRange {
  const now = new Date()

  switch (preset) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Hoje' }
    }
    case 'yesterday': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Ontem' }
    }
    case 'this_week': {
      const start = new Date(now)
      const day = start.getDay()
      const diffToMonday = (day === 0 ? -6 : 1) - day
      start.setDate(start.getDate() + diffToMonday)
      start.setHours(0, 0, 0, 0)

      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Esta Semana' }
    }
    case 'last_week': {
      const start = new Date(now)
      const day = start.getDay()
      const diffToMonday = (day === 0 ? -6 : 1) - day - 7
      start.setDate(start.getDate() + diffToMonday)
      start.setHours(0, 0, 0, 0)

      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Semana Passada' }
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Este Mês' }
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Mês Passado' }
    }
    case 'last_3_months': {
      // 3 months including current month (e.g. from 1st of month - 2 up to today/end of month)
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Últimos 3 Meses' }
    }
    case 'last_6_months': {
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Últimos 6 Meses' }
    }
    case 'this_year': {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: `Ano ${now.getFullYear()}` }
    }
    case 'custom': {
      if (customStartStr && customEndStr) {
        const [sy, sm, sd] = customStartStr.split('-').map(Number)
        const [ey, em, ed] = customEndStr.split('-').map(Number)
        const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0)
        const end = new Date(ey, em - 1, ed, 23, 59, 59, 999)
        return {
          startDate: start,
          endDate: end,
          label: `${formatDatePtBr(start)} a ${formatDatePtBr(end)}`,
        }
      }
      // Fallback to this month if missing custom values
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Personalizado' }
    }
    case 'all':
    default: {
      const start = new Date(2020, 0, 1, 0, 0, 0, 0)
      const end = new Date(2035, 11, 31, 23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Todo o Histórico' }
    }
  }
}

export function formatDatePtBr(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateYmd(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${year}-${month}-${day}`
}

/**
 * Calculates the exact worked seconds for a given task overlapping the [rangeStart, rangeEnd] window.
 * Also incorporates currently running timers if applicable.
 */
export function calculateTaskSecondsInRange(
  task: Task,
  rangeStart: Date,
  rangeEnd: Date,
  activeTaskId?: number,
  activeSeconds?: number
): number {
  if (!task.history || task.history.length === 0) {
    if (activeTaskId === task.id && activeSeconds && activeSeconds > 0) {
      return activeSeconds
    }
    return 0
  }

  let totalSec = 0
  const rangeStartMs = rangeStart.getTime()
  const rangeEndMs = rangeEnd.getTime()
  const nowMs = Date.now()

  for (const item of task.history) {
    if (!item.startAt) continue

    const utcDateStr = item.startAt.endsWith('Z') ? item.startAt : `${item.startAt}Z`
    const itemStartMs = new Date(utcDateStr).getTime()
    if (isNaN(itemStartMs)) continue

    let itemEndMs: number
    if (item.endAt) {
      const utcEndStr = item.endAt.endsWith('Z') ? item.endAt : `${item.endAt}Z`
      itemEndMs = new Date(utcEndStr).getTime()
    } else {
      // Currently active interval
      itemEndMs = nowMs
    }

    if (isNaN(itemEndMs) || itemEndMs <= itemStartMs) continue

    // Intersect [itemStartMs, itemEndMs] with [rangeStartMs, rangeEndMs]
    const overlapStart = Math.max(itemStartMs, rangeStartMs)
    const overlapEnd = Math.min(itemEndMs, rangeEndMs)

    if (overlapEnd > overlapStart) {
      totalSec += Math.floor((overlapEnd - overlapStart) / 1000)
    }
  }

  return totalSec
}

/**
 * Checks whether a task was finished within [rangeStart, rangeEnd].
 */
export function isTaskFinishedInRange(task: Task, rangeStart: Date, rangeEnd: Date): boolean {
  if (task.status !== 'COMPLETED') return false

  if (task.finishedAt) {
    const utcFinStr = task.finishedAt.endsWith('Z') ? task.finishedAt : `${task.finishedAt}Z`
    const finDate = new Date(utcFinStr)
    if (!isNaN(finDate.getTime())) {
      return finDate >= rangeStart && finDate <= rangeEnd
    }
  }

  // Fallback: Check if the last history item was within the range
  if (task.history && task.history.length > 0) {
    const last = task.history[task.history.length - 1]
    if (last.endAt) {
      const utcEndStr = last.endAt.endsWith('Z') ? last.endAt : `${last.endAt}Z`
      const endDate = new Date(utcEndStr)
      if (!isNaN(endDate.getTime())) {
        return endDate >= rangeStart && endDate <= rangeEnd
      }
    }
  }

  return false
}

/**
 * Checks if a task had any active work, history, or creation in [rangeStart, rangeEnd].
 */
export function hasTaskActivityInRange(task: Task, rangeStart: Date, rangeEnd: Date): boolean {
  const seconds = calculateTaskSecondsInRange(task, rangeStart, rangeEnd)
  if (seconds > 0) return true
  if (isTaskFinishedInRange(task, rangeStart, rangeEnd)) return true
  return false
}
