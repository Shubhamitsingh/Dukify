/**
 * Shared Super Admin commerce selectors — one definition for dashboard / finance / reports labels.
 * Demo-only calculations over in-memory seed data. Not production accounting.
 */

import { inr, sum } from "../data";
import { isGrossSalesOrder, orderSupplyCost } from "../reports/model";

export function isFailedPayment(order) {
  return order.payment === "Failed" || order.paymentStatus === "Failed";
}

export function isCancelledOrder(order) {
  return order.fulfilment === "Cancelled" || order.fulfillmentStatus === "Cancelled";
}

/** Booked GMV: exclude payment-failed (and cancelled) — matches Reports gross sales intent. */
export function isBookedSalesOrder(order) {
  return isGrossSalesOrder(order);
}

/** Live order count used on Ops dashboard: exclude payment-failed only (cancelled still listed). */
export function isLiveOrder(order) {
  return !isFailedPayment(order);
}

export function commerceSnapshot(db) {
  const orders = db.orders || [];
  const totalOrders = orders.length;
  const liveOrders = orders.filter(isLiveOrder);
  const bookedOrders = orders.filter(isBookedSalesOrder);
  const paidOrders = orders.filter(
    (order) => order.payment === "Captured" || order.payment === "COD pending" || order.paymentStatus === "Paid" || order.paymentStatus === "COD",
  );

  const bookedSales = sum(bookedOrders, "value");
  const liveSales = sum(liveOrders, "value");
  const paidSales = sum(paidOrders, "value");
  const supplyOnPaid = paidOrders.reduce((n, order) => n + orderSupplyCost(order), 0);
  const grossMarginOnPaid = paidSales - supplyOnPaid;
  const failedCount = orders.filter(isFailedPayment).length;
  const cancelledCount = orders.filter(isCancelledOrder).length;

  return {
    totalOrders,
    liveOrders: liveOrders.length,
    bookedOrders: bookedOrders.length,
    failedCount,
    cancelledCount,
    /** Alias: dashboard “Revenue” = booked GMV (failed + cancelled + refunded excluded via isGrossSalesOrder). */
    bookedSales,
    liveSales,
    paidSales,
    grossMarginOnPaid,
    supplyOnPaid,
    labels: {
      bookedSales: "Booked GMV",
      bookedSalesNote: "Excludes failed, cancelled & refunded",
      liveOrders: "Live orders",
      liveOrdersNote: `${failedCount} payment-failed excluded`,
      totalOrders: "All orders",
      grossMargin: "Gross margin (paid)",
      grossMarginNote: "Paid collections − supply cost",
    },
    format: { inr },
  };
}

export function brandOrderStats(db) {
  return (db.brands || []).map((brand) => {
    const orders = (db.orders || []).filter((order) => order.brand === brand.name && isBookedSalesOrder(order));
    return {
      ...brand,
      orders: orders.length,
      sales: sum(orders, "value"),
    };
  });
}
