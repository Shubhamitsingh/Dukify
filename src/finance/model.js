import { isBookedSalesOrder } from "../commerce/metrics";
import { inr, sum } from "../data";

const EXPENSE_CATEGORY = {
  Courier: "Courier",
  Packaging: "Packaging",
  Warehouse: "Warehouse",
  Gateway: "Payment gateway",
  Marketing: "Marketing",
  "Product sourcing": "Other",
  Refunds: "Other",
  Other: "Other",
};

export const FINANCE_TABS = [
  { id: "collections", label: "Collections & Payments" },
  { id: "settlements", label: "Brand Settlements" },
  { id: "expenses", label: "Expenses" },
  { id: "refunds", label: "Refunds & Adjustments" },
];

export const TX_TYPES = [
  "All",
  "Prepaid Collection",
  "COD Collection",
  "Pending COD",
  "Pending Collection",
  "Failed Payment",
  "Gateway Fee",
  "Brand Settlement",
  "Expense",
  "Refund Pending",
  "Refund Completed",
  "Chargeback",
  "RTO Adjustment",
];

/** Map expense head → display category for expense tab. */
export function expenseCategory(head) {
  return EXPENSE_CATEGORY[head] || "Other";
}

function orderBrand(db, orderId) {
  return db.orders.find((row) => row.id === orderId)?.brand || "—";
}

function orderDate(db, orderId) {
  return db.orders.find((row) => row.id === orderId)?.date || "—";
}

/**
 * Unified finance ledger from shared orders / payments / expenses / settlements / returns.
 * Sales ≠ collections; COD Pending is not collected; refunds stay separate.
 */
export function buildFinanceLedger(db) {
  const rows = [];

  (db.payments || []).forEach((pay) => {
    const brand = orderBrand(db, pay.order);
    const date = orderDate(db, pay.order);
    const isCod = pay.method === "COD";
    let type = "Prepaid Collection";
    if (pay.status === "Failed") type = "Failed Payment";
    else if (pay.status === "Refunded") type = "Refund Completed";
    else if (isCod && pay.status === "Captured") type = "COD Collection";
    else if (isCod && (pay.status === "Pending" || pay.status === "COD pending")) type = "Pending COD";
    else if (!isCod && pay.status === "Pending") type = "Pending Collection";
    else if (!isCod && pay.status === "Captured") type = "Prepaid Collection";

    rows.push({
      id: pay.id,
      date,
      brand,
      orderId: pay.order || "—",
      type,
      method: pay.method,
      amount: Number(pay.amount) || 0,
      status: pay.status,
      source: "payments",
      note: pay.reference || "",
    });
  });

  (db.expenses || []).forEach((exp) => {
    const category = expenseCategory(exp.head);
    const type = exp.head === "Gateway" ? "Gateway Fee" : "Expense";
    rows.push({
      id: exp.id,
      date: exp.month || "—",
      brand: "Platform",
      orderId: "—",
      type,
      method: "Ledger",
      amount: Number(exp.amount) || 0,
      status: "Posted",
      source: "expenses",
      note: exp.note || "",
      head: exp.head,
      category,
      month: exp.month,
    });
  });

  (db.settlements || []).forEach((set) => {
    const brand =
      db.brands.find((b) => b.partner === set.partner)?.name ||
      db.partners.find((p) => p.name === set.partner)?.brand ||
      set.partner;
    rows.push({
      id: set.id,
      date: set.date || "—",
      brand,
      orderId: "—",
      type: "Brand Settlement",
      method: "Settlement",
      amount: Number(set.supply) || 0,
      status: set.status,
      source: "settlements",
      note: `Sales ${inr(set.sales)} · Margin ${inr(set.margin)} · Adj ${inr(set.adjustments)}`,
      sales: Number(set.sales) || 0,
      supply: Number(set.supply) || 0,
      margin: Number(set.margin) || 0,
      adjustments: Number(set.adjustments) || 0,
      partner: set.partner,
    });
  });

  (db.returns || []).forEach((ret) => {
    const pending = ["Pending approval", "Inspection"].includes(ret.status);
    const completed = ret.status === "Refunded";
    const rtoLike = /rto|refused|return/i.test(`${ret.reason} ${ret.status}`);
    if (pending) {
      rows.push({
        id: `${ret.id}-pending`,
        date: "—",
        brand: ret.brand || "—",
        orderId: ret.order || "—",
        type: "Refund Pending",
        method: "Refund",
        amount: Number(ret.refund) || 0,
        status: ret.status,
        source: "returns",
        note: ret.reason || "",
      });
    } else if (completed) {
      // Prefer payment Refunded row; still show RTO adjustment if needed
      if (rtoLike) {
        rows.push({
          id: `${ret.id}-rto`,
          date: "—",
          brand: ret.brand || "—",
          orderId: ret.order || "—",
          type: "RTO Adjustment",
          method: "Adjustment",
          amount: Number(ret.refund) || 0,
          status: ret.status,
          source: "returns",
          note: ret.reason || "",
        });
      }
    } else if (ret.status === "Rejected") {
      /* skip */
    } else {
      rows.push({
        id: `${ret.id}-adj`,
        date: "—",
        brand: ret.brand || "—",
        orderId: ret.order || "—",
        type: "RTO Adjustment",
        method: "Adjustment",
        amount: Number(ret.refund) || 0,
        status: ret.status,
        source: "returns",
        note: ret.reason || "",
      });
    }
  });

  return rows;
}

