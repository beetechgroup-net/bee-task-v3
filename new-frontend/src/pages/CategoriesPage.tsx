import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Clock,
  ListTodo,
  Sparkles,
  ArrowRight,
  Edit2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { categoryService } from '../services/categoryService'
import { taskService } from '../services/taskService'
import type { Category, Task } from '../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman } from '../lib/timeUtils'

const COLOR_PRESETS = [
  '#d97706', // Amber / Accent
  '#0f766e', // Teal / Brand
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Yellow
  '#64748b', // Slate
]

export const CategoriesPage: React.FC = () => {
  const { activeOrg } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [submitting, setSubmitting] = useState(false)

  const activeOrgId = activeOrg?.id

  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [catsRes, tasksRes] = await Promise.all([
        categoryService.listCategories(activeOrgId),
        taskService.listTasks({ organizationId: activeOrgId }).catch(() => []),
      ])
      setCategories(catsRes || [])
      setTasks(tasksRes || [])
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao carregar categorias.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Aggregate category statistics
  const categoryStats = useMemo(() => {
    const statsMap = new Map<
      number,
      { totalTasks: number; totalSeconds: number }
    >()

    tasks.forEach((task) => {
      if (!task.category?.id) return
      const cId = task.category.id
      const current = statsMap.get(cId) || {
        totalTasks: 0,
        totalSeconds: 0,
      }

      current.totalTasks += 1
      current.totalSeconds += calculateTaskTotalSeconds(task)
      statsMap.set(cId, current)
    })

    return statsMap
  }, [tasks])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const q = searchQuery.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, searchQuery])

  const handleOpenCreateModal = () => {
    setEditingCategory(null)
    setName('')
    setColor(COLOR_PRESETS[0])
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setColor(cat.color || COLOR_PRESETS[0])
    setIsModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrgId || !name.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      if (editingCategory) {
        const updated = await categoryService.updateCategory(activeOrgId, editingCategory.id, {
          name: name.trim(),
          color,
          icon: 'tag',
        })
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        )
      } else {
        const created = await categoryService.createCategory(activeOrgId, {
          name: name.trim(),
          color,
          icon: 'tag',
        })
        setCategories((prev) => [...prev, created])
      }
      setIsModalOpen(false)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Falha ao salvar categoria.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-accent via-amber-400 to-brand bg-clip-text text-transparent">
              Categorias & Tags
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/25 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {activeOrg?.name || 'Workspace'}
            </span>
          </div>
          <p className="text-xs text-muted">
            Classifique suas tarefas por tipos de trabalho (Bug, Feature, Reunião, Design) para métricas precisas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            title="Recarregar categorias"
            className="p-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-muted hover:text-foreground hover:bg-surface-raised transition-all shadow-panel disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-accent' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover shadow-md shadow-accent/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs shadow-panel backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex items-center justify-between gap-3 shadow-panel">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar categoria por nome..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-soft bg-surface-raised/80 text-xs text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
          />
        </div>
        <div className="text-xs text-muted font-medium">
          {filteredCategories.length} {filteredCategories.length === 1 ? 'categoria' : 'categorias'}
        </div>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl border border-border-soft bg-surface-sunken/40 animate-pulse p-6 space-y-3"
            >
              <div className="h-5 bg-surface-raised rounded-md w-1/2" />
              <div className="h-3 bg-surface-raised rounded-md w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-border-soft bg-surface/60 backdrop-blur-md shadow-panel">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            Nenhum categoria cadastrada
          </h3>
          <p className="text-xs text-muted max-w-sm mb-5 leading-relaxed">
            {searchQuery
              ? 'Nenhuma categoria encontrada com este termo.'
              : 'Categorias permitem segmentar seus fluxos de trabalho e auditar onde o tempo é consumido.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover shadow-md shadow-accent/25 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Categoria</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => {
            const stats = categoryStats.get(category.id) || {
              totalTasks: 0,
              totalSeconds: 0,
            }

            return (
              <div
                key={category.id}
                className="group rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-6 hover:border-accent/40 shadow-panel hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs"
                        style={{
                          backgroundColor: category.color ? `${category.color}18` : 'rgba(217,119,6,0.15)',
                          borderColor: category.color ? `${category.color}40` : 'rgba(217,119,6,0.3)',
                          color: category.color || '#d97706',
                        }}
                      >
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors">
                          {category.name}
                        </h3>
                        <span className="text-[11px] text-muted font-medium">
                          ID #{category.id}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(category)}
                      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                      title="Editar categoria"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-surface-sunken/60 border border-border-soft mb-4">
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-3.5 h-3.5 text-muted" />
                      <div>
                        <p className="text-[10px] text-muted">Tarefas</p>
                        <p className="text-xs font-bold text-foreground">
                          {stats.totalTasks} associadas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <p className="text-[10px] text-muted">Tempo Total</p>
                        <p className="text-xs font-bold text-amber-400">
                          {formatSecondsToHuman(stats.totalSeconds)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-border-soft/60 flex items-center justify-between">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#d97706' }}
                  />
                  <button
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    <span>Ver no Quadro</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Criar/Editar Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface-raised shadow-2xl z-10 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </h2>
                  <p className="text-xs text-muted">
                    {editingCategory
                      ? 'Atualize o nome ou cor da tag.'
                      : 'Crie uma categoria para agrupar tipos de trabalho.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Nome da Categoria <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Bugfix, Feature, Reunião, Documentação..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Cor da Tag
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c
                          ? 'scale-115 border-white ring-2 ring-accent/50'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-raised"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
