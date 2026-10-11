import React from 'react'
import { Play, Square, Clock, Folder, Tag, MoreHorizontal, CheckCircle2 } from 'lucide-react'
import type { Task, TaskStatus } from '../../types/task'
import { isTaskRunning, calculateTaskTotalSeconds, formatSecondsToTimer } from '../../lib/timeUtils'
import { CustomSelect } from '../ui/Select'

interface TaskListViewProps {
  tasks: Task[]
  onToggleTimer: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
  onEditTask: (task: Task) => void
  activeTaskId?: number | null
  activeTaskSeconds?: number
}


export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onToggleTimer,
  onStatusChange,
  onEditTask,
  activeTaskId,
  activeTaskSeconds,
}) => {
  const [activeMenuId, setActiveMenuId] = React.useState<number | null>(null)

  return (
    <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md overflow-hidden shadow-panel">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-sunken/60 text-muted font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Tarefa</th>
              <th className="py-3 px-4">Projeto</th>
              <th className="py-3 px-4">Categoria</th>
              <th className="py-3 px-4">Responsável</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Tempo Total</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tasks.map((task) => {
              const isRunning =
                activeTaskId === task.id || (activeTaskId === undefined && isTaskRunning(task))
              const totalSec =
                activeTaskId === task.id && activeTaskSeconds !== undefined
                  ? activeTaskSeconds
                  : calculateTaskTotalSeconds(task)

              return (
                <tr
                  key={task.id}
                  className={`group hover:bg-surface-raised/50 transition-colors ${
                    isRunning ? 'bg-brand/5' : ''
                  }`}
                >
                  {/* Task Title & Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-col">
                      <span
                        onClick={() => onEditTask(task)}
                        className="font-medium text-foreground hover:text-brand cursor-pointer transition-colors truncate"
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-muted text-[11px] truncate max-w-sm">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Project */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {task.project ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[11px] border"
                        style={{
                          backgroundColor: task.project.color ? `${task.project.color}15` : 'rgba(255,255,255,0.05)',
                          color: task.project.color || '#94a3b8',
                          borderColor: task.project.color ? `${task.project.color}35` : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <Folder className="w-3 h-3" />
                        {task.project.name}
                      </span>
                    ) : (
                      <span className="text-muted text-[11px]">—</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {task.category ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[11px] border"
                        style={{
                          backgroundColor: task.category.color ? `${task.category.color}15` : 'rgba(217,119,6,0.1)',
                          color: task.category.color || '#d97706',
                          borderColor: task.category.color ? `${task.category.color}35` : 'rgba(217,119,6,0.2)',
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        {task.category.name}
                      </span>
                    ) : (
                      <span className="text-muted text-[11px]">—</span>
                    )}
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {task.user ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand/20 text-brand border border-brand/30 flex items-center justify-center text-[10px] font-bold uppercase">
                          {task.user.name ? task.user.name.charAt(0) : task.user.email.charAt(0)}
                        </div>
                        <span className="text-foreground/90 font-medium">
                          {task.user.name || task.user.email.split('@')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted text-[11px]">Não atribuído</span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="w-36">
                      <CustomSelect
                        size="sm"
                        value={task.status}
                        onChange={(newStatus) => onStatusChange(task, newStatus as TaskStatus)}
                        options={[
                          { value: 'NOT_STARTED', label: 'A Fazer', color: '#71717a' },
                          { value: 'IN_PROGRESS', label: 'Em Andamento', color: '#14b8a6' },
                          { value: 'COMPLETED', label: 'Concluído', color: '#10b981' },
                          { value: 'CANCELED', label: 'Cancelado', color: '#f43f5e' },
                        ]}
                      />
                    </div>
                  </td>

                  {/* Time Spent */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] ${
                        isRunning
                          ? 'bg-brand/20 text-teal-300 font-bold'
                          : 'bg-surface-sunken text-muted'
                      }`}
                    >
                      <Clock className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse text-brand' : ''}`} />
                      <span>{formatSecondsToTimer(totalSec)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Timer button */}
                      <button
                        type="button"
                        onClick={() => onToggleTimer(task)}
                        title={isRunning ? 'Parar cronômetro' : 'Iniciar cronômetro'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isRunning
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-brand/15 text-teal-300 hover:bg-brand/25'
                        }`}
                      >
                        {isRunning ? (
                          <Square className="w-3.5 h-3.5 fill-rose-300" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-teal-300" />
                        )}
                      </button>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeMenuId === task.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 top-7 z-50 w-36 rounded-xl border border-border bg-surface-raised p-1 shadow-xl text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  onEditTask(task)
                                  setActiveMenuId(null)
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-surface-sunken transition-colors"
                              >
                                Editar Detalhes
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onStatusChange(task, 'COMPLETED')
                                  setActiveMenuId(null)
                                }}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-surface-sunken transition-colors"
                              >
                                <span>Concluir</span>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
