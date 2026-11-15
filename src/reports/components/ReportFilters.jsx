import { REPORT_PERIODS } from "../model";

export function ReportFilters({ filters, brands, orderCount, onChange, onReset }) {
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const dirty =
    filters.period !== "all" ||
    filters.brand !== "All" ||
    Boolean(filters.customFrom) ||
    Boolean(filters.customTo);

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Date range</span>
          <select className="input-field" value={filters.period} onChange={set("period")}>
            {REPORT_PERIODS.map((period) => (
              <option key={period.id} value={period.id}>
                {period.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Brand</span>
          <select className="input-field" value={filters.brand} onChange={set("brand")}>
            <option value="All">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        {filters.period === "custom" ? (
          <>
            <label>
              <span className="mb-1 block text-[11px] font-medium text-gray-500">From</span>
              <input type="date" className="input-field" value={filters.customFrom} onChange={set("customFrom")} />
            </label>
            <label>
              <span className="mb-1 block text-[11px] font-medium text-gray-500">To</span>
              <input type="date" className="input-field" value={filters.customTo} onChange={set("customTo")} />
            </label>
          </>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{orderCount}</span> orders in range
        </p>
        <button
          type="button"
          className="text-xs font-semibold text-pink-700 hover:text-pink-800 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!dirty}
          onClick={onReset}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
