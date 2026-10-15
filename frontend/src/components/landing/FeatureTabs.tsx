import { useState } from "react"
import {
  Card,
  Button,
  Chip,
  ChipLabel,
} from "@heroui/react"
import {
  Clock,
  Building2,
  BarChart3,
  ShieldCheck,
  Check,
  Calendar,
} from "lucide-react"

export const FeatureTabs = () => {
  const [activeTab, setActiveTab] = useState<"tracking" | "workspaces" | "analytics" | "security">("tracking")

  return (
    <section id="time-tracking" className="py-24 bg-surface/60 border-y border-border-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs uppercase font-extrabold tracking-widest text-brand">
            Visão Detalhada dos Módulos
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main">
            Projetado de ponta a ponta com a arquitetura Bee Task
          </h2>
          <p className="text-text-muted text-base">
            Alterne entre os pilares da plataforma para entender como cada recurso foi estruturado.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto p-1.5 bg-surface-muted rounded-2xl border border-border-soft">
          <button
            onClick={() => setActiveTab("tracking")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "tracking"
                ? "bg-surface text-brand shadow-sm border border-border-soft"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <Clock className="w-4 h-4 text-brand" />
            Time Tracking Nativo
          </button>
          <button
            onClick={() => setActiveTab("workspaces")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "workspaces"
                ? "bg-surface text-accent shadow-sm border border-border-soft"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <Building2 className="w-4 h-4 text-accent" />
            Workspaces & Squads
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-surface text-brand shadow-sm border border-border-soft"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-brand" />
            Analytics & Member Detail
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "security"
                ? "bg-surface text-brand-strong shadow-sm border border-border-soft"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-brand-strong" />
            Segurança & MinIO
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-surface border border-border-soft rounded-3xl p-6 sm:p-10 shadow-panel transition-all">
          {activeTab === "tracking" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-bold">
                  <span>Mecanismo Core de Produtividade</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main">
                  Sem cronômetros externos. O tempo é propriedade da tarefa.
                </h3>
                <p className="text-text-muted leading-relaxed text-sm sm:text-base">
                  No Bee Task, o rastreamento não é uma camada solta. Cada tarefa possui seu próprio vetor de sessões 
                  (<code className="font-mono text-xs text-brand font-bold">TaskHistoryItem</code>), 
                  registrando o carimbo exato de início e término. Se você pausar para um café ou trocar de foco, a 
                  plataforma garante histórico fiel.
                </p>
                <ul className="space-y-2.5 text-sm font-medium text-text-main">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    Proteção contra múltiplas execuções concorrentes na mesma tarefa
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    Finalização automática e data de conclusão (<code className="font-mono text-xs">finishedAt</code>)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    Totalizador instantâneo de horas dedicadas ao projeto
                  </li>
                </ul>
              </div>

              {/* Visual Mockup for Tracking */}
              <div className="lg:col-span-6">
                <Card className="bg-surface-muted border border-border-soft rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border-soft pb-3">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Histórico Auditável de Sessões
                    </span>
                    <Chip className="bg-brand-soft text-brand text-xs font-semibold">
                      <ChipLabel>3 Sessões Registradas</ChipLabel>
                    </Chip>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-surface p-3.5 rounded-xl border border-border-soft flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-text-main">Sessão #1 • Planejamento e Arquitetura</p>
                        <p className="text-[11px] text-text-muted">10:00:15 → 11:30:20 (01h 30m)</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-brand">Finalizado</span>
                    </div>

                    <div className="bg-surface p-3.5 rounded-xl border border-border-soft flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-text-main">Sessão #2 • Codificação dos Endpoints</p>
                        <p className="text-[11px] text-text-muted">13:15:00 → 15:45:00 (02h 30m)</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-brand">Finalizado</span>
                    </div>

                    <div className="bg-surface p-3.5 rounded-xl border border-brand/30 ring-2 ring-brand/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-text-main">Sessão #3 • Testes Unitários & CI/CD</p>
                        <p className="text-[11px] text-text-muted">Iniciado às 16:00:00 (em execução)</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-accent animate-pulse">00h 42m 19s</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "workspaces" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-bold">
                  <span>Isolamento Corporativo & Squads</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main">
                  Uma conta, múltiplos workspaces totalmente independentes
                </h3>
                <p className="text-text-muted leading-relaxed text-sm sm:text-base">
                  Ideal para agências, consultorias e empresas de tecnologia. Mude de organização sem fazer logout. 
                  Convide membros, atribua papéis rigorosos (<code className="font-mono text-xs">OWNER</code>,{" "}
                  <code className="font-mono text-xs">ADMIN</code>, <code className="font-mono text-xs">MEMBER</code>) 
                  e gerencie o status dos convites.
                </p>
                <ul className="space-y-2.5 text-sm font-medium text-text-main">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-accent stroke-[3]" />
                    Separação completa de dados por entidade organizacional
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-accent stroke-[3]" />
                    Visão de status de membro: Ativo ou Pendente de confirmação
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-accent stroke-[3]" />
                    Projetos e categorias pertencentes ao escopo da empresa
                  </li>
                </ul>
              </div>

              {/* Visual Mockup for Workspaces */}
              <div className="lg:col-span-6">
                <Card className="bg-surface-muted border border-border-soft rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border-soft pb-3">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Workspaces Vinculados
                    </span>
                    <Button className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                      + Novo Workspace
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-surface p-4 rounded-xl border border-border-soft flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center font-bold">
                          BT
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">BeeTech Soluções Globais</p>
                          <p className="text-xs text-text-muted">14 Projetos • 28 Membros</p>
                        </div>
                      </div>
                      <Chip className="bg-accent-soft text-accent text-xs font-bold">
                        <ChipLabel>OWNER</ChipLabel>
                      </Chip>
                    </div>

                    <div className="bg-surface p-4 rounded-xl border border-border-soft flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold">
                          CL
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">Cliente Alpha • Fintech</p>
                          <p className="text-xs text-text-muted">4 Projetos • 8 Membros</p>
                        </div>
                      </div>
                      <Chip className="bg-brand-soft text-brand text-xs font-bold">
                        <ChipLabel>ADMIN</ChipLabel>
                      </Chip>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-bold">
                  <span>Inteligência Operacional</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main">
                  Painel de controle gerencial e estatísticas por colaborador
                </h3>
                <p className="text-text-muted leading-relaxed text-sm sm:text-base">
                  O módulo de Org Dashboard consolida os indicadores mais críticos para tomada de decisão: 
                  distribuição de tempo por categoria, top tasks mais demoradas, progresso de projetos e a aba 
                  exclusiva <strong>Member Detail</strong>, que detalha o rendimento e horas de cada desenvolvedor.
                </p>
                <ul className="space-y-2.5 text-sm font-medium text-text-main">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    Filtro flexível por intervalo de datas (mensal, semanal, customizado)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    Ranking de tarefas mais pesadas da sprint
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    Relatório consolidado de taxa de conclusão e entrega no prazo
                  </li>
                </ul>
              </div>

              {/* Visual Mockup for Analytics */}
              <div className="lg:col-span-6">
                <Card className="bg-surface-muted border border-border-soft rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border-soft pb-3">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Resumo da Semana (Org Dashboard)
                    </span>
                    <span className="text-xs text-text-muted font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Últimos 30 dias
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface p-3 rounded-xl border border-border-soft">
                      <p className="text-xs text-text-muted font-semibold">Total Horas Rastreadas</p>
                      <p className="text-xl font-bold font-mono text-brand mt-1">342.5h</p>
                      <span className="text-[11px] text-emerald-600 font-semibold">+14% vs mês anterior</span>
                    </div>

                    <div className="bg-surface p-3 rounded-xl border border-border-soft">
                      <p className="text-xs text-text-muted font-semibold">Taxa de Conclusão</p>
                      <p className="text-xl font-bold font-mono text-accent mt-1">92.8%</p>
                      <span className="text-[11px] text-text-muted">118 tarefas entregues</span>
                    </div>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border-soft space-y-2">
                    <p className="text-xs font-bold text-text-main">Top Demandas por Categoria</p>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span>Backend Core & APIs</span>
                          <span className="font-mono font-bold">140h (41%)</span>
                        </div>
                        <div className="w-full bg-border-soft h-2 rounded-full overflow-hidden">
                          <div className="bg-brand h-full rounded-full w-[41%]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-medium mb-1">
                          <span>Frontend & UX</span>
                          <span className="font-mono font-bold">112h (33%)</span>
                        </div>
                        <div className="w-full bg-border-soft h-2 rounded-full overflow-hidden">
                          <div className="bg-accent h-full rounded-full w-[33%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft text-brand-strong text-xs font-bold">
                  <span>Stack Confiável & Nuvem Privada</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main">
                  Segurança corporativa com Quarkus, JWT & MinIO S3
                </h3>
                <p className="text-text-muted leading-relaxed text-sm sm:text-base">
                  O backend foi desenvolvido com a robustez e baixo consumo de memória do ecossistema Quarkus. 
                  Autenticação padronizada com tokens JWT SmallRye e upload descentralizado de avatares com 
                  balde MinIO, garantindo que suas informações corporativas fiquem sob seu total controle.
                </p>
                <ul className="space-y-2.5 text-sm font-medium text-text-main">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    Chaves criptográficas assimétricas (PEM) para assinatura de tokens
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    MinIO Bucket privado com links anônimos controlados
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand stroke-[3]" />
                    Migrações de banco seguras gerenciadas via Flyway / Hibernate
                  </li>
                </ul>
              </div>

              {/* Visual Mockup for Security */}
              <div className="lg:col-span-6">
                <Card className="bg-surface-muted border border-border-soft rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border-soft pb-3">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Arquitetura de Serviços Integrados
                    </span>
                    <Chip className="bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      <ChipLabel>Status: 100% Operacional</ChipLabel>
                    </Chip>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="bg-surface p-3 rounded-xl border border-border-soft flex items-center justify-between">
                      <span className="text-text-main font-semibold">Backend API (Quarkus REST)</span>
                      <span className="text-brand font-bold">:8081 [JWT Auth]</span>
                    </div>

                    <div className="bg-surface p-3 rounded-xl border border-border-soft flex items-center justify-between">
                      <span className="text-text-main font-semibold">Storage MinIO (S3 Avatars)</span>
                      <span className="text-accent font-bold">:9000 [Bucket: avatars]</span>
                    </div>

                    <div className="bg-surface p-3 rounded-xl border border-border-soft flex items-center justify-between">
                      <span className="text-text-main font-semibold">PostgreSQL Relational DB</span>
                      <span className="text-brand-strong font-bold">:5432 [Pooled]</span>
                    </div>

                    <div className="bg-surface p-3 rounded-xl border border-border-soft flex items-center justify-between">
                      <span className="text-text-main font-semibold">Frontend SPA (React 19 + HeroUI)</span>
                      <span className="text-text-muted font-bold">:80 [Caddy Edge]</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
