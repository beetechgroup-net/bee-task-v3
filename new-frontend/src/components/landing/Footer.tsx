import { Chip, ChipLabel } from "@heroui/react"

export const Footer = () => {
  return (
    <footer className="border-t border-border-soft bg-surface py-12 text-sm text-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-border-soft">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-brand flex items-center justify-center text-sm shadow-sm">
                <span>🐝</span>
              </div>
              <span className="font-extrabold text-lg text-text-main">
                Bee<span className="text-accent">Task</span>
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Plataforma de alta performance para gestão de tarefas, controle de horas 
              e dashboards operacionais multi-empresas.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-text-main">Serviços Operacionais (v3)</span>
            </div>
          </div>

          {/* Links: Produto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
              Produto
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="#features" className="hover:text-brand transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#time-tracking" className="hover:text-brand transition-colors">
                  Time Tracking & Cronômetro
                </a>
              </li>
              <li>
                <a href="#workspaces" className="hover:text-brand transition-colors">
                  Workspaces Multi-Tenancy
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-brand transition-colors">
                  Dashboards & Member Detail
                </a>
              </li>
            </ul>
          </div>

          {/* Links: Arquitetura & Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
              Arquitetura
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <span className="text-text-muted">Backend: Quarkus 3 REST</span>
              </li>
              <li>
                <span className="text-text-muted">Frontend: React 19 + HeroUI v3</span>
              </li>
              <li>
                <span className="text-text-muted">Storage: MinIO S3 Object Storage</span>
              </li>
              <li>
                <span className="text-text-muted">Database: PostgreSQL 16</span>
              </li>
            </ul>
          </div>

          {/* Links: BeeTech Group */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
              BeeTech Group
            </h4>
            <p className="text-xs text-text-muted">
              Soluções modernas de engenharia de software e inteligência operacional.
            </p>
            <div className="pt-2">
              <Chip className="bg-surface-muted text-text-muted text-[11px] font-semibold border border-border-soft">
                <ChipLabel>task3.beetech.dev</ChipLabel>
              </Chip>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} BeeTech Group. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brand transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-brand transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-brand transition-colors">
              Status do Sistema
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
