import { inr } from "../../data";
import { Status } from "../../ui";

export function OrdersTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  onOpen,
  page,
  pageSize,
  onPage,
}) {
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  const allVisibleSelected = pageRows.length > 0 && pageRows.every((row) => selected.has(row.id));
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">No orders match these filters</p>
        <p className="mt-1 text-xs text-gray-500">Clear filters or widen the date range.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(event) => onToggleAll(pageRows.map((row) => row.id), event.target.checked)}
                />
              </th>
              <th className="px-3 py-2.5">Order</th>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5">Brand</th>
              <th className="px-3 py-2.5">Customer</th>
              <th className="px-3 py-2.5">Items</th>
              <th className="px-3 py-2.5">Amount</th>
              <th className="px-3 py-2.5">Payment</th>
              <th className="px-3 py-2.5">Fulfillment</th>
              <th className="px-3 py-2.5">Shipping</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {pageRows.map((order) => (
              <tr key={order.id} className="hover:bg-leaf-50/30 dark:hover:bg-gray-700/30">
                <td className="px-3 py-2.5">
                  <input type="checkbox" checked={selected.has(order.id)} onChange={() => onToggle(order.id)} />
                </td>
                <td className="px-3 py-2.5">
                  <button type="button" className="font-semibold text-leaf-700 hover:underline" onClick={() => onOpen(order.id)}>
                    {order.id}
                  </button>
                  {order.needsAttention ? (
                    <span className="mt-1 block text-[10px] font-semibold text-amber-700">Needs attention</span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-300">{order.date}</td>
                <td className="px-3 py-2.5">
                  <p className="font-medium text-gray-900 dark:text-white">{order.brand}</p>
                  <p className="text-[11px] text-gray-400">{order.brandId || "—"}</p>
                </td>
                <td className="px-3 py-2.5">
                  <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                  <p className="text-[11px] text-gray-400">{order.customerPhone || "—"}</p>
                </td>
                <td className="px-3 py-2.5 tabular-nums text-gray-600">{order.itemCount}</td>
                <td className="px-3 py-2.5 font-medium tabular-nums text-gray-900 dark:text-white">{inr(order.value)}</td>
                <td className="px-3 py-2.5">
                  <div className="space-y-1">
                    <Status value={order.paymentStatus} />
                    <p className="text-[11px] text-gray-400">{order.method}</p>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <Status value={order.fulfillmentStatus} />
                </td>
                <td className="px-3 py-2.5">
                  <Status value={order.shippingStatus} />
                  <p className="mt-1 text-[11px] text-gray-400">
                    {order.courier || "—"}
                    {order.awb ? ` · ${order.awb}` : ""}
                  </p>
                </td>
                <td className="px-3 py-2.5">
                  <button type="button" className="text-xs font-semibold text-sky-600" onClick={() => onOpen(order.id)}>
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-2.5 dark:border-gray-700">
        <p className="text-xs text-gray-500">
          Showing {start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold disabled:opacity-40 dark:border-gray-700"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            Prev
          </button>
          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold disabled:opacity-40 dark:border-gray-700"
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
