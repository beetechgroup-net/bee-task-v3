'use client';

import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
  Menu,
  X,
  Layout,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { publicStatsService } from '../services/publicStatsService';
import type { PublicStats } from '../services/publicStatsService';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await publicStatsService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch public stats:', err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-app-bg via-app-bg to-app-bg-strong text-text-main overflow-hidden">
      {/* Subtle radial gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-surface/80 border-b border-border-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-strong flex items-center justify-center shadow-lg shadow-brand/20 group-hover:shadow-xl group-hover:shadow-brand/30 transition-shadow">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight">BeeTask</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Plataforma
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center">
              <a href="#features" className="text-sm font-medium hover:text-brand transition-colors">
                Funcionalidades
              </a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-brand transition-colors">
                Como funciona
              </a>
              <a href="#stats" className="text-sm font-medium hover:text-brand transition-colors">
                Estatísticas
              </a>
            </div>

            {/* Auth Buttons Desktop */}
            <div className="hidden md:flex gap-3 items-center">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-semibold hover:text-brand transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 text-sm font-semibold rounded-2xl bg-brand text-white hover:bg-brand-strong transition-colors shadow-lg shadow-brand/20"
              >
                Criar conta
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-surface-muted rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              className="md:hidden pb-4 border-t border-border-soft"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col gap-3 pt-4">
                <a href="#features" className="text-sm font-medium hover:text-brand transition-colors p-2">
                  Funcionalidades
                </a>
                <a href="#how-it-works" className="text-sm font-medium hover:text-brand transition-colors p-2">
                  Como funciona
                </a>
                <a href="#stats" className="text-sm font-medium hover:text-brand transition-colors p-2">
                  Estatísticas
                </a>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex-1 px-4 py-2 text-sm font-semibold border border-border-strong rounded-xl hover:bg-surface-muted transition-colors"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex-1 px-4 py-2 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-brand-strong transition-colors"
                  >
                    Criar conta
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Gestão de equipes com{' '}
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              visibilidade real
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Organize tarefas, rastreie tempo e acompanhe a produtividade da sua equipe em tempo real.
            Tome decisões baseadas em dados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 rounded-2xl bg-brand text-white font-bold text-lg hover:bg-brand-strong transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand/30"
            >
              Começar grátis
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('showcase');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 rounded-2xl border-2 border-brand text-brand font-bold text-lg hover:bg-brand-soft transition-all"
            >
              Ver demonstração
            </button>
          </div>

          {/* Hero Decoration - Simple SVG Dashboard Mock */}
          <motion.div
            className="relative mx-auto max-w-2xl mt-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="rounded-[2.5rem] bg-surface shadow-2xl shadow-brand/10 p-8 border border-border-soft">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-black uppercase tracking-widest text-text-muted">Dashboard</div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <div className="w-2 h-2 rounded-full bg-accent/50" />
                    <div className="w-2 h-2 rounded-full bg-warning/50" />
                  </div>
                </div>

                <div className="h-32 flex items-end justify-between gap-2">
                  <div className="flex-1 h-20 bg-gradient-to-t from-brand/30 to-brand/10 rounded-xl" />
                  <div className="flex-1 h-28 bg-gradient-to-t from-brand/30 to-brand/10 rounded-xl" />
                  <div className="flex-1 h-24 bg-gradient-to-t from-brand/30 to-brand/10 rounded-xl" />
                  <div className="flex-1 h-32 bg-gradient-to-t from-brand/30 to-brand/10 rounded-xl" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4">
                  <div className="h-12 bg-accent/20 rounded-lg border border-border-soft" />
                  <div className="h-12 bg-brand/20 rounded-lg border border-border-soft" />
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              className="absolute -top-8 -right-8 w-32 h-32 bg-surface rounded-[2rem] shadow-lg shadow-accent/20 border border-border-soft p-4 flex flex-col items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Trophy className="w-8 h-8 text-accent mb-2" />
              <span className="text-xs font-black">TOP</span>
            </motion.div>

            <motion.div
              className="absolute -bottom-8 -left-8 w-32 h-20 bg-surface rounded-[2rem] shadow-lg shadow-brand/20 border border-border-soft p-4 flex flex-col items-center justify-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <Clock className="w-8 h-8 text-brand mb-2" />
              <span className="text-xs font-black">8h 30m</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Funcionalidades principais
          </h2>
          <p className="text-lg text-text-muted">
            Tudo que sua equipe precisa para gerenciar tarefas e produtividade
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: BarChart3,
              title: 'Dashboard da Organização',
              description: 'Visualize a produtividade completa da sua equipe com gráficos intuitivos e análises em tempo real.',
            },
            {
              icon: Users,
              title: 'Análise de Produtividade',
              description: 'Acompanhe o desempenho individual de cada membro da equipe com rankings e métricas detalhadas.',
            },
            {
              icon: Clock,
              title: 'Rastreamento de Tempo',
              description: 'Registre automaticamente o tempo gasto em cada tarefa com nosso cronômetro integrado.',
            },
            {
              icon: Zap,
              title: 'Gestão Visual',
              description: 'Organize tarefas em um quadro Kanban intuitivo e acompanhe o progresso do projeto.',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="group rounded-[2.5rem] bg-surface border border-border-soft p-8 hover:shadow-lg hover:shadow-brand/10 transition-all hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-brand/10 rounded-2xl blur-2xl" />
                <feature.icon className="relative w-12 h-12 text-brand" />
              </div>
              <h3 className="text-xl font-black mb-3">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-text-muted">
            Comece em 3 simples passos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: 1,
              title: 'Crie sua organização',
              description: 'Configure sua workspace em minutos e convide sua equipe.',
            },
            {
              step: 2,
              title: 'Adicione tarefas e projetos',
              description: 'Organize trabalho em projetos e categorize tarefas.',
            },
            {
              step: 3,
              title: 'Acompanhe produtividade',
              description: 'Visualize métricas em tempo real e tome melhores decisões.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand text-white font-black text-2xl mb-6">
                {item.step}
              </div>
              <h3 className="text-xl font-black mb-3">{item.title}</h3>
              <p className="text-text-muted">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Showcase Section */}
      <section id="showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Dashboard em ação
          </h2>
        </motion.div>

        <motion.div
          className="rounded-[2.5rem] bg-surface border border-border-soft overflow-hidden shadow-2xl shadow-brand/10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Left: Leaderboard */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-6">
                  Leaderboard de produtividade
                </h3>

                {['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima'].map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl bg-app-bg border border-border-soft hover:border-border-strong transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white font-black text-sm">
                      {name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-text-muted">32.5 horas esta semana</p>
                    </div>
                    {idx === 0 && <Trophy className="w-5 h-5 text-accent" />}
                  </div>
                ))}
              </div>

              {/* Right: Stats and Charts */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Tarefas', value: '124' },
                    { label: 'Concluídas', value: '89' },
                    { label: 'Em andamento', value: '28' },
                    { label: 'Tempo médio', value: '2h 30m' },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-app-bg border border-border-soft p-4 text-center"
                    >
                      <p className="text-2xl font-black text-brand">{stat.value}</p>
                      <p className="text-xs text-text-muted font-semibold mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black uppercase tracking-widest text-text-muted">
                    Tempo por categoria
                  </p>
                  {[
                    { name: 'Desenvolvimento', percent: 45, color: 'bg-brand' },
                    { name: 'Design', percent: 25, color: 'bg-accent' },
                    { name: 'Reuniões', percent: 20, color: 'bg-warning' },
                    { name: 'Outros', percent: 10, color: 'bg-success' },
                  ].map((cat, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold">{cat.name}</span>
                        <span className="text-xs text-text-muted font-bold">{cat.percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-app-bg-strong overflow-hidden">
                        <div className={cn('h-full transition-all', cat.color)} style={{ width: `${cat.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Usada por equipes em todo o Brasil
          </h2>
          <p className="text-lg text-text-muted">
            Estatísticas da plataforma em tempo real
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-text-muted">Carregando estatísticas...</p>
            </div>
          ) : !stats ? (
            <div className="col-span-full text-center py-12">
              <p className="text-text-muted">Não foi possível carregar as estatísticas</p>
            </div>
          ) : (
            <>
              <StatsCard
                icon={Users}
                label="Usuários Ativos"
                value={stats.totalUsers}
                delay={0}
              />
              <StatsCard
                icon={TrendingUp}
                label="Organizações"
                value={stats.totalOrganizations}
                delay={0.1}
              />
              <StatsCard
                icon={CheckCircle2}
                label="Tarefas Concluídas"
                value={stats.totalCompletedTasks}
                delay={0.2}
              />
              <StatsCard
                icon={Clock}
                label="Horas Registradas"
                value={Math.round(stats.totalTrackedHours)}
                delay={0.3}
              />
            </>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="rounded-[2.5rem] bg-gradient-to-r from-brand to-brand-strong p-12 md:p-16 text-center text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 opacity-10">
            <Zap className="absolute w-32 h-32 top-0 right-0" />
            <TrendingUp className="absolute w-32 h-32 bottom-0 left-0" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Pronto para começar?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de equipes que já estão usando BeeTask para gerenciar suas tarefas
              e aumentar a produtividade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-2xl bg-white text-brand font-bold text-lg hover:bg-brand-soft transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Criar conta grátis
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-2xl border-2 border-white text-white font-bold text-lg hover:bg-white/10 transition-all"
              >
                Já tenho conta
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link to="/" className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-strong flex items-center justify-center shadow-md shadow-brand/20">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className="font-black">BeeTask</span>
            </Link>

            <div className="flex gap-8">
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium hover:text-brand transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-sm font-medium hover:text-brand transition-colors"
              >
                Criar conta
              </button>
            </div>
          </div>

          <div className="border-t border-border-soft mt-8 pt-8 text-center text-sm text-text-muted">
            <p>© 2026 BeeTask. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  delay: number;
}

const StatsCard = ({ icon: Icon, label, value, delay }: StatsCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      current += increment;
      step++;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, (duration * 1000) / steps);

    return () => clearInterval(interval);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      className="rounded-[2.5rem] bg-surface border border-border-soft p-8 text-center hover:shadow-lg hover:shadow-brand/10 transition-all hover:-translate-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 mb-6">
        <Icon className="w-7 h-7 text-brand" />
      </div>
      <div className="text-4xl md:text-5xl font-black text-brand mb-2">
        {displayValue.toLocaleString('pt-BR')}
        {label.includes('Horas') && 'h'}
        {label.includes('Usuários') && '+'}
      </div>
      <p className="text-text-muted font-semibold">{label}</p>
    </motion.div>
  );
};
