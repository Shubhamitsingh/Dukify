import { ArrowLeft, Headphones } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { SoftButton } from "../ui";
import { TicketActivityTimeline } from "./components/TicketActivityTimeline";
import { TicketConversation } from "./components/TicketConversation";
import { TicketInformationPanel } from "./components/TicketInformationPanel";
import { TicketPriorityBadge, TicketStatusBadge, RequesterTypeBadge } from "./components/TicketBadges";
import { useSupportActions } from "./hooks";

export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, updateTicket, replyToTicket } = useSupportActions();
  const ticket = (db.tickets || []).find((row) => row.id === id);

  if (!ticket) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Ticket not found</p>
        <p className="text-sm text-gray-500">This ticket is not in the current session.</p>
        <SoftButton onClick={() => navigate("/support")}>Back to inbox</SoftButton>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-sky-200 bg-white shadow-[var(--app-shadow)] dark:border-sky-900/60 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-sky-100 p-4 dark:border-sky-900/40 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-gray-900 dark:text-sky-300"
                onClick={() => navigate("/support")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Inbox
              </button>
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {ticket.id}
              </span>
              <RequesterTypeBadge value={ticket.requesterType} />
              <TicketStatusBadge value={ticket.status} compact />
              <TicketPriorityBadge value={ticket.priority} compact />
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/20">
                <Headphones className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white sm:text-xl">{ticket.subject}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {ticket.requesterName}
                  {ticket.brandName ? ` · ${ticket.brandName}` : ""}
                  {ticket.relatedOrderId ? ` · ${ticket.relatedOrderId}` : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {ticket.status !== "Closed" ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                onClick={() => updateTicket(ticket.id, { status: "Closed" }, "Ticket closed")}
              >
                Close ticket
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-600/20 hover:bg-sky-700"
                onClick={() => updateTicket(ticket.id, { status: "Open" }, "Ticket reopened")}
              >
                Reopen ticket
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.7fr)]">
        <TicketConversation ticket={ticket} onReply={(body, internal) => replyToTicket(ticket.id, body, internal)} />
        <div className="space-y-4">
          <TicketInformationPanel
            ticket={ticket}
            agents={db.supportAgents || []}
            onPatch={(changes, note) => updateTicket(ticket.id, changes, note)}
          />
          <TicketActivityTimeline logs={ticket.activityLogs} />
        </div>
      </div>
    </div>
  );
}
