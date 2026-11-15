import { parseOrderDate, sampleToday, formatSampleDay } from "../orderDesk";
import { fulfillmentOf, paymentOf } from "../orders/model";

export const REPORT_PERIODS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "month", label: "This Month" },
  { id: "custom", label: "Custom Range" },
];

export const DEFAULT_REPORT_FILTERS = {
  period: "30d",
  brand: "All",
  customFrom: "",
  customTo: "",
};

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function inReportPeriod(order, { period, customFrom, customTo }, today) {
  const when = parseOrderDate(order.date);
  if (!when) return false;
  const day = startOfDay(when).getTime();
  const end = startOfDay(today).getTime();

  if (period === "today") return day === end;
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
  if (period === "custom") {
    if (!customFrom && !customTo) return true;
    const from = customFrom ? startOfDay(new Date(customFrom)).getTime() : -Infinity;
    const to = customTo ? startOfDay(new Date(customTo)).getTime() : Infinity;
    return day >= from && day <= to;
  }
  return true;
}

export function isFailedPayment(order) {
  const pay = paymentOf(order);
  return pay === "Failed" || order.payment === "Failed";
}

export function isCancelled(order) {
  const ful = fulfillmentOf(order);
  return ful === "Cancelled" || order.fulfilment === "Cancelled";
}

export function isRefunded(order) {
  const pay = paymentOf(order);
  return pay === "Refunded" || pay === "Partially Refunded" || order.payment === "Refunded";
}

/** Prepaid or courier-confirmed COD (Captured / Paid). COD pending is not paid yet. */
export function isPaidOrder(order) {
  if (isFailedPayment(order) || isRefunded(order) || isCancelled(order)) return false;
  const pay = paymentOf(order);
  return pay === "Paid" || order.payment === "Captured";
}

/**
 * Successful sales GMV candidates: exclude failed, cancelled, refunded.
 * COD pending still counts as booked order value (not cash collected).
 */
export function isGrossSalesOrder(order) {
  if (isFailedPayment(order) || isCancelled(order) || isRefunded(order)) return false;
  return true;
}

export function isDelivered(order) {
  const ful = fulfillmentOf(order);
  return ful === "Delivered" || order.fulfilment === "Delivered";
}

/** Prefer line-item supply at order time; fall back to order.supply — never catalog product.supply. */
export function orderSupplyCost(order) {
  if (Array.isArray(order.items) && order.items.length) {
    return order.items.reduce((total, item) => total + (Number(item.supply) || 0) * (Number(item.qty) || 1), 0);
  }
  return Number(order.supply) || 0;
}

export function orderUnits(order) {
  if (Array.isArray(order.items) && order.items.length) {
    return order.items.reduce((total, item) => total + (Number(item.qty) || 0), 0);
  }
  return Number(order.qty) || 0;
}

export function filterReportOrders(orders, filters, today) {
  const anchor = today || sampleToday(orders);
  const brand = filters.brand || "All";
  return orders.filter((order) => {
    if (!inReportPeriod(order, filters, anchor)) return false;
    if (brand !== "All" && order.brand !== brand) return false;
    return true;
  });
}

export function reportSummary(db, scopedOrders, filters = DEFAULT_REPORT_FILTERS) {
  const brandFiltered = filters.brand && filters.brand !== "All";
  const totalBrands = brandFiltered ? 1 : (db.brands || []).length;
  const totalProducts = brandFiltered
    ? new Set(scopedOrders.map((order) => order.product).filter(Boolean)).size ||
      (db.products || []).length
    : (db.products || []).length;
  const totalOrders = scopedOrders.length;
  const paidOrders = scopedOrders.filter(isPaidOrder).length;
  const gross = scopedOrders.filter(isGrossSalesOrder);
  const grossSales = gross.reduce((n, order) => n + (Number(order.value) || 0), 0);
  const refunds = scopedOrders.filter(isRefunded).reduce((n, order) => n + (Number(order.value) || 0), 0);

  return {
    totalBrands,
    totalProducts,
    totalOrders,
    paidOrders,
    grossSales,
    refunds,
  };
}

export function buildSalesTrend(scopedOrders, today) {
  const dated = scopedOrders
    .map((order) => ({ order, when: parseOrderDate(order.date) }))
    .filter((row) => row.when);
  if (!dated.length) {
    const anchor = today || new Date();
    return [
      {
        date: formatSampleDay(anchor),
        when: startOfDay(anchor),
        sales: 0,
        orderCount: 0,
      },
    ];
  }

  const start = startOfDay(new Date(Math.min(...dated.map((row) => row.when.getTime()))));
  const end = startOfDay(new Date(Math.max(...dated.map((row) => row.when.getTime()))));
  const byKey = {};

  dated.forEach(({ order, when }) => {
    const key = formatSampleDay(when);
    const bucket = byKey[key] || { date: key, when: startOfDay(when), sales: 0, orderCount: 0 };
    bucket.orderCount += 1;
    if (isGrossSalesOrder(order)) bucket.sales += Number(order.value) || 0;
    byKey[key] = bucket;
  });

  const days = [];
  for (let cursor = new Date(start); cursor.getTime() <= end.getTime(); cursor.setDate(cursor.getDate() + 1)) {
    const key = formatSampleDay(cursor);
    days.push(
      byKey[key] || {
        date: key,
        when: startOfDay(cursor),
        sales: 0,
        orderCount: 0,
      },
    );
  }
  return days;
}

