export const ANCHOR = "2026-11-11";

export const RANGE_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "custom", label: "Custom range" },
];

const PENDING = new Set(["New", "Confirmed", "Processing", "Packed"]);

export function addDays(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function inRange(date, bounds) {
  return date >= bounds.start && date <= bounds.end;
}

export function boundsFor(key, custom = {}) {
  if (key === "today") return { start: ANCHOR, end: ANCHOR, label: "Today" };
  if (key === "yesterday") {
    const day = addDays(ANCHOR, -1);
    return { start: day, end: day, label: "Yesterday" };
  }
  if (key === "last7") return { start: addDays(ANCHOR, -6), end: ANCHOR, label: "Last 7 days" };
  if (key === "last30") return { start: addDays(ANCHOR, -29), end: ANCHOR, label: "Last 30 days" };
  if (key === "thisMonth") return { start: "2026-11-01", end: ANCHOR, label: "This month" };
  if (key === "lastMonth") return { start: "2026-10-01", end: "2026-10-31", label: "Last month" };
  if (key === "custom" && custom.start && custom.end) {
    const start = custom.start <= custom.end ? custom.start : custom.end;
    const end = custom.start <= custom.end ? custom.end : custom.start;
    return { start, end, label: "Custom range" };
  }
  return { start: "2026-09-01", end: ANCHOR, label: "All demo dates" };
}

export function previousBounds(current) {
  const start = new Date(current.start);
  const end = new Date(current.end);
  const days = Math.round((end - start) / 86400000) + 1;
  const prevEnd = addDays(current.start, -1);
  return { start: addDays(prevEnd, -(days - 1)), end: prevEnd, label: "Previous period" };
}

export function inr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
}

export function formatDate(iso) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function delta(current, previous) {
  if (previous == null) return null;
  const pct = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
  return { up: pct >= 0, label: `${pct >= 0 ? "+" : ""}${pct}%` };
}

export function quoteOrder(order, brand) {
  const amount = order.retailUnit * order.qty - order.discount;
  const grossMargin = (order.retailUnit - order.supplyUnit) * order.qty - order.discount;
  const commission = Math.round(amount * brand.commissionRate);
  const gateway = Math.round(amount * brand.gatewayRate);
  const shipped = ["Shipped", "Delivered", "Return requested"].includes(order.status);
  const shipping = shipped ? brand.shippingShare : 0;
  const refund = order.paymentStatus === "Refunded" || order.status === "Return requested";
  const cancelled = order.status === "Cancelled" || order.paymentStatus === "Failed";
  const estimated = cancelled || refund ? 0 : Math.max(0, grossMargin - commission - gateway - shipping);
  const payable = order.status === "Delivered" && order.paymentStatus === "Paid" ? estimated : 0;
  return { amount, grossMargin, commission, gateway, shipping, estimated, payable, refund, cancelled };
}

export function withQuote(orders, brand) {
  return orders.map((order) => ({ ...order, quote: quoteOrder(order, brand) }));
}

function fold(quoted) {
  const active = quoted.filter((order) => !order.quote.cancelled);
  return {
    orders: quoted.length,
    sales: active.reduce((sum, order) => sum + order.quote.amount, 0),
    earnings: active.reduce((sum, order) => sum + order.quote.estimated, 0),
    margin: active.reduce((sum, order) => sum + Math.max(0, order.quote.grossMargin), 0),
    commission: active.reduce((sum, order) => sum + order.quote.commission, 0),
    deductions: active.reduce((sum, order) => sum + order.quote.gateway + order.quote.shipping, 0),
    refunds: quoted.filter((order) => order.quote.refund).reduce((sum, order) => sum + Math.max(0, order.quote.grossMargin), 0),
    payable: quoted.reduce((sum, order) => sum + order.quote.payable, 0),
    pending: quoted.filter((order) => PENDING.has(order.status)).length,
  };
}

export function summarize(orders, brand, rangeKey, custom) {
  const bounds = boundsFor(rangeKey, custom);
  const previous = previousBounds(bounds);
  const quoted = withQuote(orders, brand);
  const currentRows = quoted.filter((order) => inRange(order.date, bounds));
  const previousRows = quoted.filter((order) => inRange(order.date, previous));
  return {
    bounds,
    previous,
    current: fold(currentRows),
    prior: fold(previousRows),
    rows: currentRows,
  };
}

