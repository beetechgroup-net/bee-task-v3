import type { Task } from '../types/task'

export function isTaskRunning(task: Task): boolean {
  if (!task.history || task.history.length === 0) return false
  return task.history.some((h) => !h.endAt)
}

export function calculateTaskTotalSeconds(task: Task): number {
  if (!task.history || task.history.length === 0) return 0

  let total = 0
  for (const item of task.history) {
    if (item.elapsedSeconds) {
      total += item.elapsedSeconds
    } else if (item.startAt && !item.endAt) {
      const start = new Date(item.startAt).getTime()
      const now = Date.now()
      const diffSec = Math.max(0, Math.floor((now - start) / 1000))
      total += diffSec
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
