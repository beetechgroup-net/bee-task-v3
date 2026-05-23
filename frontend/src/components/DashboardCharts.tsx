import React, { useRef, useState } from "react";

export const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
export const CHART_COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899"];

export interface BarDataPoint {
  year: number;
  month: number;
  day: number | null;
  finishedTasksCount: number;
  totalMinutesWorked: number;
}

export interface ProjectSlice {
  projectName: string;
  totalMinutes: number;
}

export function chartFormatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getPeriodLabel(s: BarDataPoint, groupedBy: "DAY" | "MONTH"): string {
  if (groupedBy === "DAY") {
    return `${String(s.day).padStart(2, "0")}/${String(s.month).padStart(2, "0")}`;
  }
  return `${MONTH_NAMES[s.month - 1]}/${String(s.year).slice(2)}`;
}

export interface TooltipState { x: number; y: number; content: string }

export function ChartTooltip({ tooltip }: { tooltip: TooltipState }) {
  const above = tooltip.y > 40;
  return (
    <div
      className="absolute pointer-events-none z-20 bg-surface border border-border-soft rounded-lg px-2 py-1 text-xs font-bold text-text-main shadow-lg whitespace-nowrap"
      style={{
        left: tooltip.x,
        top: above ? tooltip.y - 34 : tooltip.y + 8,
        transform: "translateX(-50%)",
      }}
    >
      {tooltip.content}
    </div>
  );
}

export function BarChart({
  data,
  valueKey,
  color,
  groupedBy,
  formatValue,
}: {
  data: BarDataPoint[];
  valueKey: "finishedTasksCount" | "totalMinutesWorked";
  color: string;
  groupedBy: "DAY" | "MONTH";
  formatValue: (v: number) => string;
}) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent, content: string) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, content });
  };

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
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartW} ${barAreaH + 18}`}
        className="w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        {data.map((d, i) => {
          const val = d[valueKey] as number;
          const barH = maxVal > 0 ? Math.max(val > 0 ? 2 : 0, Math.round((val / maxVal) * barAreaH)) : 0;
          const x = i * (barW + gap);
          const y = barAreaH - barH;
          const label = showLabel(i) ? getPeriodLabel(d, groupedBy) : "";

          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={barH} rx={2}
                fill={color}
                opacity={val === 0 ? 0.12 : 0.85}
                className="cursor-pointer transition-opacity hover:opacity-100"
                onMouseMove={(e) => handleMouseMove(e, `${getPeriodLabel(d, groupedBy)}: ${formatValue(val)}`)}
              />
              {val === 0 && (
                <rect
                  x={x} y={0} width={barW} height={barAreaH}
                  fill="transparent"
                  onMouseMove={(e) => handleMouseMove(e, `${getPeriodLabel(d, groupedBy)}: ${formatValue(val)}`)}
                />
              )}
              {label && (
                <text x={x + barW / 2} y={barAreaH + 12} textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" opacity="0.45">
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {tooltip && <ChartTooltip tooltip={tooltip} />}
    </div>
  );
}

export function ProjectMiniPieChart({ data }: { data: ProjectSlice[] }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
    const pct = (fraction * 100).toFixed(0);
    const result = { path, color: CHART_COLORS[i % CHART_COLORS.length], label: `${d.projectName}: ${chartFormatMinutes(d.totalMinutes)} (${pct}%)` };
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
        viewBox="0 0 100 100"
        className="w-full h-full"
        onMouseLeave={() => setTooltip(null)}
      >
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            stroke="var(--color-surface,#fff)"
            strokeWidth="1.5"
            className="cursor-pointer transition-opacity hover:opacity-90"
            onMouseMove={(e) => handleMouseMove(e, s.label)}
          />
        ))}
      </svg>
      {tooltip && <ChartTooltip tooltip={tooltip} />}
    </div>
  );
}
