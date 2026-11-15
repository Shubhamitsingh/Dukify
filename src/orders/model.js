import { parseOrderDate, sampleToday } from "../orderDesk";
import { orderItems } from "../work";
import {
  ATTENTION_FILTERS,
  LEGACY_FULFILMENT_TO_OMS,
  LEGACY_PAYMENT_TO_OMS,
  OMS_TO_LEGACY_FULFILMENT,
  OMS_TO_LEGACY_PAYMENT,
  SUMMARY_CARDS,
} from "./constants";
import { getShipTo } from "./print";

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function inPeriod(order, period, today, customFrom, customTo) {
  if (period === "all") return true;
  const when = parseOrderDate(order.date);
  if (!when) return false;
  const day = startOfDay(when).getTime();
  const end = startOfDay(today).getTime();
  if (period === "today") return day === end;
  if (period === "yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return day === startOfDay(y).getTime();
  }
  if (period === "7d") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return day >= startOfDay(from).getTime() && day <= end;
  }
  if (period === "30d") {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return day >= startOfDay(from).getTime() && day <= end;
  }
  if (period === "custom") {
    if (!customFrom && !customTo) return true;
    const from = customFrom ? startOfDay(new Date(customFrom)).getTime() : -Infinity;
    const to = customTo ? startOfDay(new Date(customTo)).getTime() : Infinity;
    return day >= from && day <= to;
  }
  return true;
}

export function fulfillmentOf(order) {
  if (order.fulfillmentStatus) return order.fulfillmentStatus;
  return LEGACY_FULFILMENT_TO_OMS[order.fulfilment] || order.fulfilment || "New";
}

export function paymentOf(order) {
  if (order.paymentStatus) return order.paymentStatus;
  return LEGACY_PAYMENT_TO_OMS[order.payment] || order.payment || "Pending";
}

export function shippingOf(order, shipment) {
  if (order.shippingStatus) return order.shippingStatus;
  if (shipment?.status === "NDR") return "NDR";
  if (shipment?.status === "RTO") return "RTO";
  if (shipment?.status === "Delivered") return "Delivered";
  if (shipment?.status === "In transit") return "In Transit";
  if (shipment?.status === "Exception") return "Delivery Failed";
  const map = {
    "Not shipped": "Not Assigned",
    "Label ready": "Label Generated",
    "In transit": "In Transit",
    Delivered: "Delivered",
    Returned: "RTO",
  };
  return map[order.delivery] || "Not Assigned";
}

export function normalizeOrder(order, ctx = {}) {
  const brands = ctx.brands || [];
  const shipments = ctx.shipments || [];
  const customers = ctx.customers || [];
  const brand = brands.find((row) => row.name === order.brand || row.id === order.brandId);
  const shipment = shipments.find((row) => row.order === order.id);
  const customer = customers.find((row) => row.label === order.customer && row.brand === order.brand);
  const items = orderItems(order);
  const itemCount = items.reduce((n, line) => n + Number(line.qty || 0), 0) || Number(order.qty || 0);
  const fulfillmentStatus = fulfillmentOf(order);
  const paymentStatus = paymentOf(order);
  const shippingStatus = shippingOf(order, shipment);
  const methodGroup = order.method === "COD" || paymentStatus === "COD" ? "COD" : "Prepaid";

  return {
    ...order,
    brandId: order.brandId || brand?.id || null,
    brandName: order.brand,
    brandEmail: brand?.email || "",
    brandPhone: brand?.phone || "",
    brandDomain: brand?.domain || "",
    customerName: order.customerName || String(order.customer || "").replace(/^Customer ·\s*/, "") || order.customer,
    customerPhone: order.customerPhone || customer?.phone || "",
    customerEmail: order.customerEmail || "",
    customerId: order.customerId || customer?.id || null,
    items,
    itemCount,
    fulfillmentStatus,
    paymentStatus,
    shippingStatus,
    methodGroup,
    courier: order.courier || shipment?.courier || "",
    awb: order.awb || shipment?.awb || "",
    pickupLocationId: order.pickupLocationId || "WH-01",
    pickupLocation: order.pickupLocation || "Central warehouse",
    timeline: Array.isArray(order.timeline) ? order.timeline : defaultTimeline(order, fulfillmentStatus, paymentStatus),
    subtotal: order.subtotal ?? order.value,
    discount: order.discount ?? 0,
    shippingFee: order.shippingFee ?? 0,
    tax: order.tax ?? 0,
    codCharge: order.codCharge ?? (methodGroup === "COD" ? 40 : 0),
    paymentProvider: order.paymentProvider || (order.method === "COD" ? "COD" : "Razorpay"),
    transactionId: order.transactionId || "",
    shipTo: getShipTo(order),
    needsAttention: needsAttention(order, fulfillmentStatus, paymentStatus, shippingStatus),
  };
}

