import type { Task, TaskStatus } from '../types'

const STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  OPEN: 'bg-white/70 text-slate-700 ring-slate-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-900 ring-amber-200',
  DONE: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
}

interface TaskItemProps {
  task: Task
  isUpdating: boolean
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

export function TaskItem({ task, isUpdating, onStatusChange }: TaskItemProps) {
  return (
    <article className="rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ring-1 ${STATUS_STYLES[task.status]}`}
          >
            {STATUS_LABELS[task.status]}
          </span>
          <h3 className="text-xl font-semibold text-slate-900">{task.name}</h3>
        </div>
        <label className="min-w-32 text-sm font-medium text-slate-600">
          <span className="mb-2 block">Status</span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-400"
            value={task.status}
            onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
            disabled={isUpdating}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </label>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">
        {task.description || 'No description provided.'}
      </p>

      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
        Created {new Date(task.createdAt).toLocaleString()}
      </p>
    </article>
  )
}