export function brandSalesRows(db, scopedOrders) {
  return (db.brands || [])
    .map((brand) => {
      const orders = scopedOrders.filter((order) => order.brand === brand.name);
      const gross = orders.filter(isGrossSalesOrder);
      const grossSales = gross.reduce((n, order) => n + (Number(order.value) || 0), 0);
      const deliveredOrders = orders.filter(isDelivered).length;
      const aov = gross.length ? grossSales / gross.length : 0;
      return {
        id: brand.id,
        brand: brand.name,
        partner: brand.partner,
        status: brand.status,
        totalOrders: orders.length,
        deliveredOrders,
        grossSales,
        aov,
        orders,
        grossOrders: gross,
      };
    })
    .filter((row) => row.totalOrders > 0)
    .sort((a, b) => b.grossSales - a.grossSales || a.brand.localeCompare(b.brand));
}

export function productSalesRows(db, scopedOrders) {
  const byProduct = {};

  scopedOrders.filter(isGrossSalesOrder).forEach((order) => {
    const lines =
      Array.isArray(order.items) && order.items.length
        ? order.items.map((item) => ({
            product: item.product || order.product,
            units: Number(item.qty) || 0,
            sales: Number(item.value) || 0,
            supply: (Number(item.supply) || 0) * (Number(item.qty) || 1),
          }))
        : [
            {
              product: order.product,
              units: orderUnits(order),
              sales: Number(order.value) || 0,
              supply: orderSupplyCost(order),
            },
          ];

    lines.forEach((line) => {
      const key = line.product || "Unknown";
      const catalog = (db.products || []).find((product) => product.name === key);
      const row = byProduct[key] || {
        product: key,
        brand: order.brand,
        sku: catalog?.sku || order.sku || "—",
        unitsSold: 0,
        grossSales: 0,
        supplyCost: 0,
        orderIds: new Set(),
      };
      // If product appears under multiple brands in range, keep first seen brand label + note via brand set
      if (!row._brands) row._brands = new Set();
      row._brands.add(order.brand);
      row.brand = row._brands.size === 1 ? order.brand : "Multiple";
      row.unitsSold += line.units;
      row.grossSales += line.sales;
      row.supplyCost += line.supply;
      row.orderIds.add(order.id);
      byProduct[key] = row;
    });
  });

  return Object.values(byProduct)
    .map((row) => {
      const { _brands, orderIds, ...rest } = row;
      return {
        ...rest,
        grossMargin: rest.grossSales - rest.supplyCost,
        orderCount: orderIds.size,
        brands: [...(_brands || [])],
      };
    })
    .sort((a, b) => b.grossSales - a.grossSales || a.product.localeCompare(b.product));
}

export function partnerMarginRows(db, scopedOrders) {
  const shipments = db.shipments || [];
  const brands = db.brands || [];

  return brands
    .map((brand) => {
      const orders = scopedOrders.filter((order) => order.brand === brand.name && isGrossSalesOrder(order));
      if (!orders.length) return null;

      const orderValue = orders.reduce((n, order) => n + (Number(order.value) || 0), 0);
      const supplyCost = orders.reduce((n, order) => n + orderSupplyCost(order), 0);
      const platformCommission = orderValue - supplyCost;
      const orderIds = new Set(orders.map((order) => order.id));
      const otherDeductions = shipments
        .filter((shipment) => orderIds.has(shipment.order))
        .reduce((n, shipment) => n + (Number(shipment.charge) || 0), 0);
      const estimatedBrandPayable = Math.max(0, supplyCost - otherDeductions);
      const platformGrossMargin = platformCommission - otherDeductions;

      return {
        brand: brand.name,
        partner: brand.partner,
        orderValue,
        supplyCost,
        platformCommission,
        otherDeductions,
        estimatedBrandPayable,
        platformGrossMargin,
        orderCount: orders.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.orderValue - a.orderValue || a.brand.localeCompare(b.brand));
}

export function sortRows(rows, key, dir = "desc") {
  const factor = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
    return String(left ?? "").localeCompare(String(right ?? "")) * factor;
  });
}

export function paginate(rows, page, pageSize) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    page: safePage,
    pages,
    total,
  };
}
