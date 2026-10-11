import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

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
        <Header onToggleMobileSidebar={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
