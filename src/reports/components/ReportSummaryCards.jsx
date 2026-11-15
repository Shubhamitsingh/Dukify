import { inr } from "../../data";

const CARDS = [
  { key: "totalBrands", label: "Total Brands", tone: "slate", money: false },
  { key: "totalProducts", label: "Total Products", tone: "pink", money: false },
  { key: "totalOrders", label: "Total Orders", tone: "sky", money: false },
  { key: "paidOrders", label: "Paid Orders", tone: "emerald", money: false, note: "Captured / Paid only" },
  { key: "grossSales", label: "Gross Sales", tone: "amber", money: true, note: "Excludes failed, cancelled, refunded" },
  { key: "refunds", label: "Refunds", tone: "rose", money: true, note: "Shown separately" },
];

const DOT = {
  slate: "bg-slate-400",
  pink: "bg-pink-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

export function ReportSummaryCards({ summary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[card.tone]}`} />
            <p className="text-[11px] font-semibold tracking-[0.04em] text-gray-500 uppercase">{card.label}</p>
          </div>
          <p className="mt-3 text-[1.35rem] font-semibold tracking-tight tabular-nums text-gray-900 dark:text-white">
            {card.money ? inr(summary[card.key] || 0) : summary[card.key] ?? 0}
          </p>
          {card.note ? <p className="mt-1 text-[11px] leading-4 text-gray-400">{card.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
