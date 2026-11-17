export function PageHead({ title, description, action, eyebrow }) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-leaf-600 uppercase dark:text-leaf-300">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[1.35rem] font-semibold tracking-tight text-gray-900 sm:text-xl dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-5 text-gray-500 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

const toneMap = {
  emerald: {
    dot: "bg-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-300",
    wash: "",
  },
  sky: {
    dot: "bg-sky-500",
    icon: "text-sky-600 dark:text-sky-300",
    wash: "",
  },
  amber: {
    dot: "bg-amber-500",
    icon: "text-amber-600 dark:text-amber-300",
    wash: "",
  },
  rose: {
    dot: "bg-rose-500",
    icon: "text-rose-600 dark:text-rose-300",
    wash: "",
  },
  pink: {
    dot: "bg-leaf-500",
    icon: "text-leaf-600 dark:text-leaf-300",
    wash: "",
  },
  slate: {
    dot: "bg-gray-300",
    icon: "text-gray-500 dark:text-gray-300",
    wash: "",
  },
  violet: {
    dot: "bg-violet-500",
    icon: "text-violet-600 dark:text-violet-300",
    wash: "",
  },
  hero: {
    dot: "bg-white/80",
    icon: "text-white",
    wash: "border-transparent bg-gradient-to-br from-leaf-700 via-leaf-500 to-leaf-400 text-white shadow-md shadow-leaf-500/20",
  },
};

export function Kpi({ label, value, note, tone = "slate", icon, trend, onClick }) {
  const palette = toneMap[tone] || toneMap.slate;
  const hero = tone === "hero";
  const Tag = onClick ? "button" : "article";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex h-full min-h-[6.75rem] flex-col rounded-xl border px-2.5 py-2.5 text-left transition sm:min-h-[7.25rem] sm:px-3 sm:py-3 ${
        hero
          ? palette.wash
          : "border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800"
      } ${onClick ? "hover:-translate-y-0.5 hover:shadow-md" : ""}`}
    >
      <div className="flex h-8 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${palette.dot}`} />
          <p className={`truncate text-[10px] font-medium leading-none sm:text-[11px] ${hero ? "text-white/85" : "text-gray-500 dark:text-gray-400"}`}>
            {label}
          </p>
        </div>
        {icon ? (
          <span className={`grid h-8 w-8 shrink-0 place-items-center ${palette.icon}`}>{icon}</span>
        ) : (
          <span className="h-8 w-8 shrink-0" aria-hidden="true" />
        )}
      </div>
      <p className={`mt-2 truncate text-base font-semibold leading-none tracking-tight tabular-nums sm:text-lg ${hero ? "text-white" : "text-gray-900 dark:text-white"}`}>
        {value}
      </p>
      <div className="mt-auto flex min-h-[2.5rem] flex-col justify-end gap-1 pt-2">
        <div className="flex h-[1.25rem] items-center">
          {trend ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none sm:text-[11px] ${
                trend.up
                  ? hero
                    ? "bg-white/20 text-white"
                    : "bg-emerald-50 text-emerald-700"
                  : hero
                    ? "bg-black/15 text-white"
                    : "bg-rose-50 text-rose-700"
              }`}
            >
              {trend.label}
            </span>
          ) : null}
        </div>
        {note ? (
          <p className={`line-clamp-2 min-h-[2rem] text-[10px] leading-4 sm:text-[11px] ${hero ? "text-white/75" : "text-gray-500"}`}>
            {note}
          </p>
        ) : (
          <p className="min-h-[2rem]" aria-hidden="true" />
        )}
      </div>
    </Tag>
  );
}

const pillTone = {
  Active: "bg-emerald-50 text-emerald-800",
  Published: "bg-emerald-50 text-emerald-800",
  Operating: "bg-emerald-50 text-emerald-800",
  Available: "bg-emerald-50 text-emerald-800",
  Verified: "bg-emerald-50 text-emerald-800",
  Captured: "bg-emerald-50 text-emerald-800",
  Delivered: "bg-emerald-50 text-emerald-800",
  Paid: "bg-emerald-50 text-emerald-800",
  Resolved: "bg-emerald-50 text-emerald-800",
  Live: "bg-emerald-50 text-emerald-800",
  Pass: "bg-emerald-50 text-emerald-800",
  High: "bg-rose-50 text-rose-800",
  Medium: "bg-amber-50 text-amber-800",
  NDR: "bg-amber-50 text-amber-800",
  Fail: "bg-rose-50 text-rose-800",
  "Not connected": "bg-gray-100 text-gray-700",
  "Not Connected": "bg-gray-100 text-gray-700",
  Connected: "bg-emerald-50 text-emerald-800",
  Error: "bg-rose-50 text-rose-800",
  Testing: "bg-amber-50 text-amber-800",
  Approved: "bg-sky-50 text-sky-800",
  Received: "bg-sky-50 text-sky-800",
  Shipped: "bg-sky-50 text-sky-800",
  "In transit": "bg-sky-50 text-sky-800",
  Pending: "bg-amber-50 text-amber-800",
  "Pending approval": "bg-amber-50 text-amber-800",
  "COD pending": "bg-amber-50 text-amber-800",
  Inspection: "bg-amber-50 text-amber-800",
  "Ready to ship": "bg-amber-50 text-amber-800",
  Packing: "bg-leaf-50 text-leaf-800",
  Processing: "bg-leaf-50 text-leaf-800",
  New: "bg-indigo-50 text-indigo-800",
  "Ready to Ship": "bg-amber-50 text-amber-800",
  "In Transit": "bg-sky-50 text-sky-800",
  "Out for Delivery": "bg-sky-50 text-sky-800",
  "Label Generated": "bg-amber-50 text-amber-800",
  "Pickup Scheduled": "bg-amber-50 text-amber-800",
  "Picked Up": "bg-sky-50 text-sky-800",
  "Not Assigned": "bg-gray-100 text-gray-700",
  "Delivery Failed": "bg-rose-50 text-rose-800",
  Paid: "bg-emerald-50 text-emerald-800",
  Posted: "bg-slate-100 text-slate-700",
  COD: "bg-amber-50 text-amber-800",
  Confirmed: "bg-indigo-50 text-indigo-800",
  Open: "bg-amber-50 text-amber-800",
  Draft: "bg-gray-100 text-gray-700",
  Hidden: "bg-gray-100 text-gray-700",
  Ended: "bg-gray-100 text-gray-700",
  Cancelled: "bg-gray-100 text-gray-700",
  Suspended: "bg-rose-50 text-rose-800",
  "Temporarily suspended": "bg-rose-50 text-rose-800",
  Failed: "bg-rose-50 text-rose-800",
  "Payment failed": "bg-rose-50 text-rose-800",
  Refunded: "bg-rose-50 text-rose-800",
  Returned: "bg-rose-50 text-rose-700",
  RTO: "bg-rose-50 text-rose-800",
  "On hold": "bg-rose-50 text-rose-800",
  Low: "bg-rose-50 text-rose-800",
};

export function Status({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${pillTone[value] || "bg-gray-100 text-gray-700"}`}>
      {value}
    </span>
  );
}

