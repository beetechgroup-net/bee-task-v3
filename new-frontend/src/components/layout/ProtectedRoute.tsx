import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center gap-4 text-text-main font-sans">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-brand flex items-center justify-center text-xl shadow-md animate-pulse">
          🐝
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
          <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          <span>Carregando seu workspace...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se logado mas sem organizações cadastradas, direciona para o onboarding/criação de workspace
  if (user && user.organizations.length === 0 && location.pathname !== '/organizations') {
    return <Navigate to="/organizations" replace />
  }

  return <>{children}</>
}
