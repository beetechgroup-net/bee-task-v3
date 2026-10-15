import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Tags,
  BarChart3,
  Users,
  Settings,
  X,
  Building2,
  Sun,
  Moon,
  Clock,
  Square,
  ChevronDown,
  Check,
  PlusCircle,
  User,
  LogOut,
} from 'lucide-react'
import { Chip, ChipLabel } from '@heroui/react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useTimer } from '../../contexts/TimerContext'
import { formatSecondsToTimer } from '../../lib/timeUtils'

interface SidebarProps {
  isMobileOpen: boolean
  onCloseMobile: () => void
}

export const Sidebar = ({ isMobileOpen, onCloseMobile }: SidebarProps) => {
  const { user, activeOrg, setActiveOrg, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { activeTask, activeSeconds, stopTimer } = useTimer()
  const navigate = useNavigate()

  const [showOrgDropdown, setShowOrgDropdown] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const orgRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setShowOrgDropdown(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // All navigation items strictly formatted with a SINGLE WORD
  const navItems = [
    {
      group: 'Geral',
      links: [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/dashboard-v2', label: 'BI', icon: <BarChart3 className="w-4 h-4" /> },
        { to: '/tasks', label: 'Tarefas', icon: <ListTodo className="w-4 h-4" /> },
      ],
    },
    {
      group: 'Estrutura',
      links: [
        { to: '/projects', label: 'Projetos', icon: <FolderKanban className="w-4 h-4" /> },
        { to: '/categories', label: 'Categorias', icon: <Tags className="w-4 h-4" /> },
      ],
    },
    {
      group: 'Gestão',
      links: [
        { to: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { to: '/members', label: 'Membros', icon: <Users className="w-4 h-4" /> },
        { to: '/organization/settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ]

  const navContent = (
    <div className="flex flex-col h-full bg-surface/90 backdrop-blur-md border-r border-border-soft select-none">
      {/* Brand & Logo + Mobile Close */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-border-soft shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-brand flex items-center justify-center shadow-md shadow-accent/20 shrink-0">
            <span className="text-xl">🐝</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                Bee<span className="text-accent">Task</span>
              </span>
              <Chip className="bg-brand-soft text-brand text-[9px] font-bold px-1.5 py-0.2">
                <ChipLabel>v3</ChipLabel>
              </Chip>
            </div>
            <p className="text-[10px] font-semibold text-muted leading-tight">
              Workspace Ágil
            </p>
          </div>
        </NavLink>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-raised"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Workspace Switcher in Sidebar */}
      <div ref={orgRef} className="px-4 pt-3.5 pb-2 relative shrink-0">
        <button
          type="button"
          onClick={() => {
            setShowOrgDropdown(!showOrgDropdown)
            setShowUserMenu(false)
          }}
          className="w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border border-border-soft bg-surface-raised/80 hover:bg-surface-raised hover:border-brand/40 text-foreground transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-brand/15 text-brand flex items-center justify-center font-bold text-xs shrink-0 border border-brand/30">
              <Building2 className="w-4 h-4 text-brand" />
            </div>
            <div className="text-left truncate">
              <p className="text-xs font-bold text-foreground truncate leading-tight">
                {activeOrg?.name || 'Selecione a Org'}
              </p>
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block leading-none mt-0.5 truncate">
                {activeOrg?.roles[0] || 'Membro'}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted transition-transform duration-200 shrink-0 ${
              showOrgDropdown ? 'rotate-180 text-brand' : ''
            }`}
          />
        </button>

        {/* Workspace Dropdown Popover */}
        {showOrgDropdown && (
          <div className="absolute left-4 right-4 top-14 bg-surface/95 backdrop-blur-xl border border-border-soft rounded-2xl p-2 shadow-panel z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 border-b border-border-soft/60 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                Seus Workspaces
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand/15 text-brand">
                {user?.organizations?.length || 0}
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-0.5 py-1">
              {user?.organizations?.map((org) => {
                const isActive = org.id === activeOrg?.id
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      setActiveOrg(org.id)
                      setShowOrgDropdown(false)
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-brand/15 text-brand font-bold'
                        : 'text-foreground hover:bg-surface-raised'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isActive
                            ? 'bg-brand text-white shadow-xs'
                            : 'bg-surface-sunken text-muted border border-border-soft'
                        }`}
                      >
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="truncate leading-tight">{org.name}</p>
                        <p className="text-[9px] text-muted font-normal">
                          {org.roles.join(', ')}
                        </p>
                      </div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-border-soft/60 pt-1.5 mt-1">
              <Link
                to="/organizations"
                onClick={() => {
                  setShowOrgDropdown(false)
                  onCloseMobile()
                }}
                className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand hover:bg-brand/10 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Gerenciar Workspaces</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Active Running Task Activity Status Banner */}
      {activeTask && (
        <div className="px-4 py-2 shrink-0">
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-600/25 dark:border-teal-500/30 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 truncate">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-600 dark:bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600 dark:bg-teal-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Atividade Ativa
                </span>
              </div>

              {/* Pause/Stop Timer Button */}
              <button
                type="button"
                onClick={() => stopTimer(activeTask)}
                title="Parar cronômetro"
                className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors shrink-0 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-rose-300" />
              </button>
            </div>

            <p className="text-xs font-semibold text-foreground truncate leading-tight mb-1">
              {activeTask.title}
            </p>

            <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-teal-700 dark:text-teal-400">
              <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 animate-pulse" />
              <span>{formatSecondsToTimer(activeSeconds)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation List - Single-Word Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
        {navItems.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-muted">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand text-white shadow-md shadow-brand/20 font-bold'
                        : 'text-muted hover:text-foreground hover:bg-surface-raised'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom User Profile, Theme & Logout Card */}
      <div ref={userRef} className="p-3 border-t border-border-soft shrink-0 relative">
        <div className="p-2.5 rounded-2xl bg-surface-raised/80 border border-border-soft flex items-center justify-between gap-2 shadow-xs">
          {/* User Photo & Info */}
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowOrgDropdown(false)
            }}
            className="flex items-center gap-2.5 truncate flex-1 min-w-0 text-left hover:opacity-90 transition-opacity cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-border-soft bg-surface flex items-center justify-center shrink-0 relative">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name || 'Avatar'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="w-full h-full bg-brand/15 text-brand font-bold text-xs flex items-center justify-center uppercase select-none">
                  {userInitials}
                </span>
              )}
              {/* Online indicator dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </div>

            <div className="truncate flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-brand transition-colors">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-[10px] text-muted truncate leading-tight">
                {user?.email}
              </p>
            </div>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="p-2 rounded-xl border border-border-soft bg-surface text-muted hover:text-foreground hover:bg-surface-raised transition-all shrink-0 cursor-pointer"
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-brand" />
            )}
          </button>
        </div>

        {/* User Popover Menu */}
        {showUserMenu && (
          <div className="absolute left-3 right-3 bottom-18 bg-surface/95 backdrop-blur-xl border border-border-soft rounded-2xl p-2 shadow-panel z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
            <div className="px-3 py-2 border-b border-border-soft/60 mb-1">
              <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] text-muted truncate">{user?.email}</p>
            </div>

            <Link
              to="/profile"
              onClick={() => {
                setShowUserMenu(false)
                onCloseMobile()
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-raised hover:text-brand transition-colors"
            >
              <User className="w-4 h-4 text-muted" />
              <span>Meu Perfil</span>
            </Link>

            <Link
              to="/organization/settings"
              onClick={() => {
                setShowUserMenu(false)
                onCloseMobile()
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-raised hover:text-brand transition-colors"
            >
              <Settings className="w-4 h-4 text-muted" />
              <span>Configurações</span>
            </Link>

            <Link
              to="/organizations"
              onClick={() => {
                setShowUserMenu(false)
                onCloseMobile()
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-raised hover:text-brand transition-colors"
            >
              <Building2 className="w-4 h-4 text-muted" />
              <span>Workspaces</span>
            </Link>

            <div className="border-t border-border-soft/60 pt-1 mt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs h-full z-50 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  )
}
