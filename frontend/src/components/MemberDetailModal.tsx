import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { orgDashboardService, type MemberDetailData, type MonthlyStats } from "../services/orgDashboardService";

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const BAR_COLOR = "#7C3AED";
const BAR_COLOR_2 = "#06B6D4";

function Avatar({ name, photo }: { name: string; photo?: string | null }) {
  if (photo) {
    return <img src={photo} alt={name} className="w-20 h-20 rounded-3xl object-cover" />;
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-20 h-20 rounded-3xl bg-brand/10 text-brand font-black text-2xl flex items-center justify-center">
      {initials}
    </div>
  );
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function BarChart({
  data,
  valueKey,
  color,
  formatValue,
}: {
  data: MonthlyStats[];
  valueKey: "finishedTasksCount" | "totalMinutesWorked";
  color: string;
  formatValue: (v: number) => string;
}) {
  const values = data.map((d) => d[valueKey] as number);
  const maxVal = Math.max(...values, 1);

  const chartW = 320;
  const chartH = 120;
  const barAreaH = 90;
  const barCount = data.length;
  const gap = 6;
  const barW = barCount > 0 ? Math.floor((chartW - gap * (barCount - 1)) / barCount) : 30;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full">
      {data.map((d, i) => {
        const val = d[valueKey] as number;
        const barH = maxVal > 0 ? Math.round((val / maxVal) * barAreaH) : 0;
        const x = i * (barW + gap);
        const y = barAreaH - barH;
        const label = MONTH_NAMES[(d.month - 1) % 12];

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={color}
              opacity={val === 0 ? 0.15 : 0.85}
            />
            {val > 0 && (
              <text
                x={x + barW / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="currentColor"
                opacity="0.6"
              >
                {formatValue(val)}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={barAreaH + 14}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="currentColor"
              opacity="0.5"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface MemberDetailModalProps {
  memberId: number | null;
  orgId: number;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ memberId, orgId, onClose }) => {
  const [data, setData] = useState<MemberDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberId === null) {
      setData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setData(null);
    orgDashboardService
      .getMemberStats(orgId, memberId)
      .then(setData)
      .catch(() => setError("Falha ao carregar os dados do membro."))
      .finally(() => setIsLoading(false));
  }, [memberId, orgId]);

  return (
    <AnimatePresence>
      {memberId !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-lg bg-surface border border-border-soft rounded-[2.5rem] shadow-2xl overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="animate-spin text-brand mb-3" size={36} />
                  <p className="text-text-muted font-bold text-sm">Carregando dados...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle size={36} className="text-rose-500 mb-3" />
                  <p className="text-text-muted font-bold text-sm">{error}</p>
                </div>
              ) : data ? (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex items-center gap-5">
                    <Avatar name={data.userName} photo={data.userPhoto} />
                    <div>
                      <h2 className="text-2xl font-black text-text-main">{data.userName}</h2>
                      <div className="flex items-center gap-1.5 mt-1 text-text-muted text-sm font-medium">
                        <Mail size={14} className="text-brand" />
                        {data.userEmail}
                      </div>
                    </div>
                  </div>

                  {/* Summary chips */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-app-bg border border-border-soft rounded-2xl p-4 flex flex-col items-center text-center">
                      <CheckCircle2 size={16} className="text-accent mb-1" />
                      <div className="text-xl font-black text-text-main">
                        {data.monthlyStats.reduce((s, m) => s + m.finishedTasksCount, 0)}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-0.5">
                        Concluídas (6m)
                      </div>
                    </div>
                    <div className="bg-app-bg border border-border-soft rounded-2xl p-4 flex flex-col items-center text-center">
                      <Clock size={16} className="text-brand mb-1" />
                      <div className="text-xl font-black text-text-main">
                        {formatMinutes(data.monthlyStats.reduce((s, m) => s + m.totalMinutesWorked, 0))}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-0.5">
                        Trabalhado (6m)
                      </div>
                    </div>
                  </div>

                  {/* Chart: finished tasks per month */}
                  <div className="bg-app-bg border border-border-soft rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 size={16} className="text-accent" />
                      <span className="text-sm font-black text-text-main">Tarefas Concluídas por Mês</span>
                    </div>
                    <BarChart
                      data={data.monthlyStats}
                      valueKey="finishedTasksCount"
                      color={BAR_COLOR}
                      formatValue={(v) => String(v)}
                    />
                  </div>

                  {/* Chart: minutes worked per month */}
                  <div className="bg-app-bg border border-border-soft rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={16} className="text-brand" />
                      <span className="text-sm font-black text-text-main">Tempo Trabalhado por Mês</span>
                    </div>
                    <BarChart
                      data={data.monthlyStats}
                      valueKey="totalMinutesWorked"
                      color={BAR_COLOR_2}
                      formatValue={formatMinutes}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
