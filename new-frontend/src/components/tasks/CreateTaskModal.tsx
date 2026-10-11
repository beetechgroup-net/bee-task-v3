import React, { useState, useEffect } from 'react'
import { X, Folder, Tag, User, Loader2, Sparkles } from 'lucide-react'
import type { Task, TaskStatus, Project, Category } from '../../types/task'
import type { OrganizationMember } from '../../services/organizationService'
import { projectService } from '../../services/projectService'
import { categoryService } from '../../services/categoryService'
import { organizationService } from '../../services/organizationService'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: {
    title: string
    description: string
    status: TaskStatus
    projectId?: number
    categoryId?: number
    assigneeUserId?: number
  }) => Promise<void>
  organizationId: number
  initialStatus?: TaskStatus
  initialTask?: Task | null
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  organizationId,
  initialStatus = 'NOT_STARTED',
  initialTask = null,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>(initialStatus)
  const [projectId, setProjectId] = useState<number | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [assigneeUserId, setAssigneeUserId] = useState<number | undefined>(undefined)

  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<OrganizationMember[]>([])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quick inline creation states
  const [newProjectName, setNewProjectName] = useState('')
  const [showAddProject, setShowAddProject] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  // Populate data when modal opens
  useEffect(() => {
    if (!isOpen) return

    if (initialTask) {
      setTitle(initialTask.title)
      setDescription(initialTask.description || '')
      setStatus(initialTask.status)
      setProjectId(initialTask.project?.id)
      setCategoryId(initialTask.category?.id)
      setAssigneeUserId(initialTask.user?.id)
    } else {
      setTitle('')
      setDescription('')
      setStatus(initialStatus)
      setProjectId(undefined)
      setCategoryId(undefined)
      setAssigneeUserId(undefined)
    }
    setError(null)
    setShowAddProject(false)
    setShowAddCategory(false)

    // Load projects, categories, members
    const loadMetadata = async () => {
      setLoading(true)
      try {
        const [projRes, catRes, memRes] = await Promise.allSettled([
          projectService.listProjects(organizationId),
          categoryService.listCategories(organizationId),
          organizationService.listMembers(organizationId),
        ])

        if (projRes.status === 'fulfilled') setProjects(projRes.value || [])
        if (catRes.status === 'fulfilled') setCategories(catRes.value || [])
        if (memRes.status === 'fulfilled') setMembers(memRes.value || [])
      } catch (err) {
        console.error('Error fetching metadata', err)
      } finally {
        setLoading(false)
      }
    }

    loadMetadata()
  }, [isOpen, organizationId, initialStatus, initialTask])

  if (!isOpen) return null

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    try {
      const created = await projectService.createProject(organizationId, {
        name: newProjectName.trim(),
        color: '#0f766e',
      })
      setProjects((prev) => [...prev, created])
      setProjectId(created.id)
      setNewProjectName('')
      setShowAddProject(false)
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao criar projeto.')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    try {
      const created = await categoryService.createCategory(organizationId, {
        name: newCategoryName.trim(),
        color: '#d97706',
      })
      setCategories((prev) => [...prev, created])
      setCategoryId(created.id)
      setNewCategoryName('')
      setShowAddCategory(false)
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao criar categoria.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('O título da tarefa é obrigatório.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        projectId,
        categoryId,
        assigneeUserId,
      })
      onClose()
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface-raised shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <p className="text-xs text-muted">
                {initialTask
                  ? 'Atualize as informações da demanda.'
                  : 'Preencha os campos para cadastrar no quadro de atividades.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Título da Tarefa <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Implementar autenticação via OAuth2..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Descrição detalhada
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o escopo, critérios de aceite ou observações importantes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all resize-none"
            />
          </div>

          {/* Project & Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Project */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-brand" />
                  Projeto
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="text-[11px] text-brand hover:underline font-medium"
                >
                  {showAddProject ? 'Cancelar' : '+ Novo'}
                </button>
              </div>

              {showAddProject ? (
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Nome do projeto..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <button
                    type="button"
                    onClick={handleCreateProject}
                    className="px-2.5 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-hover"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <select
                  value={projectId ?? ''}
                  onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="">Sem projeto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-accent" />
                  Categoria
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-[11px] text-accent hover:underline font-medium"
                >
                  {showAddCategory ? 'Cancelar' : '+ Nova'}
                </button>
              </div>

              {showAddCategory ? (
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da categoria..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-2.5 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId ?? ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Assignee & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted" />
                Responsável
              </label>
              <select
                value={assigneeUserId ?? ''}
                onChange={(e) =>
                  setAssigneeUserId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">Atribuir a mim mesmo / Sem responsável</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userName} ({m.userEmail})
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="NOT_STARTED">A Fazer (NOT_STARTED)</option>
                <option value="IN_PROGRESS">Em Andamento (IN_PROGRESS)</option>
                <option value="COMPLETED">Concluído (COMPLETED)</option>
                <option value="CANCELED">Cancelado (CANCELED)</option>
              </select>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-raised transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {initialTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
