import { useState, useEffect } from "react"
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Chip,
  ChipLabel,
  Avatar,
  AvatarFallback,
} from "@heroui/react"
import {
  Play,
  Square,
  Clock,
  Sparkles,
  CheckCircle2,
  FolderKanban,
  Users,
  TrendingUp,
  Flame,
  ArrowRight,
} from "lucide-react"

export const Hero = () => {
  // Interactive mock task timer state
  const [isRunning, setIsRunning] = useState(true)
  const [seconds, setSeconds] = useState(5082) // 01:24:42

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-accent/15 via-brand/20 to-transparent blur-3xl pointer-events-none rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-soft shadow-xs text-xs font-semibold text-brand">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>Bee Task v3 • Produtividade de Alta Performance</span>
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-main leading-[1.12]">
              Onde o foco da sua equipe vira{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-strong to-accent">
                horas produtivas reais.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              O ecossistema completo para gestão ágil, <strong>time tracking auditável</strong>, 
              workspaces multi-empresas e métricas gerenciais em tempo real. Sem burocracia, 
              projetado para quem entrega código e valor.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a href="#comecar" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-brand hover:bg-brand-strong text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-xl shadow-brand/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5">
                  Criar Workspace Grátis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="#preview" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-surface hover:bg-surface-muted text-text-main font-semibold text-base px-6 py-3.5 rounded-xl border border-border-soft shadow-xs transition-colors duration-150 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 text-accent fill-accent" />
                  Ver Demonstração Interativa
                </Button>
              </a>
            </div>

            {/* Bullet Proof Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-text-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand" />
                <span>Multi-tenancy nativo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand" />
                <span>Controle de horas por segundo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand" />
                <span>Arquitetura Quarkus + React</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Interactive Preview Card */}
          <div id="preview" className="lg:col-span-5 relative">
            {/* Floating badge top right */}
            <div className="absolute -top-4 -right-2 sm:-right-4 z-20 bg-surface border border-border-soft p-3 rounded-2xl shadow-panel flex items-center gap-3 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent">
                <Flame className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Ritmo da Sprint
                </p>
                <p className="text-sm font-bold text-text-main">
                  94.8% no Prazo
                </p>
              </div>
            </div>

            {/* Card HeroUI container */}
            <Card className="bg-surface/90 backdrop-blur-md border border-border-soft rounded-3xl p-6 shadow-panel relative z-10 transition-all hover:shadow-2xl">
              <CardHeader className="p-0 pb-4 flex items-center justify-between border-b border-border-soft">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-text-muted ml-2">
                    Squad Core • Bee Task v3
                  </span>
                </div>
                <Chip className="bg-accent-soft text-accent text-xs font-semibold px-2 py-0.5 border border-accent/20">
                  <ChipLabel>Org: BeeTech Principal</ChipLabel>
                </Chip>
              </CardHeader>

              <CardContent className="p-0 py-5 space-y-4">
                {/* Active Task simulation */}
                <div className="bg-surface-muted/80 rounded-2xl p-4 border border-border-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Chip className="bg-brand-soft text-brand text-[11px] font-semibold px-2 py-0.5">
                        <ChipLabel>Feature</ChipLabel>
                      </Chip>
                      <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                        <FolderKanban className="w-3.5 h-3.5 text-brand" />
                        API Task 3.0
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          isRunning ? "bg-emerald-500 animate-ping" : "bg-zinc-400"
                        }`}
                      />
                      <span className="text-xs font-semibold text-text-muted">
                        {isRunning ? "EM ANDAMENTO" : "PAUSADO"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-text-main">
                    Refatoração do Mecanismo de Notificações & MinIO S3
                  </h3>

                  <p className="text-xs text-text-muted">
                    Implementação de upload direto de avatares com presigned URL e auditoria de log com Quarkus.
                  </p>

                  {/* Real-time interactive tracker block */}
                  <div className="bg-surface rounded-xl p-3 border border-border-soft flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                        <Clock className="w-4 h-4 text-brand" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                          Tempo Rastreado
                        </p>
                        <p className="text-lg font-mono font-bold text-text-main">
                          {formatTime(seconds)}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Button */}
                    <Button
                      onClick={() => setIsRunning(!isRunning)}
                      className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                        isRunning
                          ? "bg-danger-soft text-danger hover:bg-danger/20 border border-danger/30"
                          : "bg-brand text-white hover:bg-brand-strong shadow-md shadow-brand/20"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Iniciar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Subtask / team member preview */}
                <div className="flex items-center justify-between pt-1 px-1">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      <Avatar className="w-7 h-7 rounded-full ring-2 ring-surface">
                        <AvatarFallback className="bg-brand text-white text-[10px] font-bold">
                          GB
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="w-7 h-7 rounded-full ring-2 ring-surface">
                        <AvatarFallback className="bg-accent text-white text-[10px] font-bold">
                          AL
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="w-7 h-7 rounded-full ring-2 ring-surface">
                        <AvatarFallback className="bg-brand-strong text-white text-[10px] font-bold">
                          CR
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-xs font-medium text-text-muted">
                      3 membros com sessões ativas
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-brand flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +18.4h hoje
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-0 pt-3 border-t border-border-soft flex items-center justify-between text-xs text-text-muted">
                <span>Auditoria de sessões ativa</span>
                <span className="font-mono text-[11px] text-text-main font-semibold">
                  Última sincronia: agora
                </span>
              </CardFooter>
            </Card>

            {/* Bottom floating badge */}
            <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 bg-surface border border-border-soft p-3 rounded-2xl shadow-panel flex items-center gap-3 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-brand-soft flex items-center justify-center text-brand">
                <Users className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Permissões RBAC
                </p>
                <p className="text-sm font-bold text-text-main">
                  Owner • Admin • Member
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