export function Surface({ title, action, children, className = "", padded = false }) {
  return (
    <section
      className={`rounded-xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800 ${className.includes("overflow-") ? "" : "overflow-hidden"} ${className}`}
    >
      {title ? (
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          {action}
        </div>
      ) : null}
      {padded ? <div className="p-3">{children}</div> : children}
    </section>
  );
}

export function StatPills({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((item) => (
        <span
          key={item.label}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}
        >
          {item.label}
          <span className="tabular-nums">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

export function FilterChip({ active, children, onClick, count, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-leaf-500 bg-leaf-50 text-leaf-800 dark:bg-leaf-950/40 dark:text-leaf-200"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      } ${className}`}
    >
      <span>{children}</span>
      {count != null ? <span className="tabular-nums opacity-70">· {count}</span> : null}
    </button>
  );
}

export function Toolbar({ children, meta }) {
  return (
    <div className="mb-4 flex flex-col gap-2.5 rounded-xl border border-gray-200/80 bg-white/80 p-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800/80 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
      {meta ? <p className="shrink-0 text-xs text-gray-500 sm:ml-auto">{meta}</p> : null}
    </div>
  );
}

export function SoftButton({ children, onClick, danger = false, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function RecordChrome({ title, onClose, eyebrow = "Record", align = "left" }) {
  const centered = align === "center";
  return (
    <div
      className={`relative border-b border-gray-200/80 bg-white px-4 py-3.5 dark:border-gray-800 dark:bg-gray-900 ${
        centered ? "flex flex-col items-center justify-center pr-16 text-center" : "flex items-center justify-between"
      }`}
    >
      <div className={centered ? "min-w-0" : ""}>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">{eyebrow}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
      </div>
      <button
        type="button"
        className={`rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${
          centered ? "absolute top-3.5 right-4" : ""
        }`}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}

export function DrawerShell({ title, onClose, children, footer, eyebrow = "Record" }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20 p-3 sm:p-4">
      <aside className="flex h-full w-full max-w-md flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-[#f8fafc] shadow-2xl dark:border-gray-700 dark:bg-gray-950">
        <RecordChrome title={title} onClose={onClose} eyebrow={eyebrow} />
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>
        {footer ? (
          <div className="border-t border-gray-200/80 bg-white p-3 sm:p-4 dark:border-gray-800 dark:bg-gray-900">{footer}</div>
        ) : null}
      </aside>
    </div>
  );
}

export function ModalShell({ title, onClose, children, footer, eyebrow = "New record", align = "left", size = "lg", className = "" }) {
  const width = size === "md" ? "max-w-xl" : size === "sm" ? "max-w-lg" : "max-w-3xl";
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-3 sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[min(90vh,720px)] w-full ${width} flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-950 ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <RecordChrome title={title} onClose={onClose} eyebrow={eyebrow} align={align} />
        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5 sm:p-6 dark:bg-gray-950">{children}</div>
        {footer ? (
          <div className="border-t border-gray-100 bg-white px-5 py-4 sm:px-6 dark:border-gray-800 dark:bg-gray-950">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
