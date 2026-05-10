import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, Search, Layout, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface OnboardingModalProps {
  isOpen: boolean
  onClose?: () => void
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-bg/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-surface border border-border-soft rounded-[2.5rem] shadow-panel p-10 overflow-hidden relative"
        >
          <button 
            onClick={handleClose}
            className="absolute top-8 right-8 text-text-muted hover:text-brand transition-colors z-20"
          >
            <X size={24} />
          </button>

          {/* Decorations */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 blur-[80px] rounded-full" />

          <div className="relative z-10 text-center mb-10">
            <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20 mx-auto">
              <Layout size={32} />
            </div>
            <h2 className="text-3xl font-black text-text-main tracking-tight mb-3">Quase lá!</h2>
            <p className="text-text-muted font-medium">Você ainda não faz parte de nenhuma organização. Como deseja começar?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <button
              onClick={() => {
                navigate('/organizations');
                onClose?.();
              }}
              className="group p-6 bg-surface-muted/30 border border-border-soft rounded-[2rem] text-left hover:border-brand hover:bg-brand/5 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
                <PlusCircle size={24} />
              </div>
              <h3 className="font-bold text-text-main mb-1">Criar uma</h3>
              <p className="text-sm text-text-muted">Crie seu próprio workspace e convide sua equipe.</p>
            </button>

            <button
              onClick={() => {
                navigate('/organizations');
                onClose?.();
              }}
              className="group p-6 bg-surface-muted/30 border border-border-soft rounded-[2rem] text-left hover:border-accent hover:bg-accent/5 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                <Search size={24} />
              </div>
              <h3 className="font-bold text-text-main mb-1">Participar</h3>
              <p className="text-sm text-text-muted">Busque por uma organização existente e peça para entrar.</p>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
