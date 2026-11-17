import { useEffect, useMemo, useState } from "react";
import { inr } from "../../data";
import { Surface } from "../../ui";

function niceCeiling(value) {
  if (value <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  const n = value / exp;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * exp;
}

function moneyAxis(maxValue, targetTicks = 5) {
  const raw = Math.max(maxValue, 1);
  const rough = raw / Math.max(targetTicks - 1, 1);
  const exp = 10 ** Math.floor(Math.log10(rough));
  const n = rough / exp;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * exp;
  const ceiling = Math.ceil(raw / step) * step;
  const ticks = [];
  for (let value = 0; value <= ceiling + step / 1000; value += step) ticks.push(Math.round(value));
  return { max: ceiling || step, ticks };
}

function formatAxisMoney(value) {
  if (value >= 100000) {
    const lakhs = value / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `₹${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
  }
  return `₹${value}`;
}

function smoothLine(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function SalesTrendChart({ series }) {
  const visible = useMemo(() => {
    if (!series.length) return [];
    if (series.length <= 14) return series;
    return series.slice(series.length - 14);
  }, [series]);

  const [activeDate, setActiveDate] = useState(null);
  useEffect(() => {
    setActiveDate(visible[visible.length - 1]?.date || null);
  }, [visible]);

  const active = visible.find((day) => day.date === activeDate) || visible[visible.length - 1] || null;
  const peakSales = Math.max(...visible.map((day) => day.sales), 1);
  const salesAxis = moneyAxis(peakSales * 1.08, 5);
  const salesMax = salesAxis.max;
  const ordersMax = niceCeiling(Math.max(...visible.map((day) => day.orderCount), 1));

  const width = 640;
  const height = 180;
  const pad = { top: 14, right: 14, bottom: 28, left: 42 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const gap = plotW / Math.max(visible.length, 1);
  const barW = Math.min(22, Math.max(8, gap * 0.38));

  const points = visible.map((day, index) => {
    const x = pad.left + gap * index + gap / 2;
    const salesRatio = day.sales / salesMax;
    const salesH = salesRatio * plotH;
    const ordersH = (day.orderCount / ordersMax) * plotH * 0.88;
    return {
      day,
      x,
      barX: x - barW / 2,
      barY: pad.top + plotH - Math.max(day.sales > 0 ? 5 : 2, salesH),
      barH: Math.max(day.sales > 0 ? 5 : 2, salesH),
      lineY: pad.top + plotH - ordersH,
      fill: day.sales <= 0 ? "#E2E8F0" : salesRatio >= 0.75 ? "#001E55" : salesRatio >= 0.4 ? "#EE8802" : "#FFF4E5",
    };
  });

  const linePath = smoothLine(points.map((point) => ({ x: point.x, y: point.lineY })));
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${pad.top + plotH} L ${points[0].x} ${pad.top + plotH} Z`
    : "";

  return (
    <Surface
      title="Sales trend"
      action={
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-leaf-500" />
            Sales
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Orders
          </span>
        </div>
      }
    >
      <div className="px-3.5 pt-2 pb-3">
        {active ? (
          <p className="mb-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{active.date}</span>
            <span className="mx-1.5 text-gray-300">·</span>
            {inr(active.sales)}
            <span className="mx-1.5 text-gray-300">·</span>
            {active.orderCount} orders
          </p>
        ) : null}
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Date-wise sales and orders">
          <defs>
            <linearGradient id="reportOrdersArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {salesAxis.ticks.map((tick) => {
            const y = pad.top + plotH - (tick / salesMax) * plotH;
            return (
              <g key={tick}>
                <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={pad.left - 6} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize="9">
                  {formatAxisMoney(tick)}
                </text>
              </g>
            );
          })}
          {areaPath ? <path d={areaPath} fill="url(#reportOrdersArea)" /> : null}
          {linePath ? <path d={linePath} fill="none" stroke="#34d399" strokeWidth="2" /> : null}
          {points.map((point) => (
            <g key={point.day.date}>
              <rect
                x={point.barX}
                y={point.barY}
                width={barW}
                height={point.barH}
                rx="4"
                fill={point.fill}
                className="cursor-pointer"
                onClick={() => setActiveDate(point.day.date)}
              />
              <circle cx={point.x} cy={point.lineY} r="2.5" fill="#34d399" />
              {(visible.length <= 10 || points.indexOf(point) % 2 === 0) && (
                <text x={point.x} y={height - 8} textAnchor="middle" className="fill-gray-400" fontSize="9">
                  {point.day.date.replace(/ 2026$/, "").replace(/ /, "\u00a0")}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </Surface>
  );
}
