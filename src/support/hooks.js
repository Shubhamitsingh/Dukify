import { useEffect } from "react";
import { useStore } from "../store";
import { readBrandRaisedTickets, readDemoTickets } from "./bridge";
import { supportAgentsSeed, ticketCategoriesSeed, ticketsSeed } from "./data/seed";
import { buildActivity, buildMessage, nextTicketId } from "./model";

function needsSupportHydration(db) {
  const tickets = db.tickets || [];
  const agents = db.supportAgents || [];
  const categories = db.ticketCategories || [];
  if (!agents.length || !categories.length) return true;
  if (!tickets.length) return true;
  const rich = tickets.some((row) => row.requesterType && Array.isArray(row.messages));
  return !rich;
}

function mergeBridged(tickets, extra) {
  if (!extra.length) return tickets || [];
  const ids = new Set((tickets || []).map((row) => row.id));
  const missing = extra.filter((row) => row?.id && !ids.has(row.id));
  if (!missing.length) return tickets || [];
  return [...missing, ...(tickets || [])];
}

export function useSupportActions() {
  const { db, patch, add, toast, mergeSilent } = useStore();

  useEffect(() => {
    const hydrate = needsSupportHydration(db);
    const baseTickets = hydrate ? structuredClone(ticketsSeed) : db.tickets || [];
    const mergedTickets = mergeBridged(mergeBridged(baseTickets, readBrandRaisedTickets()), readDemoTickets());
    const ticketsChanged = hydrate || mergedTickets.length !== (db.tickets || []).length;
    const agentsMissing = !(db.supportAgents || []).length;
    const categoriesMissing = !(db.ticketCategories || []).length;

    if (!ticketsChanged && !agentsMissing && !categoriesMissing) return;

    mergeSilent({
      tickets: mergedTickets,
      supportAgents: agentsMissing ? structuredClone(supportAgentsSeed) : db.supportAgents,
      ticketCategories: categoriesMissing ? structuredClone(ticketCategoriesSeed) : db.ticketCategories,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.tickets, db.supportAgents, db.ticketCategories, mergeSilent]);

  const updateTicket = (id, changes, activityText) => {
    const ticket = db.tickets.find((row) => row.id === id);
    if (!ticket) return;
    const now = new Date().toISOString();
    const activityLogs = activityText
      ? [buildActivity(activityText), ...(ticket.activityLogs || [])]
      : ticket.activityLogs || [];
    patch(
      "tickets",
      id,
      {
        ...changes,
        updatedAt: now,
        updated: "Just now",
        activityLogs,
        from: changes.requesterName || ticket.from || ticket.requesterName,
        topic: changes.category || ticket.topic || ticket.category,
      },
      activityText || `Ticket ${id} updated`,
    );
  };

  const replyToTicket = (id, body, internal = false) => {
    const ticket = db.tickets.find((row) => row.id === id);
    if (!ticket) return;
    const message = buildMessage({
      authorType: internal ? "agent" : "admin",
      authorName: "Platform owner",
      body,
      internal,
    });
    const activityLogs = [
      buildActivity(internal ? "Internal note added" : "Admin replied"),
      ...(ticket.activityLogs || []),
    ];
    let nextStatus = ticket.status;
    if (!internal) {
      if (ticket.status === "Waiting for User" || ticket.status === "Open") nextStatus = "In Progress";
    }
    patch(
      "tickets",
      id,
      {
        messages: [...(ticket.messages || []), message],
        activityLogs,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        updated: "Just now",
      },
      internal ? `Internal note on ${id}` : `Reply on ${id}`,
    );
  };

  const createTicket = (draft) => {
    const now = new Date().toISOString();
    const brand = (db.brands || []).find((row) => row.name === draft.brandName);
    const id = nextTicketId(db.tickets);
    return add("tickets", {
      id,
      requesterType: draft.requesterType,
      requesterName: draft.requesterName,
      brandId: brand?.id || null,
      brandName: draft.brandName || null,
      customerName: draft.customerName || null,
      customerEmail: draft.customerEmail || null,
      customerPhone: draft.customerPhone || null,
      subject: draft.subject,
      description: draft.description,
      category: draft.category,
      priority: draft.priority || "Medium",
      status: "Open",
      assignedTo: draft.assignedTo || null,
      assignedName: draft.assignedName || null,
      relatedOrderId: draft.relatedOrderId || null,
      relatedProduct: null,
      createdAt: now,
      updatedAt: now,
      from: draft.requesterName,
      topic: draft.category,
      updated: "Just now",
      messages: [
        buildMessage({
          authorType: draft.requesterType,
          authorName: draft.requesterName,
          body: draft.description,
        }),
      ],
      activityLogs: [
        buildActivity("Ticket created", draft.requesterName),
        ...(draft.assignedName ? [buildActivity(`Assigned to ${draft.assignedName}`)] : []),
      ],
    });
  };

  return { db, toast, updateTicket, replyToTicket, createTicket, patch, add };
}
