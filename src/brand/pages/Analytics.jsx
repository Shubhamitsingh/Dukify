import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { customerStats, dailySeries, formatDate, inr, summarize, topProducts, trafficTotals } from "../lib/metrics";
import { usePartner } from "../store";
import { DateRange, LineChart, PageHead, Surface } from "../ui";

export default function Analytics() {
  const { section = "sales" } = useParams();
  const { brand, orders, products, customers, traffic } = usePartner();
  const [range, setRange] = useState("last30");
  const [custom, setCustom] = useState({ start: "2026-10-12", end: "2026-11-11" });
  const summary = summarize(orders, brand, range, custom);
  const series = dailySeries(orders, brand, summary.bounds);
  const leaders = topProducts(summary.rows, products, 8);
  const visits = trafficTotals(traffic, summary.bounds);
  const people = useMemo(() => customerStats(customers, orders), [customers, orders]);
  const returning = people.filter((person) => person.returning).length;
  const categories = Object.values(leaders.reduce((map, row) => {
    const key = row.product.category;
    map[key] = map[key] || { category: key, sales: 0, units: 0 };
    map[key].sales += row.sales;
    map[key].units += row.units;
    return map;
  }, {}));
  const conversion = visits.visits ? `${Math.round((summary.current.orders / visits.visits) * 1000) / 10}%` : "0%";

  return (
    <div>
      <PageHead
        title={{ sales: "Sales analytics", orders: "Order analytics", revenue: "Revenue analytics", products: "Product performance", customers: "Customer analytics", conversion: "Conversion analytics", traffic: "Traffic overview", reports: "Date-wise reports" }[section] || "Analytics"}
        description={`Figures are limited to ${brand.name}.`}
        action={<DateRange value={range} custom={custom} onChange={setRange} onCustom={setCustom} />}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Surface padded><p className="text-xs text-gray-500">Sales</p><p className="text-xl font-semibold">{inr(summary.current.sales)}</p></Surface>
        <Surface padded><p className="text-xs text-gray-500">Orders</p><p className="text-xl font-semibold">{summary.current.orders}</p></Surface>
        <Surface padded><p className="text-xs text-gray-500">Estimated earnings</p><p className="text-xl font-semibold">{inr(summary.current.earnings)}</p></Surface>
        <Surface padded><p className="text-xs text-gray-500">Visits</p><p className="text-xl font-semibold">{visits.visits.toLocaleString("en-IN")}</p></Surface>
      </div>
      {(section === "sales" || section === "orders" || section === "revenue" || section === "reports") && (
        <Surface title={section === "orders" ? "Orders by day" : section === "revenue" ? "Earnings by day" : "Sales by day"} className="mb-4" padded>
          <LineChart series={series} field={section === "orders" ? "orders" : section === "revenue" ? "earnings" : "sales"} />
        </Surface>
      )}
      {(section === "reports" || section === "sales") && (
        <Surface title="Date-wise" className="mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold tracking-wide text-gray-500 uppercase"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Sales</th><th className="px-4 py-3">Earnings</th></tr></thead>
              <tbody>
                {series.filter((day) => day.orders || section === "reports").slice(-14).map((day) => (
                  <tr key={day.date} className="border-t border-gray-100"><td className="px-4 py-2">{formatDate(day.date)}</td><td className="px-4 py-2">{day.orders}</td><td className="px-4 py-2">{inr(day.sales)}</td><td className="px-4 py-2">{inr(day.earnings)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      )}
      {(section === "products" || section === "sales") && (
        <Surface title="Top products" className="mb-4">
          <ul>
            {leaders.map((row) => (
              <li key={row.product.id} className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-sm">
                <span>{row.product.name}<span className="block text-xs text-gray-500">{row.product.category} · {row.units} units</span></span>
                <span className="font-semibold">{inr(row.sales)}</span>
              </li>
            ))}
          </ul>
        </Surface>
      )}
      {section === "products" ? (
        <Surface title="Category performance" padded>
          <ul className="space-y-2 text-sm">
            {categories.map((row) => <li key={row.category} className="flex justify-between"><span>{row.category}</span><span>{inr(row.sales)}</span></li>)}
          </ul>
        </Surface>
      ) : null}
      {(section === "customers" || section === "conversion") && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Surface padded><p className="text-xs text-gray-500">Customers</p><p className="text-xl font-semibold">{people.length}</p></Surface>
          <Surface padded><p className="text-xs text-gray-500">Returning</p><p className="text-xl font-semibold">{returning}</p></Surface>
          <Surface padded><p className="text-xs text-gray-500">New</p><p className="text-xl font-semibold">{people.length - returning}</p></Surface>
        </div>
      )}
      {(section === "conversion" || section === "traffic") && (
        <Surface title="Demo traffic" className="mt-4" padded>
          <div className="grid gap-3 sm:grid-cols-4">
            <div><p className="text-xs text-gray-500">Visits</p><p className="text-base font-semibold">{visits.visits}</p></div>
            <div><p className="text-xs text-gray-500">Product views</p><p className="text-base font-semibold">{visits.views}</p></div>
            <div><p className="text-xs text-gray-500">Add to cart</p><p className="text-base font-semibold">{visits.carts}</p></div>
            <div><p className="text-xs text-gray-500">Orders / visits</p><p className="text-base font-semibold">{conversion}</p></div>
          </div>
        </Surface>
      )}
    </div>
  );
}
