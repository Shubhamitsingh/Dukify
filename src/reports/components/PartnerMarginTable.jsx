import { useMemo } from "react";
import { inr } from "../../data";
import { Surface } from "../../ui";
import { SortTh, TablePager, TableSearch, useReportTable } from "./ReportTableChrome";

export function PartnerMarginTable({ rows }) {
  const searchKeys = useMemo(() => ["brand", "partner"], []);
  const table = useReportTable(rows, {
    defaultSort: "orderValue",
    searchKeys,
  });

  return (
    <Surface
      title="Partner margin"
      action={<TableSearch value={table.query} onChange={table.setQuery} placeholder="Search brands" />}
    >
      <div className="border-b border-gray-100 px-3 py-2 text-[11px] leading-4 text-gray-500 dark:border-gray-700">
        Estimated from filtered orders — not settled cash profit. Courier charges shown as other deductions. Actual
        payouts stay on Finance → Settlements.
      </div>
      <ul className="divide-y divide-gray-100 md:hidden dark:divide-gray-800">
        {table.rows.map((row) => (
          <li key={row.brand} className="px-3.5 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{row.brand}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{row.partner}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums">{inr(row.estimatedBrandPayable)}</p>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <div><dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Orders</dt><dd className="tabular-nums">{inr(row.orderValue)}</dd></div>
              <div><dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Supply</dt><dd className="tabular-nums">{inr(row.supplyCost)}</dd></div>
              <div><dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Commission</dt><dd className="tabular-nums">{inr(row.platformCommission)}</dd></div>
              <div><dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Margin</dt><dd className="tabular-nums">{inr(row.platformGrossMargin)}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900">
            <tr>
              <SortTh label="Brand" column="brand" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortTh
                label="Order Value"
                column="orderValue"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="Supply Cost"
                column="supplyCost"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="Platform Commission"
                column="platformCommission"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="Other Deductions"
                column="otherDeductions"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="Est. Brand Payable"
                column="estimatedBrandPayable"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="Platform Gross Margin"
                column="platformGrossMargin"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {table.rows.length ? (
              table.rows.map((row) => (
                <tr key={row.brand} className="border-b border-gray-50 last:border-0 dark:border-gray-700">
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{row.brand}</p>
                    <p className="text-[11px] text-gray-400">{row.partner}</p>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{inr(row.orderValue)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{inr(row.supplyCost)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{inr(row.platformCommission)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-rose-600 dark:text-rose-300">{inr(row.otherDeductions)}</td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">{inr(row.estimatedBrandPayable)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-emerald-700 dark:text-emerald-300">
                    {inr(row.platformGrossMargin)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-400">
                  No margin rows in this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePager page={table.page} pages={table.pages} total={table.total} onPage={table.setPage} />
    </Surface>
  );
}
