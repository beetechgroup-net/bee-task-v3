import { Link } from "react-router-dom"
import { Button, Chip, ChipLabel } from "@heroui/react"
import { ArrowRight } from "lucide-react"

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/85 border-b border-border-soft transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-brand flex items-center justify-center shadow-md shadow-accent/20">
            <span className="text-xl select-none">🐝</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-text-main">
                Bee<span className="text-accent">Task</span>
              </span>
              <Chip className="bg-brand-soft text-brand text-xs font-semibold px-2 py-0.5 border border-brand/20">
                <ChipLabel>v3.0</ChipLabel>
              </Chip>
            </div>
            <p className="text-[11px] font-medium text-text-muted leading-tight">
              by BeeTech Group
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
          <a
            href="/#features"
            className="hover:text-brand transition-colors duration-150 flex items-center gap-1.5"
          >
            Funcionalidades
          </a>
          <a
            href="/#time-tracking"
            className="hover:text-brand transition-colors duration-150"
          >
            Time Tracking
          </a>
          <a
            href="/#workspaces"
            className="hover:text-brand transition-colors duration-150"
          >
            Workspaces
          </a>
          <a
            href="/#analytics"
            className="hover:text-brand transition-colors duration-150"
          >
            Analytics & Gestão
          </a>
          <a
            href="/#faq"
            className="hover:text-brand transition-colors duration-150"
          >
            FAQ
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-text-main hover:text-brand px-3 py-2 transition-colors"
          >
            Entrar
          </Link>
          <Link to="/register">
            <Button
              className="bg-brand hover:bg-brand-strong text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-brand/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              Começar Agora
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
