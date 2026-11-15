import { TICKET_PRIORITIES, TICKET_STATUSES } from "./data/seed";

export { TICKET_PRIORITIES, TICKET_STATUSES };

export const SUPPORT_TABS = [
  { id: "all", label: "All Tickets" },
  { id: "brand", label: "Brand Tickets" },
  { id: "customer", label: "Customer Tickets" },
];

export const DEFAULT_FILTERS = {
  query: "",
  type: "All",
  status: "All",
  priority: "All",
  category: "All",
  agent: "All",
  dateFrom: "",
  dateTo: "",
};

function startOfDay(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function isOverdue(ticket, now = Date.now()) {
  if (!["Open", "In Progress", "Waiting for User"].includes(ticket.status)) return false;
  const created = new Date(ticket.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const hours = (now - created) / (1000 * 60 * 60);
  if (ticket.priority === "Urgent") return hours > 24;
  if (ticket.priority === "High") return hours > 48;
  return hours > 72;
}

export function ticketStats(tickets) {
  const list = tickets || [];
  return {
    total: list.length,
    open: list.filter((row) => row.status === "Open").length,
    inProgress: list.filter((row) => row.status === "In Progress").length,
    waiting: list.filter((row) => row.status === "Waiting for User").length,
    resolved: list.filter((row) => row.status === "Resolved").length,
    overdue: list.filter((row) => isOverdue(row)).length,
  };
}

export function filterTickets(tickets, filters = DEFAULT_FILTERS, tab = "all") {
  const needle = (filters.query || "").trim().toLowerCase();
  return (tickets || []).filter((ticket) => {
    if (tab === "brand" && ticket.requesterType !== "brand") return false;
    if (tab === "customer" && ticket.requesterType !== "customer") return false;
    if (filters.type !== "All" && ticket.requesterType !== filters.type) return false;
    if (filters.status !== "All" && ticket.status !== filters.status) return false;
    if (filters.priority !== "All" && ticket.priority !== filters.priority) return false;
    if (filters.category !== "All" && ticket.category !== filters.category) return false;
    if (filters.agent === "Unassigned" && ticket.assignedTo) return false;
    if (filters.agent !== "All" && filters.agent !== "Unassigned" && ticket.assignedTo !== filters.agent) return false;

    const from = startOfDay(filters.dateFrom);
    const to = startOfDay(filters.dateTo);
    const created = startOfDay(ticket.createdAt);
    if (from != null && created != null && created < from) return false;
    if (to != null && created != null && created > to) return false;

    if (!needle) return true;
    const hay = [
      ticket.id,
      ticket.requesterName,
      ticket.brandName,
      ticket.customerName,
      ticket.subject,
      ticket.category,
      ticket.relatedOrderId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

export function sortTickets(rows, sortKey = "updatedAt", sortDir = "desc") {
  const factor = sortDir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = a[sortKey];
    const right = b[sortKey];
    if (sortKey === "createdAt" || sortKey === "updatedAt") {
      return (new Date(left).getTime() - new Date(right).getTime()) * factor;
    }
    if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
    return String(left ?? "").localeCompare(String(right ?? "")) * factor;
  });
}

export function paginate(rows, page, pageSize) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safe = Math.min(Math.max(1, page), pages);
  const start = (safe - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), page: safe, pages, total };
}

export function formatTicketDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function agentWorkload(agents, tickets) {
  return (agents || []).map((agent) => {
    const mine = (tickets || []).filter((ticket) => ticket.assignedTo === agent.id);
    return {
      ...agent,
      assignedTickets: mine.length,
      openTickets: mine.filter((ticket) => ["Open", "In Progress", "Waiting for User"].includes(ticket.status)).length,
      resolvedTickets: mine.filter((ticket) => ticket.status === "Resolved" || ticket.status === "Closed").length,
    };
  });
}

export function nextTicketId(tickets) {
  const nums = (tickets || [])
    .map((ticket) => Number(String(ticket.id).replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `TKT-${next}`;
}

export function buildActivity(text, actor = "Platform owner") {
  return {
    id: `ACT-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    text,
    at: new Date().toISOString(),
    actor,
  };
}

export function buildMessage({ authorType, authorName, body, internal = false }) {
  return {
    id: `MSG-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    authorType,
    authorName,
    body,
    at: new Date().toISOString(),
    internal: Boolean(internal),
    attachments: [],
  };
}

export function categoriesForType(categories, requesterType) {
  const scope = requesterType === "customer" ? "customer" : "brand";
  return (categories || []).filter((row) => row.scope === scope && row.active !== false);
}

export function lastMessagePreview(ticket) {
  const messages = (ticket?.messages || []).filter((row) => !row.internal);
  const last = messages[messages.length - 1];
  if (last?.body) return last.body.replace(/\s+/g, " ").trim();
  return ticket?.description || "No messages yet";
}

export function relativeTicketTime(value, now = Date.now()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Math.max(0, now - date.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatTicketDate(value);
}

export function slaLabel(ticket, now = Date.now()) {
  if (!["Open", "In Progress", "Waiting for User"].includes(ticket.status)) return null;
  const created = new Date(ticket.createdAt).getTime();
  if (Number.isNaN(created)) return null;
  const hours = (now - created) / (1000 * 60 * 60);
  const limit = ticket.priority === "Urgent" ? 24 : ticket.priority === "High" ? 48 : 72;
  const left = limit - hours;
  if (left <= 0) return { label: "SLA breached", tone: "rose" };
  if (left <= limit * 0.25) return { label: `${Math.ceil(left)}h left`, tone: "amber" };
  return { label: `${Math.ceil(left)}h SLA`, tone: "slate" };
}

export function initials(name = "?") {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";
}
