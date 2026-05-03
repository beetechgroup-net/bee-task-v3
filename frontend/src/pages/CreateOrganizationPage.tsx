import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout, Building2, ArrowRight } from 'lucide-react'
import { organizationService } from '../services/organizationService'
import { useAuth } from '../contexts/AuthContext'

export const CreateOrganizationPage: React.FC = () => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await organizationService.create(name)
      await refreshUser()
      alert('Organização criada com sucesso!')
      navigate('/')
    } catch (error) {
      console.error('Failed to create organization', error)
      alert('Erro ao criar organização.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-brand/15 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-surface border border-border-soft p-10 rounded-[2.5rem] shadow-panel">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
              <Building2 size={28} />
            </div>
            <h1 className="text-3xl font-black text-text-main tracking-tight mb-3">Nova Organização</h1>
            <p className="text-text-muted font-medium">Dê um nome ao seu novo workspace</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main ml-1">Nome da Organização</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Layout className="h-5 w-5 text-text-muted group-focus-within:text-brand transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-muted/50 border border-border-soft rounded-2xl text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-medium"
                  placeholder="Ex: Bee Tech"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name}
              className="w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-strong disabled:bg-brand/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
              ) : (
                <>
                  Criar Agora
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
