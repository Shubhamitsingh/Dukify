import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { downloadBlob } from "../catalogue";
import { PageHead, SoftButton } from "../ui";
import { useStore } from "../store";
import { sampleToday } from "../orderDesk";
import { SUMMARY_CARDS } from "./constants";
import {
  applyOrderAction,
  bulkActionEligible,
  enrichOrders,
  filterOmsOrders,
  omsSummary,
  sortOmsOrders,
} from "./model";
import { printOrderDocument } from "./print";
import { BulkActionsBar } from "./components/BulkActionsBar";
import { OrderDetailDrawer } from "./components/OrderDetailDrawer";
import { OrderFilters } from "./components/OrderFilters";
import { OrderSummaryCards } from "./components/OrderSummaryCards";
import { OrdersTable } from "./components/OrdersTable";

const DEFAULT_FILTERS = {
  query: "",
  brand: "All",
  fulfillment: "All",
  payment: "All",
  shipping: "All",
  courier: "All",
  method: "All",
  period: "all",
  customFrom: "",
  customTo: "",
  attention: "All",
  sort: "newest",
  summary: "all",
};

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportRows(rows, format) {
  const columns = [
    ["id", "Order ID"],
    ["date", "Date"],
    ["brand", "Brand"],
    ["brandId", "Brand ID"],
    ["customerName", "Customer"],
    ["customerPhone", "Phone"],
    ["itemCount", "Items"],
    ["value", "Amount"],
    ["paymentStatus", "Payment"],
    ["method", "Method"],
    ["fulfillmentStatus", "Fulfillment"],
    ["shippingStatus", "Shipping"],
    ["courier", "Courier"],
    ["awb", "AWB"],
  ];
  if (format === "xlsx") {
    const header = columns.map(([, label]) => label);
    const data = [header, ...rows.map((row) => columns.map(([key]) => row[key] ?? ""))];
    const sheet = XLSX.utils.aoa_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Orders");
    XLSX.writeFile(book, "dukify-orders.xlsx");
    return;
  }
  const header = columns.map(([, label]) => label).join(",");
  const lines = rows.map((row) => columns.map(([key]) => csvEscape(row[key])).join(","));
  downloadBlob("dukify-orders.csv", [header, ...lines].join("\n"), "text/csv;charset=utf-8");
}

export function OrdersPage() {
  const { db, patch } = useStore();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    brand: params.get("brand") || "All",
  }));
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const enriched = useMemo(() => enrichOrders(db), [db]);
  const today = useMemo(() => sampleToday(db.orders), [db.orders]);

  const filtered = useMemo(() => {
    let rows = filterOmsOrders(enriched, filters, today);
    const card = SUMMARY_CARDS.find((item) => item.id === filters.summary);
    if (card?.fulfillment) {
      rows = rows.filter((order) => order.fulfillmentStatus === card.fulfillment);
    }
    return sortOmsOrders(rows, filters.attention !== "All" && filters.sort === "newest" ? "attention" : filters.sort);
  }, [enriched, filters, today]);

  const summarySource = useMemo(() => filterOmsOrders(enriched, { ...filters, fulfillment: "All", summary: "all" }, today), [enriched, filters, today]);
  const summary = useMemo(() => omsSummary(summarySource), [summarySource]);

  const activeId = params.get("record");
  const activeOrder = enriched.find((order) => order.id === activeId) || null;
  const activeBrand = activeOrder ? db.brands.find((brand) => brand.name === activeOrder.brand || brand.id === activeOrder.brandId) : null;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const brand = params.get("brand");
    if (brand) setFilters((current) => ({ ...current, brand }));
  }, [params]);

  const openOrder = (id) => {
    const next = new URLSearchParams(params);
    next.set("record", id);
    setParams(next);
  };

  const closeOrder = () => {
    const next = new URLSearchParams(params);
    next.delete("record");
    setParams(next);
  };

  const applyPatch = (nextOrder) => {
    const {
      items,
      itemCount,
      brandName,
      brandEmail,
      brandPhone,
      brandDomain,
      methodGroup,
      needsAttention,
      ...persist
    } = nextOrder;
    patch(
      "orders",
      nextOrder.id,
      {
        ...persist,
        items: nextOrder.items,
        fulfilment: nextOrder.fulfilment,
        fulfillmentStatus: nextOrder.fulfillmentStatus,
        payment: nextOrder.payment,
        paymentStatus: nextOrder.paymentStatus,
        delivery: nextOrder.delivery,
        shippingStatus: nextOrder.shippingStatus,
        courier: nextOrder.courier,
        awb: nextOrder.awb,
        timeline: nextOrder.timeline,
        pickupLocationId: nextOrder.pickupLocationId,
      },
      `Order ${nextOrder.id} updated`,
    );
  };

  const onSummarySelect = (id) => {
    const card = SUMMARY_CARDS.find((item) => item.id === id);
    setFilters((current) => ({
      ...current,
      summary: id,
      fulfillment: card?.fulfillment || "All",
    }));
  };

  const toggle = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (ids, on) => {
    setSelected((current) => {
      const next = new Set(current);
      ids.forEach((id) => {
        if (on) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const selectedOrders = filtered.filter((order) => selected.has(order.id));

  const runBulk = (actionId) => {
    const eligible = bulkActionEligible(selectedOrders, actionId);
    if (!eligible.length) {
      window.alert("No selected orders are valid for this action.");
      return;
    }
    if (!window.confirm(`Apply to ${eligible.length} valid order(s)? Invalid selections will be skipped.`)) return;
    eligible.forEach((order) => applyPatch(applyOrderAction(order, actionId)));
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      <PageHead
        title="Orders"
        description="Manage and fulfill orders across all brands from one centralized dashboard."
        action={
          <div className="flex flex-wrap gap-2">
            <SoftButton onClick={() => exportRows(filtered, "csv")}>Export CSV</SoftButton>
            <SoftButton onClick={() => exportRows(filtered, "xlsx")}>Export Excel</SoftButton>
          </div>
        }
      />

      <OrderSummaryCards
        counts={summary.counts}
        total={summary.total}
        active={filters.summary}
        onSelect={onSummarySelect}
      />

      <OrderFilters
        filters={filters}
        brands={db.brands}
        resultCount={filtered.length}
        onChange={(next) => {
          if (next.fulfillment !== filters.fulfillment) {
            const card = SUMMARY_CARDS.find((item) => item.fulfillment === next.fulfillment);
            next = { ...next, summary: card?.id || (next.fulfillment === "All" ? "all" : next.summary) };
          }
          setFilters(next);
        }}
        onClear={() => setFilters({ ...DEFAULT_FILTERS })}
      />

      <BulkActionsBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onExport={() => exportRows(selectedOrders, "csv")}
        onPrintSlips={() => {
          if (!selectedOrders.length) return;
          selectedOrders.forEach((order, index) => {
            window.setTimeout(() => printOrderDocument(order, "packing-slip"), index * 400);
          });
        }}
        onProcess={() => runBulk("process")}
        onReady={() => runBulk("ready")}
      />

      <OrdersTable
        rows={filtered}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onOpen={openOrder}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
      />

      {activeOrder ? (
        <OrderDetailDrawer
          order={activeOrder}
          brand={activeBrand}
          onClose={closeOrder}
          onApply={(next) => applyPatch(next)}
        />
      ) : null}
    </div>
  );
}
