import { Box, CheckCircle2, Package, PackageCheck, Truck, Warehouse } from "lucide-react";
import { SUMMARY_CARDS } from "../constants";

const ICONS = {
  total: Box,
  new: Package,
  processing: Warehouse,
  ready: PackageCheck,
  transit: Truck,
  delivered: CheckCircle2,
};

export function OrderSummaryCards({ counts, total, active, onSelect }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
      {SUMMARY_CARDS.map((card) => {
        const Icon = ICONS[card.icon] || Box;
        const value = counts[card.id] ?? 0;
        const selected = active === card.id;
        const pct = total ? Math.round((value / total) * 100) : 0;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={`rounded-2xl border px-3 py-3 text-left transition ${
              selected
                ? "border-pink-500 bg-pink-500 text-white shadow-sm shadow-pink-500/25"
                : "border-gray-200/80 bg-white hover:border-pink-200 dark:border-gray-700 dark:bg-gray-800"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[11px] font-semibold tracking-wide uppercase ${selected ? "text-white/80" : "text-gray-400"}`}>
                {card.label}
              </p>
              <Icon className={`h-4 w-4 shrink-0 ${selected ? "text-white/90" : "text-pink-500"}`} />
            </div>
            <p className={`mt-2 text-xl font-semibold tabular-nums ${selected ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {value}
            </p>
            <p className={`mt-0.5 text-[11px] ${selected ? "text-white/75" : "text-gray-400"}`}>
              {card.id === "all" ? "All brands" : `${pct}% of filtered`}
            </p>
          </button>
        );
      })}
    </div>
  );
}
