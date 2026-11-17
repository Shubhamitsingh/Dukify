import { formatTicketDate } from "../model";

export function TicketActivityTimeline({ logs }) {
  const rows = [...(logs || [])].sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <div className="overflow-hidden rounded-xl border border-sky-200/80 bg-white shadow-[var(--app-shadow)] dark:border-sky-900/60 dark:bg-gray-900">
      <div className="border-b border-sky-100 px-4 py-3 dark:border-sky-900/40">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-sky-700 uppercase dark:text-sky-300">Activity trail</p>
      </div>
      {rows.length ? (
        <ol className="space-y-0 p-2">
          {rows.map((row, index) => (
            <li key={row.id} className="relative flex gap-3 rounded-xl px-2 py-2.5 hover:bg-sky-50/50 dark:hover:bg-sky-950/20">
              <div className="relative flex w-4 shrink-0 flex-col items-center">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-500 ring-4 ring-sky-100 dark:ring-sky-950/50" />
                {index < rows.length - 1 ? <span className="mt-1 w-px flex-1 bg-sky-200 dark:bg-sky-900/40" /> : null}
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{row.text}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {row.actor} · {formatTicketDate(row.at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 py-6 text-sm text-gray-400">No activity yet.</p>
      )}
    </div>
  );
}
