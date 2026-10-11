import { NavLink } from 'react-router-dom'
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
} from 'lucide-react'
import { Chip, ChipLabel } from '@heroui/react'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isMobileOpen: boolean
  onCloseMobile: () => void
}

export const Sidebar = ({ isMobileOpen, onCloseMobile }: SidebarProps) => {
  const { activeOrg } = useAuth()

  const navItems = [
    {
      group: 'Principal',
      links: [
        { to: '/dashboard', label: 'Meu Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/tasks', label: 'Tarefas & Board', icon: <ListTodo className="w-4 h-4" /> },
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
      group: 'Gestão & Equipe',
      links: [
        { to: '/analytics', label: 'Analytics da Org', icon: <BarChart3 className="w-4 h-4" /> },
        { to: '/members', label: 'Membros & Squads', icon: <Users className="w-4 h-4" /> },
        { to: '/organization/settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ]

  const navContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border-soft select-none">
      {/* Brand & Logo */}
      <div className="h-18 px-6 flex items-center justify-between border-b border-border-soft">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-brand flex items-center justify-center shadow-md shadow-accent/20">
            <span className="text-xl">🐝</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-text-main">
                Bee<span className="text-accent">Task</span>
              </span>
              <Chip className="bg-brand-soft text-brand text-[10px] font-bold px-1.5 py-0.2">
                <ChipLabel>v3.0</ChipLabel>
              </Chip>
            </div>
            <p className="text-[10px] font-semibold text-text-muted leading-tight">
              Workspace Ágil
            </p>
          </div>
        </NavLink>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-muted"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {navItems.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand text-white shadow-md shadow-brand/20 font-bold'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-muted'
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

      {/* Bottom Workspace Card Info */}
      <div className="p-4 border-t border-border-soft">
        <div className="p-3 rounded-2xl bg-surface-muted/70 border border-border-soft flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-xs shrink-0">
            <Building2 className="w-4 h-4 text-brand" />
          </div>
          <div className="truncate flex-1 min-w-0">
            <p className="text-xs font-bold text-text-main truncate">
              {activeOrg?.name || 'Workspace Padrão'}
            </p>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {activeOrg?.roles[0] || 'Ativo'}
            </span>
          </div>
        </div>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
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
