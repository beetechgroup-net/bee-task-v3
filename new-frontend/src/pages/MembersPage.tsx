import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Mail,
  Loader2,
  Send,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  organizationService,
  type OrganizationMember,
  type PendingJoinRequest,
  type SearchOrgOutput,
  type JoinRequestOutput,
} from '../services/organizationService'

export const MembersPage: React.FC = () => {
  const { user, activeOrg } = useAuth()

  const [activeTab, setActiveTab] = useState<'members' | 'pending' | 'discover'>('members')
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingJoinRequest[]>([])
  const [myRequests, setMyRequests] = useState<JoinRequestOutput[]>([])
  const [searchResults, setSearchResults] = useState<SearchOrgOutput[]>([])

  const [searchOrgTerm, setSearchOrgTerm] = useState('')
  const [memberSearchTerm, setMemberSearchTerm] = useState('')

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searching, setSearching] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const activeOrgId = activeOrg?.id
  const isOwner = activeOrg?.roles?.includes('OWNER') || false

  const loadData = useCallback(async () => {
    if (!activeOrgId) return
    try {
      setRefreshing(true)
      const [membersRes, requestsRes, myReqsRes] = await Promise.allSettled([
        organizationService.listMembers(activeOrgId),
        isOwner ? organizationService.listPendingRequests(activeOrgId) : Promise.resolve([]),
        organizationService.listMyRequests(),
      ])

      if (membersRes.status === 'fulfilled') setMembers(membersRes.value || [])
      if (requestsRes.status === 'fulfilled') setPendingRequests(requestsRes.value || [])
      if (myReqsRes.status === 'fulfilled') setMyRequests(myReqsRes.value || [])
    } catch (err: unknown) {
      console.error(err)
      setFeedbackMsg({ type: 'error', text: 'Falha ao carregar informações da equipe.' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeOrgId, isOwner])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleApprove = async (userId: number) => {
    if (!activeOrgId) return
    setActionLoadingId(userId)
    setFeedbackMsg(null)
    try {
      await organizationService.approveRequest(activeOrgId, userId)
      setPendingRequests((prev) => prev.filter((r) => r.userId !== userId))
      setFeedbackMsg({ type: 'success', text: 'Solicitação aprovada! O usuário agora é membro da organização.' })
      // Reload members list
      const updatedMembers = await organizationService.listMembers(activeOrgId)
      setMembers(updatedMembers)
    } catch (err: unknown) {
      console.error(err)
      setFeedbackMsg({ type: 'error', text: 'Falha ao aprovar solicitação.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (userId: number) => {
    if (!activeOrgId) return
    setActionLoadingId(userId)
    setFeedbackMsg(null)
    try {
      await organizationService.rejectRequest(activeOrgId, userId)
      setPendingRequests((prev) => prev.filter((r) => r.userId !== userId))
      setFeedbackMsg({ type: 'success', text: 'Solicitação rejeitada.' })
    } catch (err: unknown) {
      console.error(err)
      setFeedbackMsg({ type: 'error', text: 'Falha ao rejeitar solicitação.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSearchOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchOrgTerm.trim()) return

    setSearching(true)
    setFeedbackMsg(null)
    try {
      const results = await organizationService.search(searchOrgTerm.trim())
      setSearchResults(results)
    } catch (err: unknown) {
      console.error(err)
      setFeedbackMsg({ type: 'error', text: 'Erro ao buscar organizações.' })
    } finally {
      setSearching(false)
    }
  }

  const handleRequestJoin = async (targetOrgId: number) => {
    setActionLoadingId(targetOrgId)
    setFeedbackMsg(null)
    try {
      await organizationService.requestJoin(targetOrgId)
      setFeedbackMsg({
        type: 'success',
        text: 'Solicitação enviada com sucesso! Aguarde a aprovação do proprietário.',
      })
      const updatedMyReqs = await organizationService.listMyRequests()
      setMyRequests(updatedMyReqs)
    } catch (err: unknown) {
      console.error(err)
      setFeedbackMsg({ type: 'error', text: 'Falha ao solicitar entrada na organização.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredMembers = members.filter((m) => {
    if (!memberSearchTerm.trim()) return true
    const term = memberSearchTerm.toLowerCase()
    return m.userName.toLowerCase().includes(term) || m.userEmail.toLowerCase().includes(term)
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Membros & Equipe
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/25">
              {activeOrg?.name || 'Workspace'}
            </span>
          </div>
          <p className="text-xs text-muted">
            Gerencie os colaboradores ativos, controle solicitações de ingresso e descubra outros workspaces.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={refreshing}
          title="Recarregar dados"
          className="self-start sm:self-auto p-2 rounded-xl border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-raised transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand' : ''}`} />
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-bold hover:opacity-80"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-brand text-white shadow-xs'
              : 'text-muted hover:text-foreground hover:bg-surface-raised'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Membros Ativos</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {members.length}
          </span>
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-muted hover:text-foreground hover:bg-surface-raised'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Solicitações Pendentes</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'discover'
              ? 'bg-brand text-white shadow-xs'
              : 'text-muted hover:text-foreground hover:bg-surface-raised'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Ingressar em Outros Workspaces</span>
        </button>
      </div>

      {/* Tab 1: Membros Ativos */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Member Search Bar */}
          <div className="p-3.5 rounded-2xl border border-border bg-surface flex items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                placeholder="Filtrar por nome ou e-mail..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface-raised text-xs text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </div>
            <span className="text-xs text-muted font-medium">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'membro' : 'membros'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl border border-border bg-surface-sunken/40 animate-pulse p-4"
                />
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-surface/50">
              <Users className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-xs text-muted">Nenhum membro encontrado com este termo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => {
                const isCurrentUser = member.userEmail === user?.email
                return (
                  <div
                    key={member.userId}
                    className="p-4 rounded-2xl border border-border bg-surface hover:border-zinc-700 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-sm font-bold text-brand uppercase shrink-0">
                        {member.userName ? member.userName.charAt(0) : member.userEmail.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {member.userName}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded-md bg-brand/20 text-brand text-[9px] font-bold">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-muted/70" />
                          {member.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-raised border border-border text-muted">
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        Ativo
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Solicitações Pendentes (Owner Only) */}
      {activeTab === 'pending' && isOwner && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Painel de Aprovação do Proprietário</p>
              <p className="text-[11px] text-amber-300/80">
                Apenas proprietários podem aprovar novos membros para acessar as tarefas e projetos deste workspace.
              </p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-surface/50">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-foreground">Tudo limpo!</h4>
              <p className="text-xs text-muted">Não há solicitações pendentes de aprovação no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.userId}
                  className="p-4 rounded-2xl border border-border bg-surface flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-400 uppercase shrink-0">
                      {req.name ? req.name.charAt(0) : req.email.charAt(0)}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-foreground truncate">{req.name}</h4>
                      <p className="text-[11px] text-muted truncate">{req.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={actionLoadingId === req.userId}
                      onClick={() => handleReject(req.userId)}
                      className="p-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 transition-colors"
                      title="Rejeitar"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === req.userId}
                      onClick={() => handleApprove(req.userId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover shadow-xs transition-colors"
                    >
                      {actionLoadingId === req.userId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Aprovar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Descobrir e Solicitar Ingresso */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search other organizations */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Buscar Organizações
                </h3>
                <p className="text-xs text-muted">
                  Procure por empresas parceiras ou squads para solicitar acesso.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearchOrg} className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchOrgTerm}
                  onChange={(e) => setSearchOrgTerm(e.target.value)}
                  placeholder="Digite o nome da organização (ex: BeeTech, Squad Core...)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-surface-raised text-xs text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !searchOrgTerm.trim()}
                className="px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Buscar</span>
              </button>
            </form>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Resultados da Busca
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((org) => {
                    const alreadyRequested = myRequests.some(
                      (r) => r.organizationId === org.id
                    )
                    return (
                      <div
                        key={org.id}
                        className="p-3.5 rounded-xl border border-border bg-surface-raised flex items-center justify-between gap-3"
                      >
                        <div className="truncate">
                          <p className="text-xs font-bold text-foreground truncate">{org.name}</p>
                          <p className="text-[10px] text-muted">ID #{org.id}</p>
                        </div>

                        {alreadyRequested ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Solicitado
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={actionLoadingId === org.id}
                            onClick={() => handleRequestJoin(org.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
                          >
                            {actionLoadingId === org.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Solicitar</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Minhas solicitações enviadas */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Minhas Solicitações de Ingresso
            </h3>

            {myRequests.length === 0 ? (
              <p className="text-xs text-muted py-4">Você ainda não solicitou entrada em outras organizações.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {myRequests.map((req, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{req.organizationName}</p>
                      <p className="text-[10px] text-muted">ID #{req.organizationId}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {req.status === 'APPROVED'
                        ? 'Aprovado'
                        : req.status === 'REJECTED'
                        ? 'Recusado'
                        : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
