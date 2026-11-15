import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHead } from "../ui";
import { useStore } from "../store";
import {
  brandSettlementRows,
  buildFinanceLedger,
  filterLedger,
  financeSummary,
  tabScopedTypes,
} from "./model";
import { BrandSettlementsPanel } from "./components/BrandSettlementsPanel";
import { ExpenseLedger } from "./components/ExpenseLedger";
import { FinanceFilters } from "./components/FinanceFilters";
import { FinanceSummaryCards } from "./components/FinanceSummaryCards";
import { FinanceTabs } from "./components/FinanceTabs";
import { FinanceTransactionTable } from "./components/FinanceTransactionTable";
import { SectionMetrics } from "./components/SectionMetrics";

const DEFAULT_FILTERS = {
  query: "",
  brand: "All",
  type: "All",
  status: "All",
  period: "all",
};

export function FinancePage() {
  const { db } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState("collections");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const summary = useMemo(() => financeSummary(db, filters.brand), [db, filters.brand]);
  const ledger = useMemo(() => buildFinanceLedger(db), [db]);
  const settlements = useMemo(() => brandSettlementRows(db, filters.brand), [db, filters.brand]);

  const scoped = useMemo(() => {
    const types = tabScopedTypes(tab);
    let rows = ledger;
    if (types) rows = rows.filter((row) => types.includes(row.type));
    return filterLedger(rows, filters);
  }, [ledger, tab, filters]);

  // Tab metrics: only extras not already on the top summary strip
  const collectionMetrics = useMemo(() => {
    const rows = filterLedger(
      ledger.filter((row) => tabScopedTypes("collections").includes(row.type)),
      { ...filters, type: "All" },
    );
    const by = (type) => rows.filter((row) => row.type === type).reduce((n, row) => n + row.amount, 0);
    return [
      { label: "Gateway fees", value: by("Gateway Fee"), money: true },
      { label: "Failed payments", value: by("Failed Payment"), money: true },
      { label: "Pending collections", value: by("Pending Collection") + by("Pending COD"), money: true },
    ];
  }, [ledger, filters]);

  const refundMetrics = useMemo(() => {
    const rows = filterLedger(
      ledger.filter((row) => tabScopedTypes("refunds").includes(row.type)),
      { ...filters, type: "All" },
    );
    const by = (type) => rows.filter((row) => row.type === type).reduce((n, row) => n + row.amount, 0);
    return [
      { label: "Refund pending", value: by("Refund Pending"), money: true },
      { label: "Refund completed", value: by("Refund Completed"), money: true },
      { label: "RTO adjustments", value: by("RTO Adjustment"), money: true },
      { label: "Chargebacks", value: by("Chargeback"), money: true },
    ];
  }, [ledger, filters]);

  const openOrder = (id) => navigate(`/orders?record=${id}`);

  return (
    <div className="space-y-5">
      <PageHead
        title="Finance"
        description="Platform-wide money view across brands — sales, collections, settlements, expenses and refunds stay separate."
      />

      <FinanceSummaryCards summary={summary} />

      <div className="space-y-3">
        <FinanceTabs active={tab} onChange={setTab} />

        {tab !== "expenses" ? (
          <FinanceFilters
            filters={filters}
            brands={db.brands}
            resultCount={scoped.length}
            onChange={setFilters}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-3 py-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
            <label className="min-w-[180px]">
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Brand (summary cards)</span>
              <select
                className="input-field"
                value={filters.brand}
                onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}
              >
                <option value="All">All brands</option>
                {db.brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="pt-4 text-xs text-gray-500">Expense ledger stays platform-wide.</p>
          </div>
        )}
      </div>

      {tab === "collections" ? (
        <div className="space-y-3">
          <SectionMetrics title="Collection breakdown" items={collectionMetrics} />
          <FinanceTransactionTable rows={scoped} onOpenOrder={openOrder} title="Collections & payments" />
        </div>
      ) : null}

      {tab === "settlements" ? (
        <div className="space-y-3">
          <BrandSettlementsPanel rows={settlements} />
          <FinanceTransactionTable rows={scoped} onOpenOrder={openOrder} title="Settlement transactions" />
        </div>
      ) : null}

      {tab === "expenses" ? <ExpenseLedger /> : null}

      {tab === "refunds" ? (
        <div className="space-y-3">
          <SectionMetrics title="Refunds & adjustments" items={refundMetrics} />
          <FinanceTransactionTable rows={scoped} onOpenOrder={openOrder} title="Refund & adjustment ledger" />
        </div>
      ) : null}
    </div>
  );
}
