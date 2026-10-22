import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Plus,
  ArrowRight,
  Users,
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Check,
  Loader2,
  Inbox,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  organizationService,
  type SearchOrgOutput,
  type JoinRequestOutput,
} from '../services/organizationService'

export const OrganizationsPage = () => {
  const { user, activeOrg, setActiveOrg, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'workspaces' | 'join' | 'create'>(
    user?.organizations && user.organizations.length > 0 ? 'workspaces' : 'join'
  )

  // Create Org states
  const [newOrgName, setNewOrgName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Search & Join states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchOrgOutput[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [joiningOrgId, setJoiningOrgId] = useState<number | null>(null)

  // My join requests
  const [myRequests, setMyRequests] = useState<JoinRequestOutput[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // Feedback notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load user's join requests
  const loadMyRequests = useCallback(async () => {
    setLoadingRequests(true)
    try {
      const reqs = await organizationService.listMyRequests()
      setMyRequests(reqs || [])
    } catch (err) {
      console.error('Error fetching join requests', err)
    } finally {
      setLoadingRequests(false)
    }
  }, [])

  useEffect(() => {
    loadMyRequests()
  }, [loadMyRequests])

  const handleCreateOrg = async (e: FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setIsCreating(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const created = await organizationService.create(newOrgName.trim())
      await refreshUser()
      setActiveOrg(created.id)
      setSuccessMessage(`Workspace "${newOrgName}" criado com sucesso!`)
      setNewOrgName('')
      setTimeout(() => {
        navigate('/dashboard')
      }, 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar organização.'
      setErrorMessage(msg)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectOrg = (id: number) => {
    setActiveOrg(id)
    navigate('/dashboard')
  }

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    setIsSearching(true)
    setHasSearched(true)
    setErrorMessage(null)

    try {
      const results = await organizationService.search(searchQuery.trim())
      setSearchResults(results || [])
    } catch (err: unknown) {
      console.error(err)
      setErrorMessage('Falha ao buscar organizações.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleRequestJoin = async (orgId: number, orgName: string) => {
    setJoiningOrgId(orgId)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await organizationService.requestJoin(orgId)
      setSuccessMessage(`Solicitação enviada para "${orgName}" com sucesso! Aguarde a aprovação do proprietário.`)
      await loadMyRequests()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao solicitar entrada.'
      setErrorMessage(msg)
    } finally {
      setJoiningOrgId(null)
    }
  }

  const handleEnterApprovedOrg = async (orgId: number) => {
    try {
      await refreshUser()
      setActiveOrg(orgId)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  const pendingRequestsCount = myRequests.filter((r) => r.status === 'PENDING').length

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Gestão de Workspaces & Organizações</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Workspaces Corporativos
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-2xl">
          Navegue entre seus workspaces ativos, solicite entrada em uma organização existente ou
          crie um novo ambiente dedicado para seu squad ou empresa.
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-start gap-3 animate-in fade-in">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Ocorreu um erro</p>
            <p className="mt-0.5 text-rose-300/90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-muted hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Sucesso</p>
            <p className="mt-0.5 text-emerald-300/90">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-muted hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border-soft pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('workspaces')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'workspaces'
              ? 'bg-brand text-white shadow-md shadow-brand/20'
              : 'text-muted hover:text-foreground hover:bg-surface-raised'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Meus Workspaces</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'workspaces'
                ? 'bg-white/20 text-white font-bold'
                : 'bg-surface-sunken text-muted'
            }`}
          >
            {user?.organizations?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('join')
            if (!hasSearched) handleSearch()
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'join'
              ? 'bg-brand text-white shadow-md shadow-brand/20'
              : 'text-muted hover:text-foreground hover:bg-surface-raised'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Solicitar Entrada</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {pendingRequestsCount} pendente{pendingRequestsCount > 1 ? 's' : ''}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'create'
              ? 'bg-brand text-white shadow-md shadow-brand/20'
              : 'text-muted hover:text-foreground hover:bg-surface-raised'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Criar Workspace</span>
        </button>
      </div>

      {/* TAB 1: WORKSPACES VINCULADOS */}
      {activeTab === 'workspaces' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand" />
                Workspaces Vinculados ({user?.organizations?.length || 0})
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Organizações das quais você já é membro ou proprietário.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('join')
                  if (!hasSearched) handleSearch()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-soft bg-surface-raised text-xs font-semibold text-foreground hover:border-brand/40 hover:text-brand transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Entrar em Outra</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Workspace</span>
              </button>
            </div>
          </div>

          {user?.organizations && user.organizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {user.organizations.map((org) => {
                const isActive = org.id === activeOrg?.id
                return (
                  <div
                    key={org.id}
                    onClick={() => handleSelectOrg(org.id)}
                    className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-panel ${
                      isActive
                        ? 'border-brand/60 bg-brand/5 ring-1 ring-brand/30 shadow-md'
                        : 'border-border-soft bg-surface/90 backdrop-blur-md hover:border-brand/40 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                          isActive
                            ? 'bg-brand text-white shadow-brand/20'
                            : 'bg-surface-sunken text-muted border border-border-soft'
                        }`}
                      >
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {org.name}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-brand/15 text-brand text-[10px] font-extrabold tracking-wide uppercase border border-brand/30">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-0.5 font-medium">
                          Papel:{' '}
                          <span className="text-brand font-semibold">
                            {org.roles.join(', ')}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectOrg(org.id)
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-surface-raised border border-border-soft text-muted hover:text-foreground hover:bg-surface-sunken'
                      }`}
                    >
                      {isActive ? 'Acessar' : 'Selecionar'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border-soft bg-surface/60 backdrop-blur-md p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Você ainda não está vinculado a nenhum workspace
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Você pode solicitar entrada em uma organização existente ou criar um novo workspace para sua equipe.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('join')
                    handleSearch()
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover shadow-sm transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Buscar e Entrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-soft bg-surface-raised text-xs font-bold text-foreground hover:border-brand/40 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Novo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SOLICITAR ENTRADA EM UMA ORGANIZAÇÃO */}
      {activeTab === 'join' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="p-5 sm:p-6 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md shadow-panel space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Search className="w-4 h-4 text-brand" />
                Buscar Organização
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Digite o nome da empresa ou organização para solicitar participação como membro.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: BeeTech, Empresa Alpha, Squad..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-soft bg-surface text-xs text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all pl-9"
                />
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </>
                )}
              </button>
            </form>

            {/* Search Results */}
            {hasSearched && (
              <div className="pt-2 space-y-2 border-t border-border-soft/60">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>Resultados da busca:</span>
                  <span>{searchResults.length} encontrada{searchResults.length === 1 ? '' : 's'}</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted border border-dashed border-border-soft rounded-2xl">
                    Nenhuma organização encontrada com o termo "{searchQuery}".
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {searchResults.map((org) => {
                      const isAlreadyMember = user?.organizations?.some((o) => o.id === org.id)
                      const pendingReq = myRequests.find(
                        (r) => r.organizationId === org.id && r.status === 'PENDING'
                      )
                      const isJoining = joiningOrgId === org.id

                      return (
                        <div
                          key={org.id}
                          className="p-3.5 rounded-2xl border border-border-soft bg-surface-raised/70 flex items-center justify-between gap-3 hover:border-brand/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-brand/15 text-brand flex items-center justify-center font-bold text-xs shrink-0 border border-brand/25">
                              {org.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-foreground truncate">
                                {org.name}
                              </h4>
                              <p className="text-[10px] text-muted">ID: #{org.id}</p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isAlreadyMember ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                <Check className="w-3 h-3" />
                                <span>Já é Membro</span>
                              </span>
                            ) : pendingReq ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                <Clock className="w-3 h-3 animate-pulse" />
                                <span>Pendente</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={isJoining}
                                onClick={() => handleRequestJoin(org.id, org.name)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/15 text-brand border border-brand/30 text-xs font-bold hover:bg-brand hover:text-white transition-all cursor-pointer disabled:opacity-50"
                              >
                                {isJoining ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Solicitar Entrada</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* My Join Requests Status Section */}
          <div className="p-5 sm:p-6 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md shadow-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-accent" />
                  Minhas Solicitações de Entrada
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Acompanhe o status dos seus pedidos para ingressar em organizações.
                </p>
              </div>

              <button
                type="button"
                onClick={loadMyRequests}
                disabled={loadingRequests}
                className="text-xs text-brand hover:underline font-semibold cursor-pointer disabled:opacity-50"
              >
                {loadingRequests ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>

            {myRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted border border-dashed border-border-soft rounded-2xl">
                Você ainda não enviou nenhuma solicitação de entrada.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myRequests.map((req, idx) => {
                  const isPending = req.status === 'PENDING'
                  const isApproved = req.status === 'APPROVED'
                  const isRejected = req.status === 'REJECTED'

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-border-soft bg-surface-raised/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isApproved
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {req.organizationName}
                          </h4>
                          <p className="text-[10px] text-muted">
                            Solicitado em:{' '}
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleDateString('pt-BR')
                              : 'Recentemente'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>Pendente de Aprovação</span>
                          </span>
                        )}

                        {isApproved && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aprovada</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEnterApprovedOrg(req.organizationId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Entrar no Workspace
                            </button>
                          </div>
                        )}

                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                            <XCircle className="w-3 h-3" />
                            <span>Recusada pelo Dono</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CRIAR NOVO WORKSPACE */}
      {activeTab === 'create' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-border-soft bg-surface/90 backdrop-blur-md shadow-panel space-y-6">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-2 border border-accent/25">
              <Plus className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Criar Novo Workspace
            </h2>
            <p className="text-xs text-muted">
              Você será automaticamente configurado como <strong>PROPRIETÁRIO (OWNER)</strong> deste workspace.
            </p>
          </div>

          <form onSubmit={handleCreateOrg} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Nome da Organização / Empresa
              </label>
              <input
                type="text"
                required
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Ex: Minha Empresa Corp, Tech Labs..."
                className="w-full px-3.5 py-2.5 bg-surface border border-border-soft rounded-xl text-xs text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || !newOrgName.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Criar Organização</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-border-soft flex items-center gap-2 text-[11px] text-muted font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Multi-tenancy com isolamento seguro de projetos, tarefas e métricas da equipe</span>
          </div>
        </div>
      )}
    </div>
  )
}
