import { TICKET_PRIORITIES, TICKET_STATUSES, formatTicketDate, initials } from "../model";
import { RequesterTypeBadge, TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";

export function TicketInformationPanel({ ticket, agents, onPatch }) {
  if (!ticket) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent px-4 py-3 dark:border-sky-900/40 dark:from-sky-950/20">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-sky-700 uppercase dark:text-sky-300">Ticket properties</p>
        <p className="mt-1 font-mono text-sm font-semibold text-gray-900 dark:text-white">{ticket.id}</p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-700 text-xs font-semibold text-white dark:bg-slate-200 dark:text-slate-900">
            {initials(ticket.requesterName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{ticket.requesterName}</p>
            <div className="mt-1">
              <RequesterTypeBadge value={ticket.requesterType} />
            </div>
          </div>
        </div>

        <dl className="space-y-2.5 text-sm">
          {ticket.brandName ? <Row label="Brand" value={ticket.brandName} /> : null}
          {ticket.customerName ? <Row label="Customer" value={ticket.customerName} /> : null}
          {ticket.customerEmail ? <Row label="Email" value={ticket.customerEmail} /> : null}
          {ticket.customerPhone ? <Row label="Phone" value={ticket.customerPhone} /> : null}
          <Row label="Category" value={ticket.category} />
          <Row label="Order" value={ticket.relatedOrderId || "—"} mono={Boolean(ticket.relatedOrderId)} />
          <Row label="Created" value={formatTicketDate(ticket.createdAt)} />
          <Row label="Updated" value={formatTicketDate(ticket.updatedAt)} />
        </dl>

        <div className="space-y-3 border-t border-dashed border-gray-200 pt-4 dark:border-gray-700">
          <label className="block">
            <span className="mb-1 flex items-center justify-between text-[11px] font-medium text-gray-500">
              Status
              <TicketStatusBadge value={ticket.status} compact />
            </span>
            <select
              className="input-field"
              value={ticket.status}
              onChange={(event) => onPatch({ status: event.target.value }, `Status → ${event.target.value}`)}
            >
              {TICKET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 flex items-center justify-between text-[11px] font-medium text-gray-500">
              Priority
              <TicketPriorityBadge value={ticket.priority} compact />
            </span>
            <select
              className="input-field"
              value={ticket.priority}
              onChange={(event) => onPatch({ priority: event.target.value }, `Priority → ${event.target.value}`)}
            >
              {TICKET_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-500">Assigned agent</span>
            <select
              className="input-field"
              value={ticket.assignedTo || ""}
              onChange={(event) => {
                const agent = agents.find((row) => row.id === event.target.value);
                onPatch(
                  { assignedTo: agent?.id || null, assignedName: agent?.name || null },
                  agent ? `Assigned to ${agent.name}` : "Unassigned",
                );
              }}
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`text-right font-medium text-gray-900 dark:text-white ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
