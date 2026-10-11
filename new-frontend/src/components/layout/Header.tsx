import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Chip,
  ChipLabel,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@heroui/react'
import {
  Building2,
  ChevronDown,
  Plus,
  Clock,
  User,
  LogOut,
  Settings,
  PlusCircle,
  Menu as MenuIcon,
  Check,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  onToggleMobileSidebar: () => void
}

export const Header = ({ onToggleMobileSidebar }: HeaderProps) => {
  const { user, activeOrg, setActiveOrg, logout } = useAuth()
  const [showOrgDropdown, setShowOrgDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const orgRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setShowOrgDropdown(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false)
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

  return (
    <header className="sticky top-0 z-40 h-18 border-b border-border-soft bg-surface/85 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left Area: Mobile Menu Trigger + Workspace Switcher */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors"
          aria-label="Abrir menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Workspace Selector Dropdown */}
        <div ref={orgRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowOrgDropdown(!showOrgDropdown)
              setShowUserDropdown(false)
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border-soft bg-surface-muted/60 hover:bg-surface-muted text-text-main transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center font-bold text-xs shadow-xs">
              <Building2 className="w-4 h-4 text-brand" />
            </div>
            <div className="text-left hidden sm:block max-w-[140px] md:max-w-[180px]">
              <span className="block text-xs font-bold truncate leading-tight">
                {activeOrg?.name || 'Selecione a Org'}
              </span>
              <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider leading-none truncate">
                {activeOrg?.roles[0] || 'Membro'}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                showOrgDropdown ? 'rotate-180 text-brand' : ''
              }`}
            />
          </button>

          {/* Org Dropdown Menu */}
          {showOrgDropdown && (
            <Card className="absolute left-0 mt-2 w-64 bg-surface border border-border-soft rounded-2xl p-2 shadow-panel z-50">
              <div className="px-3 py-2 border-b border-border-soft mb-1 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-muted">
                  Workspaces
                </span>
                <Chip className="bg-brand-soft text-brand text-[10px] font-bold px-1.5 py-0.2">
                  <ChipLabel>{user?.organizations?.length || 0}</ChipLabel>
                </Chip>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 py-1">
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
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-brand-soft text-brand font-bold'
                          : 'text-text-muted hover:text-text-main hover:bg-surface-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isActive
                              ? 'bg-brand text-white'
                              : 'bg-surface-muted text-text-muted border border-border-soft'
                          }`}
                        >
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="truncate leading-tight">{org.name}</p>
                          <p className="text-[10px] opacity-75 font-medium">
                            {org.roles.join(', ')}
                          </p>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-brand shrink-0" />}
                    </button>
                  )
                })}
              </div>

              <div className="border-t border-border-soft pt-1.5 mt-1">
                <Link
                  to="/organizations"
                  onClick={() => setShowOrgDropdown(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-brand hover:bg-brand-soft/50 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Gerenciar / Criar Workspace
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Right Area: Active Tracker Pill + Action Button + User Profile */}
      <div className="flex items-center gap-3">
        {/* Active Timer Pill Banner */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-muted border border-border-soft text-xs text-text-muted">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <span className="font-mono font-semibold text-text-main">
            Modo Foco Ativo
          </span>
          <Chip className="bg-accent-soft text-accent text-[10px] font-bold px-1.5 py-0.2">
            <ChipLabel>v3.0</ChipLabel>
          </Chip>
        </div>

        {/* Create Task Button */}
        <Button
          onClick={() => navigate('/tasks/new')}
          className="bg-brand hover:bg-brand-strong text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-brand/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Tarefa</span>
        </Button>

        {/* User Profile Menu Dropdown */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserDropdown(!showUserDropdown)
              setShowOrgDropdown(false)
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand/30 transition-all"
            aria-label="Menu do usuário"
          >
            <Avatar className="w-9 h-9 rounded-full ring-2 ring-border-soft">
              {user?.photo ? (
                <AvatarImage src={user.photo} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-brand-soft text-brand font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <Card className="absolute right-0 mt-2 w-60 bg-surface border border-border-soft rounded-2xl p-2 shadow-panel z-50">
              <div className="p-3 border-b border-border-soft mb-1">
                <p className="text-sm font-bold text-text-main truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {user?.email}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Chip className="bg-accent-soft text-accent text-[10px] font-bold px-2 py-0.5">
                    <ChipLabel>{activeOrg?.roles[0] || 'MEMBRO'}</ChipLabel>
                  </Chip>
                  <span className="text-[10px] text-text-muted">
                    {activeOrg?.name}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 py-1">
                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors"
                >
                  <User className="w-4 h-4 text-brand" />
                  Meu Perfil & Avatar
                </Link>

                <Link
                  to="/organization/settings"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors"
                >
                  <Settings className="w-4 h-4 text-brand" />
                  Configurações do Workspace
                </Link>
              </div>

              <div className="border-t border-border-soft pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-danger hover:bg-danger-soft transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da Conta
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </header>
  )
}
