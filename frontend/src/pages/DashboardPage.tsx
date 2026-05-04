import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Layout,
  FileText,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  History,
  Briefcase
} from "lucide-react";
import { dashboardService, type DashboardData } from "../services/dashboardService";
import { cn } from "../lib/utils";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const result = await dashboardService.getDashboard(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setData(result);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Falha ao carregar os dados do dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate]);

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Filters */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand font-black uppercase tracking-widest text-[10px] mb-2">
            <BarChart3 size={14} />
            Visão Geral
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            Dashboard
          </h1>
          <p className="mt-2 text-lg text-text-muted">
            Acompanhe sua produtividade e tempo gasto.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface border border-border-soft p-2 rounded-2xl shadow-sm">
           <div className="flex items-center gap-2 px-3 py-2 border-r border-border-soft">
              <Calendar size={18} className="text-brand" />
              <input 
                type="date" 
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="bg-transparent border-none text-sm font-bold text-text-main focus:ring-0 outline-none"
              />
           </div>
           <div className="flex items-center gap-2 px-3 py-2">
              <input 
                type="date" 
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="bg-transparent border-none text-sm font-bold text-text-main focus:ring-0 outline-none"
              />
           </div>
           <button 
            onClick={fetchDashboardData}
            className="p-2 bg-brand text-white rounded-xl hover:scale-105 transition-transform active:scale-95"
           >
             <Filter size={18} />
           </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-brand mb-4" size={48} />
          <p className="text-text-muted font-bold">Gerando estatísticas...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-surface rounded-[2.5rem] border border-border-soft">
          <AlertCircle size={48} className="text-rose-500 mb-4" />
          <h3 className="text-xl font-bold text-text-main mb-2">Ocorreu um erro</h3>
          <p className="text-text-muted max-w-sm mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="px-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all">
            Tentar novamente
          </button>
        </div>
      ) : data ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border-soft p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center mb-6">
                  <Clock size={24} />
                </div>
                <div className="text-sm font-bold text-text-muted uppercase tracking-wider">Tempo Total</div>
                <div className="mt-2 text-4xl font-black text-text-main">{formatMinutes(data.totalMinutesWorked)}</div>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-brand bg-brand/5 w-fit px-2 py-1 rounded-full uppercase tracking-widest">
                  <TrendingUp size={12} />
                  Foco em alta
                </div>
              </div>
              <Clock size={120} className="absolute -right-10 -bottom-10 text-brand/5 -rotate-12 transition-transform group-hover:rotate-0" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-border-soft p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle2 size={24} />
                </div>
                <div className="text-sm font-bold text-text-muted uppercase tracking-wider">Tarefas Concluídas</div>
                <div className="mt-2 text-4xl font-black text-text-main">{data.finishedTasksInPeriod.length}</div>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-accent bg-accent/5 w-fit px-2 py-1 rounded-full uppercase tracking-widest">
                  <CheckCircle2 size={12} />
                  Periodo de Entrega
                </div>
              </div>
              <CheckCircle2 size={120} className="absolute -right-10 -bottom-10 text-accent/5 -rotate-12 transition-transform group-hover:rotate-0" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-accent p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-accent/20 transition-all text-white"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mb-6">
                  <FileText size={24} />
                </div>
                <div className="text-sm font-bold text-white/70 uppercase tracking-wider">Média por Projeto</div>
                <div className="mt-2 text-4xl font-black">
                  {data.projectStats.length > 0 
                    ? formatMinutes(Math.round(data.totalMinutesWorked / data.projectStats.length)) 
                    : '0h 0m'}
                </div>
                <button className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">
                  <Download size={14} />
                  Exportar Relatório
                </button>
              </div>
              <TrendingUp size={160} className="absolute -right-10 -bottom-10 text-white/10 -rotate-12 transition-transform group-hover:rotate-0" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Breakdown */}
            <section className="bg-surface border border-border-soft rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Briefcase size={20} className="text-brand" />
                  <h2 className="text-xl font-black text-text-main">Tempo por Projeto</h2>
                </div>
                <BarChart3 size={20} className="text-text-muted" />
              </div>

              <div className="space-y-6">
                {data.projectStats.length > 0 ? data.projectStats.map((stat, idx) => {
                  const percentage = (stat.totalMinutes / data.totalMinutesWorked) * 100;
                  return (
                    <div key={stat.projectId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-main flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", idx % 2 === 0 ? "bg-brand" : "bg-accent")} />
                          {stat.projectName}
                        </span>
                        <span className="text-sm font-black text-text-muted">{formatMinutes(stat.totalMinutes)}</span>
                      </div>
                      <div className="h-3 w-full bg-surface-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={cn("h-full rounded-full", idx % 2 === 0 ? "bg-brand" : "bg-accent")}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-10 opacity-50 font-bold">Nenhum dado por projeto.</div>
                )}
              </div>
            </section>

            {/* Daily Section (Yesterday) */}
            <section className="bg-surface border border-border-soft rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <History size={20} className="text-accent" />
                  <h2 className="text-xl font-black text-text-main">Daily (Ontem)</h2>
                </div>
                <div className="text-xs font-bold text-text-muted uppercase bg-surface-muted px-2 py-1 rounded-lg">
                  {format(subDays(new Date(), 1), 'dd MMM', { locale: ptBR })}
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {data.yesterdayTasks.length > 0 ? data.yesterdayTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-app-bg rounded-2xl border border-border-soft group hover:border-brand/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                        <Layout size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-text-main line-clamp-1">{task.title}</div>
                        <div className="text-[10px] font-black uppercase text-brand tracking-widest">{task.projectName}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-50 font-bold">Nenhuma atividade registrada ontem.</div>
                )}
              </div>
            </section>
          </div>

          {/* Reporting Section (Finished Tasks) */}
          <section className="bg-surface border border-border-soft rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-brand" />
                <h2 className="text-xl font-black text-text-main">Relatório de Entregas</h2>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-brand hover:underline bg-brand/5 px-4 py-2 rounded-xl transition-all">
                <Download size={16} />
                Baixar PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-soft">
                    <th className="pb-4 text-xs font-black uppercase text-text-muted tracking-widest pl-4">Tarefa</th>
                    <th className="pb-4 text-xs font-black uppercase text-text-muted tracking-widest">Projeto</th>
                    <th className="pb-4 text-xs font-black uppercase text-text-muted tracking-widest">Concluída em</th>
                    <th className="pb-4 text-xs font-black uppercase text-text-muted tracking-widest text-right pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft/50">
                  {data.finishedTasksInPeriod.length > 0 ? data.finishedTasksInPeriod.map(task => (
                    <tr key={task.id} className="group hover:bg-app-bg transition-colors">
                      <td className="py-4 pl-4 font-bold text-text-main">{task.title}</td>
                      <td className="py-4 text-sm font-medium text-text-muted">
                        <span className="px-2 py-1 bg-surface-muted rounded-lg border border-border-soft">
                          {task.projectName}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-bold text-text-main">
                         {task.finishedAt ? format(new Date(task.finishedAt), 'dd/MM/yyyy HH:mm') : '-'}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 px-2 py-1 text-[10px] font-black uppercase text-green-600 tracking-tighter">
                          <CheckCircle2 size={12} />
                          Finalizado
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center opacity-50 font-bold">Nenhuma tarefa finalizada neste período.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
};
