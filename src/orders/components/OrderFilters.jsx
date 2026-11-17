import {
  ATTENTION_FILTERS,
  COURIERS,
  DATE_PRESETS,
  FULFILLMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SHIPPING_STATUSES,
} from "../constants";

function Select({ label, value, onChange, options }) {
  return (
    <label className="min-w-[140px] flex-1">
      <span className="mb-1 block text-[11px] font-medium text-gray-500">{label}</span>
      <select className="input-field" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function OrderFilters({
  filters,
  brands,
  resultCount,
  onChange,
  onClear,
}) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  const activeChips = [];
  if (filters.brand !== "All") activeChips.push(["brand", `Brand: ${filters.brand}`]);
  if (filters.fulfillment !== "All") activeChips.push(["fulfillment", `Status: ${filters.fulfillment}`]);
  if (filters.payment !== "All") activeChips.push(["payment", `Payment: ${filters.payment}`]);
  if (filters.shipping !== "All") activeChips.push(["shipping", `Shipping: ${filters.shipping}`]);
  if (filters.courier !== "All") activeChips.push(["courier", `Courier: ${filters.courier}`]);
  if (filters.method !== "All") activeChips.push(["method", `Method: ${filters.method}`]);
  if (filters.attention !== "All") activeChips.push(["attention", `Attention: ${filters.attention}`]);
  if (filters.period !== "all") activeChips.push(["period", `Date: ${filters.period}`]);
  if (filters.query.trim()) activeChips.push(["query", `Search: ${filters.query.trim()}`]);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white p-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-medium text-gray-500">Search</span>
          <input
            className="input-field"
            value={filters.query}
            onChange={(event) => set("query")(event.target.value)}
            placeholder="Order ID, customer, phone, product, AWB"
          />
        </label>
        <Select
          label="Brand"
          value={filters.brand}
          onChange={set("brand")}
          options={[{ value: "All", label: "All brands" }, ...brands.map((brand) => ({ value: brand.name, label: brand.name }))]}
        />
        <Select
          label="Order status"
          value={filters.fulfillment}
          onChange={set("fulfillment")}
          options={[{ value: "All", label: "All" }, ...FULFILLMENT_STATUSES.map((status) => ({ value: status, label: status }))]}
        />
        <Select
          label="Payment"
          value={filters.payment}
          onChange={set("payment")}
          options={[{ value: "All", label: "All" }, ...PAYMENT_STATUSES.map((status) => ({ value: status, label: status }))]}
        />
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
        <Select
          label="Shipping"
          value={filters.shipping}
          onChange={set("shipping")}
          options={[{ value: "All", label: "All" }, ...SHIPPING_STATUSES.map((status) => ({ value: status, label: status }))]}
        />
        <Select
          label="Courier"
          value={filters.courier}
          onChange={set("courier")}
          options={[{ value: "All", label: "All" }, ...COURIERS.map((name) => ({ value: name, label: name }))]}
        />
        <Select
          label="Payment method"
          value={filters.method}
          onChange={set("method")}
          options={[{ value: "All", label: "All" }, ...PAYMENT_METHODS.map((name) => ({ value: name, label: name }))]}
        />
        <Select
          label="Date range"
          value={filters.period}
          onChange={set("period")}
          options={DATE_PRESETS.map((item) => ({ value: item.id, label: item.label }))}
        />
        <Select
          label="Attention"
          value={filters.attention}
          onChange={set("attention")}
          options={ATTENTION_FILTERS.map((item) => ({ value: item.id, label: item.label }))}
        />
        <Select
          label="Sort"
          value={filters.sort}
          onChange={set("sort")}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "attention", label: "Needs attention first" },
            { value: "value-high", label: "Value high → low" },
            { value: "value-low", label: "Value low → high" },
          ]}
        />
      </div>

      {filters.period === "custom" ? (
        <div className="flex flex-wrap gap-2">
          <label>
            <span className="mb-1 block text-[11px] font-medium text-gray-500">From</span>
            <input className="input-field" type="date" value={filters.customFrom} onChange={(event) => set("customFrom")(event.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-[11px] font-medium text-gray-500">To</span>
            <input className="input-field" type="date" value={filters.customTo} onChange={(event) => set("customTo")(event.target.value)} />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="rounded-lg bg-leaf-50 px-2 py-1 text-[11px] font-semibold text-leaf-700 dark:bg-leaf-950/40 dark:text-leaf-200"
              onClick={() =>
                onChange({
                  ...filters,
                  [key]: key === "query" ? "" : key === "period" ? "all" : "All",
                })
              }
            >
              {label} ×
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{resultCount}</span> orders
          </p>
          <button type="button" className="text-xs font-semibold text-leaf-700" onClick={onClear}>
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  );
}
