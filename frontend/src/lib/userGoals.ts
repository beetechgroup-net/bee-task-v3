import type { Task } from '../types/task'
import { calculateTaskSecondsInRange } from './periodUtils'
import { calculateTaskTotalSeconds, formatSecondsToHuman } from './timeUtils'

export type WorkGoalPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export interface WorkGoal {
  targetHours: number
  period: WorkGoalPeriod
}

const STORAGE_PREFIX = 'beetask_global_work_goal_'

export const DEFAULT_WORK_GOAL: WorkGoal = {
  targetHours: 8,
  period: 'DAILY',
}

export function getUserWorkGoal(userId?: number | string): WorkGoal {
  if (!userId) return DEFAULT_WORK_GOAL
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (raw) {
      const parsed = JSON.parse(raw) as WorkGoal
      if (parsed && typeof parsed.targetHours === 'number' && parsed.period) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Could not parse user work goal from localStorage', err)
  }
  return DEFAULT_WORK_GOAL
}

export function saveUserWorkGoal(userId: number | string, goal: WorkGoal): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(goal))
    // Dispatch custom event to notify other components in same window
    window.dispatchEvent(new CustomEvent('beetask_work_goal_changed', { detail: goal }))
  } catch (err) {
    console.error('Failed to save user work goal to localStorage', err)
  }
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function isSameWeek(d: Date, now: Date): boolean {
  // Start of current week (Monday at 00:00:00)
  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay()
  const diffToMonday = (day === 0 ? -6 : 1) - day
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  // End of current week (Sunday at 23:59:59)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return d >= startOfWeek && d <= endOfWeek
}

export function isSameMonth(d: Date, now: Date): boolean {
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

/**
 * Calculates the total seconds worked by the user in the specified goal period (Daily, Weekly, or Monthly).
 */
export function calculateUserPeriodWorkedSeconds(
  tasks: Task[],
  period: WorkGoalPeriod,
  activeTaskId?: number,
  activeTaskSeconds?: number
): number {
  const now = new Date()
  let totalSeconds = 0

  for (const task of tasks) {
    if (!task.history || task.history.length === 0) continue

    for (const item of task.history) {
      if (!item.startAt) continue

      const utcDateStr = item.startAt.endsWith('Z') ? item.startAt : `${item.startAt}Z`
      const startDate = new Date(utcDateStr)
      if (isNaN(startDate.getTime())) continue

      let inPeriod = false
      if (period === 'DAILY') {
        inPeriod = isSameDay(startDate, now)
      } else if (period === 'WEEKLY') {
        inPeriod = isSameWeek(startDate, now)
      } else if (period === 'MONTHLY') {
        inPeriod = isSameMonth(startDate, now)
      }

      if (!inPeriod) continue

      if (item.endAt) {
        totalSeconds += item.elapsedSeconds || 0
      } else {
        // Active item
        if (task.id === activeTaskId && activeTaskSeconds !== undefined) {
          // If active task, calculate time elapsed in this running session
          const diffSec = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 1000))
          totalSeconds += Math.max(diffSec, item.elapsedSeconds || 0)
        } else {
          totalSeconds += item.elapsedSeconds || 0
        }
      }
    }
  }

  return totalSeconds
}

export interface PlannedGoalResult {
  targetSeconds: number
  targetHours: number
  workdays: number
  calendarDays: number
}

function countWeekdaysInCalendarMonth(year: number, monthIndex: number): number {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  let count = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = new Date(year, monthIndex, day, 12, 0, 0, 0).getDay()
    if (dow >= 1 && dow <= 5) count++
  }
  return count
}

/**
 * Calculates planned target hours/seconds for an arbitrary [rangeStart, rangeEnd] window
 * based on the user's configured WorkGoal (DAILY, WEEKLY, or MONTHLY) using weekdays (Mon-Fri).
 */
