import { inr } from "../../data";
import { Status, Surface } from "../../ui";

export function BrandSettlementsPanel({ rows }) {
  const pending = rows.filter((row) => ["Pending", "Approved", "On hold"].includes(row.status));
  const completed = rows.filter((row) => row.status === "Paid");

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Mini label="Brand-wise sales" value={inr(rows.reduce((n, row) => n + row.sales, 0))} />
        <Mini label="Brand payable (open)" value={inr(pending.reduce((n, row) => n + row.payable, 0))} />
        <Mini label="Platform commission (margin)" value={inr(rows.reduce((n, row) => n + row.platformCommission, 0))} />
        <Mini label="Completed settlements" value={completed.length} />
      </div>

      <Surface title="Settlement rows">
        <ul className="divide-y divide-gray-100 md:hidden dark:divide-gray-800">
          {rows.map((row) => (
            <li key={row.id} className="px-3.5 py-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.brand}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{row.id} · {row.date}</p>
                </div>
                <Status value={row.status} />
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div><dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Sales</dt><dd className="tabular-nums">{inr(row.sales)}</dd></div>
                <div><dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Payable</dt><dd className="tabular-nums">{inr(row.payable)}</dd></div>
                <div><dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Commission</dt><dd className="tabular-nums">{inr(row.platformCommission)}</dd></div>
                <div><dt className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Deductions</dt><dd className="tabular-nums">{inr(row.deductions)}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2.5">ID</th>
                <th className="px-3 py-2.5">Brand</th>
                <th className="px-3 py-2.5">Sales</th>
                <th className="px-3 py-2.5">Payable</th>
                <th className="px-3 py-2.5">Commission</th>
                <th className="px-3 py-2.5">Deductions</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2.5 font-medium">{row.id}</td>
                  <td className="px-3 py-2.5">{row.brand}</td>
                  <td className="px-3 py-2.5 tabular-nums">{inr(row.sales)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{inr(row.payable)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{inr(row.platformCommission)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{inr(row.deductions)}</td>
                  <td className="px-3 py-2.5">
                    <Status value={row.status} />
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>
      <p className="text-[11px] text-gray-400">
        Payable uses settlement supply minus deductions. Commission shown as stored margin — not double-counted as cash collections.
      </p>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
