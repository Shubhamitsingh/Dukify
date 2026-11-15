import { inr, sum } from "./data";

const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export const ORDER_PERIODS = [
  { id: "all", label: "All dates" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
];

export function parseOrderDate(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const day = Number(parts[0]);
  const month = MONTHS[parts[1]];
  const year = Number(parts[2]);
  if (!day || month == null || !year) return null;
  return new Date(year, month, day);
}

export function sampleToday(orders) {
  const dates = orders.map((order) => parseOrderDate(order.date)).filter(Boolean);
  if (!dates.length) return new Date(2026, 10, 10);
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function inPeriod(order, period, today) {
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
  if (period === "month") {
    return when.getFullYear() === today.getFullYear() && when.getMonth() === today.getMonth();
  }
  return true;
}

export function filterOrders(orders, { period = "all", brand = "All", payment = "All", fulfilment = "All", query = "" } = {}, today) {
  const anchor = today || sampleToday(orders);
  const needle = query.trim().toLowerCase();
  return orders.filter((order) => {
    if (!inPeriod(order, period, anchor)) return false;
    if (brand !== "All" && order.brand !== brand) return false;
    if (payment !== "All" && order.payment !== payment) return false;
    if (fulfilment !== "All" && order.fulfilment !== fulfilment) return false;
    if (!needle) return true;
    const haystack = [order.id, order.brand, order.customer, order.product, order.sku, order.payment, order.fulfilment, order.date, order.partner]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

function countStatus(orders, name) {
  return orders.filter((order) => order.fulfilment === name).length;
}

export function orderSummary(orders, brands, periodOrders) {
  const activeBrands = brands.filter((brand) => brand.status === "Active").length;
  const brandsWithOrders = new Set(periodOrders.map((order) => order.brand)).size;
  const processing = periodOrders.filter((order) => ["Packing", "Ready to ship"].includes(order.fulfilment)).length;
  return {
    received: periodOrders.length,
    activeBrands,
    brandsWithOrders,
    brandsWithZero: Math.max(0, brands.length - brandsWithOrders),
    pending: countStatus(periodOrders, "Confirmed"),
    confirmed: countStatus(periodOrders, "Confirmed"),
    processing,
    packed: countStatus(periodOrders, "Ready to ship"),
    shipped: countStatus(periodOrders, "Shipped"),
    delivered: countStatus(periodOrders, "Delivered"),
    cancelled: countStatus(periodOrders, "Cancelled"),
    returned: countStatus(periodOrders, "Returned") + countStatus(periodOrders, "Payment failed"),
    returnsOnly: countStatus(periodOrders, "Returned"),
    failedPay: countStatus(periodOrders, "Payment failed"),
    salesValue: sum(
      periodOrders.filter((order) => order.payment !== "Failed"),
      "value",
    ),
  };
}

export function brandOrderMatrix(brands, allOrders, periodOrders, today) {
  const anchor = today || sampleToday(allOrders);
  const todayOrders = filterOrders(allOrders, { period: "today" }, anchor);
  const rows = brands.map((brand) => {
    const inPeriod = periodOrders.filter((order) => order.brand === brand.name);
    const allTime = allOrders.filter((order) => order.brand === brand.name);
    const todayCount = todayOrders.filter((order) => order.brand === brand.name).length;
    return {
      id: brand.id,
      name: brand.name,
      status: brand.status,
      today: todayCount,
      total: allTime.length,
      period: inPeriod.length,
      pending: countStatus(inPeriod, "Confirmed"),
      processing: inPeriod.filter((order) => ["Packing", "Ready to ship"].includes(order.fulfilment)).length,
      shipped: countStatus(inPeriod, "Shipped"),
      delivered: countStatus(inPeriod, "Delivered"),
      cancelled: countStatus(inPeriod, "Cancelled"),
      returned: countStatus(inPeriod, "Returned"),
      sales: sum(
        inPeriod.filter((order) => order.payment !== "Failed"),
        "value",
      ),
    };
  });
  rows.sort((left, right) => right.period - left.period || right.total - left.total || left.name.localeCompare(right.name));
  const totals = rows.reduce(
    (bag, row) => ({
      today: bag.today + row.today,
      total: bag.total + row.total,
      period: bag.period + row.period,
      pending: bag.pending + row.pending,
      processing: bag.processing + row.processing,
      shipped: bag.shipped + row.shipped,
      delivered: bag.delivered + row.delivered,
      cancelled: bag.cancelled + row.cancelled,
      returned: bag.returned + row.returned,
      sales: bag.sales + row.sales,
    }),
    { today: 0, total: 0, period: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0, sales: 0 },
  );
  return { rows, totals };
}

export function brandOrderPerformance(brandName, orders) {
  const brandOrders = orders.filter((order) => order.brand === brandName);
  const today = sampleToday(orders);
  const inRange = (period) => filterOrders(brandOrders, { period }, today);
  const live = brandOrders.filter((order) => order.payment !== "Failed");
  const revenue = sum(live, "value");
  const customers = new Set(brandOrders.map((order) => order.customer).filter(Boolean)).size;
  const products = Object.values(
    brandOrders.reduce((bag, order) => {
      const key = order.product || "Unknown";
      const row = bag[key] || { product: key, orders: 0, qty: 0, sales: 0 };
      row.orders += 1;
      row.qty += Number(order.qty) || 0;
      if (order.payment !== "Failed") row.sales += Number(order.value) || 0;
      bag[key] = row;
      return bag;
    }, {}),
  )
    .sort((left, right) => right.sales - left.sales)
    .slice(0, 5);

  return {
    total: brandOrders.length,
    today: inRange("today").length,
    yesterday: inRange("yesterday").length,
    week: inRange("7d").length,
    month: inRange("month").length,
    pending: countStatus(brandOrders, "Confirmed"),
    processing: brandOrders.filter((order) => ["Packing", "Ready to ship"].includes(order.fulfilment)).length,
    shipped: countStatus(brandOrders, "Shipped"),
    delivered: countStatus(brandOrders, "Delivered"),
    cancelled: countStatus(brandOrders, "Cancelled"),
    returned: countStatus(brandOrders, "Returned"),
    revenue,
    aov: live.length ? Math.round(revenue / live.length) : 0,
    customers,
    products,
  };
}

export function formatSampleDay(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function money(value) {
  return inr(value);
}