export function calculatePlannedGoalForRange(
  goal: WorkGoal,
  rangeStart: Date,
  rangeEnd: Date
): PlannedGoalResult {
  const baseHours = goal?.targetHours || 8
  const period = goal?.period || 'DAILY'

  // Use noon to prevent DST transitions from shifting calendar dates
  const start = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate(), 12, 0, 0, 0)
  const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate(), 12, 0, 0, 0)

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { targetSeconds: 0, targetHours: 0, workdays: 0, calendarDays: 0 }
  }

  let calendarDays = 0
  let workdays = 0
  const workdaysByMonth = new Map<string, { year: number; month: number; workdays: number }>()

  const cursor = new Date(start)
  while (cursor <= end) {
    calendarDays++
    const dow = cursor.getDay()
    if (dow >= 1 && dow <= 5) {
      workdays++
      const y = cursor.getFullYear()
      const m = cursor.getMonth()
      const key = `${y}-${m}`
      const entry = workdaysByMonth.get(key)
      if (entry) {
        entry.workdays++
      } else {
        workdaysByMonth.set(key, { year: y, month: m, workdays: 1 })
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  let plannedHours = 0
  if (period === 'DAILY') {
    plannedHours = workdays * baseHours
  } else if (period === 'WEEKLY') {
    plannedHours = (workdays / 5) * baseHours
  } else {
    for (const { year, month, workdays: selectedMonthWorkdays } of workdaysByMonth.values()) {
      const totalMonthWorkdays = countWeekdaysInCalendarMonth(year, month)
      if (totalMonthWorkdays > 0) {
        plannedHours += (selectedMonthWorkdays / totalMonthWorkdays) * baseHours
      }
    }
  }

  const targetSeconds = Math.round(plannedHours * 3600)
  return {
    targetSeconds,
    targetHours: Math.round(plannedHours * 100) / 100,
    workdays,
    calendarDays,
  }
}

/**
 * Resolves the effective date bounds when the user selects "all" (Todo o Histórico),
 * spanning from the earliest recorded task history entry up to today (or latest entry).
 */
export function getEffectiveDateRangeForTasks(
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date,
  isAllPeriod: boolean
): { startDate: Date; endDate: Date } {
  if (!isAllPeriod) {
    return { startDate: rangeStart, endDate: rangeEnd }
  }

  const now = new Date()
  let minMs = Infinity
  let maxMs = now.getTime()

  for (const task of tasks) {
    if (!task.history) continue
    for (const item of task.history) {
      if (item.startAt) {
        const utcStart = item.startAt.endsWith('Z') ? item.startAt : `${item.startAt}Z`
        const startMs = new Date(utcStart).getTime()
        if (!isNaN(startMs)) {
          minMs = Math.min(minMs, startMs)
          maxMs = Math.max(maxMs, startMs)
        }
      }
      if (item.endAt) {
        const utcEnd = item.endAt.endsWith('Z') ? item.endAt : `${item.endAt}Z`
        const endMs = new Date(utcEnd).getTime()
        if (!isNaN(endMs)) {
          maxMs = Math.max(maxMs, endMs)
        }
      }
    }
  }

  if (!isFinite(minMs)) {
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
    }
  }

  const minDate = new Date(minMs)
  const maxDate = new Date(maxMs)
  return {
    startDate: new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 0, 0, 0, 0),
    endDate: new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999),
  }
}

/**
 * Calculates total worked seconds across tasks within the given date range (or all-time when isAllPeriod is true).
 */
export function calculateWorkedSecondsInRange(
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date,
  isAllPeriod: boolean,
  activeTaskId?: number,
  activeSeconds?: number
): number {
  let total = 0
  for (const task of tasks) {
    total += isAllPeriod
      ? calculateTaskTotalSeconds(task)
      : calculateTaskSecondsInRange(task, rangeStart, rangeEnd, activeTaskId, activeSeconds)
  }
  return total
}

export interface WorkGoalProgress {
  targetSeconds: number
  targetLabel: string
  workedSeconds: number
  percent: number
  remainingSeconds: number
  workdays: number
  workdaysLabel: string
  baseLabel: string
  isCompleted: boolean
}

/**
 * Computes planned vs worked goal progress for the given tasks and date window.
 */
export function calculateWorkGoalProgress(
  tasks: Task[],
  goal: WorkGoal,
  rangeStart: Date,
  rangeEnd: Date,
  isAllPeriod: boolean,
  activeTaskId?: number,
  activeSeconds?: number
): WorkGoalProgress {
  const effectiveRange = getEffectiveDateRangeForTasks(tasks, rangeStart, rangeEnd, isAllPeriod)
  const planned = calculatePlannedGoalForRange(goal, effectiveRange.startDate, effectiveRange.endDate)
  const workedSeconds = calculateWorkedSecondsInRange(
    tasks,
    rangeStart,
    rangeEnd,
    isAllPeriod,
    activeTaskId,
    activeSeconds
  )

  const targetSeconds = planned.targetSeconds
  const percent =
    targetSeconds > 0
      ? Math.min(100, Math.round((workedSeconds / targetSeconds) * 100))
      : workedSeconds > 0
      ? 100
      : 0
  const remainingSeconds = Math.max(0, targetSeconds - workedSeconds)
  const isCompleted = targetSeconds > 0 ? workedSeconds >= targetSeconds : workedSeconds > 0

  const periodUnit =
    goal?.period === 'DAILY' ? '/ dia' : goal?.period === 'WEEKLY' ? '/ semana' : '/ mês'
  const targetLabel = targetSeconds > 0 ? formatSecondsToHuman(targetSeconds) : '0h'
  const workdaysLabel = `${planned.workdays} ${planned.workdays === 1 ? 'dia útil' : 'dias úteis'}`

  return {
    targetSeconds,
    targetLabel,
    workedSeconds,
    percent,
    remainingSeconds,
    workdays: planned.workdays,
    workdaysLabel,
    baseLabel: `${goal?.targetHours || 8}h ${periodUnit}`,
    isCompleted,
  }
}