export function financeSummary(db, brand = "All") {
  const orders = (db.orders || []).filter((order) => brand === "All" || order.brand === brand);
  const payments = (db.payments || []).filter((pay) => {
    if (brand === "All") return true;
    return orderBrand(db, pay.order) === brand;
  });
  const expenses = db.expenses || [];
  const settlements = (db.settlements || []).filter((set) => {
    if (brand === "All") return true;
    const name =
      db.brands.find((b) => b.partner === set.partner)?.name ||
      db.partners.find((p) => p.name === set.partner)?.brand ||
      set.partner;
    return name === brand || set.partner === brand;
  });

  // Booked GMV — same selector as Reports / dashboard (isBookedSalesOrder).
  // Not the same as cash collections below.
  const totalSales = sum(orders.filter(isBookedSalesOrder), "value");

  const prepaidCollections = sum(
    payments.filter((pay) => pay.status === "Captured" && pay.method !== "COD"),
    "amount",
  );

  // COD collected only when status Captured (courier-confirmed). Pending COD excluded.
  const codCollections = sum(
    payments.filter((pay) => pay.status === "Captured" && pay.method === "COD"),
    "amount",
  );

  const refunds = sum(
    payments.filter((pay) => pay.status === "Refunded"),
    "amount",
  );

  const brandPayables = settlements
    .filter((set) => ["Pending", "Approved", "On hold"].includes(set.status))
    .reduce((total, set) => total + (Number(set.supply) || 0) - (Number(set.adjustments) || 0), 0);

  // Platform operating expenses — exclude Refunds head (tracked in refunds card)
  const platformExpenses = sum(
    expenses.filter((exp) => exp.head !== "Refunds"),
    "amount",
  );

  return {
    totalSales,
    prepaidCollections,
    codCollections,
    refunds,
    brandPayables: Math.max(0, brandPayables),
    platformExpenses,
  };
}

export function brandSettlementRows(db, brand = "All") {
  return (db.settlements || [])
    .map((set) => {
      const brandName =
        db.brands.find((b) => b.partner === set.partner)?.name ||
        db.partners.find((p) => p.name === set.partner)?.brand ||
        set.partner;
      const payable = Math.max(0, (Number(set.supply) || 0) - (Number(set.adjustments) || 0));
      return {
        ...set,
        brand: brandName,
        platformCommission: Number(set.margin) || 0,
        deductions: Number(set.adjustments) || 0,
        payable,
      };
    })
    .filter((row) => brand === "All" || row.brand === brand);
}

export function filterLedger(rows, { query = "", brand = "All", type = "All", status = "All", period = "all" } = {}) {
  const needle = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (brand !== "All" && row.brand !== brand) return false;
    if (type !== "All" && row.type !== type) return false;
    if (status !== "All" && row.status !== status) return false;
    if (period === "month" && row.date && !String(row.date).includes("Nov 2026") && !String(row.date).includes("Nov")) {
      // soft filter for demo months — keep if date unknown
      if (row.date !== "—" && !/Nov|Oct|2026/.test(String(row.date))) return false;
    }
    if (!needle) return true;
    const hay = [row.id, row.brand, row.orderId, row.type, row.method, row.status, row.note, row.head]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

export function tabScopedTypes(tab) {
  if (tab === "collections") {
    return ["Prepaid Collection", "COD Collection", "Pending COD", "Pending Collection", "Failed Payment", "Gateway Fee"];
  }
  if (tab === "settlements") return ["Brand Settlement"];
  if (tab === "expenses") return ["Expense", "Gateway Fee"];
  if (tab === "refunds") return ["Refund Pending", "Refund Completed", "Chargeback", "RTO Adjustment"];
  return null;
}

export function expenseHeads() {
  return ["Courier", "Packaging", "Warehouse", "Gateway", "Marketing", "Product sourcing", "Other"];
}
