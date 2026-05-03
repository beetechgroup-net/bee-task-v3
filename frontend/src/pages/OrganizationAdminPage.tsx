import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Check, X, ShieldAlert, Mail } from 'lucide-react'
import { organizationService, type JoinRequest } from '../services/organizationService'
import { useAuth } from '../contexts/AuthContext'

export const OrganizationAdminPage: React.FC = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // For this simplified version, we manage the first organization where the user is OWNER
  const orgToManage = user?.organizations.find(org => org.roles.includes('OWNER') || org.roles.includes('ADMIN'))

  useEffect(() => {
    if (orgToManage) {
      loadRequests()
    }
  }, [orgToManage])

  const loadRequests = async () => {
    if (!orgToManage) return
    try {
      const data = await organizationService.listPendingRequests(orgToManage.id)
      setRequests(data)
    } catch (error) {
      console.error('Failed to load requests', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (userId: number, approved: boolean) => {
    if (!orgToManage) return
    try {
      if (approved) {
        await organizationService.approveRequest(orgToManage.id, userId)
      } else {
        await organizationService.rejectRequest(orgToManage.id, userId)
      }
      setRequests(prev => prev.filter(r => r.userId !== userId))
    } catch (error) {
      console.error('Action failed', error)
      alert('Erro ao processar solicitação.')
    }
  }

  if (!orgToManage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-black text-text-main mb-2">Acesso Negado</h2>
        <p className="text-text-muted max-w-xs">Você não tem permissão para gerenciar nenhuma organização.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            Gestão da <span className="text-brand">{orgToManage.name}</span>
          </h1>
          <p className="mt-2 text-text-muted font-medium">
            Gerencie membros e solicitações de entrada
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border-soft rounded-[2.5rem] shadow-panel overflow-hidden">
        <div className="p-8 border-b border-border-soft bg-surface-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-bold text-text-main">Solicitações Pendentes</h2>
            <span className="ml-auto bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
              {requests.length} novos
            </span>
          </div>
        </div>

        <div className="divide-y divide-border-soft">
          {isLoading ? (
            <div className="p-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="p-20 text-center text-text-muted font-medium">
              Nenhuma solicitação pendente no momento.
            </div>
          ) : (
            requests.map((request) => (
              <motion.div
                key={request.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-surface-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={request.photo || `https://ui-avatars.com/api/?name=${request.name}&background=random`}
                    alt={request.name}
                    className="w-12 h-12 rounded-full border border-border-soft object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-text-main text-lg">{request.name}</h3>
                    <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                      <Mail size={14} />
                      {request.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleAction(request.userId, false)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-border-soft text-text-muted font-bold hover:bg-danger/10 hover:text-danger hover:border-danger/20 transition-all"
                  >
                    <X size={18} />
                    Recusar
                  </button>
                  <button
                    onClick={() => handleAction(request.userId, true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-strong shadow-lg shadow-brand/20 transition-all active:scale-[0.98]"
                  >
                    <Check size={18} />
                    Aprovar
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
