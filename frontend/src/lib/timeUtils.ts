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

// Parses a backend ISO string (which represents UTC) into a local JavaScript Date object
export function parseUtcToLocalDate(isoString: string): Date | null {
  if (!isoString) return null
  const utcStr = isoString.endsWith('Z') ? isoString : `${isoString}Z`
  const d = new Date(utcStr)
  return isNaN(d.getTime()) ? null : d
}

// Formats a backend UTC timestamp into local DD/MM/YYYY
export function formatIsoDateOnly(isoString: string): string {
  if (!isoString) return ''
  const d = parseUtcToLocalDate(isoString)
  if (!d) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Formats a backend UTC timestamp into local HH:mm
export function formatIsoTimeOnly(isoString: string): string {
  if (!isoString) return ''
  const d = parseUtcToLocalDate(isoString)
  if (!d) return ''
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Splits a backend UTC ISO string into local Date (YYYY-MM-DD) and local Time (HH:mm) for HTML form inputs
export function splitIsoToDateTime(isoString?: string | null): { date: string; time: string } {
  if (!isoString) {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` }
  }

  const d = parseUtcToLocalDate(isoString)
  if (!d) {
    return { date: '', time: '00:00' }
  }

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return { date: `${y}-${m}-${day}`, time: `${hh}:${mm}` }
}

// Combines local date and time inputs into a UTC ISO string (without milliseconds) expected by the backend
export function combineDateAndTimeToIso(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  // Create Date in user's local timezone
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
  // Convert to UTC ISO string: e.g. "2026-10-14T13:30:00.000Z" -> "2026-10-14T13:30:00"
  return localDate.toISOString().split('.')[0]
}

