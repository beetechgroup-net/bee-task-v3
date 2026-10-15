import type { Task } from '../types/task'

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
