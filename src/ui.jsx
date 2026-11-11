export function PageHead({ title, description, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-xs leading-5 text-gray-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

const dots = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  pink: "bg-pink-500",
  slate: "bg-gray-300",
};

export function Kpi({ label, value, note, tone = "slate" }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dots[tone] || dots.slate}`} />
        <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums dark:text-white">{value}</p>
      {note ? <p className="mt-1 text-[11px] leading-4 text-gray-500">{note}</p> : null}
    </article>
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
  Approved: "bg-sky-50 text-sky-800",
  Received: "bg-sky-50 text-sky-800",
  Shipped: "bg-sky-50 text-sky-800",
  "In transit": "bg-sky-50 text-sky-800",
  Pending: "bg-amber-50 text-amber-800",
  "Pending approval": "bg-amber-50 text-amber-800",
  "COD pending": "bg-amber-50 text-amber-800",
  Inspection: "bg-amber-50 text-amber-800",
  Packing: "bg-amber-50 text-amber-800",
  Open: "bg-amber-50 text-amber-800",
  Draft: "bg-gray-100 text-gray-700",
  Hidden: "bg-gray-100 text-gray-700",
  Ended: "bg-gray-100 text-gray-700",
  Suspended: "bg-rose-50 text-rose-800",
  "Temporarily suspended": "bg-rose-50 text-rose-800",
  Failed: "bg-rose-50 text-rose-800",
  Refunded: "bg-rose-50 text-rose-800",
  Returned: "bg-rose-50 text-rose-800",
  RTO: "bg-rose-50 text-rose-800",
  "On hold": "bg-rose-50 text-rose-800",
  Low: "bg-rose-50 text-rose-800",
  Cancelled: "bg-rose-50 text-rose-800",
};

export function Status({ value }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${pillTone[value] || "bg-gray-100 text-gray-700"}`}>
      {value}
    </span>
  );
}

export function Surface({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