function defaultTimeline(order, fulfillmentStatus, paymentStatus) {
  const base = [{ at: `${order.date} · 10:12`, event: "Order Placed", detail: "Placed on brand storefront", actor: "System" }];
  if (paymentStatus === "Paid") {
    base.push({ at: `${order.date} · 10:13`, event: "Payment Received", detail: "Payment captured", actor: "Payments" });
  } else if (paymentStatus === "Failed") {
    base.push({ at: `${order.date} · 10:13`, event: "Payment Failed", detail: "Checkout payment failed", actor: "Payments" });
  } else if (paymentStatus === "COD") {
    base.push({ at: `${order.date} · 10:13`, event: "COD Confirmed", detail: "Cash on delivery selected", actor: "System" });
  }
  if (["Processing", "Ready to Ship", "Shipped", "Delivered"].includes(fulfillmentStatus)) {
    base.push({ at: `${order.date} · 12:40`, event: "Processing Started", detail: "Warehouse started packing", actor: "Fulfilment desk" });
  }
  if (["Ready to Ship", "Shipped", "Delivered"].includes(fulfillmentStatus)) {
    base.push({ at: `${order.date} · 15:10`, event: "Ready to Ship", detail: "Packed and labelled", actor: "Packing desk" });
  }
  if (["Shipped", "Delivered"].includes(fulfillmentStatus)) {
    base.push({ at: `${order.date} · 17:00`, event: "Picked Up", detail: "Courier pickup confirmed (mock)", actor: "Dispatch" });
  }
  if (fulfillmentStatus === "Delivered") {
    base.push({ at: `${order.date} · 19:20`, event: "Delivered", detail: "Delivery confirmed", actor: "Courier" });
  }
  if (fulfillmentStatus === "Cancelled") {
    base.push({ at: `${order.date} · 11:00`, event: "Cancelled", detail: "Order cancelled", actor: "Platform owner" });
  }
  return base;
}

export function needsAttention(order, fulfillmentStatus, paymentStatus, shippingStatus) {
  if (["Failed", "Pending"].includes(paymentStatus) && fulfillmentStatus !== "Cancelled") return true;
  if (["NDR", "RTO", "Delivery Failed"].includes(shippingStatus)) return true;
  if (fulfillmentStatus === "On Hold") return true;
  if (fulfillmentStatus === "New" && paymentStatus === "Paid") return true;
  return false;
}

export function enrichOrders(db) {
  return (db.orders || []).map((order) =>
    normalizeOrder(order, { brands: db.brands, shipments: db.shipments, customers: db.customers }),
  );
}

