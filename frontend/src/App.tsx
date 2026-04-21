import { useEffect, useState } from 'react'
import { createTask, listTasks, updateTaskStatus } from './api'
import { CreateTaskForm } from './components/CreateTaskForm'
import { TaskItem } from './components/TaskItem'
import type { Task, TaskStatus } from './types'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingTaskIds, setUpdatingTaskIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTasks() {
      try {
        setIsLoading(true)
        const data = await listTasks()
        setTasks(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load tasks.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadTasks()
  }, [])

  async function handleCreateTask(input: { name: string; description: string }) {
    try {
      setIsSubmitting(true)
      setError(null)
      const createdTask = await createTask(input)
      setTasks((current) => [createdTask, ...current])
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not create task.')
      throw submitError
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    try {
      setError(null)
      setUpdatingTaskIds((current) => [...current, taskId])
      const updatedTask = await updateTaskStatus(taskId, status)

      setTasks((current) =>
        current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      )
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update the task.')
    } finally {
      setUpdatingTaskIds((current) => current.filter((id) => id !== taskId))
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.35),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-10 text-slate-800">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">TimeTrack MVP</p>
            <h1 className="mt-4 max-w-sm text-5xl font-semibold tracking-[-0.04em] text-slate-950">
              Task management in one simple slice.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Create tasks, move them through progress, and keep the flow visible while the wider
              platform is still being built.
            </p>
          </div>

          <CreateTaskForm isSubmitting={isSubmitting} onSubmit={handleCreateTask} />
        </section>

        <section className="rounded-[2.5rem] border border-white/70 bg-white/65 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Task list</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                Current work
              </h2>
            </div>
            <p className="text-sm text-slate-500">{tasks.length} tasks loaded</p>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
              No tasks yet. Create the first one from the panel on the left.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isUpdating={updatingTaskIds.includes(task.id)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
