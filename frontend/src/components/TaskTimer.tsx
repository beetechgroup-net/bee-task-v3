import { differenceInSeconds, parseISO } from 'date-fns'
import { Play, Square } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { taskService } from '../services/taskService'
import { cn } from '../lib/utils'
import type { TaskResponse } from '../types/task'

interface TaskTimerProps {
  task: TaskResponse
  onUpdate: () => void
}

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [
    hrs > 0 ? String(hrs).padStart(2, '0') : '00',
    String(mins).padStart(2, '0'),
    String(secs).padStart(2, '0'),
  ].join(':')
}

export function TaskTimer({ task, onUpdate }: TaskTimerProps) {
  const [now, setNow] = useState(new Date())
  const [isActionLoading, setIsActionLoading] = useState(false)

  const history = task.history ?? []
  const runningItem = useMemo(
    () => history.find((item) => !item.endAt),
    [history],
  )

  const accumulatedSeconds = useMemo(() => {
    return history.reduce((acc, item) => {
      if (item.endAt) {
        return acc + differenceInSeconds(parseISO(item.endAt), parseISO(item.startAt))
      }
      return acc
    }, 0)
  }, [history])

  const [displaySeconds, setDisplaySeconds] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (runningItem) {
      interval = setInterval(() => {
        const runningSeconds = differenceInSeconds(new Date(), parseISO(runningItem.startAt))
        setDisplaySeconds(accumulatedSeconds + runningSeconds)
      }, 1000)
    } else {
      setDisplaySeconds(accumulatedSeconds)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [runningItem, accumulatedSeconds])

  // Initial calculation
  useEffect(() => {
    if (runningItem) {
      const runningSeconds = differenceInSeconds(new Date(), parseISO(runningItem.startAt))
      setDisplaySeconds(accumulatedSeconds + runningSeconds)
    } else {
      setDisplaySeconds(accumulatedSeconds)
    }
  }, [runningItem, accumulatedSeconds])

  async function handleStart() {
    setIsActionLoading(true)
    try {
      await taskService.startTask(task.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to start task', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  async function handleStop() {
    setIsActionLoading(true)
    try {
      await taskService.stopTask(task.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to stop task', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-app-bg/50 p-2 pl-3">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted/60">
          Tempo Gasto
        </span>
        <span className={cn(
          "font-mono text-sm font-bold tabular-nums",
          runningItem ? "text-brand" : "text-text-main"
        )}>
          {formatDuration(displaySeconds)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {runningItem ? (
          <button
            onClick={handleStop}
            disabled={isActionLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-50"
            title="Parar Cronômetro"
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isActionLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-strong active:scale-95 disabled:opacity-50"
            title="Iniciar Cronômetro"
          >
            <Play size={14} fill="currentColor" className="ml-0.5" />
          </button>
        )}
      </div>
    </div>
  )
}
