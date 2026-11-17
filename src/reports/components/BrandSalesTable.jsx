import { useMemo } from "react";
import { inr } from "../../data";
import { Surface } from "../../ui";
import { SortTh, TablePager, TableSearch, useReportTable } from "./ReportTableChrome";

export function BrandSalesTable({ rows, onSelect }) {
  const searchKeys = useMemo(() => ["brand", "partner", "status"], []);
  const table = useReportTable(rows, {
    defaultSort: "grossSales",
    searchKeys,
  });

  return (
    <Surface
      title="Brand sales"
      action={<TableSearch value={table.query} onChange={table.setQuery} placeholder="Search brands" />}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900">
            <tr>
              <SortTh label="Brand" column="brand" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortTh
                label="Total Orders"
                column="totalOrders"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="Delivered"
                column="deliveredOrders"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="Gross Sales"
                column="grossSales"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="AOV"
                column="aov"
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
                <tr
                  key={row.id || row.brand}
                  className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-leaf-50/40 dark:border-gray-700 dark:hover:bg-gray-700/40"
                  onClick={() => onSelect?.(row)}
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{row.brand}</p>
                    <p className="text-[11px] text-gray-400">{row.status}</p>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{row.totalOrders}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{row.deliveredOrders}</td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">{inr(row.grossSales)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{inr(row.aov)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-400">
                  No brand sales in this range.
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
