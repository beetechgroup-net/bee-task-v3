import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  RefreshCw,
  Clock,
  ListTodo,
  ArrowRight,
  Edit2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Ban,
  Trash2,
  Check,
  MoveUp,
  MoveDown,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { taskStatusService } from '../services/taskStatusService'
import { taskService } from '../services/taskService'
import type { TaskStatus, Task } from '../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman } from '../lib/timeUtils'

const COLOR_PRESETS = [
  '#71717a', // Zinc
  '#0f766e', // Teal / Brand
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#64748b', // Slate
]

export const StatusesPage: React.FC = () => {
  const { activeOrg } = useAuth()
  const navigate = useNavigate()

  const [statuses, setStatuses] = useState<TaskStatus[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<TaskStatus | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [isDefault, setIsDefault] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCanceled, setIsCanceled] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Delete Modal
  const [deletingStatus, setDeletingStatus] = useState<TaskStatus | null>(null)
  const [moveToStatusId, setMoveToStatusId] = useState<number | undefined>(undefined)
  const [deleting, setDeleting] = useState(false)

  const activeOrgId = activeOrg?.id

  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [statusesRes, tasksRes] = await Promise.all([
        taskStatusService.listStatuses(activeOrgId),
        taskService.listTasks({ organizationId: activeOrgId }).catch(() => []),
      ])
      setStatuses(statusesRes || [])
      setTasks(tasksRes || [])
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao carregar status.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Aggregate stats per status
  const statusStats = useMemo(() => {
    const statsMap = new Map<number, { totalTasks: number; totalSeconds: number }>()

    tasks.forEach((task) => {
      let matchedStatusId: number | undefined = task.taskStatus?.id

      if (!matchedStatusId) {
        const found = statuses.find(
          (s) =>
            s.name === task.status ||
            (s.name === 'A Fazer' && (task.status === 'NOT_STARTED' || task.taskStatus?.isDefault)) ||
            (s.name === 'Em Andamento' && task.status === 'IN_PROGRESS') ||
            (s.name === 'Concluído' && (task.status === 'COMPLETED' || task.taskStatus?.isCompleted)) ||
            (s.name === 'Cancelado' && (task.status === 'CANCELED' || task.taskStatus?.isCanceled))
        )
        matchedStatusId = found?.id
      }

      if (matchedStatusId) {
        const current = statsMap.get(matchedStatusId) || { totalTasks: 0, totalSeconds: 0 }
        current.totalTasks += 1
        current.totalSeconds += calculateTaskTotalSeconds(task)
        statsMap.set(matchedStatusId, current)
      }
    })

    return statsMap
  }, [tasks, statuses])

  const openCreateModal = () => {
    setEditingStatus(null)
    setName('')
    setColor(COLOR_PRESETS[0])
    setIsDefault(false)
    setIsCompleted(false)
    setIsCanceled(false)
    setIsModalOpen(true)
  }

  const openEditModal = (st: TaskStatus) => {
    setEditingStatus(st)
    setName(st.name)
    setColor(st.color || COLOR_PRESETS[0])
    setIsDefault(Boolean(st.isDefault))
    setIsCompleted(Boolean(st.isCompleted))
    setIsCanceled(Boolean(st.isCanceled))
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrgId || !name.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      if (editingStatus) {
        await taskStatusService.updateStatus(activeOrgId, editingStatus.id, {
          name: name.trim(),
          color,
          isDefault,
          isCompleted,
          isCanceled,
        })
      } else {
        await taskStatusService.createStatus(activeOrgId, {
          name: name.trim(),
          color,
          isDefault,
          isCompleted,
          isCanceled,
        })
      }
      setIsModalOpen(false)
      loadData()
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Falha ao salvar status.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenDeleteModal = (st: TaskStatus) => {
    const otherStatuses = statuses.filter((s) => s.id !== st.id)
    setMoveToStatusId(otherStatuses.length > 0 ? otherStatuses[0].id : undefined)
    setDeletingStatus(st)
  }

  const handleConfirmDelete = async () => {
    if (!activeOrgId || !deletingStatus) return
    setDeleting(true)
    setError(null)
    try {
      await taskStatusService.deleteStatus(activeOrgId, deletingStatus.id, moveToStatusId)
      setDeletingStatus(null)
      loadData()
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Falha ao excluir status.')
    } finally {
      setDeleting(false)
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (!activeOrgId) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= statuses.length) return

    const reordered = [...statuses]
    const temp = reordered[index]
    reordered[index] = reordered[targetIndex]
    reordered[targetIndex] = temp

    setStatuses(reordered)
    try {
      await taskStatusService.reorderStatuses(
        activeOrgId,
        reordered.map((s) => s.id)
      )
    } catch (err) {
      console.error('Failed to reorder statuses', err)
      loadData()
    }
  }

  const filteredStatuses = useMemo(() => {
    if (!searchQuery.trim()) return statuses
    const q = searchQuery.toLowerCase()
    return statuses.filter((s) => s.name.toLowerCase().includes(q))
  }, [statuses, searchQuery])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Estados das Tarefas</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-soft text-brand border border-brand/20">
              {statuses.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Personalize as colunas e os fluxos de trabalho da organização {activeOrg?.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="p-2 rounded-xl border border-border-soft bg-surface hover:bg-surface-raised text-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-accent to-brand text-accent-foreground font-semibold text-xs shadow-md shadow-accent/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Status</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto text-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border-soft bg-surface text-foreground text-xs focus:outline-hidden focus:border-brand transition-colors"
          />
        </div>
      </div>

      {/* Grid of Statuses */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl border border-border-soft bg-surface-sunken/40 animate-pulse" />
          ))}
        </div>
      ) : filteredStatuses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-border-soft bg-surface/40">
          <CircleDot className="w-10 h-10 text-muted/60 mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Nenhum status encontrado</h3>
          <p className="text-xs text-muted mb-4 max-w-sm">
            {searchQuery
              ? 'Nenhum status corresponde à busca atual.'
              : 'Crie seu primeiro status para gerenciar o fluxo das tarefas da sua organização.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand text-brand-foreground font-semibold text-xs shadow-md shadow-brand/20 hover:opacity-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Status</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStatuses.map((st, index) => {
            const stats = statusStats.get(st.id) || { totalTasks: 0, totalSeconds: 0 }
            let IconComponent = Clock
            if (st.isCompleted) IconComponent = CheckCircle2
            else if (st.isCanceled) IconComponent = Ban
            else if (st.isDefault) IconComponent = CircleDot

            return (
              <div
                key={st.id}
                className="group relative rounded-3xl border border-border-soft bg-surface/70 backdrop-blur-md p-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:border-border flex flex-col justify-between"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: st.color || '#71717a',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${st.color}20`,
                          color: st.color,
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">{st.name}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {st.isDefault && (
                            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-brand-soft text-brand border border-brand/20">
                              Padrão
                            </span>
                          )}
                          {st.isCompleted && (
                            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                              Conclusão
                            </span>
                          )}
                          {st.isCanceled && (
                            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/20">
                              Cancelamento
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order buttons & Edit */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        title="Mover para a esquerda / cima"
                        className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === filteredStatuses.length - 1}
                        title="Mover para a direita / baixo"
                        className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(st)}
                        title="Editar status"
                        className="p-1 rounded-lg text-muted hover:text-brand hover:bg-surface-raised transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {statuses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(st)}
                          title="Excluir status"
                          className="p-1 rounded-lg text-muted hover:text-rose-400 hover:bg-surface-raised transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border-soft">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>
                        <strong className="text-foreground font-mono">{stats.totalTasks}</strong> tarefas
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        <strong className="text-foreground font-mono">{formatSecondsToHuman(stats.totalSeconds)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-[11px] text-muted">
                  <span>Posição no Kanban: {st.position + 1}</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/tasks?scope=team`)}
                    className="inline-flex items-center gap-1 text-brand hover:underline"
                  >
                    <span>Ver no quadro</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-soft pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-brand" />
                <span>{editingStatus ? 'Editar Status' : 'Novo Status'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Nome do Status</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Em Teste, Homologação, Bloqueado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-raised text-foreground text-xs focus:outline-hidden focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Cor da Coluna</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setColor(preset)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        color === preset ? 'border-foreground scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset }}
                    >
                      {color === preset && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Behavior Flags */}
              <div className="space-y-2 pt-2 border-t border-border-soft">
                <label className="block text-xs font-semibold text-foreground mb-1">Comportamento</label>

                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded-md border-border text-brand focus:ring-brand"
                  />
                  <span>Status inicial padrão para novas tarefas</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => {
                      setIsCompleted(e.target.checked)
                      if (e.target.checked) setIsCanceled(false)
                    }}
                    className="w-4 h-4 rounded-md border-border text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Indica que a tarefa foi concluída</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCanceled}
                    onChange={(e) => {
                      setIsCanceled(e.target.checked)
                      if (e.target.checked) setIsCompleted(false)
                    }}
                    className="w-4 h-4 rounded-md border-border text-rose-500 focus:ring-rose-500"
                  />
                  <span>Indica que a tarefa foi cancelada</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-border-soft text-xs text-muted hover:text-foreground hover:bg-surface-raised"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-brand text-accent-foreground font-semibold text-xs shadow-md shadow-accent/20 hover:opacity-95 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingStatus ? 'Salvar Alterações' : 'Criar Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Excluir com Reatribuição */}
      {deletingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Excluir Status "{deletingStatus.name}"?</h3>
                <p className="text-xs text-muted">Esta ação remove o status e a coluna correspondente no Kanban.</p>
              </div>
            </div>

            {(() => {
              const taskCount = statusStats.get(deletingStatus.id)?.totalTasks || 0
              const otherStatuses = statuses.filter((s) => s.id !== deletingStatus.id)

              if (taskCount > 0) {
                return (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
                      Existem <strong>{taskCount}</strong> tarefas neste status. Escolha para qual status elas devem ser
                      movidas:
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Mover tarefas para:</label>
                      <select
                        value={moveToStatusId}
                        onChange={(e) => setMoveToStatusId(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface-raised text-foreground text-xs"
                      >
                        {otherStatuses.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )
              }
              return (
                <p className="text-xs text-muted">Não há tarefas vinculadas a este status. Ele pode ser excluído com segurança.</p>
              )
            })()}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setDeletingStatus(null)}
                className="px-3.5 py-2 rounded-xl border border-border-soft text-xs text-muted hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Excluir Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
