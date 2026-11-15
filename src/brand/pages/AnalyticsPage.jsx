import { useMemo, useState } from "react";
import { usePartner } from "../store";
import { DateRange, LineChart, PageHead, Surface } from "../ui";
import { customerStats, dailySeries, inr, summarize, topProducts, trafficTotals } from "../lib/metrics";

const copy = {
  sales: ["Sales analytics", "Daily sales from non-cancelled orders."],
  orders: ["Order analytics", "Order counts by day in the selected window."],
  revenue: ["Revenue analytics", "Estimated earnings by day, using this brand's commercial terms."],
  products: ["Product performance", "Units and sales by style."],
  customers: ["Customer analytics", "New and returning customers are derived from order counts."],
  conversion: ["Conversion analytics", "Orders divided by demo store visits."],
  traffic: ["Traffic overview", "Visits, product views, and add-to-cart counts are labelled demo traffic."],
  reports: ["Date-wise report", "One row per day. Export is the on-screen table, not a file download."],
};

export default function AnalyticsPage({ section }) {
  const partner = usePartner();
  const [range, setRange] = useState("last30");
  const [custom, setCustom] = useState({ start: "2026-10-12", end: "2026-11-11" });
  const summary = useMemo(() => summarize(partner.orders, partner.brand, range, custom), [custom, partner, range]);
  const series = useMemo(() => dailySeries(partner.orders, partner.brand, summary.bounds), [partner, summary.bounds]);
  const traffic = trafficTotals(partner.traffic, summary.bounds);
  const tops = topProducts(summary.rows, partner.products, 8);
  const people = customerStats(partner.customers, summary.rows);
  const returning = people.filter((person) => person.returning).length;
  const [title, description] = copy[section];
  const field = section === "orders" ? "orders" : section === "revenue" ? "earnings" : "sales";

  return (
    <div>
      <PageHead title={title} description={description} action={<DateRange value={range} custom={custom} onChange={setRange} onCustom={setCustom} />} />
      {section !== "products" && section !== "customers" && section !== "reports" ? (
        <Surface title="Trend" padded className="mb-4">
          <LineChart series={series} field={field} />
        </Surface>
      ) : null}
      {section === "conversion" || section === "traffic" ? (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Visits", traffic.visits.toLocaleString("en-IN")],
            ["Product views", traffic.views.toLocaleString("en-IN")],
            ["Add to cart", traffic.carts.toLocaleString("en-IN")],
            ["Conversion", traffic.visits ? `${((summary.current.orders / traffic.visits) * 100).toFixed(1)}%` : "—"],
          ].map(([label, value]) => (
            <Surface key={label} padded><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></Surface>
          ))}
        </div>
      ) : null}
      {section === "products" || section === "sales" ? (
        <Surface title="Top products" className="mb-4">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {tops.map((row) => (
              <li key={row.product.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{row.product.name}<span className="block text-xs text-gray-500">{row.product.category} · {row.units} units</span></span>
                <span className="font-semibold tabular-nums">{inr(row.sales)}</span>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}
      {section === "customers" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Surface padded><p className="text-xs text-gray-500">Customers with orders in range</p><p className="text-xl font-semibold">{people.filter((person) => person.orderCount).length}</p></Surface>
          <Surface padded><p className="text-xs text-gray-500">Returning in range</p><p className="text-xl font-semibold">{returning}</p></Surface>
          <Surface padded><p className="text-xs text-gray-500">Single order</p><p className="text-xl font-semibold">{people.filter((person) => person.orderCount === 1).length}</p></Surface>
        </div>
      ) : null}
      {section === "reports" ? (
        <Surface title="Daily report">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <tr>{["Date", "Orders", "Sales", "Estimated earnings"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr>
              </thead>
              <tbody>
                {series.filter((row) => row.orders || row.sales).map((row) => (
                  <tr key={row.date} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2 tabular-nums">{row.orders}</td>
                    <td className="px-4 py-2 tabular-nums">{inr(row.sales)}</td>
                    <td className="px-4 py-2 tabular-nums">{inr(row.earnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      ) : null}
    </div>
  );
}

AnalyticsPage.moduleId = "analytics";
