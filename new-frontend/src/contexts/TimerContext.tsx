import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { Task } from '../types/task'
import { taskService } from '../services/taskService'
import { isTaskRunning, calculateBaseSeconds } from '../lib/timeUtils'
import { useAuth } from './AuthContext'

interface TimerContextType {
  activeTask: Task | null
  activeSeconds: number
  startTimer: (task: Task) => Promise<Task>
  stopTimer: (task?: Task) => Promise<Task | null>
  syncWithTasks: (tasks: Task[]) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeOrg } = useAuth()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeSeconds, setActiveSeconds] = useState<number>(0)

  // Track the baseline seconds and client-side timestamp when task data was fetched/started
  const baseSecondsRef = useRef<number>(0)
  const receivedAtRef = useRef<number>(Date.now())

  // Sync state whenever tasks list updates
  const syncWithTasks = useCallback((tasks: Task[]) => {
    const running = tasks.find((t) => isTaskRunning(t))
    if (running) {
      setActiveTask(running)
      const base = calculateBaseSeconds(running)
      baseSecondsRef.current = base
      receivedAtRef.current = Date.now()
      setActiveSeconds(base)
    } else {
      setActiveTask(null)
      baseSecondsRef.current = 0
      setActiveSeconds(0)
    }
  }, [])

  // Auto-fetch active running task on mount or workspace change
  useEffect(() => {
    if (!activeOrg?.id) return
    let isMounted = true

    taskService
      .listMyTasks({ organizationId: activeOrg.id })
      .then((tasks) => {
        if (!isMounted) return
        const running = tasks.find((t) => isTaskRunning(t))
        if (running) {
          syncWithTasks(tasks)
        }
      })
      .catch((err) => {
        console.warn('Could not auto-fetch running task on init', err)
      })

    return () => {
      isMounted = false
    }
  }, [activeOrg?.id, syncWithTasks])

  // Live timer interval: uses wall-clock Date.now() and visibilitychange/focus
  // This guarantees that switching tabs or minimizing the browser NEVER freezes or drifts the timer
  useEffect(() => {
    if (!activeTask) return

    const updateSeconds = () => {
      const elapsedSinceReceived = Math.max(0, Math.floor((Date.now() - receivedAtRef.current) / 1000))
      setActiveSeconds(baseSecondsRef.current + elapsedSinceReceived)
    }

    // Immediate initial sync
    updateSeconds()

    // 1-second interval
    const interval = setInterval(updateSeconds, 1000)

    // Instantly catch up when user returns from another tab or focuses window
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateSeconds()
      }
    }

    const handleFocus = () => {
      updateSeconds()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [activeTask])

  const startTimer = useCallback(
    async (task: Task): Promise<Task> => {
      // If there was an active task running different from this one, stop it first
      if (activeTask && activeTask.id !== task.id) {
        try {
          await taskService.stopTask(activeTask.id)
        } catch (e) {
          console.warn('Could not stop previously running task', e)
        }
      }

      const updated = await taskService.startTask(task.id)
      setActiveTask(updated)
      const base = calculateBaseSeconds(updated)
      baseSecondsRef.current = base
      receivedAtRef.current = Date.now()
      setActiveSeconds(base)
      return updated
    },
    [activeTask]
  )

  const stopTimer = useCallback(
    async (task?: Task): Promise<Task | null> => {
      const targetId = task ? task.id : activeTask?.id
      if (!targetId) return null

      const updated = await taskService.stopTask(targetId)
      setActiveTask(null)
      baseSecondsRef.current = 0
      setActiveSeconds(0)
      return updated
    },
    [activeTask]
  )

  return (
    <TimerContext.Provider
      value={{
        activeTask,
        activeSeconds,
        startTimer,
        stopTimer,
        syncWithTasks,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export const useTimer = (): TimerContextType => {
  const ctx = useContext(TimerContext)
  if (!ctx) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return ctx
}
