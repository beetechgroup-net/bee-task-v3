import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  RefreshCw,
  RotateCcw,
  BarChart3,
  Layers,
  LayoutDashboard,
  AlertCircle,
  Check,
  User,
  Users,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTimer } from '../contexts/TimerContext'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import { categoryService } from '../services/categoryService'
import type { Task, Project, Category } from '../types/task'
import {
  getLocalPreferences,
  syncPreferencesFromBackend,
  savePreferencesToBackend,
  DEFAULT_V2_CARDS,
  type DashboardV2Card,
} from '../lib/userPreferences'
import { getUserWorkGoal, type WorkGoal } from '../lib/userGoals'
import { BiUniformCard } from '../components/dashboard/BiUniformCard'
import { CreateBiCardModal } from '../components/dashboard/CreateBiCardModal'

export const DashboardV2Page: React.FC = () => {
  const { user, activeOrg } = useAuth()
  const { activeTask, activeSeconds, startTimer, stopTimer, syncWithTasks } = useTimer()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Work goal
  const [workGoal, setWorkGoal] = useState<WorkGoal>(() => getUserWorkGoal(user?.email))

  // Dashboard v2 BI Cards State
  const [biCards, setBiCards] = useState<DashboardV2Card[]>(() =>
    getLocalPreferences(user?.email).dashboardV2?.cards || DEFAULT_V2_CARDS
  )

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<DashboardV2Card | null>(null)
  const [saveToast, setSaveToast] = useState(false)

  // Scope Toggle State (Individual vs Equipe)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialScope =
    (searchParams.get('scope') as 'mine' | 'team') ||
    (localStorage.getItem('beetask_bi_scope') as 'mine' | 'team') ||
    'team'
  const [viewScope, setViewScope] = useState<'mine' | 'team'>(initialScope)

  const handleScopeChange = (newScope: 'mine' | 'team') => {
    setViewScope(newScope)
    try {
      localStorage.setItem('beetask_bi_scope', newScope)
    } catch (_) {}
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('scope', newScope)
        return next
      },
      { replace: true }
    )
  }

  const activeOrgId = activeOrg?.id

  // Load backend data
  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [tasksRes, projsRes, catsRes] = await Promise.allSettled([
        taskService.listTasks({ organizationId: activeOrgId }),
        projectService.listProjects(activeOrgId),
        categoryService.listCategories(activeOrgId),
      ])

      const loadedTasks = tasksRes.status === 'fulfilled' ? tasksRes.value || [] : []
      setTasks(loadedTasks)
      syncWithTasks(loadedTasks)

      if (projsRes.status === 'fulfilled') {
        setProjects(projsRes.value || [])
      }
      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value || [])
      }
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar dados do workspace.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId, syncWithTasks])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Sync preferences on load & user change
  useEffect(() => {
    if (user?.email) {
      setWorkGoal(getUserWorkGoal(user.email))
      setBiCards(getLocalPreferences(user.email).dashboardV2?.cards || DEFAULT_V2_CARDS)

      syncPreferencesFromBackend(user.email).then((prefs) => {
        if (prefs?.dashboardV2?.cards) {
          setBiCards(prefs.dashboardV2.cards)
        }
      })
    }
  }, [user?.email])

  // Persist helper
  const persistBiCards = useCallback(
    async (newCards: DashboardV2Card[]) => {
      if (!user?.email) return
      setBiCards(newCards)
      try {
        await savePreferencesToBackend(user.email, {
          dashboardV2: { cards: newCards },
          workGoal,
        })
        setSaveToast(true)
        setTimeout(() => setSaveToast(false), 1500)
      } catch (err) {
        console.error('Failed to save BI cards to backend:', err)
      }
    },
    [user?.email, workGoal]
  )

  // Add or Edit Card
  const handleSaveCard = (card: DashboardV2Card) => {
    const exists = biCards.some((c) => c.id === card.id)
    let next: DashboardV2Card[]
    if (exists) {
      next = biCards.map((c) => (c.id === card.id ? card : c))
    } else {
      next = [...biCards, card]
    }
    persistBiCards(next)
  }

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    const next = biCards.filter((c) => c.id !== cardId)
    persistBiCards(next)
  }

  // Drag and Drop reordering state & handlers
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null)

  const handleSwapCards = (idA: string, idB: string) => {
    if (idA === idB) return
    const indexA = biCards.findIndex((c) => c.id === idA)
    const indexB = biCards.findIndex((c) => c.id === idB)
    if (indexA === -1 || indexB === -1) return

    const next = [...biCards]
    const temp = next[indexA]
    next[indexA] = next[indexB]
    next[indexB] = temp

    persistBiCards(next)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedCardId(id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCardId !== id) {
      setDragOverCardId(id)
    }
  }

  const handleDragLeave = (_e: React.DragEvent, id: string) => {
    if (dragOverCardId === id) {
      setDragOverCardId(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = (e.dataTransfer.getData('text/plain') as string) || draggedCardId
    if (sourceId && sourceId !== targetId) {
      handleSwapCards(sourceId, targetId)
    }
    setDraggedCardId(null)
    setDragOverCardId(null)
  }

  const handleDragEnd = () => {
    setDraggedCardId(null)
    setDragOverCardId(null)
  }

  // Move Card Left/Right
  const handleMoveCard = (cardId: string, direction: 'prev' | 'next') => {
    const currentIdx = biCards.findIndex((c) => c.id === cardId)
    if (currentIdx === -1) return

    const targetIdx = direction === 'prev' ? currentIdx - 1 : currentIdx + 1
    if (targetIdx < 0 || targetIdx >= biCards.length) return

    const next = [...biCards]
    const temp = next[currentIdx]
    next[currentIdx] = next[targetIdx]
    next[targetIdx] = temp

    persistBiCards(next)
  }

  // Reset to default cards
  const handleResetDefault = () => {
    persistBiCards(DEFAULT_V2_CARDS)
  }

  // Clear all cards to start 100% from scratch
  const handleClearAll = () => {
    persistBiCards([])
  }

  // Timer handler
  const handleToggleTimer = async (task: Task) => {
    try {
      if (activeTask?.id === task.id) {
        const stopped = await stopTimer(task)
        if (stopped) {
          setTasks((prev) => prev.map((t) => (t.id === stopped.id ? stopped : t)))
        }
      } else {
        const started = await startTimer(task)
        setTasks((prev) => prev.map((t) => (t.id === started.id ? started : t)))
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao acionar cronômetro.')
    }
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Desenvolvedor'

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-2">
        <div className="space-y-2">
          {/* Tabs: Visão Geral vs BI v2 */}
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft bg-surface hover:bg-surface-raised text-xs font-semibold text-muted hover:text-foreground transition-all shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Visão Geral</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-xs font-bold text-brand shadow-xs">
              <BarChart3 className="w-3.5 h-3.5 text-brand" />
              <span>Painel BI v2 (Modular)</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            BI Customizável, {firstName}!{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-strong to-accent">
              Monte seu painel.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Crie e combine indicadores do zero em cards uniformes. Filtre por projeto, período e status como em um BI corporativo.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            title="Recarregar dados"
            className="p-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-muted hover:text-foreground hover:bg-surface-raised transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          </button>

          {biCards.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              title="Limpar todos os cards para começar do zero"
              className="px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-xs font-bold text-muted hover:text-foreground hover:bg-surface-raised transition-all shadow-xs"
            >
              Limpar Todos
            </button>
          )}

          <button
            type="button"
            onClick={handleResetDefault}
            title="Restaurar conjunto padrão de cards de BI"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-xs font-bold text-muted hover:text-foreground hover:bg-surface-raised transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar Padrão</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingCard(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-strong text-white font-bold text-xs shadow-lg shadow-brand/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Card de BI</span>
          </button>
        </div>
      </div>

      {/* Save Toast Feedback */}
      {saveToast && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4" />
          <span>Configuração salva no banco de dados!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
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

      {/* Scope Selector: Individual vs Equipe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-surface/90 border border-border-soft backdrop-blur-md shadow-panel">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted uppercase tracking-wider hidden sm:inline">
            Escopo do Painel:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-surface-sunken border border-border-soft shadow-inner">
            <button
              type="button"
              onClick={() => handleScopeChange('mine')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'mine'
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Minha Visão (Individual)</span>
            </button>
            <button
              type="button"
              onClick={() => handleScopeChange('team')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'team'
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Visão da Equipe (Workspace)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] truncate">
            {viewScope === 'mine'
              ? 'Exibindo cards com dados das suas tarefas atribuídas'
              : 'Exibindo cards com métricas consolidadas de todo o workspace'}
          </span>
        </div>
      </div>

      {/* Uniform Modular Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[260px] rounded-3xl border border-border-soft bg-surface/60 backdrop-blur-md animate-pulse p-5"
            />
          ))}
        </div>
      ) : biCards.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-dashed border-border-soft bg-surface/60 backdrop-blur-md p-8 space-y-4">
          <Layers className="w-12 h-12 text-muted mx-auto mb-2 opacity-50" />
          <h3 className="text-lg font-bold text-foreground">Seu Painel BI está vazio</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Você pode criar cards totalmente customizados do zero escolhendo métricas, filtros de projeto, períodos e status.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-4 py-2.5 rounded-xl border border-border-soft bg-surface text-foreground text-xs font-bold hover:bg-surface-raised transition-all"
            >
              Carregar Cards de Exemplo
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingCard(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-strong shadow-lg shadow-brand/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeiro Card</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {biCards.map((card, idx) => (
            <BiUniformCard
              key={card.id}
              card={card}
              index={idx}
              totalCards={biCards.length}
              tasks={tasks}
              projects={projects}
              categories={categories}
              activeTask={activeTask}
              activeSeconds={activeSeconds}
              workGoal={workGoal}
              globalScope={viewScope}
              isBeingDragged={draggedCardId === card.id}
              isDragOver={dragOverCardId === card.id}
              onToggleTimer={handleToggleTimer}
              onMoveCard={handleMoveCard}
              onEditCard={(c) => {
                setEditingCard(c)
                setIsModalOpen(true)
              }}
              onDeleteCard={handleDeleteCard}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}

      {/* Create / Edit BI Card Modal */}
      <CreateBiCardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCard(null)
        }}
        onSave={handleSaveCard}
        editingCard={editingCard}
        projects={projects}
        categories={categories}
      />
    </div>
  )
}
