import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, MessageSquareText } from "lucide-react";
import { initials, isOverdue, lastMessagePreview, relativeTicketTime, slaLabel } from "../model";
import { RequesterTypeBadge, TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";

const PRIORITY_RAIL = {
  Urgent: "bg-rose-500",
  High: "bg-amber-500",
  Medium: "bg-sky-400",
  Low: "bg-gray-300",
};

export function TicketDataTable({
  rows,
  sortKey,
  sortDir,
  onSort,
  onOpen,
  onAssign,
  onPriority,
  onStatus,
  onClose,
  page,
  pages,
  total,
  pageSize,
  onPage,
  onPageSize,
}) {
  const [menuId, setMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuId) return undefined;
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-200">
            <MessageSquareText className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Ticket queue</p>
            <p className="text-[11px] text-gray-500">Conversation-first helpdesk list</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <SortChip label="Updated" active={sortKey === "updatedAt"} dir={sortDir} onClick={() => onSort("updatedAt")} />
          <SortChip label="Priority" active={sortKey === "priority"} dir={sortDir} onClick={() => onSort("priority")} />
          <SortChip label="Created" active={sortKey === "createdAt"} dir={sortDir} onClick={() => onSort("createdAt")} />
          <select
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
            value={pageSize}
            onChange={(event) => onPageSize(Number(event.target.value))}
          >
            {[8, 12, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {rows.length ? (
          rows.map((ticket) => {
            const overdue = isOverdue(ticket);
            const sla = slaLabel(ticket);
            const preview = lastMessagePreview(ticket);
            const msgCount = (ticket.messages || []).filter((row) => !row.internal).length;
            return (
              <div
                key={ticket.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(ticket.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(ticket.id);
                  }
                }}
                className="group relative flex cursor-pointer gap-0 hover:bg-rose-50/40 dark:hover:bg-pink-950/20"
              >
                <span className={`w-1 shrink-0 ${PRIORITY_RAIL[ticket.priority] || PRIORITY_RAIL.Medium}`} />
                <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-start sm:gap-4 sm:px-4">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span
                      className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xs font-semibold ${
                        ticket.requesterType === "brand"
                          ? "bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-200"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200"
                      }`}
                    >
                      {initials(ticket.requesterName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          {ticket.id}
                        </span>
                        <RequesterTypeBadge value={ticket.requesterType} />
                        {overdue ? (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">Overdue</span>
                        ) : null}
                        {sla ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              sla.tone === "rose"
                                ? "bg-rose-50 text-rose-700"
                                : sla.tone === "amber"
                                  ? "bg-amber-50 text-amber-800"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {sla.label}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-900 group-hover:text-pink-800 dark:text-white dark:group-hover:text-pink-200">
                        {ticket.subject}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{preview}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.requesterName}</span>
                        <span>·</span>
                        <span>{ticket.category}</span>
                        {ticket.relatedOrderId ? (
                          <>
                            <span>·</span>
                            <span className="font-mono">{ticket.relatedOrderId}</span>
                          </>
                        ) : null}
                        <span>·</span>
                        <span>{msgCount} msg</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                      <TicketPriorityBadge value={ticket.priority} compact />
                      <TicketStatusBadge value={ticket.status} compact />
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.assignedName ? (
                        <span
                          className="grid h-7 w-7 place-items-center rounded-full bg-gray-900 text-[10px] font-semibold text-white dark:bg-gray-100 dark:text-gray-900"
                          title={ticket.assignedName}
                        >
                          {initials(ticket.assignedName)}
                        </span>
                      ) : (
                        <span className="rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                          Unassigned
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">{relativeTicketTime(ticket.updatedAt)}</span>
                      <div className="relative" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="Ticket actions"
                          onClick={() => setMenuId((current) => (current === ticket.id ? null : ticket.id))}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {menuId === ticket.id ? (
                          <div
                            ref={menuRef}
                            className="absolute top-9 right-0 z-20 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                          >
                            <MenuItem label="Open conversation" onClick={() => { setMenuId(null); onOpen(ticket.id); }} />
                            <MenuItem label="Assign agent" onClick={() => { setMenuId(null); onAssign(ticket); }} />
                            <MenuItem label="Change priority" onClick={() => { setMenuId(null); onPriority(ticket); }} />
                            <MenuItem label="Change status" onClick={() => { setMenuId(null); onStatus(ticket); }} />
                            <MenuItem label="Close ticket" danger onClick={() => { setMenuId(null); onClose(ticket); }} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950/40">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">Queue is clear for these filters</p>
            <p className="mt-1 text-xs text-gray-500">Try another desk, clear filters, or create a ticket.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-2.5 text-xs text-gray-500 dark:border-gray-800">
        <span>
          {total} ticket{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-2 py-1 font-semibold disabled:opacity-40 dark:border-gray-700"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            Prev
          </button>
          <span className="tabular-nums">
            {page} / {pages}
          </span>
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-2 py-1 font-semibold disabled:opacity-40 dark:border-gray-700"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function SortChip({ label, active, dir, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 font-semibold ${
        active ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {label}
      {active ? <span className="ml-1 opacity-80">{dir === "asc" ? "↑" : "↓"}</span> : null}
    </button>
  );
}

function MenuItem({ label, onClick, danger = false }) {
  return (
    <button
      type="button"
      className={`block w-full px-3 py-2 text-left text-sm ${
        danger ? "text-rose-600 hover:bg-rose-50" : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
