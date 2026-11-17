import { inr } from "../../data";

export function SectionMetrics({ title, items }) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
      {title ? <p className="mb-2.5 text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase">{title}</p> : null}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="text-[11px] font-medium text-gray-500">{item.label}</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-gray-900 dark:text-white">
              {item.money ? inr(item.value) : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
