import { Link, useNavigate, useParams } from "react-router-dom";
import { usePartner } from "../store";
import { PageHead, Status, Surface } from "../ui";
import { formatDate, inr, quoteOrder } from "../lib/metrics";

const steps = ["New", "Confirmed", "Processing", "Packed", "Shipped", "Delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const partner = usePartner();
  const order = partner.orders.find((item) => item.id === id);
  if (!order) return <PageHead title="Order not on this brand" description="It may belong to another partner, or the id is unknown." />;
  const customer = partner.customers.find((item) => item.id === order.customerId);
  const product = partner.products.find((item) => item.id === order.productId);
  const quote = quoteOrder(order, partner.brand);
  const active = steps.indexOf(order.status);

  return (
    <div>
      <PageHead
        eyebrow="Orders"
        title={order.id}
        description="Fulfilment is updated by Pahachan. This page does not advance warehouse steps."
        action={<Link className="btn-soft" to="/brand/orders/all">All orders</Link>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Status value={order.status} />
        <Status value={order.paymentStatus} />
      </div>
      {order.status === "Cancelled" || order.status === "Return requested" ? (
        <Surface padded className="mb-4">
          <p className="text-sm">{order.status === "Cancelled" ? "This order was cancelled before or during fulfilment." : order.note || "A return is with the central desk."}</p>
          <button
            type="button"
            className="btn-soft mt-3"
            onClick={() => {
              partner.addTicket({ topic: "Orders", subject: `Update on ${order.id}`, message: "Please share the latest central status.", priority: "Medium" });
              navigate("/brand/support/tickets");
            }}
          >
            Ask support for an update
          </button>
        </Surface>
      ) : (
        <Surface title="Fulfilment progress" padded className="mb-4">
          <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {steps.map((step, index) => (
              <li key={step} className={`rounded-xl px-3 py-2 text-xs font-semibold ${index <= active ? "bg-pink-50 text-pink-800" : "bg-gray-50 text-gray-400"}`}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-gray-500">Shaded steps are already recorded by the platform. You cannot tick them yourself.</p>
        </Surface>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Surface title="Order" padded>
          <dl className="space-y-2 text-sm">
            {[
              ["Date", formatDate(order.date)],
              ["Product", product?.name],
              ["SKU", product?.sku],
              ["Quantity", order.qty],
              ["Retail", inr(order.retailUnit)],
              ["Discount", inr(order.discount)],
              ["Amount", inr(quote.amount)],
              ["Courier", order.courier || "Not handed over"],
              ["AWB", order.awb || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3"><dt className="text-gray-500">{label}</dt><dd className="text-right">{value}</dd></div>
            ))}
          </dl>
        </Surface>
        <Surface title="Customer" padded>
          <button type="button" className="text-left" onClick={() => navigate(`/brand/customers/item/${customer.id}`)}>
            <p className="text-sm font-semibold">{customer?.name}</p>
            <p className="text-xs text-gray-500">{customer?.email}</p>
            <p className="text-xs text-gray-500">{customer?.phone}</p>
          </button>
          <p className="mt-4 text-xs text-gray-500">Estimated earning on this order: {inr(quote.estimated)}. Gross margin {inr(quote.grossMargin)}, commission {inr(quote.commission)}, deductions {inr(quote.gateway + quote.shipping)}.</p>
        </Surface>
      </div>
    </div>
  );
}