export function dailySeries(orders, brand, bounds) {
  const quoted = withQuote(orders, brand).filter((order) => inRange(order.date, bounds) && !order.quote.cancelled);
  const days = [];
  let cursor = bounds.start;
  while (cursor <= bounds.end) {
    const rows = quoted.filter((order) => order.date === cursor);
    days.push({
      date: cursor,
      label: formatDate(cursor).replace(/ 2026/, ""),
      sales: rows.reduce((sum, order) => sum + order.quote.amount, 0),
      orders: rows.length,
      earnings: rows.reduce((sum, order) => sum + order.quote.estimated, 0),
    });
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function statusCounts(orders) {
  const statuses = ["New", "Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Return requested"];
  return statuses.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
}

export function topProducts(orders, products, limit = 5) {
  const map = new Map();
  orders
    .filter((order) => order.status !== "Cancelled")
    .forEach((order) => {
      const current = map.get(order.productId) || { units: 0, sales: 0 };
      current.units += order.qty;
      current.sales += order.retailUnit * order.qty - order.discount;
      map.set(order.productId, current);
    });
  return [...map.entries()]
    .map(([productId, stats]) => ({
      ...stats,
      product: products.find((product) => product.id === productId),
    }))
    .filter((row) => row.product)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

export function customerStats(customers, orders) {
  return customers
    .map((customer) => {
      const rows = orders.filter((order) => order.customerId === customer.id && order.status !== "Cancelled");
      const spend = rows.reduce((sum, order) => sum + order.retailUnit * order.qty - order.discount, 0);
      const last = rows.map((order) => order.date).sort().at(-1) || null;
      return { ...customer, orderCount: rows.length, spend, lastPurchase: last, returning: rows.length > 1 };
    })
    .sort((a, b) => b.spend - a.spend);
}

export function trafficTotals(traffic, bounds) {
  const rows = traffic.filter((row) => inRange(row.date, bounds));
  return rows.reduce(
    (sum, row) => ({
      visits: sum.visits + row.visits,
      views: sum.views + row.views,
      carts: sum.carts + row.carts,
    }),
    { visits: 0, views: 0, carts: 0 },
  );
}

export function settlementBooks(orders, brand) {
  const quoted = withQuote(orders, brand);
  const completed = quoted.filter((order) => order.quote.payable > 0 && order.date < "2026-11-01");
  const pending = quoted.filter((order) => order.quote.payable > 0 && order.date >= "2026-11-01");
  const months = new Map();
  completed.forEach((order) => {
    const key = order.date.slice(0, 7);
    const bucket = months.get(key) || { month: key, orders: 0, sales: 0, payable: 0 };
    bucket.orders += 1;
    bucket.sales += order.quote.amount;
    bucket.payable += order.quote.payable;
    months.set(key, bucket);
  });
  return {
    completed,
    pending,
    history: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)),
    completedTotal: completed.reduce((sum, order) => sum + order.quote.payable, 0),
    pendingTotal: pending.reduce((sum, order) => sum + order.quote.payable, 0),
  };
}

export function priceError(product, retail, promo) {
  const retailValue = Number(retail);
  const promoValue = promo === "" || promo == null ? null : Number(promo);
  if (!Number.isFinite(retailValue) || retailValue <= 0) return "Enter a retail price.";
  if (retailValue < product.supplyPrice) return `Retail price must stay at or above the supply price of ${inr(product.supplyPrice)}.`;
  if (retailValue > product.mrp) return `Retail price cannot exceed MRP ${inr(product.mrp)}.`;
  if (promoValue != null) {
    if (!Number.isFinite(promoValue) || promoValue <= 0) return "Enter a valid promotional price.";
    if (promoValue >= retailValue) return "Promotional price must be below the retail price.";
    if (promoValue < product.supplyPrice) return "Promotional price cannot fall below the supply price.";
  }
  return "";
}

export function greeting(name) {
  const hour = new Date().getHours();
  const when = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return { when, name };
}
