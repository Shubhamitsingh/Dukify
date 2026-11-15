import { Headphones, Store, UserRound } from "lucide-react";

const TABS = [
  { id: "all", label: "Inbox", icon: Headphones },
  { id: "brand", label: "Brand desk", icon: Store },
  { id: "customer", label: "Customer desk", icon: UserRound },
];

export function TicketTabs({ active, onChange, counts = {} }) {
  return (
    <div className="flex w-full gap-1 overflow-x-auto pb-0.5">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const selected = active === tab.id;
        const count = counts[tab.id] ?? 0;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
              selected
                ? "border-pink-500 bg-pink-500 text-white shadow-sm shadow-pink-500/25"
                : "border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:text-pink-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
