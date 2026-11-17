import { TX_TYPES } from "../model";

export function FinanceFilters({ filters, brands, onChange, resultCount, onClear }) {
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const active =
    filters.query ||
    filters.brand !== "All" ||
    filters.type !== "All" ||
    filters.status !== "All" ||
    filters.period !== "all";

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
        <label className="md:col-span-2 xl:col-span-2">
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Search</span>
          <input
            className="input-field"
            value={filters.query}
            onChange={set("query")}
            placeholder="ID, brand, order, reference"
          />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Brand</span>
          <select className="input-field" value={filters.brand} onChange={set("brand")}>
            <option value="All">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Type</span>
          <select className="input-field" value={filters.type} onChange={set("type")}>
            {TX_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Status</span>
          <select className="input-field" value={filters.status} onChange={set("status")}>
            {["All", "Captured", "Pending", "Failed", "Refunded", "Posted", "Paid", "Approved", "On hold"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Date</span>
          <select className="input-field" value={filters.period} onChange={set("period")}>
            <option value="all">All dates</option>
            <option value="month">Recent months</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{resultCount}</span> transactions
        </p>
        {active ? (
          <button type="button" className="text-xs font-semibold text-leaf-700 hover:text-leaf-800" onClick={onClear}>
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
