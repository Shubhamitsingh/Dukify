import { inr } from "../../data";

const CARDS = [
  { key: "totalSales", label: "Booked GMV", note: "≠ cash collected · same as Reports", tone: "sky" },
  { key: "prepaidCollections", label: "Prepaid collections", note: "Captured non-COD", tone: "emerald" },
  { key: "codCollections", label: "COD collections", note: "Courier-confirmed only", tone: "amber" },
  { key: "refunds", label: "Refunds", note: "Completed refunds", tone: "rose" },
  { key: "brandPayables", label: "Brand payables", note: "Open settlements", tone: "violet" },
  { key: "platformExpenses", label: "Platform expenses", note: "Ops ledger", tone: "slate" },
];

const TONES = {
  slate: "bg-slate-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

export function FinanceSummaryCards({ summary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${TONES[card.tone]}`} />
            <p className="text-[11px] font-semibold tracking-[0.04em] text-gray-500 uppercase">{card.label}</p>
          </div>
          <p className="mt-3 text-[1.35rem] font-semibold tracking-tight tabular-nums text-gray-900 dark:text-white">
            {inr(summary[card.key] || 0)}
          </p>
          <p className="mt-1 text-[11px] leading-4 text-gray-400">{card.note}</p>
        </div>
      ))}
    </div>
  );
}
