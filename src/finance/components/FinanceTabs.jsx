import { FINANCE_TABS } from "../model";

export function FinanceTabs({ active, onChange }) {
  return (
    <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-gray-200/80 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
      {FINANCE_TABS.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              selected
                ? "bg-leaf-500 text-white shadow-sm shadow-leaf-500/20"
                : "text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
