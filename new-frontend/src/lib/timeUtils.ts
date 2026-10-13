import type { Task } from '../types/task'

export function isTaskRunning(task: Task): boolean {
  if (!task.history || task.history.length === 0) return false
  return task.history.some((h) => !h.endAt)
}

export function calculateTaskTotalSeconds(task: Task): number {
  if (!task.history || task.history.length === 0) return 0

  let total = 0
  for (const item of task.history) {
    if (item.endAt) {
      total += item.elapsedSeconds || 0
    } else {
      // Running interval: calculate based on start timestamp if available or elapsedSeconds
      if (item.startAt) {
        // Backend stores UTC LocalDateTime without timezone offset suffix. Append 'Z' to parse as UTC.
        const utcDateStr = item.startAt.endsWith('Z') ? item.startAt : `${item.startAt}Z`
        const start = new Date(utcDateStr).getTime()
        if (!isNaN(start)) {
          const diffSec = Math.max(0, Math.floor((Date.now() - start) / 1000))
          total += Math.max(diffSec, item.elapsedSeconds || 0)
        } else {
          total += item.elapsedSeconds || 0
        }
      } else {
        total += item.elapsedSeconds || 0
      }
    }
  }
  return total
}

export function calculateBaseSeconds(task: Task): number {
  if (!task.history || task.history.length === 0) return 0
  let total = 0
  for (const item of task.history) {
    if (item.elapsedSeconds) {
      total += item.elapsedSeconds
    }
  }
  return total
}

export function formatSecondsToTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const hh = hours.toString().padStart(2, '0')
  const mm = minutes.toString().padStart(2, '0')
  const ss = seconds.toString().padStart(2, '0')

  return `${hh}:${mm}:${ss}`
}

export function formatSecondsToHuman(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0m'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${minutes}m`
}