export function filterOmsOrders(orders, filters, today) {
  const anchor = today || sampleToday(orders);
  const needle = (filters.query || "").trim().toLowerCase();
  return orders.filter((order) => {
    if (!inPeriod(order, filters.period || "all", anchor, filters.customFrom, filters.customTo)) return false;
    if (filters.brand && filters.brand !== "All" && order.brand !== filters.brand && order.brandId !== filters.brand) return false;
    if (filters.fulfillment && filters.fulfillment !== "All") {
      if (fulfillmentOf(order) !== filters.fulfillment) return false;
    }
    if (filters.payment && filters.payment !== "All") {
      const pay = paymentOf(order);
      if (filters.payment === "COD") {
        if (pay !== "COD" && order.method !== "COD") return false;
      } else if (pay !== filters.payment) return false;
    }
    if (filters.shipping && filters.shipping !== "All") {
      const ship = order.shippingStatus || shippingOf(order);
      if (ship !== filters.shipping) return false;
    }
    if (filters.courier && filters.courier !== "All") {
      if ((order.courier || "") !== filters.courier) return false;
    }
    if (filters.method && filters.method !== "All") {
      if (order.methodGroup !== filters.method) return false;
    }
    if (filters.attention && filters.attention !== "All") {
      if (!matchesAttention(order, filters.attention)) return false;
    }
    if (!needle) return true;
    const hay = [
      order.id,
      order.brand,
      order.customer,
      order.customerName,
      order.customerPhone,
      order.product,
      order.sku,
      order.awb,
      order.courier,
      ...(order.items || []).map((line) => `${line.product} ${line.sku}`),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

function matchesAttention(order, attention) {
  const pay = paymentOf(order);
  const ful = fulfillmentOf(order);
  const ship = order.shippingStatus || shippingOf(order);
  if (attention === "payment") return ["Failed", "Pending"].includes(pay);
  if (attention === "processing") return ["New", "Processing", "Confirmed"].includes(ful);
  if (attention === "pickup") return ship === "Pickup Scheduled" || (ful === "Ready to Ship" && !order.awb);
  if (attention === "delivery") return ["NDR", "Delivery Failed"].includes(ship);
  if (attention === "failed_ship") return ["NDR", "RTO", "Delivery Failed"].includes(ship);
  if (attention === "admin") return order.needsAttention;
  return true;
}

export function omsSummary(orders) {
  const total = orders.length;
  const counts = Object.fromEntries(SUMMARY_CARDS.map((card) => [card.id, 0]));
  counts.all = total;
  orders.forEach((order) => {
    const ful = fulfillmentOf(order);
    SUMMARY_CARDS.forEach((card) => {
      if (card.fulfillment && ful === card.fulfillment) counts[card.id] += 1;
    });
  });
  return { total, counts };
}

export function sortOmsOrders(orders, sort = "newest") {
  const copy = [...orders];
  if (sort === "attention") {
    return copy.sort((a, b) => Number(b.needsAttention) - Number(a.needsAttention) || String(b.id).localeCompare(String(a.id)));
  }
  if (sort === "oldest") return copy.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  if (sort === "value-high") return copy.sort((a, b) => Number(b.value) - Number(a.value));
  if (sort === "value-low") return copy.sort((a, b) => Number(a.value) - Number(b.value));
  return copy.sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

export function appendTimeline(order, event, detail, actor = "Platform owner") {
  const stamp = new Date();
  const at = `${stamp.getDate()} ${stamp.toLocaleString("en", { month: "short" })} ${stamp.getFullYear()} · ${String(stamp.getHours()).padStart(2, "0")}:${String(stamp.getMinutes()).padStart(2, "0")}`;
  return [...(order.timeline || []), { at, event, detail, actor }];
}

/** Valid OMS actions for current state (Super Admin). */
export function availableActions(order) {
  const ful = fulfillmentOf(order);
  const pay = paymentOf(order);
  const actions = [];
  if (ful === "New" || ful === "Confirmed") {
    if (pay !== "Failed") actions.push({ id: "verify", label: "Verify order" }, { id: "process", label: "Start processing" });
    actions.push({ id: "hold", label: "Put on hold" }, { id: "cancel", label: "Cancel order" });
  }
  if (ful === "Processing") {
    actions.push({ id: "ready", label: "Mark ready to ship" }, { id: "hold", label: "Put on hold" });
  }
  if (ful === "Ready to Ship") {
    actions.push(
      { id: "assign_courier", label: "Assign courier (mock)" },
      { id: "generate_awb", label: "Generate AWB (mock)" },
      { id: "schedule_pickup", label: "Schedule pickup (mock)" },
      { id: "mark_shipped", label: "Confirm pickup → Shipped" },
    );
  }
  if (ful === "Shipped") {
    actions.push({ id: "out_for_delivery", label: "Out for delivery (mock)" }, { id: "deliver", label: "Mark delivered" });
  }
  if (ful === "On Hold") {
    actions.push({ id: "process", label: "Resume processing" }, { id: "cancel", label: "Cancel order" });
  }
  if (ful === "Delivered") {
    actions.push({ id: "return", label: "Initiate return (note)" });
  }
  return actions;
}

export function applyOrderAction(order, actionId, payload = {}) {
  let next = { ...order };
  const note = (event, detail) => {
    next.timeline = appendTimeline(next, event, detail);
  };

  switch (actionId) {
    case "verify":
      next.fulfillmentStatus = "Confirmed";
      next.fulfilment = OMS_TO_LEGACY_FULFILMENT.Confirmed;
      note("Order Verified", "Admin verified order details");
      break;
    case "process":
      next.fulfillmentStatus = "Processing";
      next.fulfilment = OMS_TO_LEGACY_FULFILMENT.Processing;
      note("Processing Started", "Moved to warehouse processing");
      break;
    case "ready":
      next.fulfillmentStatus = "Ready to Ship";
      next.fulfilment = OMS_TO_LEGACY_FULFILMENT["Ready to Ship"];
      next.delivery = "Label ready";
      next.shippingStatus = "Label Generated";
      note("Packed", "Marked ready to ship");
      break;
    case "hold":
      next.fulfillmentStatus = "On Hold";
      next.fulfilment = OMS_TO_LEGACY_FULFILMENT["On Hold"];
      note("On Hold", payload.reason || "Held by admin");
      break;
    case "cancel":
      next.fulfillmentStatus = "Cancelled";
      next.fulfilment = OMS_TO_LEGACY_FULFILMENT.Cancelled;
      note("Cancelled", payload.reason || "Cancelled by admin");
      break;
    case "assign_courier":
      next.courier = payload.courier || "Shiprocket";
      next.pickupLocationId = payload.pickupLocationId || next.pickupLocationId || "WH-01";
      note("Courier Selected", `${next.courier} assigned (mock — no live booking)`);
      break;
    case "generate_awb":
      if (!next.courier) next.courier = "Shiprocket";
      next.awb = next.awb || `MOCK-${next.id.replace(/\D/g, "")}${Math.floor(Math.random() * 90 + 10)}`;
      next.shippingStatus = "Label Generated";
      next.delivery = "Label ready";
      note("AWB Generated", `${next.awb} (mock label — not a live courier AWB)`);
      break;
    case "schedule_pickup":
      next.shippingStatus = "Pickup Scheduled";
      note("Pickup Scheduled", "Pickup window set (mock)");
      break;
    case "mark_shipped":
      next.fulfillmentStatus = "Shipped";
      next.fulfilment = OMS_TO_LEGACY_FULFILMENT.Shipped;
      next.shippingStatus = "Picked Up";
      next.delivery = "In transit";
      note("Picked Up", "Courier pickup confirmed — order marked Shipped");
      break;
    case "out_for_delivery":
      next.shippingStatus = "Out for Delivery";
      note("Out for Delivery", "Courier out for delivery (mock)");
      break;
    case "deliver":
      next.fulfillmentStatus = "Delivered";
      next.fulfilment = OMS_TO_LEGACY_FULFILMENT.Delivered;
      next.shippingStatus = "Delivered";
      next.delivery = "Delivered";
      note("Delivered", "Delivery confirmed");
      break;
    case "return":
      note("Return Workflow", "Return initiation noted — use Returns module for processing");
      break;
    default:
      break;
  }

  // Keep payment independent — never rewrite payment from fulfillment actions
  if (next.paymentStatus) {
    next.payment = OMS_TO_LEGACY_PAYMENT[next.paymentStatus] || next.payment;
  }
  return next;
}

export function bulkActionEligible(orders, actionId) {
  return orders.filter((order) => availableActions(order).some((action) => action.id === actionId));
}

export { ATTENTION_FILTERS };

/** Brand dashboard isolation helper (enforce server-side later). */
export function scopeOrdersForViewer(orders, { role = "super_admin", brandId = null, brandName = null } = {}) {
  if (role === "super_admin") return orders;
  return orders.filter((order) => (brandId && order.brandId === brandId) || (brandName && order.brand === brandName));
}
