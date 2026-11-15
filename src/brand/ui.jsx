import { useEffect, useMemo, useState } from "react";
import { RANGE_OPTIONS, inr } from "./lib/metrics";

export function PageHead({ title, description, action, eyebrow = "Brand partner" }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-pink-600 uppercase dark:text-pink-300">{eyebrow}</p>
        ) : null}
        <h1 className="text-[1.25rem] font-semibold tracking-tight text-gray-900 sm:text-[1.35rem] md:text-xl dark:text-white">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-5 text-gray-500 dark:text-gray-400">{description}</p> : null}
      </div>
      {action ? <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{action}</div> : null}
    </div>
  );
}

const toneMap = {
  emerald: {
    dot: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    wash: "",
  },
  sky: {
    dot: "bg-sky-500",
    icon: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    wash: "",
  },
  amber: {
    dot: "bg-amber-500",
    icon: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    wash: "",
  },
  rose: {
    dot: "bg-rose-500",
    icon: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    wash: "",
  },
  pink: {
    dot: "bg-pink-500",
    icon: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
    wash: "",
  },
  slate: {
    dot: "bg-gray-300",
    icon: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    wash: "",
  },
  violet: {
    dot: "bg-violet-500",
    icon: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    wash: "",
  },
  hero: {
    dot: "bg-white/80",
    icon: "bg-white/15 text-white",
    wash: "border-transparent bg-gradient-to-br from-rose-600 via-pink-500 to-fuchsia-500 text-white shadow-md shadow-pink-500/20",
  },
};

export function Kpi({ label, value, note, tone = "slate", icon, trend, onClick }) {
  const palette = toneMap[tone] || toneMap.slate;
  const hero = tone === "hero";
  const Tag = onClick ? "button" : "article";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-2xl border px-2.5 py-2.5 text-left transition sm:px-3 sm:py-3 ${
        hero
          ? palette.wash
          : "border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800"
      } ${onClick ? "hover:-translate-y-0.5 hover:shadow-md" : ""}`}
    >
      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${palette.dot}`} />
            <p className={`truncate text-[10px] font-medium sm:text-[11px] ${hero ? "text-white/85" : "text-gray-500 dark:text-gray-400"}`}>{label}</p>
          </div>
          <p className={`mt-1 text-base font-semibold tracking-tight tabular-nums sm:text-lg ${hero ? "text-white" : "text-gray-900 dark:text-white"}`}>
            {value}
          </p>
        </div>
        {icon ? <span className={`hidden h-8 w-8 shrink-0 place-items-center rounded-xl sm:grid ${palette.icon}`}>{icon}</span> : null}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
        {trend ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px] ${
              trend.up
                ? hero
                  ? "bg-white/20 text-white"
                  : "bg-emerald-50 text-emerald-700"
                : hero
                  ? "bg-black/15 text-white"
                  : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend.label}
          </span>
        ) : null}
        {note ? <p className={`text-[10px] leading-4 sm:text-[11px] ${hero ? "text-white/75" : "text-gray-500"}`}>{note}</p> : null}
      </div>
    </Tag>
  );
}

const pills = {
  Active: "bg-emerald-50 text-emerald-800",
  Live: "bg-emerald-50 text-emerald-800",
  Approved: "bg-emerald-50 text-emerald-800",
  Paid: "bg-emerald-50 text-emerald-800",
  Delivered: "bg-emerald-50 text-emerald-800",
  Resolved: "bg-emerald-50 text-emerald-800",
  Verified: "bg-emerald-50 text-emerald-800",
  "In stock": "bg-emerald-50 text-emerald-800",
  Shipped: "bg-sky-50 text-sky-800",
  Confirmed: "bg-sky-50 text-sky-800",
  Packed: "bg-sky-50 text-sky-800",
  Processing: "bg-amber-50 text-amber-800",
  Pending: "bg-amber-50 text-amber-800",
  "Pending approval": "bg-amber-50 text-amber-800",
  Scheduled: "bg-amber-50 text-amber-800",
  Open: "bg-amber-50 text-amber-800",
  Low: "bg-amber-50 text-amber-800",
  Medium: "bg-amber-50 text-amber-800",
  "In review": "bg-amber-50 text-amber-800",
  New: "bg-pink-50 text-pink-800",
  Ended: "bg-gray-100 text-gray-700",
  Draft: "bg-gray-100 text-gray-700",
  High: "bg-rose-50 text-rose-800",
  Cancelled: "bg-rose-50 text-rose-800",
  Refunded: "bg-rose-50 text-rose-800",
  Failed: "bg-rose-50 text-rose-800",
  "Out of stock": "bg-rose-50 text-rose-800",
  "Return requested": "bg-rose-50 text-rose-800",
};

