import { Link, useParams } from "react-router-dom";
import { usePartner } from "../store";
import { PageHead, Status, Surface } from "../ui";
import { formatDate, inr } from "../lib/metrics";

export default function CustomerDetail() {
  const { id } = useParams();
  const partner = usePartner();
  const customer = partner.customers.find((item) => item.id === id);
  if (!customer) return <PageHead title="Customer not on this brand" description="This profile is outside the signed-in brand." />;
  const orders = partner.orders.filter((order) => order.customerId === customer.id);
  const spend = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.retailUnit * order.qty - order.discount, 0);

  return (
    <div>
      <PageHead eyebrow="Customers" title={customer.name} description={`${customer.email} · ${customer.phone}`} action={<Link className="btn-soft" to="/brand/customers/all">All customers</Link>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Surface padded><p className="text-xs text-gray-500">Orders</p><p className="text-xl font-semibold">{orders.length}</p></Surface>
        <Surface padded><p className="text-xs text-gray-500">Spending</p><p className="text-xl font-semibold">{inr(spend)}</p></Surface>
        <Surface padded><p className="text-xs text-gray-500">Customer since</p><p className="text-xl font-semibold">{formatDate(customer.since)}</p></Surface>
      </div>
      <Surface title="Order history">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {orders.map((order) => {
            const product = partner.products.find((item) => item.id === order.productId);
            return (
              <li key={order.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <Link to={`/brand/orders/item/${order.id}`} className="min-w-0">
                  <span className="block font-medium">{order.id}</span>
                  <span className="block truncate text-xs text-gray-500">{product?.name} · {formatDate(order.date)}</span>
                </Link>
                <span className="text-right">
                  <span className="block font-semibold tabular-nums">{inr(order.retailUnit * order.qty - order.discount)}</span>
                  <Status value={order.status} />
                </span>
              </li>
            );
          })}
        </ul>
      </Surface>
    </div>
  );
}
