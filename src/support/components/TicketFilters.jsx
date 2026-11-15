import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../model";

export function TicketFilters({ filters, agents, categories, resultCount, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const dirty =
    filters.query ||
    filters.type !== "All" ||
    filters.status !== "All" ||
    filters.priority !== "All" ||
    filters.category !== "All" ||
    filters.agent !== "All" ||
    filters.dateFrom ||
    filters.dateTo;

  const categoryNames = [...new Set((categories || []).map((row) => row.name))];
  const activeChips = [
    filters.status !== "All" ? ["status", filters.status] : null,
    filters.priority !== "All" ? ["priority", filters.priority] : null,
    filters.agent !== "All" ? ["agent", filters.agent === "Unassigned" ? "Unassigned" : agents.find((a) => a.id === filters.agent)?.name || "Agent"] : null,
    filters.category !== "All" ? ["category", filters.category] : null,
    filters.type !== "All" ? ["type", filters.type === "brand" ? "Brand" : "Customer"] : null,
  ].filter(Boolean);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field !rounded-full pl-9"
            value={filters.query}
            onChange={set("query")}
            placeholder="Search ticket ID, brand, customer, subject…"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="hidden text-xs text-gray-500 sm:block">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{resultCount}</span> in view
          </p>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${
              open || dirty
                ? "border-pink-300 bg-pink-50 text-pink-800 dark:border-pink-800 dark:bg-pink-950/30 dark:text-pink-200"
                : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900"
            }`}
            onClick={() => setOpen((value) => !value)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {dirty ? <span className="rounded-full bg-pink-500 px-1.5 text-[10px] text-white">{activeChips.length}</span> : null}
          </button>
          {dirty ? (
            <button type="button" className="inline-flex items-center gap-1 rounded-full px-2 py-2 text-xs font-semibold text-pink-700" onClick={onClear}>
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {activeChips.length ? (
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200"
              onClick={() =>
                onChange({
                  ...filters,
                  [key]: key === "type" || key === "status" || key === "priority" || key === "category" || key === "agent" ? "All" : filters[key],
                })
              }
            >
              {label}
              <X className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="grid gap-2 rounded-2xl border border-dashed border-pink-200/80 bg-pink-50/40 p-3 sm:grid-cols-2 xl:grid-cols-4 dark:border-pink-900/50 dark:bg-pink-950/10">
          <select className="input-field" value={filters.type} onChange={set("type")}>
            <option value="All">All requester types</option>
            <option value="brand">Brand</option>
            <option value="customer">Customer</option>
          </select>
          <select className="input-field" value={filters.status} onChange={set("status")}>
            <option value="All">All statuses</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select className="input-field" value={filters.priority} onChange={set("priority")}>
            <option value="All">All priorities</option>
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <select className="input-field" value={filters.category} onChange={set("category")}>
            <option value="All">All categories</option>
            {categoryNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select className="input-field" value={filters.agent} onChange={set("agent")}>
            <option value="All">All agents</option>
            <option value="Unassigned">Unassigned</option>
            {(agents || []).map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          <input type="date" className="input-field" value={filters.dateFrom} onChange={set("dateFrom")} title="Created from" />
          <input type="date" className="input-field" value={filters.dateTo} onChange={set("dateTo")} title="Created to" />
        </div>
      ) : null}
    </div>
  );
}
