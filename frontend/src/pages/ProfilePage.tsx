import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  LogOut,
  ExternalLink,
  Loader2,
  Target,
  CheckCircle2,
  Save,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { taskService } from '../services/taskService'
import type { Task } from '../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman, formatSecondsToTimer } from '../lib/timeUtils'
import { CustomSelect } from '../components/ui/Select'
import {
  getUserWorkGoal,
  saveUserWorkGoal,
  type WorkGoal,
  type WorkGoalPeriod,
} from '../lib/userGoals'

export const ProfilePage: React.FC = () => {
  const { user, activeOrg, setActiveOrg, logout } = useAuth()
  const navigate = useNavigate()

  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Workload & Goal State (Global)
  const [goalPeriod, setGoalPeriod] = useState<WorkGoalPeriod>('DAILY')
  const [goalHours, setGoalHours] = useState<number>(8)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (user?.email) {
      const g = getUserWorkGoal(user.email)
      setGoalPeriod(g.period)
      setGoalHours(g.targetHours)
    }
  }, [user?.email])

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return
    const validHours = Math.max(1, Math.min(720, Number(goalHours) || 8))
    const goal: WorkGoal = {
      period: goalPeriod,
      targetHours: validHours,
    }
    setGoalHours(validHours)
    saveUserWorkGoal(user.email, goal)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  useEffect(() => {
    if (!activeOrg?.id) return
    const loadMyTasks = async () => {
      try {
        const res = await taskService.listMyTasks({ organizationId: activeOrg.id })
        setMyTasks(res || [])
      } catch (err) {
        console.error('Failed to load my tasks', err)
      } finally {
        setLoading(false)
      }
    }
    loadMyTasks()
  }, [activeOrg?.id])

  const myTotalSeconds = myTasks.reduce(
    (acc, t) => acc + calculateTaskTotalSeconds(t),
    0
  )
  const myCompletedCount = myTasks.filter((t) => t.status === 'COMPLETED').length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand via-brand-strong to-accent bg-clip-text text-transparent mb-1">
          Meu Perfil & Conta
        </h1>
        <p className="text-xs text-muted">
          Gerencie seus dados pessoais, credenciais de acesso e visualize seu desempenho.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md p-8 shadow-panel space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand/40 bg-gradient-to-br from-brand to-teal-700 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-brand/20 shrink-0">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name || 'Avatar'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : user.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                user.email.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{user.name || 'Usuário'}</h2>
              <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition-all hover:shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>

        {/* My Performance KPIs */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Meu Desempenho no Workspace Atual ({activeOrg?.name})
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted gap-2 text-xs rounded-2xl bg-surface-raised/80 border border-border-soft">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Carregando estatísticas pessoais...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-5 rounded-2xl bg-surface-raised/80 border border-border-soft shadow-xs">
                <span className="text-[11px] font-semibold text-muted block mb-1">
                  Tempo Registrado
                </span>
                <span className="text-lg font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                  {formatSecondsToTimer(myTotalSeconds)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  ({formatSecondsToHuman(myTotalSeconds)})
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-raised/80 border border-border-soft shadow-xs">
                <span className="text-[11px] font-semibold text-muted block mb-1">
                  Tarefas Concluídas
                </span>
                <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                  {myCompletedCount} entregas
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  de {myTasks.length} atribuídas a você
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-raised/80 border border-border-soft shadow-xs">
                <span className="text-[11px] font-semibold text-muted block mb-1">
                  Workspace Ativo
                </span>
                <span className="text-sm font-bold text-foreground truncate block">
                  {activeOrg?.name}
                </span>
                <span className="text-[10px] text-brand font-semibold block mt-0.5">
                  {activeOrg?.roles.join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Workload & Time Goals (Global) */}
        <div className="p-6 rounded-3xl border border-border-soft bg-surface-raised/60 backdrop-blur-md shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-600/20 dark:border-amber-500/25 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Jornada de Trabalho & Metas de Tempo
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                    Global
                  </span>
                </h3>
                <p className="text-xs text-muted">
                  Defina o número de horas que você planeja trabalhar. Esse valor será usado para calcular sua barra de progresso no Dashboard.
                </p>
              </div>
            </div>

            {savedSuccess && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Meta salva com sucesso!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveGoal} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Period selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Frequência da Meta
                </label>
                <CustomSelect
                  value={goalPeriod}
                  onChange={(val) => {
                    const newPeriod = val as WorkGoalPeriod
                    setGoalPeriod(newPeriod)
                    // Auto-adjust default recommended hours when changing period
                    if (newPeriod === 'DAILY' && goalHours > 24) setGoalHours(8)
                    else if (newPeriod === 'WEEKLY' && (goalHours < 15 || goalHours > 80)) setGoalHours(40)
                    else if (newPeriod === 'MONTHLY' && goalHours < 60) setGoalHours(160)
                  }}
                  options={[
                    { value: 'DAILY', label: '☀️ Diária (por dia de trabalho)' },
                    { value: 'WEEKLY', label: '📅 Semanal (por semana)' },
                    { value: 'MONTHLY', label: '📆 Mensal (por mês)' },
                  ]}
                />
              </div>

              {/* Hours target */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Número de Horas Planejadas
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="720"
                    step="0.5"
                    value={goalHours}
                    onChange={(e) => setGoalHours(Number(e.target.value))}
                    required
                    className="w-full pl-3.5 pr-28 py-2.5 rounded-xl border border-border-soft bg-surface text-xs font-bold text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted pointer-events-none select-none">
                      horas
                    </span>
                    <div className="flex items-center gap-0.5 pl-1.5 border-l border-border-soft">
                      <button
                        type="button"
                        onClick={() => setGoalHours((prev) => Math.max(1, (Number(prev) || 0) - 1))}
                        className="w-6 h-6 rounded-md bg-surface-sunken hover:bg-surface-raised border border-border-soft text-muted hover:text-foreground text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="Diminuir 1 hora"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalHours((prev) => Math.min(720, (Number(prev) || 0) + 1))}
                        className="w-6 h-6 rounded-md bg-surface-sunken hover:bg-surface-raised border border-border-soft text-muted hover:text-foreground text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="Aumentar 1 hora"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-muted font-medium mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Atalhos rápidos:
              </span>
              {[
                { label: '4h / dia', period: 'DAILY' as WorkGoalPeriod, hours: 4 },
                { label: '6h / dia', period: 'DAILY' as WorkGoalPeriod, hours: 6 },
                { label: '8h / dia (Padrão CLT)', period: 'DAILY' as WorkGoalPeriod, hours: 8 },
                { label: '20h / semana (Meio período)', period: 'WEEKLY' as WorkGoalPeriod, hours: 20 },
                { label: '40h / semana (Integral)', period: 'WEEKLY' as WorkGoalPeriod, hours: 40 },
                { label: '160h / mês', period: 'MONTHLY' as WorkGoalPeriod, hours: 160 },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setGoalPeriod(preset.period)
                    setGoalHours(preset.hours)
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    goalPeriod === preset.period && goalHours === preset.hours
                      ? 'bg-brand text-white border-brand shadow-xs'
                      : 'bg-surface hover:bg-surface-sunken text-muted hover:text-foreground border-border-soft'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover shadow-md shadow-brand/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Meta de Horas</span>
              </button>
            </div>
          </form>
        </div>

        {/* My Workspaces */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Meus Workspaces Cadastrados
            </h3>
            <button
              type="button"
              onClick={() => navigate('/organizations')}
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <span>Gerenciar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.organizations.map((org) => {
              const isCurrent = org.id === activeOrg?.id
              return (
                <div
                  key={org.id}
                  onClick={() => setActiveOrg(org.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-brand bg-brand/10 ring-1 ring-brand/40 shadow-xs'
                      : 'border-border-soft bg-surface-raised/80 hover:border-brand/40 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCurrent
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-surface-sunken text-muted border border-border-soft'
                      }`}
                    >
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{org.name}</h4>
                      <p className="text-[10px] text-muted">{org.roles.join(', ')}</p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-brand/20 text-brand text-[10px] font-bold">
                      Ativo
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
