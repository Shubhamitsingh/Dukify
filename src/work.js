export function exceptions(db) {
  const low = db.inventory.filter((row) => row.available <= (Number(row.reorderAt) || 11));
  return [
    ...db.orders
      .filter((order) => order.payment === "Failed" || order.payment === "COD pending")
      .map((order) => ({
        id: `pay-${order.id}`,
        category: "Payment",
        title: order.payment === "Failed" ? "Payment failed" : "COD not collected",
        detail: `${order.id} · ${order.brand}`,
        owner: "Finance desk",
        priority: "High",
        status: "Open",
        to: `/orders?record=${order.id}`,
      })),
    ...db.shipments
      .filter((row) => row.status === "RTO" || row.status === "Exception" || row.status === "NDR")
      .map((row) => ({
        id: `ship-${row.id}`,
        category: "Shipping",
        title: row.status === "RTO" ? "RTO" : row.status === "NDR" ? "NDR pending" : "Delivery exception",
        detail: `${row.order} · ${row.awb} · ${row.ndrReason || row.status}`,
        owner: "Dispatch desk",
        priority: "High",
        status: "Open",
        to: `/shipping?record=${row.id}`,
      })),
    ...db.returns
      .filter((item) => item.status === "Pending approval" || item.status === "Inspection")
      .map((item) => ({
        id: `ret-${item.id}`,
        category: "Return",
        title: `Return · ${item.status}`,
        detail: `${item.order} · ${item.brand}`,
        owner: "Support desk",
        priority: item.status === "Inspection" ? "High" : "Medium",
        status: "Open",
        to: `/returns?record=${item.id}`,
      })),
    ...db.purchases
      .filter((item) => item.status === "In transit" || item.status === "Inspection")
      .map((item) => ({
        id: `po-${item.id}`,
        category: "Procurement",
        title: `Purchase · ${item.status}`,
        detail: `${item.id} · ${item.product} · ${item.qty}`,
        owner: "Catalogue desk",
        priority: item.status === "Inspection" ? "High" : "Medium",
        status: "Open",
        to: `/purchasing?record=${item.id}`,
      })),
    ...low.map((row) => ({
      id: `stk-${row.id}`,
      category: "Inventory",
      title: row.available === 0 ? "Out of stock" : "Low stock",
      detail: `${row.product} · ${row.sku} · ${row.available} available`,
      owner: "Inventory desk",
      priority: row.available === 0 ? "High" : "Medium",
      status: "Open",
      to: `/inventory?record=${row.id}`,
    })),
    ...db.tickets
      .filter((ticket) => ticket.status === "Open")
      .map((ticket) => ({
        id: `tkt-${ticket.id}`,
        category: "Support",
        title: `Support · ${ticket.topic}`,
        detail: `${ticket.from} · ${ticket.id}`,
        owner: "Support desk",
        priority: ticket.priority || "Medium",
        status: "Open",
        to: `/support/ticket/${ticket.id}`,
      })),
    ...db.settlements
      .filter((row) => row.status === "On hold")
      .map((row) => ({
        id: `set-${row.id}`,
        category: "Settlement",
        title: "Settlement on hold",
        detail: `${row.partner} · ${row.id}`,
        owner: "Finance desk",
        priority: "High",
        status: "Open",
        to: `/settlements?record=${row.id}`,
      })),
    ...db.notices
      .filter((row) => row.status === "Failed")
      .map((row) => ({
        id: `ntc-${row.id}`,
        category: "Notification",
        title: "Notice failed",
        detail: `${row.title} · ${row.channel}`,
        owner: "Operations desk",
        priority: "Medium",
        status: "Open",
        to: `/notifications?record=${row.id}`,
      })),
    ...(db.integrations || [])
      .filter((row) => row.status !== "Connected")
      .map((row) => ({
        id: `int-${row.id}`,
        category: "Integration",
        title: `${row.name} not connected`,
        detail: row.note,
        owner: "Platform owner",
        priority: "Not connected",
        status: "Open",
        to: "/integrations",
      })),
  ];
}

export function approvals(db) {
  return [
    ...db.brands
      .filter((row) => row.status === "Pending approval")
      .map((row) => ({
        id: `apr-brand-${row.id}`,
        kind: "Brand",
        title: row.name,
        detail: `${row.partner} · ${row.category}`,
        collection: "brands",
        recordId: row.id,
        approveTo: "Active",
        rejectTo: "Deactivated",
        to: `/brands?record=${row.id}`,
      })),
    ...db.partners
      .filter((row) => row.status === "Pending approval")
      .map((row) => ({
        id: `apr-partner-${row.id}`,
        kind: "Partner",
        title: row.name,
        detail: `${row.brand} · ${row.verification}`,
        collection: "partners",
        recordId: row.id,
        approveTo: "Active",
        rejectTo: "Suspended",
        to: `/partners?record=${row.id}`,
      })),
    ...db.purchases
      .filter((row) => row.status === "Draft")
      .map((row) => ({
        id: `apr-po-${row.id}`,
        kind: "Purchase",
        title: row.id,
        detail: `${row.supplier} · ${row.product} · ${row.qty}`,
        collection: "purchases",
        recordId: row.id,
        approveTo: "In transit",
        rejectTo: "Draft",
        to: `/purchasing?record=${row.id}`,
      })),
    ...db.labels
      .filter((row) => row.status === "Pending approval")
      .map((row) => ({
        id: `apr-label-${row.id}`,
        kind: "Private label",
        title: `${row.brand} · ${row.type}`,
        detail: row.artwork,
        collection: "labels",
        recordId: row.id,
        approveTo: "Active",
        rejectTo: "Paused",
        to: `/private-label?record=${row.id}`,
      })),
    ...db.returns
      .filter((row) => row.status === "Pending approval")
      .map((row) => ({
        id: `apr-ret-${row.id}`,
        kind: "Return",
        title: row.order,
        detail: `${row.brand} · ${row.reason}`,
        collection: "returns",
        recordId: row.id,
        approveTo: "Inspection",
        rejectTo: "Rejected",
        to: `/returns?record=${row.id}`,
      })),
    ...db.settlements
      .filter((row) => row.status === "Pending")
      .map((row) => ({
        id: `apr-set-${row.id}`,
        kind: "Settlement",
        title: row.partner,
        detail: `${row.id} · stored row, not the live worksheet`,
        collection: "settlements",
        recordId: row.id,
        approveTo: "Approved",
        rejectTo: "On hold",
        to: `/settlements?record=${row.id}`,
      })),
  ];
}

export function orderItems(order) {
  if (Array.isArray(order?.items) && order.items.length) return order.items;
  if (!order?.product || order.payment == null) return [];
  return [{ sku: order.sku, product: order.product, qty: order.qty, value: order.value, supply: order.supply }];
}
