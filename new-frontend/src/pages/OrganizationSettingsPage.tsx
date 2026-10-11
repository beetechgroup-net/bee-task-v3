import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Shield,
  Users,
  FolderKanban,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const OrganizationSettingsPage: React.FC = () => {
  const { activeOrg, user } = useAuth()
  const navigate = useNavigate()

  if (!activeOrg) {
    return (
      <div className="p-8 text-center text-muted">
        Nenhuma organização ativa selecionada.
      </div>
    )
  }

  const isOwner = activeOrg.roles?.includes('OWNER') || false

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Configurações do Workspace
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/25">
            {activeOrg.name}
          </span>
        </div>
        <p className="text-xs text-muted">
          Informações gerais, permissões e detalhes estruturais do seu espaço de trabalho.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-brand/20">
              {activeOrg.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{activeOrg.name}</h2>
              <p className="text-xs text-muted">Identificador Único: #{activeOrg.id}</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
              isOwner
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {isOwner ? 'Proprietário (Owner)' : 'Colaborador (Member)'}
          </span>
        </div>

        {/* Workspace Details List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <span className="text-[11px] font-semibold text-muted block mb-1">
              Nome da Organização
            </span>
            <span className="text-sm font-bold text-foreground">{activeOrg.name}</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <span className="text-[11px] font-semibold text-muted block mb-1">
              Seu Perfil Conectado
            </span>
            <span className="text-sm font-bold text-foreground">
              {user?.name} ({user?.email})
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <span className="text-[11px] font-semibold text-muted block mb-1">
              Permissões Ativas
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeOrg.roles.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand/15 text-brand border border-brand/25"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <span className="text-[11px] font-semibold text-muted block mb-1">
              Status da Conexão
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sincronizado com Quarkus API</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Ações Rápidas do Workspace
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => navigate('/members')}
              className="p-3.5 rounded-xl border border-border bg-surface-raised hover:border-brand transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-brand" />
                <span className="text-xs font-semibold text-foreground">Gerenciar Membros</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="p-3.5 rounded-xl border border-border bg-surface-raised hover:border-brand transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4 text-brand" />
                <span className="text-xs font-semibold text-foreground">Projetos do Time</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/organizations')}
              className="p-3.5 rounded-xl border border-border bg-surface-raised hover:border-brand transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-brand" />
                <span className="text-xs font-semibold text-foreground">Trocar de Workspace</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="p-4 rounded-xl bg-surface-sunken/60 border border-border flex items-start gap-3 text-xs text-muted">
          <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <p>
            As alterações nos dados cadastrais da organização respeitam a política de isolamento multi-tenant do BeeTask. Apenas os usuários autenticados e aprovados têm acesso aos dados deste workspace.
          </p>
        </div>
      </div>
    </div>
  )
}
