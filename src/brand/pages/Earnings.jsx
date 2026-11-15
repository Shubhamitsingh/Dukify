import { useParams } from "react-router-dom";
import { formatDate, inr, settlementBooks, withQuote } from "../lib/metrics";
import { usePartner } from "../store";
import { Empty, PageHead, Surface } from "../ui";

export default function Earnings() {
  const { section = "overview" } = useParams();
  const { brand, orders } = usePartner();
  const quoted = withQuote(orders, brand);
  const books = settlementBooks(orders, brand);
  const active = quoted.filter((order) => !order.quote.cancelled);
  const gross = active.reduce((sum, order) => sum + order.quote.amount, 0);
  const margin = active.reduce((sum, order) => sum + order.quote.grossMargin, 0);
  const commission = active.reduce((sum, order) => sum + order.quote.commission, 0);
  const deductions = active.reduce((sum, order) => sum + order.quote.gateway + order.quote.shipping + order.discount, 0);
  const refunds = quoted.filter((order) => order.quote.refund);

  const list = section === "pending" ? books.pending : section === "completed" ? books.completed : section === "refunds" ? refunds : active;

  return (
    <div>
      <PageHead title="Earnings and settlements" description="Partner supply price, retail price, and deductions are visible. Central purchase cost is not." />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total sales", inr(gross)],
          ["Gross margin", inr(margin)],
          ["Commission", inr(commission)],
          ["Pending settlement", inr(books.pendingTotal)],
          ["Completed settlement", inr(books.completedTotal)],
          ["Deductions", inr(deductions)],
          ["Refund adjustments", inr(refunds.reduce((sum, order) => sum + Math.max(0, order.quote.grossMargin), 0))],
          ["Estimated earnings", inr(active.reduce((sum, order) => sum + order.quote.estimated, 0))],
        ].map(([label, value]) => (
          <Surface key={label} padded><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-semibold tabular-nums">{value}</p></Surface>
        ))}
      </div>
      {(section === "history" || section === "overview") && (
        <Surface title="Settlement history" className="mb-4">
          {books.history.length === 0 ? <Empty title="No completed month yet" body="Completed rows appear for delivered, paid orders before November 2026." /> : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase"><tr><th className="px-4 py-3">Month</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Sales</th><th className="px-4 py-3">Payable</th></tr></thead>
              <tbody>
                {books.history.map((row) => (
                  <tr key={row.month} className="border-t border-gray-100"><td className="px-4 py-3">{row.month}</td><td className="px-4 py-3">{row.orders}</td><td className="px-4 py-3">{inr(row.sales)}</td><td className="px-4 py-3">{inr(row.payable)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Surface>
      )}
      {section === "payment" ? (
        <Surface title="Payment details" padded>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-gray-500">Account name</dt><dd>{brand.bank.holder}</dd></div>
            <div><dt className="text-xs text-gray-500">Bank</dt><dd>{brand.bank.bank}</dd></div>
            <div><dt className="text-xs text-gray-500">Account</dt><dd>{brand.bank.account}</dd></div>
            <div><dt className="text-xs text-gray-500">IFSC</dt><dd>{brand.bank.ifsc}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-gray-500">Next demo estimate waiting for approval: {inr(books.pendingTotal)}.</p>
        </Surface>
      ) : (
        <Surface title={section === "gross" ? "Gross sales" : section === "margin" ? "Gross margin" : section === "commission" ? "Commission" : section === "deductions" ? "Deductions" : "Order economics"}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <tr>
                  {["Order", "Date", "Sales", "Margin", "Commission", "Gateway", "Shipping", "Estimated"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {list.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{formatDate(order.date)}</td>
                    <td className="px-4 py-2">{inr(order.quote.amount)}</td>
                    <td className="px-4 py-2">{inr(order.quote.grossMargin)}</td>
                    <td className="px-4 py-2">{inr(order.quote.commission)}</td>
                    <td className="px-4 py-2">{inr(order.quote.gateway)}</td>
                    <td className="px-4 py-2">{inr(order.quote.shipping)}</td>
                    <td className="px-4 py-2">{inr(order.quote.estimated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      )}
    </div>
  );
}
