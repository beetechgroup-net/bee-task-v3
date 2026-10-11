import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  LogOut,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { taskService } from '../services/taskService'
import type { Task } from '../types/task'
import { calculateTaskTotalSeconds, formatSecondsToHuman, formatSecondsToTimer } from '../lib/timeUtils'

export const ProfilePage: React.FC = () => {
  const { user, activeOrg, setActiveOrg, logout } = useAuth()
  const navigate = useNavigate()

  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

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
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          Meu Perfil & Conta
        </h1>
        <p className="text-xs text-muted">
          Gerencie seus dados pessoais, credenciais de acesso e visualize seu desempenho.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
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
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
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
            <div className="flex items-center justify-center py-8 text-muted gap-2 text-xs rounded-xl bg-surface-raised border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Carregando estatísticas pessoais...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-surface-raised border border-border">
                <span className="text-[11px] font-semibold text-muted block mb-1">
                  Tempo Registrado
                </span>
                <span className="text-lg font-extrabold text-teal-300 font-mono">
                  {formatSecondsToTimer(myTotalSeconds)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  ({formatSecondsToHuman(myTotalSeconds)})
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border">
                <span className="text-[11px] font-semibold text-muted block mb-1">
                  Tarefas Concluídas
                </span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {myCompletedCount} entregas
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  de {myTasks.length} atribuídas a você
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border">
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
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-border bg-surface-raised hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCurrent
                          ? 'bg-brand text-white'
                          : 'bg-surface-sunken text-muted border border-border'
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
                    <span className="px-2 py-0.5 rounded-md bg-brand/20 text-brand text-[10px] font-bold">
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
