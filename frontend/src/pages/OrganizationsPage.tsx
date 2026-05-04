import { motion } from 'framer-motion'
import { 
  Building2, 
  Plus, 
  Search, 
  Users, 
  Settings, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  UserPlus
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'

export function OrganizationsPage() {
  const { user, activeOrg, setActiveOrg } = useAuth()

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            Organizações
          </h1>
          <p className="mt-2 text-lg text-text-muted">
            Gerencie seus espaços de trabalho e conexões.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/organizations/join"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border-soft px-6 py-3 text-sm font-bold text-text-main shadow-sm transition-all hover:bg-surface-muted active:scale-95"
          >
            <Search size={18} />
            Encontrar Organização
          </Link>
          <Link
            to="/organizations/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-strong active:scale-95"
          >
            <Plus size={18} />
            Nova Organização
          </Link>
        </div>
      </header>

      {/* Your Organizations Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Building2 size={20} className="text-brand" />
          <h2 className="text-xl font-bold text-text-main">Suas Organizações</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {user?.organizations.map((org) => {
            const isActive = org.id === activeOrg?.id
            const isOwner = org.roles.includes('OWNER')
            const isAdmin = org.roles.includes('ADMIN')

            return (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group relative overflow-hidden rounded-[2.5rem] border bg-surface p-8 transition-all hover:shadow-2xl hover:shadow-brand/5",
                  isActive ? "border-brand ring-1 ring-brand/10" : "border-border-soft hover:border-brand/30"
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                    Ativa
                  </div>
                )}

                <div className="relative z-10">
                  <div className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black shadow-inner transition-transform group-hover:scale-110",
                    isActive ? "bg-brand text-white" : "bg-surface-muted text-text-muted group-hover:bg-brand group-hover:text-white"
                  )}>
                    {org.name.substring(0, 2).toUpperCase()}
                  </div>

                  <h3 className="mt-6 text-xl font-black text-text-main leading-tight">
                    {org.name}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {org.roles.map(role => (
                      <span key={role} className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-1 text-[10px] font-bold text-text-muted">
                        {role === 'OWNER' && <ShieldCheck size={12} className="text-brand" />}
                        {role === 'ADMIN' && <Settings size={12} className="text-accent" />}
                        {role}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-3">
                    {!isActive ? (
                      <button
                        onClick={() => setActiveOrg(org.id)}
                        className="flex-1 rounded-xl bg-app-bg py-3 text-xs font-black uppercase tracking-widest text-text-main transition-all hover:bg-brand hover:text-white"
                      >
                        Selecionar
                      </button>
                    ) : (
                      <div className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-brand text-center">
                        Selecionada
                      </div>
                    )}
                    
                    {(isOwner || isAdmin) && (
                      <Link
                        to="/admin"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-text-muted transition-all hover:bg-accent hover:text-white"
                        title="Configurações da Organização"
                      >
                        <Settings size={18} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Decorations */}
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-brand/5 blur-3xl group-hover:bg-brand/10 transition-colors" />
              </motion.div>
            )
          })}

          {/* Quick Create Card */}
          <Link
            to="/organizations/new"
            className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 border-dashed border-border-soft bg-surface/50 p-8 text-center transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-app-bg text-text-muted transition-colors group-hover:bg-brand group-hover:text-white">
              <Plus size={32} />
            </div>
            <div>
              <h3 className="font-bold text-text-main">Criar nova organização</h3>
              <p className="text-sm text-text-muted">Inicie um novo projeto com sua equipe.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Discovery Section */}
      <section className="rounded-[3rem] bg-brand p-8 md:p-12 text-white overflow-hidden relative shadow-2xl shadow-brand/20">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight leading-none">
            Procurando uma equipe?
          </h2>
          <p className="mt-4 text-white/80 font-medium">
            Explore organizações públicas ou use um código de convite para se juntar aos seus colegas de trabalho.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/organizations/join"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black text-brand shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Search size={20} />
              Buscar Organizações
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
        <Users size={200} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
      </section>

      {/* Info Section */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-[2rem] border border-border-soft bg-surface p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent mb-6">
            <UserPlus size={24} />
          </div>
          <h3 className="text-xl font-bold text-text-main">Como funciona?</h3>
          <p className="mt-3 text-text-muted leading-relaxed">
            Organizações são espaços isolados para seus projetos e tarefas. Você pode ser dono de várias ou participar como colaborador em outras. Toda a sua atividade é filtrada pela organização ativa.
          </p>
          <a href="#" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
            Saiba mais sobre permissões
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="rounded-[2rem] border border-border-soft bg-surface p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand mb-6">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-text-main">Segurança & Funções</h3>
          <p className="mt-3 text-text-muted leading-relaxed">
            Cada organização define seus próprios papéis (OWNER, ADMIN, MEMBER). Apenas administradores e donos podem gerenciar membros e configurações do espaço.
          </p>
          <a href="#" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
            Ver detalhes de segurança
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
