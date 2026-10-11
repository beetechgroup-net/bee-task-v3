import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Menu as MenuIcon } from 'lucide-react'

export const AppShell = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-app-bg text-text-main flex font-sans selection:bg-brand-soft selection:text-brand relative overflow-x-hidden">
      {/* Decorative ambient background glows matching Landing Page aesthetic */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[350px] bg-gradient-to-tr from-accent/10 via-brand/12 to-transparent blur-3xl pointer-events-none rounded-full -z-0" />
      <div className="fixed bottom-10 right-10 w-[550px] h-[350px] bg-gradient-to-br from-brand/10 via-accent/10 to-transparent blur-3xl pointer-events-none rounded-full -z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Mobile-only compact top bar to open drawer on smartphones */}
        <div className="lg:hidden h-14 border-b border-border-soft bg-surface/85 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
            aria-label="Abrir menu lateral"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🐝</span>
            <span className="font-extrabold text-sm tracking-tight text-foreground">
              Bee<span className="text-accent">Task</span>
            </span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
