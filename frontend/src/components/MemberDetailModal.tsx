import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Clock, CheckCircle2, Loader2, AlertCircle, TrendingUp, Zap } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import {
  orgDashboardService,
  type MemberDetailData,
  type PeriodStats,
  type MemberProjectStats,
} from "../services/orgDashboardService";

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const CHART_COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899"];

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getPeriodLabel(s: PeriodStats, groupedBy: "DAY" | "MONTH"): string {
  if (groupedBy === "DAY") {
    return `${String(s.day).padStart(2, "0")}/${String(s.month).padStart(2, "0")}`;
  }
  return `${MONTH_NAMES[s.month - 1]}/${String(s.year).slice(2)}`;
}

function Avatar({ name, photo }: { name: string; photo?: string | null }) {
  if (photo) return <img src={photo} alt={name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />;
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  return (
    <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand font-black text-xl flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

function BarChart({
  data,
  valueKey,
  color,
  groupedBy,
}: {
  data: PeriodStats[];
  valueKey: "finishedTasksCount" | "totalMinutesWorked";
  color: string;
  groupedBy: "DAY" | "MONTH";
}) {
  const values = data.map((d) => d[valueKey] as number);
  const maxVal = Math.max(...values, 1);
  const chartW = 220;
  const barAreaH = 80;
  const barCount = data.length;
  const gap = barCount > 15 ? 2 : 4;
  const barW = barCount > 0 ? Math.max(2, Math.floor((chartW - gap * (barCount - 1)) / barCount)) : 10;

  const showLabel = (i: number) => {
    if (groupedBy === "DAY") return barCount <= 10 || i % Math.ceil(barCount / 6) === 0;
    return true;
  };

  return (
    <svg viewBox={`0 0 ${chartW} ${barAreaH + 18}`} className="w-full">
      {data.map((d, i) => {
        const val = d[valueKey] as number;
        const barH = maxVal > 0 ? Math.max(val > 0 ? 2 : 0, Math.round((val / maxVal) * barAreaH)) : 0;
        const x = i * (barW + gap);
        const y = barAreaH - barH;
        const label = showLabel(i) ? getPeriodLabel(d, groupedBy) : "";

        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={2} fill={color} opacity={val === 0 ? 0.12 : 0.85} />
            {label && (
              <text x={x + barW / 2} y={barAreaH + 12} textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" opacity="0.45">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function MiniPieChart({ data }: { data: MemberProjectStats[] }) {
  const total = data.reduce((s, d) => s + d.totalMinutes, 0);
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full opacity-40 text-xs font-bold">
        Sem dados
      </div>
    );
  }

  const cx = 50, cy = 50, r = 38, innerR = 22;
  let startAngle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const fraction = d.totalMinutes / total;
    const angle = fraction * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle), iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle), iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    const result = { path, color: CHART_COLORS[i % CHART_COLORS.length], name: d.projectName, fraction };
    startAngle = endAngle;
    return result;
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="var(--color-surface,#fff)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

interface MemberDetailModalProps {
  memberId: number | null;
  orgId: number;
  startDate: Date;
  endDate: Date;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  memberId,
  orgId,
  startDate,
  endDate,
  onClose,
}) => {
  const [data, setData] = useState<MemberDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberId === null) { setData(null); return; }
    setIsLoading(true);
    setError(null);
    setData(null);
    const start = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
    const end = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
    orgDashboardService
      .getMemberStats(orgId, memberId, start, end)
      .then(setData)
      .catch(() => setError("Falha ao carregar os dados do membro."))
      .finally(() => setIsLoading(false));
  }, [memberId, orgId, startDate, endDate]);

  const totalMinutes = data?.periodStats.reduce((s, p) => s + p.totalMinutesWorked, 0) ?? 0;
  const totalFinished = data?.periodStats.reduce((s, p) => s + p.finishedTasksCount, 0) ?? 0;

  const daySpan = Math.max(differenceInDays(endDate, startDate), 1);
  const avgPerDay = totalMinutes / daySpan;

  const bestPeriod = data?.periodStats.reduce(
    (best, p) => (p.totalMinutesWorked > (best?.totalMinutesWorked ?? -1) ? p : best),
    null as PeriodStats | null,
  );
  const bestLabel = bestPeriod && bestPeriod.totalMinutesWorked > 0
    ? getPeriodLabel(bestPeriod, data!.groupedBy)
    : "—";

  return (
    <AnimatePresence>
      {memberId !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative z-10 w-full max-w-3xl bg-surface border border-border-soft rounded-[2rem] shadow-2xl overflow-hidden"
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-brand mb-3" size={32} />
                  <p className="text-text-muted font-bold text-sm">Carregando dados...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle size={32} className="text-rose-500 mb-3" />
                  <p className="text-text-muted font-bold text-sm">{error}</p>
                </div>
              ) : data ? (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <Avatar name={data.userName} photo={data.userPhoto} />
                    <div>
                      <h2 className="text-xl font-black text-text-main">{data.userName}</h2>
                      <div className="flex items-center gap-1.5 mt-0.5 text-text-muted text-sm">
                        <Mail size={12} className="text-brand" />
                        {data.userEmail}
                      </div>
                    </div>
                  </div>

                  {/* 4 stat chips */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-app-bg border border-border-soft rounded-xl p-3 flex flex-col items-center text-center">
                      <CheckCircle2 size={14} className="text-accent mb-1" />
                      <div className="text-lg font-black text-text-main leading-none">{totalFinished}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-1">Concluídas</div>
                    </div>
                    <div className="bg-app-bg border border-border-soft rounded-xl p-3 flex flex-col items-center text-center">
                      <Clock size={14} className="text-brand mb-1" />
                      <div className="text-lg font-black text-text-main leading-none">{formatMinutes(totalMinutes)}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-1">Trabalhado</div>
                    </div>
                    <div className="bg-app-bg border border-border-soft rounded-xl p-3 flex flex-col items-center text-center">
                      <TrendingUp size={14} className="text-cyan-500 mb-1" />
                      <div className="text-lg font-black text-text-main leading-none">{formatMinutes(Math.round(avgPerDay))}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-1">Média/dia</div>
                    </div>
                    <div className="bg-app-bg border border-border-soft rounded-xl p-3 flex flex-col items-center text-center">
                      <Zap size={14} className="text-amber-500 mb-1" />
                      <div className="text-lg font-black text-text-main leading-none">{bestLabel}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-1">Melhor período</div>
                    </div>
                  </div>

                  {/* Bar charts side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-app-bg border border-border-soft rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <CheckCircle2 size={13} className="text-accent" />
                        <span className="text-xs font-black text-text-main">
                          Tarefas Concluídas {data.groupedBy === "DAY" ? "por Dia" : "por Mês"}
                        </span>
                      </div>
                      <BarChart
                        data={data.periodStats}
                        valueKey="finishedTasksCount"
                        color="#7C3AED"
                        groupedBy={data.groupedBy}
                      />
                    </div>

                    <div className="bg-app-bg border border-border-soft rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Clock size={13} className="text-brand" />
                        <span className="text-xs font-black text-text-main">
                          Tempo Trabalhado {data.groupedBy === "DAY" ? "por Dia" : "por Mês"}
                        </span>
                      </div>
                      <BarChart
                        data={data.periodStats}
                        valueKey="totalMinutesWorked"
                        color="#06B6D4"
                        groupedBy={data.groupedBy}
                      />
                    </div>
                  </div>

                  {/* Pie chart — hours by project */}
                  {data.projectStats.length > 0 && (
                    <div className="bg-app-bg border border-border-soft rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-xs font-black text-text-main">Horas por Projeto</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 shrink-0">
                          <MiniPieChart data={data.projectStats} />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {data.projectStats
                            .slice()
                            .sort((a, b) => b.totalMinutes - a.totalMinutes)
                            .map((p, i) => {
                              const total = data.projectStats.reduce((s, x) => s + x.totalMinutes, 0);
                              const pct = total > 0 ? ((p.totalMinutes / total) * 100).toFixed(0) : "0";
                              return (
                                <div key={p.projectId ?? "geral"} className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                  <span className="text-xs font-bold text-text-main truncate flex-1">{p.projectName}</span>
                                  <span className="text-[10px] font-black text-text-muted shrink-0">
                                    {formatMinutes(p.totalMinutes)} ({pct}%)
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
