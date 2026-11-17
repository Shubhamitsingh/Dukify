import { inr } from "../../data";
import { Status } from "../../ui";

export function FinanceTransactionTable({ rows, onOpenOrder, title = "Transactions" }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-14 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">No transactions found</p>
        <p className="mt-1 text-xs text-gray-500">Try clearing filters or switching tabs.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-xs text-gray-400">{rows.length} rows</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2.5">Transaction</th>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Brand</th>
              <th className="px-4 py-2.5">Order</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Method</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Reference</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row.date}</td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.brand}</td>
                <td className="px-4 py-3">
                  {row.orderId && row.orderId !== "—" ? (
                    <button
                      type="button"
                      className="font-medium text-sky-700 hover:underline dark:text-sky-400"
                      onClick={() => onOpenOrder?.(row.orderId)}
                    >
                      {row.orderId}
                    </button>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-lg bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.method}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                  {inr(row.amount)}
                </td>
                <td className="px-4 py-3">
                  <Status value={row.status} />
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 text-xs text-gray-400" title={row.note || ""}>
                  {row.note || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.orderId && row.orderId !== "—" ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-sky-700 hover:text-sky-800"
                      onClick={() => onOpenOrder?.(row.orderId)}
                    >
                      View
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
