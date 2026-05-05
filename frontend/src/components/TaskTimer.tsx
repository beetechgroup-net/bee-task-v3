import { differenceInSeconds, parseISO } from 'date-fns'
import { Clock, Play, Square } from 'lucide-react'
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

  async function handleStart(e: React.MouseEvent) {
    e.stopPropagation()
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

  async function handleStop(e: React.MouseEvent) {
    e.stopPropagation()
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
    <div className={cn(
      "group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-2 transition-all duration-500",
      runningItem 
        ? "border-brand/30 bg-brand/5 shadow-xl shadow-brand/10" 
        : "border-border-soft bg-surface shadow-sm hover:border-brand/20 hover:bg-app-bg/30"
    )}>
      {/* Active Indicator Pulse */}
      {runningItem && (
        <div className="absolute left-0 top-0 h-full w-1 bg-brand animate-pulse" />
      )}

      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
        runningItem ? "bg-brand text-white scale-110 shadow-lg shadow-brand/30" : "bg-app-bg text-text-muted group-hover:bg-surface"
      )}>
        <Clock size={18} className={runningItem ? "animate-spin [animation-duration:3s]" : ""} />
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">
          {runningItem ? 'Contagem Ativa' : 'Tempo Total'}
        </span>
        <span className={cn(
          "text-base font-black tabular-nums tracking-tight transition-colors duration-500",
          runningItem ? "text-brand" : "text-text-main"
        )}>
          {formatDuration(displaySeconds)}
        </span>
      </div>

      <div className="ml-auto pr-1">
        {runningItem ? (
          <button
            onClick={handleStop}
            disabled={isActionLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger text-white shadow-lg shadow-danger/30 transition-all hover:scale-110 hover:bg-danger active:scale-90 disabled:opacity-50"
            title="Parar Cronômetro"
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isActionLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/30 transition-all hover:scale-110 hover:bg-brand-strong active:scale-90 disabled:opacity-50"
            title="Iniciar Cronômetro"
          >
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </button>
        )}
      </div>
    </div>
  )
}
