import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Layout } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (error) {
      console.error('Login failed', error)
      alert('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Visual decorations matching index.css body gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-accent/15 blur-[100px] rounded-full" />
        <div className="absolute top-0 right-0 w-[35%] h-[35%] bg-brand/15 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-surface border border-border-soft p-10 rounded-[2.5rem] shadow-panel">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
              <Layout size={28} />
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tight mb-3">BeeTask</h1>
            <p className="text-text-muted font-medium">Bem-vindo de volta ao seu workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted group-focus-within:text-brand transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-muted/50 border border-border-soft rounded-2xl text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-medium"
                  placeholder="exemplo@beetech.net"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted group-focus-within:text-brand transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-muted/50 border border-border-soft rounded-2xl text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-strong disabled:bg-brand/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98] mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Acessar Painel
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border-soft text-center space-y-4">
            <p className="text-text-muted text-sm font-medium">
              Não tem uma conta? <Link to="/register" className="text-brand font-bold hover:underline">Criar conta</Link>
            </p>
            <p className="text-text-muted text-sm font-medium">
              Precisa de ajuda? <span className="text-brand font-bold cursor-pointer hover:underline">Falar com suporte</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
