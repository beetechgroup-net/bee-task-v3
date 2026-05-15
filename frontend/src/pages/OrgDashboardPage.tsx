import React, { useEffect, useRef, useState, useCallback } from "react";
import { MemberDetailModal } from "../components/MemberDetailModal";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  Trophy,
  Users,
  Briefcase,
  Filter,
  AlertCircle,
  Loader2,
  Medal,
  Timer,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import {
  orgDashboardService,
  type OrgDashboardData,
  type OrgProjectStats,
} from "../services/orgDashboardService";
import { cn } from "../lib/utils";
import { PieChart as SharedPieChart } from "../components/PieChart";
import { CategoryIcon } from "../components/CategoryIcon";
import { Tag } from "lucide-react";

const CHART_COLORS = [
  "#7C3AED",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#3B82F6",
  "#EC4899",
];

interface TooltipState { x: number; y: number; content: string }

function PieChart({ data }: { data: OrgProjectStats[] }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const total = data.reduce((sum, d) => sum + d.totalMinutes, 0);
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full opacity-40 font-bold text-sm">
        Sem dados no período
      </div>
    );
  }

  const cx = 100;
  const cy = 100;
  const r = 70;
  const innerR = 42;

  let startAngle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const fraction = d.totalMinutes / total;
    const angle = fraction * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");

    const pct = ((fraction) * 100).toFixed(1);
    const result = {
      path,
      color: CHART_COLORS[i % CHART_COLORS.length],
      fraction,
      label: `${d.projectName}: ${formatMinutes(d.totalMinutes)} (${pct}%)`,
    };
    startAngle = endAngle;
    return result;
  });

  const handleMouseMove = (e: React.MouseEvent, content: string) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, content });
  };

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full"
        onMouseLeave={() => setTooltip(null)}
      >
        {slices.map((slice, i) => (
          <path
            key={i}
            d={slice.path}
            fill={slice.color}
            stroke="var(--color-surface, #fff)"
            strokeWidth="2"
            className="cursor-pointer transition-opacity hover:opacity-80"
            onMouseMove={(e) => handleMouseMove(e, slice.label)}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" className="text-xs" fontSize="11" fill="currentColor" opacity="0.5">
          projetos
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="20" fontWeight="900" fill="currentColor">
          {data.length}
        </text>
      </svg>
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 bg-surface border border-border-soft rounded-lg px-2 py-1 text-xs font-bold text-text-main shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 36, transform: "translateX(-50%)" }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function Avatar({ name, photo, size = "md" }: { name: string; photo?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-16 h-16 text-xl" : size === "md" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  if (photo) {
    return <img src={photo} alt={name} className={cn("rounded-2xl object-cover shrink-0", sizeClass)} />;
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className={cn("rounded-2xl bg-brand/10 text-brand font-black flex items-center justify-center shrink-0", sizeClass)}>
      {initials}
    </div>
  );
}

export const OrgDashboardPage: React.FC = () => {
  const { activeOrg } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OrgDashboardData | null>(null);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!activeOrg) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await orgDashboardService.getDashboard(
        activeOrg.id,
        format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
      );
      setData(result);
    } catch {
      setError("Falha ao carregar os dados do dashboard da organização.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrg, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalMinutes = data?.projectStats.reduce((sum, p) => sum + p.totalMinutes, 0) ?? 0;

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Filters */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand font-black uppercase tracking-widest text-[10px] mb-2">
            <BarChart3 size={14} />
            Visão da Organização
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-main">
            Dashboard da Org
          </h1>
          <p className="mt-2 text-lg text-text-muted">
            {activeOrg?.name} — desempenho e produtividade do time.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface border border-border-soft p-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2 border-r border-border-soft">
            <Calendar size={18} className="text-brand" />
            <input
              type="date"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => setStartDate(new Date(e.target.value + "T00:00:00"))}
              className="bg-transparent border-none text-sm font-bold text-text-main focus:ring-0 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <input
              type="date"
              value={format(endDate, "yyyy-MM-dd")}
              onChange={(e) => setEndDate(new Date(e.target.value + "T23:59:59"))}
              className="bg-transparent border-none text-sm font-bold text-text-main focus:ring-0 outline-none"
            />
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-brand text-white rounded-xl hover:scale-105 transition-transform active:scale-95"
          >
            <Filter size={18} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-brand mb-4" size={48} />
          <p className="text-text-muted font-bold">Carregando dados da organização...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-surface rounded-[2.5rem] border border-border-soft">
          <AlertCircle size={48} className="text-rose-500 mb-4" />
          <h3 className="text-xl font-bold text-text-main mb-2">Ocorreu um erro</h3>
          <p className="text-text-muted max-w-sm mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all"
          >
            Tentar novamente
          </button>
        </div>
      ) : data ? (
        <>
          {/* Pie chart + Top Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart — Projects */}
            <section className="bg-surface border border-border-soft rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Briefcase size={20} className="text-brand" />
                <h2 className="text-xl font-black text-text-main">Tempo por Projeto</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="w-48 h-48 shrink-0">
                  <PieChart data={data.projectStats} />
                </div>

                <div className="flex-1 space-y-3 w-full">
                  {data.projectStats.length > 0 ? (
                    data.projectStats
                      .slice()
                      .sort((a, b) => b.totalMinutes - a.totalMinutes)
                      .map((stat, i) => {
                        const pct = totalMinutes > 0 ? ((stat.totalMinutes / totalMinutes) * 100).toFixed(1) : "0";
                        return (
                          <div key={stat.projectId ?? "geral"} className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-text-main truncate">{stat.projectName}</span>
                                <span className="text-xs font-black text-text-muted ml-2 shrink-0">
                                  {formatMinutes(stat.totalMinutes)} ({pct}%)
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  className="h-full rounded-full"
                                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-center opacity-40 font-bold text-sm py-6">
                      Nenhum projeto com atividade no período.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Top 5 Tasks */}
            <section className="bg-surface border border-border-soft rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Trophy size={20} className="text-amber-500" />
                <h2 className="text-xl font-black text-text-main">Top 3 Tarefas</h2>
                <span className="ml-auto text-xs font-bold text-text-muted bg-surface-muted px-2 py-1 rounded-lg">
                  por tempo
                </span>
              </div>

              <div className="space-y-3">
                {data.topTasks.length > 0 ? (
                  data.topTasks.map((task, idx) => (
                    <motion.div
                      key={task.taskId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                        idx === 0
                          ? "border-amber-400/40 bg-amber-500/5"
                          : "border-border-soft bg-app-bg",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
                          idx === 0
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                            : idx === 1
                            ? "bg-slate-300 text-slate-700"
                            : idx === 2
                            ? "bg-orange-300 text-orange-800"
                            : "bg-surface-muted text-text-muted",
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-text-main truncate">{task.title}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-brand mt-0.5">
                          {task.projectName}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-black text-text-muted shrink-0">
                        <Timer size={14} className="text-brand" />
                        {formatMinutes(task.totalMinutes)}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center opacity-40 font-bold text-sm py-10">
                    Nenhuma tarefa com atividade no período.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Category Pie */}
          {data.categoryStats.length > 0 && (
            <section className="bg-surface border border-border-soft rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Tag size={20} className="text-brand" />
                <h2 className="text-xl font-black text-text-main">Tarefas por Categoria</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <SharedPieChart
                  size={200}
                  centerLabel="categorias"
                  centerValue={data.categoryStats.length}
                  slices={data.categoryStats.map((c) => ({
                    key: c.categoryId,
                    label: c.categoryName,
                    value: c.totalMinutes,
                    color: c.color,
                  }))}
                  formatTooltip={(s, pct) => `${s.label}: ${formatMinutes(s.value)} (${pct.toFixed(1)}%)`}
                />

                <div className="flex-1 space-y-3 w-full">
                  {data.categoryStats
                    .slice()
                    .sort((a, b) => b.totalMinutes - a.totalMinutes)
                    .map((c) => {
                      const totalCat = data.categoryStats.reduce((s, x) => s + x.totalMinutes, 0);
                      const pct = totalCat > 0 ? ((c.totalMinutes / totalCat) * 100).toFixed(1) : "0";
                      return (
                        <div key={c.categoryId} className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                            style={{ background: `${c.color}1a`, color: c.color }}
                          >
                            <CategoryIcon iconName={c.icon} color={c.color} size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-text-main truncate">{c.categoryName}</span>
                              <span className="text-xs font-black text-text-muted ml-2 shrink-0">
                                {formatMinutes(c.totalMinutes)} ({pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                className="h-full rounded-full"
                                style={{ background: c.color }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          )}

          {/* Members Section */}
          <section className="bg-surface border border-border-soft rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <Users size={20} className="text-brand" />
              <h2 className="text-xl font-black text-text-main">Membros do Time</h2>
              <span className="ml-auto text-xs font-bold text-text-muted bg-surface-muted px-2 py-1 rounded-lg">
                ordenado por tempo
              </span>
            </div>

            {data.memberStats.length === 0 ? (
              <p className="text-center opacity-40 font-bold py-10">
                Nenhum membro encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.memberStats.map((member, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => setSelectedMemberId(member.userId)}
                      className={cn(
                        "relative rounded-[1.5rem] p-6 border transition-all flex flex-col items-center text-center gap-3 cursor-pointer",
                        isFirst
                          ? "border-amber-400/50 bg-gradient-to-b from-amber-500/10 to-amber-500/5 shadow-xl shadow-amber-500/10 hover:shadow-2xl"
                          : "border-border-soft bg-app-bg hover:border-brand/30 hover:shadow-md",
                      )}
                    >
                      {isFirst && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-amber-500/30">
                          <Medal size={10} />
                          Top 1
                        </div>
                      )}

                      <Avatar name={member.userName} photo={member.userPhoto} size={isFirst ? "lg" : "md"} />

                      <div>
                        <div className={cn("font-black text-text-main", isFirst ? "text-lg" : "text-base")}>
                          {member.userName}
                        </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-surface rounded-xl p-3 border border-border-soft">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock size={12} className="text-brand" />
                          </div>
                          <div className={cn("font-black text-text-main", isFirst ? "text-lg" : "text-base")}>
                            {formatMinutes(member.totalMinutesWorked)}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-0.5">
                            Trabalhado
                          </div>
                        </div>

                        <div className="bg-surface rounded-xl p-3 border border-border-soft">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle2 size={12} className="text-accent" />
                          </div>
                          <div className={cn("font-black text-text-main", isFirst ? "text-lg" : "text-base")}>
                            {member.finishedTasksCount}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-0.5">
                            Concluídas
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : null}

      {activeOrg && (
        <MemberDetailModal
          memberId={selectedMemberId}
          orgId={activeOrg.id}
          startDate={startDate}
          endDate={endDate}
          onClose={() => setSelectedMemberId(null)}
        />
      )}
    </div>
  );
};
