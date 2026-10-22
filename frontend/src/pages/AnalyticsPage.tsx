import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Folder,
  Tag,
  Users,
  RefreshCw,
  Sparkles,
  Activity,
  AlertCircle,
  User,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import { categoryService } from '../services/categoryService'
import { organizationService, type OrganizationMember } from '../services/organizationService'
import type { Task, Project, Category } from '../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman, formatSecondsToTimer } from '../lib/timeUtils'
import { CustomSelect } from '../components/ui/Select'

export const AnalyticsPage: React.FC = () => {
  const { user, activeOrg } = useAuth()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<OrganizationMember[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Scope Filter: 'ALL' | 'MINE' | email do membro
  const [searchParams, setSearchParams] = useSearchParams()
  const initialScope = searchParams.get('member') || 'ALL'
  const [selectedMember, setSelectedMember] = useState<string>(initialScope)

  const handleMemberChange = (value: string) => {
    setSelectedMember(value)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === 'ALL') next.delete('member')
        else next.set('member', value)
        return next
      },
      { replace: true }
    )
  }

  const activeOrgId = activeOrg?.id

  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [tasksRes, projsRes, catsRes, memsRes] = await Promise.allSettled([
        taskService.listTasks({ organizationId: activeOrgId }),
        projectService.listProjects(activeOrgId),
        categoryService.listCategories(activeOrgId),
        organizationService.listMembers(activeOrgId),
      ])

      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value || [])
      if (projsRes.status === 'fulfilled') setProjects(projsRes.value || [])
      if (catsRes.status === 'fulfilled') setCategories(catsRes.value || [])
      if (memsRes.status === 'fulfilled') setMembers(memsRes.value || [])
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao calcular métricas do workspace.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter tasks based on selected member scope
  const scopedTasks = useMemo(() => {
    if (selectedMember === 'ALL') return tasks
    const targetEmail = selectedMember === 'MINE' ? user?.email : selectedMember
    if (!targetEmail) return tasks
    return tasks.filter(
      (t) => t.user?.email && t.user.email.toLowerCase() === targetEmail.toLowerCase()
    )
  }, [tasks, selectedMember, user?.email])

  // Aggregate high-level KPIs based on scopedTasks
  const kpis = useMemo(() => {
    const totalTasks = scopedTasks.length
    const completedTasks = scopedTasks.filter((t) => t.status === 'COMPLETED').length
    const inProgressTasks = scopedTasks.filter((t) => t.status === 'IN_PROGRESS').length
    const notStartedTasks = scopedTasks.filter((t) => t.status === 'NOT_STARTED').length
    const canceledTasks = scopedTasks.filter((t) => t.status === 'CANCELED').length

    const totalSecondsTracked = scopedTasks.reduce(
      (acc, t) => acc + calculateTaskTotalSeconds(t),
      0
    )

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const avgSecondsPerCompletedTask =
      completedTasks > 0
        ? Math.round(
            scopedTasks
              .filter((t) => t.status === 'COMPLETED')
              .reduce((acc, t) => acc + calculateTaskTotalSeconds(t), 0) / completedTasks
          )
        : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      canceledTasks,
      totalSecondsTracked,
      completionRate,
      avgSecondsPerCompletedTask,
    }
  }, [scopedTasks])

  // Project breakdown
  const projectBreakdown = useMemo(() => {
    const map = new Map<number, { project: Project; seconds: number; taskCount: number }>()

    projects.forEach((p) => {
      map.set(p.id, { project: p, seconds: 0, taskCount: 0 })
    })

    let unassignedSeconds = 0
    let unassignedTasks = 0

    scopedTasks.forEach((t) => {
      const sec = calculateTaskTotalSeconds(t)
      if (t.project?.id && map.has(t.project.id)) {
        const item = map.get(t.project.id)!
        item.seconds += sec
        item.taskCount += 1
      } else {
        unassignedSeconds += sec
        unassignedTasks += 1
      }
    })

    const list = Array.from(map.values())
    if (unassignedTasks > 0) {
      list.push({
        project: { id: 0, name: 'Sem Projeto', color: '#64748b' },
        seconds: unassignedSeconds,
        taskCount: unassignedTasks,
      })
    }

    return list.sort((a, b) => b.seconds - a.seconds)
  }, [projects, scopedTasks])

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<number, { category: Category; seconds: number; taskCount: number }>()

    categories.forEach((c) => {
      map.set(c.id, { category: c, seconds: 0, taskCount: 0 })
    })

    let unassignedSeconds = 0
    let unassignedTasks = 0

    scopedTasks.forEach((t) => {
      const sec = calculateTaskTotalSeconds(t)
      if (t.category?.id && map.has(t.category.id)) {
        const item = map.get(t.category.id)!
        item.seconds += sec
        item.taskCount += 1
      } else {
        unassignedSeconds += sec
        unassignedTasks += 1
      }
    })

    const list = Array.from(map.values())
    if (unassignedTasks > 0) {
      list.push({
        category: { id: 0, name: 'Sem Categoria', color: '#64748b' },
        seconds: unassignedSeconds,
        taskCount: unassignedTasks,
      })
    }

    return list.sort((a, b) => b.seconds - a.seconds)
  }, [categories, scopedTasks])

  // Member breakdown
  const memberBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; seconds: number; completedCount: number; totalCount: number }
    >()

    members.forEach((m) => {
      map.set(m.userEmail, {
        name: m.userName,
        email: m.userEmail,
        seconds: 0,
        completedCount: 0,
        totalCount: 0,
      })
    })

    tasks.forEach((t) => {
      const sec = calculateTaskTotalSeconds(t)
      const email = t.user?.email || 'unassigned@bee.internal'
      if (!map.has(email)) {
        map.set(email, {
          name: t.user?.name || 'Não atribuído',
          email,
          seconds: 0,
          completedCount: 0,
          totalCount: 0,
        })
      }
      const item = map.get(email)!
      item.seconds += sec
      item.totalCount += 1
      if (t.status === 'COMPLETED') item.completedCount += 1
    })

    return Array.from(map.values()).sort((a, b) => b.seconds - a.seconds)
  }, [members, tasks])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand via-brand-strong to-accent bg-clip-text text-transparent">
              Analytics & Produtividade
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/25 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              {activeOrg?.name || 'Workspace'}
            </span>
          </div>
          <p className="text-xs text-muted">
            Auditoria de tempo investido, distribuição por iniciativas e acompanhamento da vazão da equipe.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={refreshing}
          title="Recarregar métricas"
          className="self-start sm:self-auto p-2.5 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md text-muted hover:text-foreground hover:bg-surface-raised transition-all shadow-panel disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand' : ''}`} />
        </button>
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

      {/* Scope Selector: Equipe Completa vs Apenas Minhas vs Membro Específico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-3xl bg-surface/90 border border-border-soft backdrop-blur-md shadow-panel">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-muted uppercase tracking-wider hidden sm:inline">
            Filtro de Membro:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-surface-sunken border border-border-soft shadow-inner">
            <button
              type="button"
              onClick={() => handleMemberChange('ALL')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedMember === 'ALL'
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Toda a Equipe</span>
            </button>
            <button
              type="button"
              onClick={() => handleMemberChange('MINE')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedMember === 'MINE'
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Apenas Minhas</span>
            </button>
          </div>

          {/* Specific Member Dropdown */}
          <div className="w-56">
            <CustomSelect
              size="sm"
              value={selectedMember === 'ALL' || selectedMember === 'MINE' ? '' : selectedMember}
              onChange={(val) => handleMemberChange(val || 'ALL')}
              placeholder="Outro Membro..."
              options={[
                { value: '', label: 'Outro Membro...' },
                ...members.map((m) => ({
                  value: m.userEmail,
                  label: m.userName,
                  description: m.userEmail,
                })),
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] truncate">
            {selectedMember === 'ALL'
              ? 'Calculando métricas globais consolidadas do workspace'
              : selectedMember === 'MINE'
              ? 'Calculando métricas estritamente do seu perfil'
              : `Filtrando métricas para o membro selecionado`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-3xl border border-border-soft bg-surface-sunken/40 animate-pulse p-5"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Time */}
            <div className="p-6 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex flex-col justify-between shadow-panel hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted">Tempo Total Dedicado</span>
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">
                    {formatSecondsToTimer(kpis.totalSecondsTracked)}
                  </p>
                  <span
                    className="text-muted/70 hover:text-foreground transition-colors shrink-0"
                    title={selectedMember === 'ALL' ? 'Métrica da Equipe' : 'Métrica Individual'}
                  >
                    {selectedMember === 'ALL' ? (
                      <Users className="w-4 h-4 text-muted" />
                    ) : (
                      <User className="w-4 h-4 text-brand" />
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Equivalente a {formatSecondsToHuman(kpis.totalSecondsTracked)}
                </p>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="p-6 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex flex-col justify-between shadow-panel hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted">Taxa de Conclusão</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
                    {kpis.completionRate}%
                  </p>
                  <span
                    className="text-muted/70 hover:text-foreground transition-colors shrink-0"
                    title={selectedMember === 'ALL' ? 'Métrica da Equipe' : 'Métrica Individual'}
                  >
                    {selectedMember === 'ALL' ? (
                      <Users className="w-4 h-4 text-muted" />
                    ) : (
                      <User className="w-4 h-4 text-brand" />
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  {kpis.completedTasks} de {kpis.totalTasks} demandas finalizadas
                </p>
              </div>
            </div>

            {/* In Progress vs Backlog */}
            <div className="p-6 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex flex-col justify-between shadow-panel hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted">Em Execução Agora</span>
                <div className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-300 tracking-tight">
                    {kpis.inProgressTasks} tarefas
                  </p>
                  <span
                    className="text-muted/70 hover:text-foreground transition-colors shrink-0"
                    title={selectedMember === 'ALL' ? 'Métrica da Equipe' : 'Métrica Individual'}
                  >
                    {selectedMember === 'ALL' ? (
                      <Users className="w-4 h-4 text-muted" />
                    ) : (
                      <User className="w-4 h-4 text-brand" />
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  {kpis.notStartedTasks} no backlog aguardando início
                </p>
              </div>
            </div>

            {/* Avg Time per Task */}
            <div className="p-6 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md flex flex-col justify-between shadow-panel hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted">Média por Entrega</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">
                    {formatSecondsToHuman(kpis.avgSecondsPerCompletedTask)}
                  </p>
                  <span
                    className="text-muted/70 hover:text-foreground transition-colors shrink-0"
                    title={selectedMember === 'ALL' ? 'Métrica da Equipe' : 'Métrica Individual'}
                  >
                    {selectedMember === 'ALL' ? (
                      <Users className="w-4 h-4 text-muted" />
                    ) : (
                      <User className="w-4 h-4 text-brand" />
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Tempo médio gasto em cada entrega concluída
                </p>
              </div>
            </div>
          </div>

      {/* Main Grid: Projects & Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Time Distribution */}
        <div className="p-6 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md shadow-panel space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                <Folder className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-foreground">
                Tempo por Projeto
              </h2>
            </div>
            <span className="text-xs text-muted font-medium">
              {projectBreakdown.length} projetos
            </span>
          </div>

          {projectBreakdown.length === 0 ? (
            <p className="text-xs text-muted py-8 text-center">Nenhum dado de projeto disponível.</p>
          ) : (
            <div className="space-y-4">
              {projectBreakdown.map((item) => {
                const pct =
                  kpis.totalSecondsTracked > 0
                    ? Math.round((item.seconds / kpis.totalSecondsTracked) * 100)
                    : 0
                return (
                  <div key={item.project.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.project.color || '#0f766e' }}
                        />
                        <span className="font-semibold text-foreground truncate">
                          {item.project.name}
                        </span>
                        <span className="text-[10px] text-muted font-normal">
                          ({item.taskCount} {item.taskCount === 1 ? 'tarefa' : 'tarefas'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className="text-foreground font-bold">
                          {formatSecondsToHuman(item.seconds)}
                        </span>
                        <span className="text-muted w-10 text-right font-sans">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.project.color || '#0f766e',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Category Time Distribution */}
        <div className="p-6 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md shadow-panel space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Tag className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-foreground">
                Tempo por Categoria / Tag
              </h2>
            </div>
            <span className="text-xs text-muted font-medium">
              {categoryBreakdown.length} categorias
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-muted py-8 text-center">Nenhum dado de categoria disponível.</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((item) => {
                const pct =
                  kpis.totalSecondsTracked > 0
                    ? Math.round((item.seconds / kpis.totalSecondsTracked) * 100)
                    : 0
                return (
                  <div key={item.category.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.category.color || '#d97706' }}
                        />
                        <span className="font-semibold text-foreground truncate">
                          {item.category.name}
                        </span>
                        <span className="text-[10px] text-muted font-normal">
                          ({item.taskCount} {item.taskCount === 1 ? 'tarefa' : 'tarefas'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className="text-foreground font-bold">
                          {formatSecondsToHuman(item.seconds)}
                        </span>
                        <span className="text-muted w-10 text-right font-sans">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.category.color || '#d97706',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Team Productivity Table */}
      <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-6 shadow-panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-foreground">
              Dedicação por Membro da Equipe
            </h2>
          </div>
          <span className="text-xs text-muted font-medium">
            {memberBreakdown.length} colaboradores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-sunken/40 text-muted font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Membro</th>
                <th className="py-3 px-4">Tarefas Atribuídas</th>
                <th className="py-3 px-4">Entregas Concluídas</th>
                <th className="py-3 px-4">Tempo Total Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {memberBreakdown.map((member, idx) => (
                <tr key={idx} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center font-bold text-brand uppercase text-[10px]">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{member.name}</p>
                        <p className="text-[10px] text-muted">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {member.totalCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {member.completedCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-300">
                    {formatSecondsToTimer(member.seconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  )
}
