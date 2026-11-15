import { useMemo } from "react";
import { usePartner } from "../store";
import { Empty, PageHead, Surface } from "../ui";
import { formatDate, inr, settlementBooks, withQuote } from "../lib/metrics";

const copy = {
  overview: ["Earnings overview", "A configurable commercial model. The numbers below follow this brand's agreement, not one global formula."],
  gross: ["Gross sales", "Order amount after the order-level discount, excluding cancelled orders."],
  margin: ["Partner gross margin", "Retail minus partner supply price, then minus the order discount. Central cost is hidden."],
  commission: ["Applicable commission", "This brand's commission rate applied to order amount."],
  deductions: ["Discounts and deductions", "Gateway fee plus the contractual shipping share once an order has shipped."],
  refunds: ["Refund adjustments", "Returned or refunded orders contribute no estimated earning."],
  pending: ["Pending settlements", "Delivered and paid orders from 1 Nov 2026 onward. Waiting on central approval."],
  completed: ["Completed settlements", "Delivered and paid orders dated before 1 Nov 2026 in this demo rule."],
  history: ["Settlement history", "Monthly roll-up of the completed demo settlements."],
  payment: ["Payment details", "The masked account Pahachan would pay. Editing it is a demo change in this browser."],
};

export default function EarningsPage({ section }) {
  const partner = usePartner();
  const books = useMemo(() => settlementBooks(partner.orders, partner.brand), [partner]);
  const quoted = useMemo(() => withQuote(partner.orders, partner.brand), [partner]);
  const active = quoted.filter((order) => !order.quote.cancelled);
  const sum = (rows, key) => rows.reduce((total, order) => total + order.quote[key], 0);
  const [title, description] = copy[section];
  const list = section === "pending" ? books.pending : section === "completed" ? books.completed : section === "refunds" ? quoted.filter((order) => order.quote.refund) : active;

  return (
    <div>
      <PageHead title={title} description={description} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total sales", sum(active, "amount")],
          ["Gross margin", sum(active, "grossMargin")],
          ["Commission", sum(active, "commission")],
          ["Deductions", sum(active, "gateway") + sum(active, "shipping")],
          ["Refund adjustments", quoted.filter((order) => order.quote.refund).reduce((total, order) => total + Math.max(0, order.quote.grossMargin), 0)],
          ["Estimated earnings", sum(active, "estimated")],
          ["Pending settlement", books.pendingTotal],
          ["Completed settlement", books.completedTotal],
        ].map(([label, value]) => (
          <Surface key={label} padded>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{inr(value)}</p>
          </Surface>
        ))}
      </div>
      {section === "history" ? (
        <Surface title="Months treated as settled">
          {books.history.length === 0 ? <Empty title="No completed month yet" body="Delivered paid orders before November appear here." /> : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {books.history.map((row) => (
                <li key={row.month} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{row.month} · {row.orders} orders</span>
                  <span className="font-semibold tabular-nums">{inr(row.payable)}</span>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      ) : null}
      {section === "payment" ? (
        <Surface title="Settlement account" padded>
          <dl className="space-y-2 text-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between"><dt className="text-gray-500">Account name</dt><dd className="break-words">{partner.brand.bank.holder}</dd></div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between"><dt className="text-gray-500">Bank</dt><dd className="break-words">{partner.brand.bank.bank}</dd></div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between"><dt className="text-gray-500">Account</dt><dd className="break-all">{partner.brand.bank.account}</dd></div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between"><dt className="text-gray-500">IFSC</dt><dd>{partner.brand.bank.ifsc}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-gray-500">Change the account from Settings → Bank. This demo does not send it to a bank.</p>
        </Surface>
      ) : null}
      {section !== "history" && section !== "payment" && section !== "overview" ? (
        <Surface title="Orders in this view">
          {list.length === 0 ? <Empty title="No rows" body="This commercial view has no matching orders for the brand." /> : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {list.map((order) => (
                <li key={order.id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-4">
                  <span className="font-medium">{order.id}<span className="block text-xs text-gray-500">{formatDate(order.date)} · {order.status}</span></span>
                  <span>Sales {inr(order.quote.amount)}</span>
                  <span>Margin {inr(order.quote.grossMargin)}</span>
                  <span>Earning {inr(section === "commission" ? order.quote.commission : section === "deductions" ? order.quote.gateway + order.quote.shipping : order.quote.estimated)}</span>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      ) : null}
      {section === "margin" ? (
        <p className="mt-3 text-xs text-gray-500">Worked example on a single unit with no discount: retail {inr(2000)} − supply {inr(1700)} = {inr(300)} gross margin. An order only matches that example when its own prices do.</p>
      ) : null}
    </div>
  );
}

EarningsPage.moduleId = "earnings";
