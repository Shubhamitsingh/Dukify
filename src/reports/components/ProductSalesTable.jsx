import { useMemo } from "react";
import { inr } from "../../data";
import { Surface } from "../../ui";
import { SortTh, TablePager, TableSearch, useReportTable } from "./ReportTableChrome";

export function ProductSalesTable({ rows, onSelect }) {
  const searchKeys = useMemo(() => ["product", "brand", "sku"], []);
  const table = useReportTable(rows, {
    defaultSort: "grossSales",
    searchKeys,
  });

  return (
    <Surface
      title="Product sales"
      action={<TableSearch value={table.query} onChange={table.setQuery} placeholder="Search products" />}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900">
            <tr>
              <SortTh label="Product" column="product" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortTh label="Brand" column="brand" sortKey={table.sortKey} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortTh
                label="Units Sold"
                column="unitsSold"
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
                label="Supply Cost"
                column="supplyCost"
                sortKey={table.sortKey}
                sortDir={table.sortDir}
                onSort={table.toggleSort}
                align="right"
              />
              <SortTh
                label="Gross Margin"
                column="grossMargin"
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
                  key={row.product}
                  className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-leaf-50/40 dark:border-gray-700 dark:hover:bg-gray-700/40"
                  onClick={() => onSelect?.(row)}
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{row.product}</p>
                    <p className="text-[11px] text-gray-400">{row.sku}</p>
                  </td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{row.brand}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{row.unitsSold}</td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">{inr(row.grossSales)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{inr(row.supplyCost)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-emerald-700 dark:text-emerald-300">{inr(row.grossMargin)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-400">
                  No product sales in this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="border-t border-gray-50 px-3 py-2 text-[11px] text-gray-400 dark:border-gray-700">
        Supply cost uses order-time supply on each line — not the current catalog price.
      </p>
      <TablePager page={table.page} pages={table.pages} total={table.total} onPage={table.setPage} />
    </Surface>
  );
}
