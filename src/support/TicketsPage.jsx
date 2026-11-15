import { useEffect, useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { downloadBlob } from "../catalogue";
import { SoftButton } from "../ui";
import { AssignAgentModal } from "./components/AssignAgentModal";
import { CreateTicketModal } from "./components/CreateTicketModal";
import { TicketDataTable } from "./components/TicketDataTable";
import { TicketFilters } from "./components/TicketFilters";
import { TicketStatsCards } from "./components/TicketStatsCards";
import { TicketTabs } from "./components/TicketTabs";
import { useSupportActions } from "./hooks";
import {
  DEFAULT_FILTERS,
  filterTickets,
  formatTicketDate,
  isOverdue,
  paginate,
  sortTickets,
  ticketStats,
} from "./model";

const STATUS_FILTER_MAP = {
  open: "Open",
  inProgress: "In Progress",
  waiting: "Waiting for User",
  resolved: "Resolved",
  overdue: "Overdue",
};

export function TicketsPage({ initialTab = "all" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { db, updateTicket, createTicket } = useSupportActions();
  const [tab, setTab] = useState(initialTab);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortKey, setSortKey] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [creating, setCreating] = useState(false);
  const [actionTicket, setActionTicket] = useState(null);
  const [actionMode, setActionMode] = useState("assign");

  useEffect(() => {
    setTab(initialTab);
    setPage(1);
  }, [initialTab]);

  useEffect(() => {
    const openId = params.get("ticket");
    if (openId) navigate(`/support/ticket/${openId}`, { replace: true });
  }, [navigate, params]);

  const tickets = db.tickets || [];
  const agents = db.supportAgents || [];
  const categories = db.ticketCategories || [];

  const scoped = useMemo(() => {
    const rows = filterTickets(tickets, filters, tab);
    if (!overdueOnly) return rows;
    return rows.filter((row) => isOverdue(row));
  }, [tickets, filters, tab, overdueOnly]);

  const sorted = useMemo(() => sortTickets(scoped, sortKey, sortDir), [scoped, sortKey, sortDir]);
  const pageData = useMemo(() => paginate(sorted, page, pageSize), [sorted, page, pageSize]);
  const stats = useMemo(
    () => ticketStats(filterTickets(tickets, DEFAULT_FILTERS, tab === "all" ? "all" : tab)),
    [tickets, tab],
  );

  const counts = useMemo(
    () => ({
      all: tickets.length,
      brand: tickets.filter((row) => row.requesterType === "brand").length,
      customer: tickets.filter((row) => row.requesterType === "customer").length,
    }),
    [tickets],
  );

  useEffect(() => {
    if (pageData.page !== page) setPage(pageData.page);
  }, [pageData.page, page]);

  const onSort = (key) => {
    if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const exportCsv = () => {
    const header = [
      "Ticket ID",
      "Requester",
      "Type",
      "Subject",
      "Category",
      "Priority",
      "Agent",
      "Created",
      "Updated",
      "Status",
    ];
    const lines = sorted.map((ticket) =>
      [
        ticket.id,
        ticket.requesterName,
        ticket.requesterType,
        ticket.subject,
        ticket.category,
        ticket.priority,
        ticket.assignedName || "",
        formatTicketDate(ticket.createdAt),
        formatTicketDate(ticket.updatedAt),
        ticket.status,
      ]
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    );
    downloadBlob(`pahachan-tickets-${tab}.csv`, [header.join(","), ...lines].join("\n"), "text/csv;charset=utf-8");
  };

  return (
    <div className="space-y-4">
      <TicketStatsCards
        stats={stats}
        activeStatus={overdueOnly ? "Overdue" : filters.status}
        onStatusClick={(key) => {
          setPage(1);
          if (key === "overdue") {
            setOverdueOnly((value) => !value);
            setFilters({ ...filters, status: "All" });
            return;
          }
          if (key === "all") {
            setOverdueOnly(false);
            setFilters({ ...filters, status: "All" });
            return;
          }
          setOverdueOnly(false);
          const status = STATUS_FILTER_MAP[key];
          setFilters({
            ...filters,
            status: filters.status === status ? "All" : status,
          });
        }}
      />

      <div className="space-y-3 rounded-2xl border border-sky-200/80 bg-white p-3 shadow-[var(--app-shadow)] dark:border-sky-900/60 dark:bg-gray-900 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TicketTabs
            active={tab}
            counts={counts}
            onChange={(next) => {
              setTab(next);
              setPage(1);
              navigate(next === "all" ? "/support" : `/support/${next}`);
            }}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <SoftButton onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" />
              Export
            </SoftButton>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-600/20 hover:bg-sky-700"
              onClick={() => setCreating(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Create ticket
            </button>
          </div>
        </div>
        <TicketFilters
          filters={filters}
          agents={agents}
          categories={categories}
          resultCount={scoped.length}
          onChange={(next) => {
            setFilters(next);
            setOverdueOnly(false);
            setPage(1);
          }}
          onClear={() => {
            setFilters(DEFAULT_FILTERS);
            setOverdueOnly(false);
            setPage(1);
          }}
        />
        {overdueOnly ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-800 ring-1 ring-rose-200"
            onClick={() => {
              setOverdueOnly(false);
              setPage(1);
            }}
          >
            Overdue SLA only ×
          </button>
        ) : null}
      </div>

      <TicketDataTable
        rows={pageData.rows}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={onSort}
        onOpen={(id) => navigate(`/support/ticket/${id}`)}
        onAssign={(ticket) => {
          setActionTicket(ticket);
          setActionMode("assign");
        }}
        onPriority={(ticket) => {
          setActionTicket(ticket);
          setActionMode("priority");
        }}
        onStatus={(ticket) => {
          setActionTicket(ticket);
          setActionMode("status");
        }}
        onClose={(ticket) => updateTicket(ticket.id, { status: "Closed" }, "Ticket closed")}
        page={pageData.page}
        pages={pageData.pages}
        total={pageData.total}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {creating ? (
        <CreateTicketModal
          brands={db.brands}
          agents={agents}
          categories={categories}
          onClose={() => setCreating(false)}
          onCreate={(draft) => {
            const id = createTicket(draft);
            setCreating(false);
            if (id) navigate(`/support/ticket/${id}`);
          }}
        />
      ) : null}

      {actionTicket ? (
        <AssignAgentModal
          ticket={actionTicket}
          agents={agents}
          mode={actionMode}
          onClose={() => setActionTicket(null)}
          onSave={(changes) => {
            const notes = [];
            if (actionMode === "assign" || actionMode === "all") {
              notes.push(changes.assignedName ? `Assigned to ${changes.assignedName}` : "Unassigned");
            }
            if (actionMode === "priority" || actionMode === "all") notes.push(`Priority → ${changes.priority}`);
            if (actionMode === "status" || actionMode === "all") notes.push(`Status → ${changes.status}`);
            const payload =
              actionMode === "assign"
                ? { assignedTo: changes.assignedTo, assignedName: changes.assignedName }
                : actionMode === "priority"
                  ? { priority: changes.priority }
                  : { status: changes.status };
            updateTicket(actionTicket.id, payload, notes.join(" · "));
            setActionTicket(null);
          }}
        />
      ) : null}
    </div>
  );
}
