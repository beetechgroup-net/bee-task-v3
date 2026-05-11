import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2,
  Plus,
  Search,
  Users,
  Settings,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  X,
  Loader2,
  Layout as LayoutIcon,
  Globe,
  Zap,
  Send,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'
import { organizationService, type UserJoinRequest } from '../services/organizationService'
import { OnboardingModal } from '../components/OnboardingModal'

const requestStatusConfig: Record<UserJoinRequest['status'], {
  label: string
  icon: typeof Clock
  className: string
}> = {
  PENDING: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  ACTIVE: {
    label: 'Aprovado',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  REJECTED: {
    label: 'Recusado',
    icon: XCircle,
    className: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
}

export function OrganizationsPage() {
  const { user, activeOrg, setActiveOrg, refreshUser } = useAuth()
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [joinQuery, setJoinQuery] = useState('')
  const [joinResults, setJoinResults] = useState<Array<{ id: number; name: string }> | null>(null)
  const [isSearchingOrganizations, setIsSearchingOrganizations] = useState(false)
  const [requestedOrgId, setRequestedOrgId] = useState<number | null>(null)
  const [requests, setRequests] = useState<UserJoinRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setIsCreating(true)
    setError(null)
    try {
      await organizationService.create(newOrgName)
      await refreshUser()
      setNewOrgName('')
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create organization', err)
      setError('Erro ao criar organização. Tente outro nome.')
    } finally {
      setIsCreating(false)
    }
  }

  const filteredOrgs = user?.organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  useEffect(() => {
    setShowOnboardingModal((user?.organizations.length ?? 0) === 0)
  }, [user?.organizations.length])

  const openCreateOrganizationModal = () => {
    setShowOnboardingModal(false)
    setShowJoinModal(false)
    setShowCreateModal(true)
  }

  const openJoinOrganizationModal = () => {
    setShowOnboardingModal(false)
    setShowCreateModal(false)
    setShowJoinModal(true)
  }

  const openRequestsModal = () => {
    setShowOnboardingModal(false)
    setShowCreateModal(false)
    setShowJoinModal(false)
    setShowRequestsModal(true)
  }

  const handleSearchOrganizations = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinQuery.trim()) return

    setIsSearchingOrganizations(true)

    try {
      const data = await organizationService.search(joinQuery)
      setJoinResults(data)
    } catch (err) {
      console.error('Search failed', err)
      setJoinResults([])
    } finally {
      setIsSearchingOrganizations(false)
    }
  }

  const handleJoinRequest = async (organizationId: number) => {
    try {
      await organizationService.requestJoin(organizationId)
      setRequestedOrgId(organizationId)
      alert('Solicitação enviada! Aguarde a aprovação do dono da organização.')
    } catch (err) {
      console.error('Join request failed', err)
      alert(err instanceof Error ? err.message : 'Erro ao enviar solicitação.')
    }
  }

  useEffect(() => {
    if (!showRequestsModal) return

    const fetchRequests = async () => {
      setIsLoadingRequests(true)

      try {
        const data = await organizationService.getUserRequests()
        setRequests(data)
      } catch (err) {
        console.error('Failed to fetch requests', err)
        setRequests([])
      } finally {
        setIsLoadingRequests(false)
      }
    }

    void fetchRequests()
  }, [showRequestsModal])

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand font-black uppercase tracking-widest text-[10px] mb-2">
            <Globe size={14} />
            Hub Global
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            Organizações
          </h1>
          <p className="mt-2 text-lg text-text-muted">
            Gerencie seus espaços de trabalho e conexões.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-surface border border-border-soft rounded-xl text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all w-48 font-medium"
            />
          </div>
          <button
            onClick={openJoinOrganizationModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border-soft px-6 py-3 text-sm font-bold text-text-main shadow-sm transition-all hover:bg-surface-muted active:scale-95"
          >
            <Search size={18} />
            Encontrar
          </button>
          <button
            onClick={openRequestsModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border-soft px-6 py-3 text-sm font-bold text-text-main shadow-sm transition-all hover:bg-surface-muted active:scale-95"
          >
            <UserPlus size={18} />
            Minhas Solicitações
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand-dark active:scale-95"
          >
            <Plus size={18} />
            Nova Organização
          </button>
        </div>
      </header>

      {/* Your Organizations Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Building2 size={20} className="text-brand" />
          <h2 className="text-xl font-bold text-text-main">Suas Organizações</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredOrgs.map((org, index) => {
              const isActive = org.id === activeOrg?.id
              const isOwner = org.roles.includes('OWNER')
              const isAdmin = org.roles.includes('ADMIN')

              return (
                <motion.div
                  key={org.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group relative overflow-hidden rounded-[2.5rem] border bg-surface p-8 transition-all hover:shadow-2xl hover:shadow-brand/5",
                    isActive ? "border-brand ring-1 ring-brand/10 shadow-lg shadow-brand/5" : "border-border-soft hover:border-brand/30"
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
                      "flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black shadow-inner transition-all group-hover:scale-110",
                      isActive ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-surface-muted text-text-muted group-hover:bg-brand group-hover:text-white"
                    )}>
                      {org.name.substring(0, 2).toUpperCase()}
                    </div>

                    <h3 className="mt-6 text-xl font-black text-text-main leading-tight group-hover:text-brand transition-colors">
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
                          className="flex-1 rounded-xl bg-app-bg py-3 text-xs font-black uppercase tracking-widest text-text-main transition-all hover:bg-brand hover:text-white shadow-sm"
                        >
                          Selecionar
                        </button>
                      ) : (
                        <div className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-brand text-center font-black">
                          Organização Atual
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 border-dashed border-border-soft bg-surface/50 p-8 text-center transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98] group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-app-bg text-text-muted transition-colors group-hover:bg-brand group-hover:text-white">
                <Plus size={32} />
              </div>
              <div>
                <h3 className="font-bold text-text-main group-hover:text-brand transition-colors">Nova Organização</h3>
                <p className="text-sm text-text-muted">Inicie um novo workspace.</p>
              </div>
            </button>
          </AnimatePresence>
        </div>
      </section>

      {/* Discovery Section */}
      <section className="rounded-[3rem] bg-brand p-8 md:p-12 text-white overflow-hidden relative shadow-2xl shadow-brand/20">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight leading-none">
            Procurando uma equipe?
          </h2>
          <p className="mt-4 text-white/80 font-medium text-lg">
            Explore organizações públicas ou use um código de convite para se juntar aos seus colegas de trabalho.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={openJoinOrganizationModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black text-brand shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Search size={20} />
              Buscar Organizações
              <ArrowRight size={18} />
            </button>
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
          <h3 className="text-xl font-bold text-text-main">Gestão de Equipe</h3>
          <p className="mt-3 text-text-muted leading-relaxed font-medium">
            Organizações são espaços isolados para seus projetos e tarefas. Você pode alternar facilmente entre elas e gerenciar diferentes equipes.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border-soft bg-surface p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand mb-6">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold text-text-main">Início Imediato</h3>
          <p className="mt-3 text-text-muted leading-relaxed font-medium">
            Crie uma organização em segundos e comece a convidar seus membros. O BeeTask facilita a colaboração desde o primeiro dia.
          </p>
        </div>
      </div>

      {/* Create Organization Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-bg/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-surface border border-border-soft rounded-[2.5rem] shadow-panel p-10 relative"
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-8 right-8 text-text-muted hover:text-brand transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20 mx-auto">
                  <Building2 size={32} />
                </div>
                <h2 className="text-3xl font-black text-text-main tracking-tight mb-3">Nova Organização</h2>
                <p className="text-text-muted font-medium">Inicie um novo workspace colaborativo agora mesmo.</p>
              </div>

              <form onSubmit={handleCreateOrganization} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main ml-1">Nome da Organização</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LayoutIcon className="h-5 w-5 text-text-muted group-focus-within:text-brand transition-colors" />
                    </div>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-surface-muted/50 border border-border-soft rounded-2xl text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-bold"
                      placeholder="Ex: Bee Tech, Creative Agency..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold flex items-center gap-3">
                    <X size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating || !newOrgName.trim()}
                  className="w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-dark disabled:bg-brand/50 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
                >
                  {isCreating ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Criar Agora
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-bg/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-surface border border-border-soft rounded-[2.5rem] shadow-panel p-10 relative"
            >
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute top-8 right-8 text-text-muted hover:text-brand transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20 mx-auto">
                  <Search size={32} />
                </div>
                <h2 className="text-3xl font-black text-text-main tracking-tight mb-3">Buscar Organização</h2>
                <p className="text-text-muted font-medium">Encontre uma organização pelo nome e solicite entrada.</p>
              </div>

              <form onSubmit={handleSearchOrganizations} className="flex gap-3 mb-8">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-text-muted group-focus-within:text-brand transition-colors" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={joinQuery}
                    onChange={(e) => setJoinQuery(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-surface-muted/50 border border-border-soft rounded-2xl text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-medium"
                    placeholder="Nome da organização..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingOrganizations}
                  className="bg-brand hover:bg-brand-dark disabled:bg-brand/50 text-white font-black px-8 rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98] flex items-center gap-2"
                >
                  {isSearchingOrganizations ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Buscar'
                  )}
                </button>
              </form>

              <div className="space-y-3">
                {joinResults && joinResults.length > 0 ? (
                  joinResults.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-5 bg-surface-muted/30 border border-border-soft rounded-2xl hover:border-brand/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center">
                          <Building2 size={20} />
                        </div>
                        <span className="font-bold text-text-main">{org.name}</span>
                      </div>
                      {requestedOrgId === org.id ? (
                        <div className="flex items-center gap-2 text-success font-bold text-sm bg-success/10 px-4 py-2 rounded-xl">
                          <CheckCircle2 size={16} />
                          Solicitado
                        </div>
                      ) : (
                        <button
                          onClick={() => void handleJoinRequest(org.id)}
                          className="flex items-center gap-2 text-brand font-bold text-sm hover:bg-brand hover:text-white px-4 py-2 rounded-xl border border-brand/20 transition-all"
                        >
                          <Send size={16} />
                          Solicitar entrada
                        </button>
                      )}
                    </div>
                  ))
                ) : joinResults && joinResults.length === 0 ? (
                  <p className="text-center text-text-muted py-10 font-medium">
                    Nenhuma organização encontrada.
                  </p>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRequestsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-bg/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl bg-surface border border-border-soft rounded-[2.5rem] shadow-panel p-10 relative"
            >
              <button
                onClick={() => setShowRequestsModal(false)}
                className="absolute top-8 right-8 text-text-muted hover:text-brand transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20 mx-auto">
                  <UserPlus size={32} />
                </div>
                <h2 className="text-3xl font-black text-text-main tracking-tight mb-3">Minhas Solicitações</h2>
                <p className="text-text-muted font-medium">Acompanhe o status dos seus pedidos para entrar em organizações.</p>
              </div>

              {isLoadingRequests ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-20 bg-surface-muted/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-surface-muted/30 border border-dashed border-border-soft rounded-[2rem] p-12 text-center">
                  <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="text-text-muted/50" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-main mb-2">Nenhuma solicitação encontrada</h3>
                  <p className="text-text-muted mb-8 max-w-xs mx-auto">
                    Você ainda não solicitou participar de nenhuma organização.
                  </p>
                  <button
                    onClick={() => {
                      setShowRequestsModal(false)
                      openJoinOrganizationModal()
                    }}
                    className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand/20 transition-all active:scale-95"
                  >
                    Buscar Organizações
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {requests.map((request, index) => {
                    const config = requestStatusConfig[request.status]
                    const StatusIcon = config.icon

                    return (
                      <motion.div
                        key={request.organizationId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-surface-muted/30 hover:bg-surface-muted/50 border border-border-soft p-5 rounded-2xl flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-border-soft flex items-center justify-center text-brand">
                            <Building2 size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-text-main group-hover:text-brand transition-colors">
                              {request.organizationName}
                            </h3>
                            <span className="text-xs text-text-muted font-semibold tracking-wider uppercase">
                              ID: {request.organizationId}
                            </span>
                          </div>
                        </div>
                        <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border', config.className)}>
                          <StatusIcon size={14} />
                          <span>{config.label}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onCreateOrganization={openCreateOrganizationModal}
        onJoinOrganization={openJoinOrganizationModal}
      />
    </div>
  )
}
