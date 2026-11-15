/**
 * Focused Node tests for commerce selectors, OMS summary mapping, and role path rules.
 * Logic is inlined to avoid Vite-style extensionless imports under plain Node.
 * Keep assertions aligned with src/commerce/metrics.js, src/auth.js, src/orders/constants.js.
 * Run: npm test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function isFailedPayment(order) {
  return order.payment === "Failed" || order.paymentStatus === "Failed";
}

function isCancelledOrder(order) {
  return order.fulfilment === "Cancelled" || order.fulfillmentStatus === "Cancelled";
}

function isRefunded(order) {
  const pay = order.paymentStatus || order.payment;
  return pay === "Refunded" || pay === "Partially Refunded" || order.payment === "Refunded";
}

function isBookedSalesOrder(order) {
  if (isFailedPayment(order) || isCancelledOrder(order) || isRefunded(order)) return false;
  return true;
}

function isLiveOrder(order) {
  return !isFailedPayment(order);
}

function sum(rows, key) {
  return rows.reduce((n, row) => n + (Number(row[key]) || 0), 0);
}

function commerceSnapshot(db) {
  const orders = db.orders || [];
  const liveOrders = orders.filter(isLiveOrder);
  const bookedOrders = orders.filter(isBookedSalesOrder);
  return {
    totalOrders: orders.length,
    liveOrders: liveOrders.length,
    bookedOrders: bookedOrders.length,
    bookedSales: sum(bookedOrders, "value"),
  };
}

const ROLES = { SUPER_ADMIN: "super_admin", BRAND_ADMIN: "brand_admin", BRAND_STAFF: "brand_staff" };

function isBrandWorkspacePath(pathname) {
  const path = pathname || "/";
  return path === "/brand" || path.startsWith("/brand/");
}

function canAccessPath(session, pathname) {
  if (!session) return false;
  const path = pathname || "/";
  if (session.role === ROLES.BRAND_ADMIN || session.role === ROLES.BRAND_STAFF) {
    return path === "/login" || isBrandWorkspacePath(path);
  }
  if (session.role === ROLES.SUPER_ADMIN) {
    return !isBrandWorkspacePath(path);
  }
  return false;
}

function isAssignedBrand(session, brandId) {
  if (!session || (session.role !== ROLES.BRAND_ADMIN && session.role !== ROLES.BRAND_STAFF)) return false;
  return session.brandId === brandId;
}

function scopeOrdersForViewer(orders, { role = "super_admin", brandId = null, brandName = null } = {}) {
  if (role === "super_admin") return orders;
  return orders.filter((order) => (brandId && order.brandId === brandId) || (brandName && order.brand === brandName));
}

describe("auth path boundaries", () => {
  it("blocks brand roles from super-admin paths", () => {
    const session = { email: "a@b.test", role: ROLES.BRAND_ADMIN, brandId: "brand-k" };
    assert.equal(canAccessPath(session, "/dashboard"), false);
    assert.equal(canAccessPath(session, "/brands"), false);
    assert.equal(canAccessPath(session, "/brand/orders/all"), true);
  });

  it("blocks super admin from brand workspace paths", () => {
    const session = { email: "owner@pahachan.example", role: ROLES.SUPER_ADMIN };
    assert.equal(canAccessPath(session, "/brand/dashboard/overview"), false);
    assert.equal(canAccessPath(session, "/dashboard"), true);
    assert.equal(canAccessPath(session, "/brands"), true);
  });

  it("scopes assigned brand membership", () => {
    const session = { email: "a@b.test", role: ROLES.BRAND_ADMIN, brandId: "brand-k" };
    assert.equal(isAssignedBrand(session, "brand-k"), true);
    assert.equal(isAssignedBrand(session, "aura-loom"), false);
  });
});

describe("commerce snapshot consistency", () => {
  const db = {
    orders: [
      { id: "1", value: 1000, payment: "Captured", fulfilment: "Delivered", brand: "Brand K" },
      { id: "2", value: 500, payment: "Failed", fulfilment: "Payment failed", brand: "Brand K" },
      { id: "3", value: 800, payment: "Captured", fulfilment: "Cancelled", brand: "Aura" },
      { id: "4", value: 200, payment: "Refunded", fulfilment: "Returned", brand: "Brand K" },
      { id: "5", value: 1500, payment: "COD pending", fulfilment: "Shipped", brand: "Brand K" },
    ],
  };

  it("booked GMV excludes failed, cancelled, refunded", () => {
    assert.equal(isBookedSalesOrder(db.orders[0]), true);
    assert.equal(isBookedSalesOrder(db.orders[1]), false);
    assert.equal(isBookedSalesOrder(db.orders[2]), false);
    assert.equal(isBookedSalesOrder(db.orders[3]), false);
    assert.equal(isBookedSalesOrder(db.orders[4]), true);
    const snap = commerceSnapshot(db);
    assert.equal(snap.bookedSales, 2500);
    assert.equal(snap.bookedOrders, 2);
    assert.equal(snap.totalOrders, 5);
    assert.equal(snap.liveOrders, 4);
  });

  it("live orders exclude payment-failed only", () => {
    assert.equal(isLiveOrder(db.orders[1]), false);
    assert.equal(isLiveOrder(db.orders[2]), true);
  });
});

describe("OMS summary cards + tenant scope", () => {
  it("SUMMARY_CARDS uses fulfillment key (source file)", () => {
    const source = readFileSync(join(root, "src/orders/constants.js"), "utf8");
    assert.match(source, /fulfillment:\s*"New"/);
    assert.doesNotMatch(source, /fulfilment:\s*"New"/);
    assert.match(source, /fulfillment:\s*null/);
  });

  it("SuperAdminApp registers /brands before catch-all", () => {
    const source = readFileSync(join(root, "src/SuperAdminApp.jsx"), "utf8");
    const brandsIdx = source.indexOf('path="/brands"');
    const starIdx = source.indexOf('path="*"');
    assert.ok(brandsIdx > 0);
    assert.ok(starIdx > brandsIdx);
  });

  it("scopes brand viewer away from other tenants", () => {
    const orders = [
      { id: "1", brandId: "brand-k", brand: "Brand K" },
      { id: "2", brandId: "aura-loom", brand: "Aura Loom" },
    ];
    const scoped = scopeOrdersForViewer(orders, { role: "brand_admin", brandId: "brand-k", brandName: "Brand K" });
    assert.equal(scoped.length, 1);
    assert.equal(scoped[0].id, "1");
  });
});
