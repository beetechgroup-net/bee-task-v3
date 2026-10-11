import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Task } from '../types/task'
import { taskService } from '../services/taskService'
import { isTaskRunning, calculateTaskTotalSeconds } from '../lib/timeUtils'

interface TimerContextType {
  activeTask: Task | null
  activeSeconds: number
  startTimer: (task: Task) => Promise<Task>
  stopTimer: (task?: Task) => Promise<Task | null>
  syncWithTasks: (tasks: Task[]) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeSeconds, setActiveSeconds] = useState<number>(0)

  // Sync state whenever tasks list updates
  const syncWithTasks = useCallback((tasks: Task[]) => {
    const running = tasks.find((t) => isTaskRunning(t))
    if (running) {
      setActiveTask(running)
      setActiveSeconds(calculateTaskTotalSeconds(running))
    } else {
      setActiveTask(null)
      setActiveSeconds(0)
    }
  }, [])

  // Live timer interval
  useEffect(() => {
    if (!activeTask) return

    const interval = setInterval(() => {
      setActiveSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTask])

  const startTimer = useCallback(
    async (task: Task): Promise<Task> => {
      // If there was an active task running different from this one, stop it first or handle
      if (activeTask && activeTask.id !== task.id) {
        try {
          await taskService.stopTask(activeTask.id)
        } catch (e) {
          console.warn('Could not stop previously running task', e)
        }
      }

      const updated = await taskService.startTask(task.id)
      setActiveTask(updated)
      setActiveSeconds(calculateTaskTotalSeconds(updated))
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