export function Status({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${pills[value] || "bg-gray-100 text-gray-700"}`}>{value}</span>;
}

export function Surface({ title, action, children, className = "", padded = false }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5 dark:border-gray-700">
          <h2 className="min-w-0 text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          {action}
        </div>
      ) : null}
      {padded ? <div className="p-3 sm:p-4">{children}</div> : children}
    </section>
  );
}

export function DateRange({ value, custom, onChange, onCustom }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="toolbar-field" value={value} onChange={(event) => onChange(event.target.value)} aria-label="Date range">
        {RANGE_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {value === "custom" ? (
        <>
          <input className="toolbar-field" type="date" value={custom.start} onChange={(event) => onCustom({ ...custom, start: event.target.value })} />
          <input className="toolbar-field" type="date" value={custom.end} onChange={(event) => onCustom({ ...custom, end: event.target.value })} />
        </>
      ) : null}
    </div>
  );
}

export function Swatch({ color, label }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[11px] font-semibold text-white" style={{ background: color }}>
      {label?.slice(0, 1)}
    </span>
  );
}

export function Empty({ title, body }) {
  return (
    <div className="px-4 py-12 text-center">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{body}</p>
    </div>
  );
}

export function Modal({ title, body, confirmLabel = "Confirm", onConfirm, onClose, danger = false }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-5 text-gray-500">{body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-soft" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={danger ? "btn-primary bg-rose-600" : "btn-primary"} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Drawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button type="button" className="h-full min-w-0 flex-1" aria-label="Close" onClick={onClose} />
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-4 shadow-xl sm:p-5 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <button type="button" className="btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

export function useTable(rows, pageSize = 8) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    return [...rows].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      const base = typeof left === "number" && typeof right === "number" ? left - right : String(left ?? "").localeCompare(String(right ?? ""));
      return sort.dir === "asc" ? base : -base;
    });
  }, [rows, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pages);
  const slice = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  return {
    slice,
    page: safePage,
    pages,
    total: sorted.length,
    setPage,
    sort,
    toggle: (key) => {
      setSort((current) => ({ key, dir: current.key === key && current.dir === "asc" ? "desc" : "asc" }));
      setPage(1);
    },
  };
}

export function Table({ columns, table }) {
  const primary = columns[0];
  const rest = columns.slice(1);
  return (
    <div>
      <ul className="divide-y divide-gray-100 md:hidden dark:divide-gray-800">
        {table.slice.map((row) => (
          <li key={row.id} className="space-y-2 px-3 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-sm font-medium text-gray-900 dark:text-white">
                {primary.render ? primary.render(row) : row[primary.key]}
              </div>
              {rest.length > 0 && rest[rest.length - 1].key === "view" ? (
                <div className="shrink-0">{rest[rest.length - 1].render?.(row)}</div>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {rest
                .filter((column) => column.key !== "view")
                .map((column) => (
                  <div key={column.key} className="min-w-0">
                    <dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">{column.label}</dt>
                    <dd className="mt-0.5 truncate text-xs text-gray-800 dark:text-gray-100">
                      {column.render ? column.render(row) : row[column.key]}
                    </dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto overscroll-x-contain md:block">
        <table className="w-full min-w-[640px] text-left text-sm md:min-w-[720px]">
          <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:border-gray-700 dark:bg-gray-900/40">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                  {column.sort === false ? (
                    column.label
                  ) : (
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => table.toggle(column.key)}>
                      {column.label}
                      {table.sort.key === column.key ? <span>{table.sort.dir === "asc" ? "↑" : "↓"}</span> : null}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.slice.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3 align-middle text-gray-800 sm:px-4 dark:text-gray-100">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 border-t border-gray-100 px-3 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 dark:border-gray-700">
        <span>
          {table.total} records · page {table.page} of {table.pages}
        </span>
        <div className="flex gap-2">
          <button type="button" className="btn-soft" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)}>
            Previous
          </button>
          <button type="button" className="btn-soft" disabled={table.page >= table.pages} onClick={() => table.setPage(table.page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function LineChart({ series, field = "sales" }) {
  const width = 640;
  const height = 220;
  const pad = 28;
  const max = Math.max(1, ...series.map((row) => row[field]));
  const step = series.length > 1 ? (width - pad * 2) / (series.length - 1) : 0;
  const points = series.map((row, index) => {
    const x = pad + index * step;
    const y = height - pad - (row[field] / max) * (height - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
      <polyline fill="none" stroke="#ec4899" strokeWidth="2.5" points={points.join(" ")} />
      {series.map((row, index) => {
        const [x, y] = points[index].split(",");
        return <circle key={row.date} cx={x} cy={y} r="2.5" fill="#db2777" />;
      })}
    </svg>
  );
}

function niceCeiling(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function moneyAxis(maxValue, tickCount = 5) {
  const max = niceCeiling(Math.max(maxValue, 1));
  const step = max / (tickCount - 1);
  return { max, ticks: Array.from({ length: tickCount }, (_, index) => Math.round(step * index)) };
}

function formatAxisMoney(value) {
  if (value >= 100000) return `${Math.round(value / 1000)}k`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return String(Math.round(value));
}

function smoothLine(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    path += ` Q ${current.x} ${current.y} ${midX} ${(current.y + next.y) / 2}`;
    if (index === points.length - 2) path += ` T ${next.x} ${next.y}`;
  }
  return path;
}

export function PerformanceChart({ series, rangeLabel }) {
  const [activeDate, setActiveDate] = useState(series[series.length - 1]?.date || null);
  const [maxPoints, setMaxPoints] = useState(14);
  useEffect(() => {
    function sync() {
      setMaxPoints(window.matchMedia("(max-width: 639px)").matches ? 7 : window.matchMedia("(max-width: 1023px)").matches ? 10 : 14);
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  const visible = series.length > maxPoints ? series.slice(-maxPoints) : series;
  const peakSales = Math.max(...visible.map((day) => day.sales), 1);
  const salesAxis = moneyAxis(peakSales * 1.08, 7);
  const salesMax = salesAxis.max;
  const yTicks = salesAxis.ticks;
  const ordersMax = niceCeiling(Math.max(...visible.map((day) => day.orders), 1));
  const width = 560;
  const height = 168;
  const pad = { top: 12, right: 12, bottom: 26, left: 40 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const gap = plotW / Math.max(visible.length, 1);
  const barW = Math.min(22, Math.max(9, gap * 0.38));
  const points = visible.map((day, index) => {
    const x = pad.left + gap * index + gap / 2;
    const salesRatio = day.sales / salesMax;
    const salesH = salesRatio * plotH;
    const ordersH = (day.orders / ordersMax) * plotH * 0.88;
    return {
      day,
      x,
      barX: x - barW / 2,
      barY: pad.top + plotH - Math.max(day.sales > 0 ? 6 : 3, salesH),
      barH: Math.max(day.sales > 0 ? 6 : 3, salesH),
      lineY: pad.top + plotH - ordersH,
      fill: day.sales <= 0 ? "#e5e7eb" : salesRatio >= 0.75 ? "#f59e0b" : salesRatio >= 0.4 ? "#fb923c" : "#fdba74",
    };
  });
  const linePath = smoothLine(points.map((point) => ({ x: point.x, y: point.lineY })));
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${pad.top + plotH} L ${points[0].x} ${pad.top + plotH} Z`
    : "";
  const active = visible.find((day) => day.date === activeDate) || visible[visible.length - 1] || null;
  const activePoint = points.find((point) => point.day.date === active?.date) || null;
  const tipW = 100;
  const tipH = 40;
  const tipX = activePoint ? Math.min(Math.max(activePoint.x - tipW / 2, pad.left), width - pad.right - tipW) : 0;
  const tipY = activePoint ? Math.max(2, activePoint.barY - tipH - 8) : 0;

  return (
    <div className="px-3.5 pt-3 pb-2">
      <div className={`flex flex-wrap items-center justify-between gap-2 ${rangeLabel ? "mb-2" : "mb-1.5"}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Performance</h2>
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
              Sales
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#34d399]" />
              Orders
            </span>
          </div>
        </div>
        {rangeLabel ? (
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            {rangeLabel}
          </span>
        ) : null}
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Sales and orders performance">
          <defs>
            <linearGradient id="partnerOrdersArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => {
            const y = pad.top + plotH - (tick / salesMax) * plotH;
            return (
              <g key={tick}>
                <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#eef2f7" strokeDasharray="2 4" strokeWidth="1" />
                <text x={pad.left - 6} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="9">
                  {formatAxisMoney(tick)}
                </text>
              </g>
            );
          })}
          {areaPath ? <path d={areaPath} fill="url(#partnerOrdersArea)" /> : null}
          {linePath ? <path d={linePath} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" /> : null}
          {points.map((point) => {
            const selected = active?.date === point.day.date;
            return (
              <g key={point.day.date}>
                <rect
                  x={point.barX}
                  y={point.barY}
                  width={barW}
                  height={point.barH}
                  rx={barW / 2}
                  ry={barW / 2}
                  fill={point.fill}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveDate(point.day.date)}
                  onClick={() => setActiveDate(point.day.date)}
                />
                <circle
                  cx={point.x}
                  cy={point.lineY}
                  r={selected ? 3.5 : 2.5}
                  fill="#fff"
                  stroke="#34d399"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
                <text
                  x={point.x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight={selected ? 600 : 500}
                  fill={selected ? "#111827" : "#9ca3af"}
                >
                  {(point.day.label || point.day.date).replace(/ 20\d{2}$/, "").slice(0, 6)}
                </text>
                <rect
                  x={point.barX - 4}
                  y={pad.top}
                  width={barW + 8}
                  height={plotH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveDate(point.day.date)}
                  onClick={() => setActiveDate(point.day.date)}
                />
              </g>
            );
          })}
          {active && activePoint ? (
            <g className="pointer-events-none">
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="8" fill="#fff" stroke="#e5e7eb" />
              <text x={tipX + 10} y={tipY + 16} fill="#6b7280" fontSize="9">
                Sales
              </text>
              <text x={tipX + tipW - 10} y={tipY + 16} textAnchor="end" fill="#111827" fontSize="10" fontWeight="600">
                {inr(active.sales)}
              </text>
              <text x={tipX + 10} y={tipY + 30} fill="#6b7280" fontSize="9">
                Orders
              </text>
              <text x={tipX + tipW - 10} y={tipY + 30} textAnchor="end" fill="#111827" fontSize="10" fontWeight="600">
                {active.orders}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}

const orderMixColors = {
  Delivered: "#34d399",
  Packed: "#ec4899",
  Processing: "#f472b6",
  Shipped: "#38bdf8",
  New: "#fbbf24",
  Confirmed: "#818cf8",
  Cancelled: "#a1a1aa",
  "Return requested": "#fb7185",
  Refunded: "#e11d48",
};

function orderMixPct(count, total) {
  if (!total) return "0%";
  const value = (count / total) * 100;
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)}%`;
}

function OrderMixRow({ step, align = "left", total, active, onHover }) {
  const color = orderMixColors[step.status] || "#52525b";
  const selected = active === step.status;
  return (
    <li>
      <button
        type="button"
        onMouseEnter={() => onHover(step.status)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(step.status)}
        onBlur={() => onHover(null)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${
          selected ? "bg-pink-50 ring-1 ring-pink-200 dark:bg-pink-950/30 dark:ring-pink-900/50" : "bg-gray-50 dark:bg-gray-900/50"
        } ${align === "right" ? "flex-row-reverse text-right" : ""}`}
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        <span className="min-w-0 flex-1 truncate text-xs text-gray-600 dark:text-gray-300">{step.status}</span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-900 dark:text-white">{step.count}</span>
        <span className="hidden shrink-0 text-[10px] tabular-nums text-gray-400 sm:inline">{orderMixPct(step.count, total)}</span>
      </button>
    </li>
  );
}

function MixRing({ steps, total, activeStatus, onHover }) {
  const radius = 38;
  const length = 2 * Math.PI * radius;
  let cursor = 0;
  const active = steps.filter((step) => step.count > 0);
  const hovered = active.find((step) => step.status === activeStatus) || null;
  return (
    <div className="relative mx-auto h-[7.25rem] w-[7.25rem] shrink-0" onMouseLeave={() => onHover(null)}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Orders by status">
        <g transform="rotate(-90 50 50)">
          {active.map((step) => {
            const slice = (step.count / Math.max(total, 1)) * length;
            const dash = `${slice} ${length - slice}`;
            const selected = !activeStatus || activeStatus === step.status;
            const node = (
              <circle
                key={step.status}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={orderMixColors[step.status] || "#52525b"}
                strokeWidth={activeStatus === step.status ? 14 : 12}
                strokeDasharray={dash}
                strokeDashoffset={-cursor}
                opacity={selected ? 1 : 0.28}
                className="cursor-pointer transition-[stroke-width,opacity] duration-150"
                style={{ pointerEvents: "stroke" }}
                onMouseEnter={() => onHover(step.status)}
                onFocus={() => onHover(step.status)}
                tabIndex={0}
              />
            );
            cursor += slice;
            return node;
          })}
        </g>
        <text x="50" y="54" textAnchor="middle" fontSize="16" fontWeight="600" fill="#111827" className="pointer-events-none">
          {hovered ? orderMixPct(hovered.count, total) : total}
        </text>
      </svg>
      {hovered ? (
        <div className="pointer-events-none absolute top-[calc(100%+0.35rem)] left-1/2 z-10 w-max max-w-[12rem] -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: orderMixColors[hovered.status] || "#52525b" }} />
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{hovered.status}</p>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            <span className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">{orderMixPct(hovered.count, total)}</span>
            {" · "}
            {hovered.count} of {total} orders
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function OrderMixPanel({ pipeline, total }) {
  const [activeStatus, setActiveStatus] = useState(null);
  const active = pipeline.filter((step) => step.count > 0);
  const right = active.slice(Math.max(0, active.length - 5));
  const left = active.slice(0, Math.max(0, active.length - 5));
  return (
    <div className="flex flex-col items-center gap-3 p-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
      <ul className="hidden min-w-0 flex-col justify-center gap-1.5 sm:flex">
        {left.map((step) => (
          <OrderMixRow key={step.status} step={step} align="right" total={total} active={activeStatus} onHover={setActiveStatus} />
        ))}
      </ul>
      <MixRing steps={pipeline} total={total} activeStatus={activeStatus} onHover={setActiveStatus} />
      <ul className="hidden min-w-0 flex-col justify-center gap-1.5 sm:flex">
        {right.map((step) => (
          <OrderMixRow key={step.status} step={step} align="left" total={total} active={activeStatus} onHover={setActiveStatus} />
        ))}
      </ul>
      <ul className="grid w-full grid-cols-2 gap-1.5 sm:hidden">
        {active.map((step) => (
          <OrderMixRow key={step.status} step={step} align="left" total={total} active={activeStatus} onHover={setActiveStatus} />
        ))}
      </ul>
    </div>
  );
}

export function FilterChip({ active, children, onClick, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
        active
          ? "border-pink-500 bg-pink-50 text-pink-800 dark:bg-pink-950/40 dark:text-pink-200"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      <span>{children}</span>
      {count != null ? <span className="tabular-nums opacity-70">· {count}</span> : null}
    </button>
  );
}

export function SoftButton({ children, onClick, danger = false, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export function DemoNote({ children }) {
  return <p className="mb-4 rounded-xl bg-pink-50 px-3 py-2 text-xs leading-5 text-pink-900 dark:bg-pink-950/30 dark:text-pink-100">{children}</p>;
}
