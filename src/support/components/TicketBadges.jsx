const STATUS_TONE = {
  Open: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200",
  "In Progress": "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200",
  "Waiting for User": "bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-200",
  Resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200",
  Closed: "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300",
};

const PRIORITY_TONE = {
  Low: "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300",
  Medium: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200",
  High: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200",
  Urgent: "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200",
};

const STATUS_DOT = {
  Open: "bg-sky-500",
  "In Progress": "bg-amber-500",
  "Waiting for User": "bg-violet-500",
  Resolved: "bg-emerald-500",
  Closed: "bg-gray-400",
};

export function TicketStatusBadge({ value, compact = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"
      } ${STATUS_TONE[value] || STATUS_TONE.Open}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[value] || STATUS_DOT.Open}`} />
      {value}
    </span>
  );
}

export function TicketPriorityBadge({ value, compact = false }) {
  return (
    <span
      className={`inline-flex rounded-full font-semibold ring-1 ring-inset ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"
      } ${PRIORITY_TONE[value] || PRIORITY_TONE.Medium}`}
    >
      {value}
    </span>
  );
}

export function RequesterTypeBadge({ value }) {
  const brand = value === "brand";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
        brand
          ? "bg-leaf-50 text-leaf-800 ring-leaf-200 dark:bg-leaf-950/40 dark:text-leaf-200"
          : "bg-indigo-50 text-indigo-800 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200"
      }`}
    >
      {brand ? "Brand" : "Customer"}
    </span>
  );
}
