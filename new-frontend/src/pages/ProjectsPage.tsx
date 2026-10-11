import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  ListTodo,
  Sparkles,
  ArrowRight,
  Folder,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'
import type { Project, Task } from '../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman } from '../lib/timeUtils'

const COLOR_PRESETS = [
  '#0f766e', // Teal / Brand
  '#d97706', // Amber / Accent
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#14b8a6', // Cyan
  '#64748b', // Slate
]

export const ProjectsPage: React.FC = () => {
  const { activeOrg } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [submitting, setSubmitting] = useState(false)

  const activeOrgId = activeOrg?.id

  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [projsRes, tasksRes] = await Promise.all([
        projectService.listProjects(activeOrgId),
        taskService.listTasks({ organizationId: activeOrgId }).catch(() => []),
      ])
      setProjects(projsRes || [])
      setTasks(tasksRes || [])
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao carregar projetos.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Aggregate project statistics
  const projectStats = useMemo(() => {
    const statsMap = new Map<
      number,
      { totalTasks: number; completedTasks: number; totalSeconds: number }
    >()

    tasks.forEach((task) => {
      if (!task.project?.id) return
      const pId = task.project.id
      const current = statsMap.get(pId) || {
        totalTasks: 0,
        completedTasks: 0,
        totalSeconds: 0,
      }

      current.totalTasks += 1
      if (task.status === 'COMPLETED') {
        current.completedTasks += 1
      }
      current.totalSeconds += calculateTaskTotalSeconds(task)
      statsMap.set(pId, current)
    })

    return statsMap
  }, [tasks])

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const q = searchQuery.toLowerCase()
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, searchQuery])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrgId || !name.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const created = await projectService.createProject(activeOrgId, {
        name: name.trim(),
        color,
        icon: 'folder',
      })
      setProjects((prev) => [...prev, created])
      setIsModalOpen(false)
      setName('')
      setColor(COLOR_PRESETS[0])
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Falha ao criar projeto.')
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand via-brand-strong to-accent bg-clip-text text-transparent">
              Projetos
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/25 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              {activeOrg?.name || 'Workspace'}
            </span>
          </div>
          <p className="text-xs text-muted">
            Organize suas entregas em iniciativas, acompanhe o progresso e o tempo dedicado.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            title="Recarregar projetos"
            className="p-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-muted hover:text-foreground hover:bg-surface-raised transition-all shadow-panel disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs hover:bg-brand-hover shadow-md shadow-brand/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
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
            placeholder="Buscar projeto por nome..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-soft bg-surface-raised/80 text-xs text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
          />
        </div>
        <div className="text-xs text-muted font-medium">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
        </div>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 rounded-3xl border border-border-soft bg-surface-sunken/40 animate-pulse p-6 space-y-4"
            >
              <div className="h-5 bg-surface-raised rounded-md w-1/2" />
              <div className="h-3 bg-surface-raised rounded-md w-3/4" />
              <div className="h-2 bg-surface-raised rounded-full w-full mt-4" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-border-soft bg-surface/60 backdrop-blur-md shadow-panel">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-4">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            Nenhum projeto cadastrado
          </h3>
          <p className="text-xs text-muted max-w-sm mb-5 leading-relaxed">
            {searchQuery
              ? 'Nenhum projeto encontrado com este termo de busca.'
              : 'Projetos ajudam a agrupar demandas por produtos, clientes ou sprints.'}
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-md shadow-brand/25 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeiro Projeto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const stats = projectStats.get(project.id) || {
              totalTasks: 0,
              completedTasks: 0,
              totalSeconds: 0,
            }
            const progress =
              stats.totalTasks > 0
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                : 0

            return (
              <div
                key={project.id}
                className="group rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-6 hover:border-brand/40 shadow-panel hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon & Color badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs"
                        style={{
                          backgroundColor: project.color ? `${project.color}18` : 'rgba(15,118,110,0.15)',
                          borderColor: project.color ? `${project.color}40` : 'rgba(15,118,110,0.3)',
                          color: project.color || '#0f766e',
                        }}
                      >
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-brand transition-colors">
                          {project.name}
                        </h3>
                        <span className="text-[11px] text-muted font-medium">
                          ID #{project.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-surface-sunken/60 border border-border-soft mb-4">
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-3.5 h-3.5 text-muted" />
                      <div>
                        <p className="text-[10px] text-muted">Tarefas</p>
                        <p className="text-xs font-bold text-foreground">
                          {stats.totalTasks} ({stats.completedTasks} concl.)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <div>
                        <p className="text-[10px] text-muted">Tempo Total</p>
                        <p className="text-xs font-bold text-teal-400">
                          {formatSecondsToHuman(stats.totalSeconds)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted font-medium">Conclusão</span>
                      <span className="font-bold text-foreground">{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color || '#0f766e',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-border-soft/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {stats.completedTasks} entregues
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    <span>Ver Tarefas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Novo Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface-raised shadow-2xl z-10 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Novo Projeto</h2>
                  <p className="text-xs text-muted">Crie um projeto para agrupar demandas.</p>
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

            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Nome do Projeto <span className="text-brand">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Plataforma Web v3, App Mobile, API..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c
                          ? 'scale-115 border-white ring-2 ring-brand/50'
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
                  className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
