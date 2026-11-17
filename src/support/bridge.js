/** Shared browser bridge: Brand portal → Super Admin Support inbox. */

export const BRAND_TICKET_BRIDGE_KEY = "pahachan-brand-raised-tickets";

const TOPIC_TO_CATEGORY = {
  Orders: "Order Management",
  Products: "Product Listing",
  Pricing: "Payment & Settlement",
  Payments: "Payment & Settlement",
  Technical: "Technical Issues",
  Account: "Account & Verification",
  Platform: "Platform Issues",
  Other: "Other",
};

export function readBrandRaisedTickets() {
  try {
    const raw = localStorage.getItem(BRAND_TICKET_BRIDGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export const DEMO_TICKET_BRIDGE_KEY = "dukify-demo-tickets";

export function readDemoTickets() {
  try {
    const raw = localStorage.getItem(DEMO_TICKET_BRIDGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function pushDemoTicket(ticket) {
  if (!ticket?.id) return;
  const list = readDemoTickets().filter((row) => row.id !== ticket.id);
  localStorage.setItem(DEMO_TICKET_BRIDGE_KEY, JSON.stringify([ticket, ...list].slice(0, 120)));
}

/** Landing “Book a demo” → Super Admin support inbox. */
export function demoRequestToTicket(entry) {
  const now = entry.createdAt || new Date().toISOString();
  const id = `TKT-D${String(Date.now()).slice(-6)}`;
  const requesterName = entry.name || "Demo request";
  const lines = [
    `Phone: ${entry.phone || "—"}`,
    `Email: ${entry.email || "—"}`,
    entry.brand ? `Brand or Instagram: ${entry.brand}` : "",
    entry.note || "Asked for a demo call from the landing page.",
  ].filter(Boolean);
  const body = lines.join("\n");

  return {
    id,
    requesterType: "customer",
    requesterName,
    brandId: null,
    brandName: null,
    customerName: requesterName,
    customerEmail: entry.email || null,
    customerPhone: entry.phone || null,
    subject: `Demo call · ${requesterName}`,
    description: body,
    category: "Demo call",
    priority: "Medium",
    status: "Open",
    assignedTo: null,
    assignedName: null,
    relatedOrderId: null,
    relatedProduct: null,
    createdAt: now,
    updatedAt: now,
    from: requesterName,
    topic: "Demo call",
    updated: "Just now",
    messages: [
      {
        id: `MSG-${Date.now()}`,
        authorType: "customer",
        authorName: requesterName,
        body,
        at: now,
        internal: false,
        attachments: [],
      },
    ],
    activityLogs: [
      {
        id: `ACT-${Date.now()}`,
        text: "Demo call requested from the landing page",
        at: now,
        actor: requesterName,
      },
    ],
  };
}

export function pushBrandRaisedTicket(ticket) {
  if (!ticket?.id) return;
  const list = readBrandRaisedTickets().filter((row) => row.id !== ticket.id);
  localStorage.setItem(BRAND_TICKET_BRIDGE_KEY, JSON.stringify([ticket, ...list].slice(0, 120)));
}

export function brandFormToSaTicket(form, brand) {
  const now = new Date().toISOString();
  const id = `TKT-B${String(Date.now()).slice(-6)}`;
  const requesterName = brand.contactName || brand.name || "Brand partner";
  const category = TOPIC_TO_CATEGORY[form.topic] || form.category || form.topic || "Other";
  const body = form.message || form.description || "";

  return {
    id,
    requesterType: "brand",
    requesterName,
    brandId: brand.id || null,
    brandName: brand.name || requesterName,
    customerName: null,
    customerEmail: null,
    customerPhone: null,
    subject: form.subject,
    description: body,
    category,
    priority: form.priority || "Medium",
    status: "Open",
    assignedTo: null,
    assignedName: null,
    relatedOrderId: form.relatedOrderId || null,
    relatedProduct: null,
    createdAt: now,
    updatedAt: now,
    from: brand.name || requesterName,
    topic: form.topic || category,
    updated: "Just now",
    messages: [
      {
        id: `MSG-${Date.now()}`,
        authorType: "brand",
        authorName: requesterName,
        body,
        at: now,
        internal: false,
        attachments: [],
      },
    ],
    activityLogs: [
      {
        id: `ACT-${Date.now()}`,
        text: "Ticket created by brand",
        at: now,
        actor: brand.name || requesterName,
      },
    ],
  };
}
