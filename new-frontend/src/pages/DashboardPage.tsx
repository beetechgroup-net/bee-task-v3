import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Chip,
  ChipLabel,
  Avatar,
  AvatarFallback,
} from '@heroui/react'
import {
  Clock,
  CheckCircle2,
  FolderKanban,
  Play,
  Square,
  Users,
  TrendingUp,
  Plus,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const DashboardPage = () => {
  const { user, activeOrg } = useAuth()

  // Simulação de cronômetro local interativo
  const [isRunning, setIsRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(1450)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTimer = (total: number) => {
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const kpis = [
    {
      label: 'Tarefas em Andamento',
      value: '4',
      sub: '2 com prazo hoje',
      icon: <Clock className="w-5 h-5 text-brand" />,
      bg: 'bg-brand-soft',
    },
    {
      label: 'Finalizadas nesta Semana',
      value: '18',
      sub: '+25% vs semana anterior',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      label: 'Horas Rastreadas (Você)',
      value: '26.4h',
      sub: 'Média de 6.6h / dia',
      icon: <TrendingUp className="w-5 h-5 text-accent" />,
      bg: 'bg-accent-soft',
    },
    {
      label: 'Projetos Conectados',
      value: '5',
      sub: 'No workspace ativo',
      icon: <FolderKanban className="w-5 h-5 text-brand" />,
      bg: 'bg-brand-soft',
    },
  ]

  const recentTasks = [
    {
      id: 1,
      title: 'Implementação do AppShell e Sidebar retrátil',
      project: 'Frontend v3',
      category: 'Feature',
      status: 'EM ANDAMENTO',
      time: '02h 15m',
    },
    {
      id: 2,
      title: 'Ajuste de Headers CORS e preflight no Quarkus',
      project: 'Core Backend',
      category: 'Bugfix',
      status: 'CONCLUÍDO',
      time: '01h 05m',
    },
    {
      id: 3,
      title: 'Configuração de balde MinIO e expiração de URLs',
      project: 'Infra & Storage',
      category: 'DevOps',
      status: 'A FAZER',
      time: '00h 00m',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-main">
              Olá, {user?.name?.split(' ')[0] || 'Desenvolvedor'}! 👋
            </h1>
            <Chip className="bg-brand-soft text-brand text-xs font-semibold px-2 py-0.5 border border-brand/20">
              <ChipLabel>{activeOrg?.name || 'Workspace'}</ChipLabel>
            </Chip>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Aqui está o resumo da sua produtividade e das atividades da equipe hoje.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/tasks">
            <Button className="bg-surface hover:bg-surface-muted text-text-main font-semibold text-xs px-4 py-2.5 rounded-xl border border-border-soft transition-colors shadow-xs">
              Ver Quadro de Tarefas
            </Button>
          </Link>
          <Link to="/tasks/new">
            <Button className="bg-brand hover:bg-brand-strong text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-brand/20 transition-all flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <Card
            key={idx}
            className="bg-surface border border-border-soft rounded-2xl p-5 shadow-xs hover:shadow-panel transition-all"
          >
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">
                  {kpi.label}
                </span>
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                  {kpi.icon}
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-mono text-text-main">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-text-muted font-medium mt-0.5">
                  {kpi.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Active Task Tracker + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Session & Pomodoro Card (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-surface border border-border-soft rounded-3xl p-6 shadow-panel space-y-5">
            <CardHeader className="p-0 flex items-center justify-between pb-3 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent-soft text-accent">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-text-main">
                    Sessão em Foco
                  </CardTitle>
                  <CardDescription className="text-xs text-text-muted">
                    Time tracking em tempo real
                  </CardDescription>
                </div>
              </div>
              <Chip className={isRunning ? "bg-emerald-100 text-emerald-800 text-xs font-bold" : "bg-surface-muted text-text-muted text-xs font-semibold"}>
                <ChipLabel>{isRunning ? "ATIVO" : "PAUSADO"}</ChipLabel>
              </Chip>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border-soft space-y-2">
                <div className="flex items-center gap-2">
                  <Chip className="bg-brand-soft text-brand text-[10px] font-bold">
                    <ChipLabel>Frontend v3</ChipLabel>
                  </Chip>
                  <span className="text-xs font-medium text-text-muted">
                    Squad Core
                  </span>
                </div>
                <h3 className="text-sm font-bold text-text-main">
                  Refatoração do Layout Principal & Navegação com HeroUI
                </h3>
              </div>

              {/* Big Timer display */}
              <div className="text-center py-3 bg-surface rounded-2xl border border-border-soft">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Tempo na Tarefa
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-text-main mt-1">
                  {formatTimer(timerSeconds)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    isRunning
                      ? 'bg-danger-soft text-danger hover:bg-danger/20 border border-danger/30'
                      : 'bg-brand hover:bg-brand-strong text-white shadow-md shadow-brand/20'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      Pausar Tempo
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Iniciar Tempo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter className="p-0 pt-3 border-t border-border-soft flex items-center justify-between text-xs text-text-muted">
              <span>Sessão vinculada ao usuário</span>
              <span className="font-mono text-[11px] font-bold text-brand">
                {user?.email}
              </span>
            </CardFooter>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="bg-surface border border-border-soft rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Acesso Rápido
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                to="/projects"
                className="p-3 rounded-xl bg-surface-muted hover:bg-brand-soft/50 hover:text-brand transition-colors flex items-center gap-2"
              >
                <FolderKanban className="w-4 h-4 text-brand" />
                <span>Ver Projetos</span>
              </Link>
              <Link
                to="/analytics"
                className="p-3 rounded-xl bg-surface-muted hover:bg-accent-soft/50 hover:text-accent transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Métricas da Org</span>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Tasks List (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Tarefas Recentes da Sprint
            </h2>
            <Link
              to="/tasks"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.map((task) => (
              <Card
                key={task.id}
                className="bg-surface border border-border-soft rounded-2xl p-4 shadow-xs hover:shadow-panel hover:border-brand/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Chip className="bg-surface-muted text-text-muted text-[10px] font-semibold border border-border-soft">
                      <ChipLabel>{task.project}</ChipLabel>
                    </Chip>
                    <Chip className="bg-brand-soft text-brand text-[10px] font-bold">
                      <ChipLabel>{task.category}</ChipLabel>
                    </Chip>
                  </div>
                  <h3 className="text-sm font-bold text-text-main truncate">
                    {task.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-mono font-semibold text-text-muted">
                    {task.time}
                  </span>
                  <Chip
                    className={`text-[10px] font-bold ${
                      task.status === 'CONCLUÍDO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'EM ANDAMENTO'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-surface-muted text-text-muted'
                    }`}
                  >
                    <ChipLabel>{task.status}</ChipLabel>
                  </Chip>
                </div>
              </Card>
            ))}
          </div>

          {/* Team Active Members Banner */}
          <Card className="bg-gradient-to-r from-surface to-surface-muted border border-border-soft rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-main">
                  Squad Ativo no Workspace
                </p>
                <p className="text-[11px] text-text-muted">
                  3 colaboradores com sessões registradas hoje
                </p>
              </div>
            </div>

            <div className="flex -space-x-2">
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
                  MS
                </AvatarFallback>
              </Avatar>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
