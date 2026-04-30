import { Layout, ListTodo, PlusCircle, Columns } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { cn } from '../lib/utils'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-brand text-white shadow-md shadow-brand/20'
      : 'text-text-muted hover:bg-surface-muted hover:text-text-main',
  )

export function AppShell() {
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
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden h-8 w-px bg-border-soft md:block" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent-soft border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                GM
              </div>
              <span className="hidden text-sm font-medium text-text-muted lg:block">
                Gabriel Menezes
              </span>
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
        </nav>
      </footer>
    </div>
  )
}
