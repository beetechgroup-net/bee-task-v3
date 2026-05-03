import React, { useState } from 'react'
import { Layout, ListTodo, PlusCircle, Columns, LogOut, Settings, Building2 } from 'lucide-react'
import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { OnboardingModal } from './OnboardingModal'

import { cn } from '../lib/utils'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-brand text-white shadow-md shadow-brand/20'
      : 'text-text-muted hover:bg-surface-muted hover:text-text-main',
  )

export function AppShell() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [showOrgModal, setShowOrgModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg text-brand">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-app-bg font-sans text-text-main">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border-soft bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20 transition-transform group-hover:scale-105">
                <Layout size={20} />
              </div>
              <div>
                <span className="block text-lg font-black tracking-tight text-text-main">
                  BeeTask
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Workspace
                </span>
              </div>
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
              <NavLink to="/" end className={navLinkClassName}>
                <ListTodo size={18} />
                Minhas Tarefas
              </NavLink>
              <NavLink to="/board" className={navLinkClassName}>
                <Columns size={18} />
                Quadro
              </NavLink>
              <NavLink to="/new" className={navLinkClassName}>
                <PlusCircle size={18} />
                Nova Tarefa
              </NavLink>
              <button 
                onClick={() => setShowOrgModal(true)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
                  'text-text-muted hover:bg-surface-muted hover:text-text-main'
                )}
              >
                <Building2 size={18} />
                Organizações
              </button>
              {user?.organizations.some(org => org.roles.includes('OWNER') || org.roles.includes('ADMIN')) && (
                <NavLink to="/admin" className={navLinkClassName}>
                  <Settings size={18} />
                  Gestão
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden h-8 w-px bg-border-soft md:block" />
            <div className="flex items-center gap-3">
              <img 
                src={user?.photo} 
                alt={user?.name}
                className="h-8 w-8 rounded-full border border-accent/20 object-cover"
              />
              <span className="hidden text-sm font-medium text-text-muted lg:block">
                {user?.name}
              </span>
              <button 
                onClick={logout}
                className="ml-2 p-2 text-text-muted hover:text-danger transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Footer / Mobile Nav */}
      <footer className="border-t border-border-soft bg-surface py-6 md:hidden">
        <nav className="flex justify-around px-4">
          <NavLink to="/" end className={navLinkClassName}>
            <ListTodo size={18} />
            Tarefas
          </NavLink>
          <NavLink to="/board" className={navLinkClassName}>
            <Columns size={18} />
            Quadro
          </NavLink>
          <NavLink to="/new" className={navLinkClassName}>
            <PlusCircle size={18} />
            Criar
          </NavLink>
          <button 
            onClick={() => setShowOrgModal(true)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
              'text-text-muted hover:bg-surface-muted hover:text-text-main'
            )}
          >
            <Building2 size={18} />
            Org
          </button>
          {user?.organizations.some(org => org.roles.includes('OWNER') || org.roles.includes('ADMIN')) && (
            <NavLink to="/admin" className={navLinkClassName}>
              <Settings size={18} />
              Gestão
            </NavLink>
          )}
        </nav>
      </footer>
      <OnboardingModal isOpen={showOrgModal} onClose={() => setShowOrgModal(false)} />
    </div>
  )
}
