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
  const { user, activeOrg } = useAuth()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeSeconds, setActiveSeconds] = useState<number>(0)

  // Track the baseline seconds and client-side timestamp when task data was fetched/started
  const baseSecondsRef = useRef<number>(0)
  const receivedAtRef = useRef<number>(Date.now())
  const activeTaskRef = useRef<Task | null>(null)

  useEffect(() => {
    activeTaskRef.current = activeTask
  }, [activeTask])

  // Check if task belongs to the logged-in user (as assignee or creator)
  const isMyTask = useCallback(
    (t: Task) => {
      if (!user?.email) return false
      const userEmail = user.email.toLowerCase()
      const matchesAssignee = t.user?.email && t.user.email.toLowerCase() === userEmail
      const matchesCreator = t.createdBy?.email && t.createdBy.email.toLowerCase() === userEmail
      return Boolean(matchesAssignee || matchesCreator)
    },
    [user?.email]
  )

  // Sync state whenever tasks list updates
  const syncWithTasks = useCallback(
    (tasks: Task[]) => {
      // ONLY consider tasks assigned to the current logged-in user
      const running = tasks.find((t) => isTaskRunning(t) && isMyTask(t))
      if (running) {
        activeTaskRef.current = running
        setActiveTask((prev) => {
          if (prev?.id === running.id && prev.status === running.status) {
            const prevRunningItem = prev.history?.find((h) => !h.endAt)
            const currRunningItem = running.history?.find((h) => !h.endAt)
            if (prevRunningItem?.id === currRunningItem?.id && prevRunningItem?.startAt === currRunningItem?.startAt) {
              return prev
            }
          }
          return running
        })
        const base = calculateBaseSeconds(running)
        baseSecondsRef.current = base
        receivedAtRef.current = Date.now()
        setActiveSeconds(base)
      } else {
        // If syncing a single task and it's not the active task, don't accidentally clear
        if (tasks.length === 1 && activeTaskRef.current && tasks[0].id !== activeTaskRef.current.id) {
          return
        }
        activeTaskRef.current = null
        setActiveTask(null)
        baseSecondsRef.current = 0
        setActiveSeconds(0)
      }
    },
    [isMyTask]
  )

  // Auto-fetch active running task on mount or workspace change
  useEffect(() => {
    if (!activeOrg?.id) return
    let isMounted = true

    taskService
      .listMyTasks({ organizationId: activeOrg.id })
      .then((tasks) => {
        if (!isMounted) return
        const running = tasks.find((t) => isTaskRunning(t) && isMyTask(t))
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
      if (activeTaskRef.current && activeTaskRef.current.id !== task.id) {
        try {
          await taskService.stopTask(activeTaskRef.current.id)
        } catch (e) {
          console.warn('Could not stop previously running task', e)
        }
      }

      const updated = await taskService.startTask(task.id)
      activeTaskRef.current = updated
      setActiveTask(updated)
      const base = calculateBaseSeconds(updated)
      baseSecondsRef.current = base
      receivedAtRef.current = Date.now()
      setActiveSeconds(base)
      return updated
    },
    []
  )

  const stopTimer = useCallback(
    async (task?: Task): Promise<Task | null> => {
      const targetId = task ? task.id : activeTaskRef.current?.id
      if (!targetId) return null

      const updated = await taskService.stopTask(targetId)
      activeTaskRef.current = null
      setActiveTask(null)
      baseSecondsRef.current = 0
      setActiveSeconds(0)
      return updated
    },
    []
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
