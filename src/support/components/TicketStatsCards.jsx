import { AlertTriangle, CheckCircle2, CircleDot, Clock3, Inbox, Loader2 } from "lucide-react";

/**
 * Compact queue meter — clickable status filters.
 * Needed: yes, but as a filter strip — not a heavy “dashboard widget”.
 */
const METRICS = [
  { key: "all", label: "All", status: "All", icon: Inbox, note: "Total desk" },
  { key: "open", label: "Open", status: "Open", icon: CircleDot, note: "Needs pickup" },
  { key: "inProgress", label: "In progress", status: "In Progress", icon: Loader2, note: "Being worked" },
  { key: "waiting", label: "Waiting", status: "Waiting for User", icon: Clock3, note: "User reply" },
  { key: "resolved", label: "Resolved", status: "Resolved", icon: CheckCircle2, note: "Done" },
];

export function TicketStatsCards({ stats, activeStatus = "All", onStatusClick }) {
  const total = stats.total || 0;
  const queue = (stats.open || 0) + (stats.inProgress || 0) + (stats.waiting || 0);
  const overdue = stats.overdue || 0;
  const overdueSelected = activeStatus === "Overdue";
  const values = {
    all: total,
    open: stats.open || 0,
    inProgress: stats.inProgress || 0,
    waiting: stats.waiting || 0,
    resolved: stats.resolved || 0,
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2 px-0.5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-sky-700 uppercase dark:text-sky-300">Queue</p>
          <p className="mt-0.5 text-xs text-gray-500">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{queue}</span> active · tap a status to filter
          </p>
        </div>
        <button
          type="button"
          onClick={() => onStatusClick?.(overdueSelected ? "all" : "overdue")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
            overdueSelected
              ? "bg-rose-600 text-white shadow-sm shadow-rose-600/20"
              : overdue > 0
                ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {overdue} overdue SLA
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {METRICS.map((item) => {
          const Icon = item.icon;
          const value = values[item.key];
          const selected = activeStatus === item.status || (item.key === "all" && (activeStatus === "All" || !activeStatus));
          const share = total ? Math.round((value / total) * 100) : 0;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onStatusClick?.(item.key)}
              className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-sky-500 bg-sky-600 text-white shadow-md shadow-sky-600/25"
                  : "border-sky-100 bg-white hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-sky-900/50 dark:bg-gray-900 dark:hover:border-sky-700"
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-1 ${selected ? "bg-white/30" : "bg-sky-100 dark:bg-sky-950/40"}`}
              >
                <span
                  className={`block h-full ${selected ? "bg-white" : "bg-sky-500"}`}
                  style={{ width: `${item.key === "all" ? 100 : share}%` }}
                />
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-[10px] font-semibold tracking-wide uppercase ${selected ? "text-sky-100" : "text-gray-500"}`}>
                    {item.label}
                  </p>
                  <p className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${selected ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {value}
                  </p>
                  <p className={`mt-1 text-[11px] ${selected ? "text-sky-100/90" : "text-gray-400"}`}>{item.note}</p>
                </div>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${
                    selected ? "bg-white/15 text-white" : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
