import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderSectionStatus } from "../nav";
import { usePartner } from "../store";
import { Empty, PageHead, Status, Surface, Table, useTable } from "../ui";
import { formatDate, inr, quoteOrder } from "../lib/metrics";

const copy = {
  all: ["All orders", "Every order placed on this brand. Fulfilment progress is read-only."],
  new: ["New orders", "Orders Pahachan has not confirmed yet."],
  confirmed: ["Confirmed orders", "Accepted into the central queue."],
  processing: ["Processing orders", "Picking is happening in the central warehouse."],
  packed: ["Packed orders", "Packed by Pahachan. You cannot mark this step yourself."],
  shipped: ["Shipped orders", "Handed to the platform courier."],
  delivered: ["Delivered orders", "Closed deliveries for this brand."],
  cancelled: ["Cancelled orders", "These orders are excluded from sales totals."],
  returns: ["Return requests", "The customer asked for a return. The central desk owns the decision."],
  refunds: ["Refund status", "Payments marked refunded. Settlement earnings on these orders are zero."],
};

export default function OrdersPage({ section }) {
  const partner = usePartner();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const rows = useMemo(() => {
    return partner.orders
      .map((order) => {
        const customer = partner.customers.find((item) => item.id === order.customerId);
        const product = partner.products.find((item) => item.id === order.productId);
        const quote = quoteOrder(order, partner.brand);
        return { ...order, customer: customer?.name || "Customer", product: product?.name || "Product", amount: quote.amount };
      })
      .filter((order) => {
        if (orderSectionStatus[section] && order.status !== orderSectionStatus[section]) return false;
        if (section === "refunds" && order.paymentStatus !== "Refunded") return false;
        if (payment !== "All" && order.paymentStatus !== payment) return false;
        if (from && order.date < from) return false;
        if (to && order.date > to) return false;
        const needle = query.trim().toLowerCase();
        if (needle && !`${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [from, partner, payment, query, section, to]);
  const table = useTable(rows);
  const [title, description] = copy[section];
  const columns = [
    { key: "id", label: "Order ID", render: (row) => <button type="button" className="font-medium text-pink-700" onClick={() => navigate(`/brand/orders/item/${row.id}`)}>{row.id}</button> },
    { key: "date", label: "Order date", render: (row) => formatDate(row.date) },
    { key: "customer", label: "Customer" },
    { key: "product", label: "Product" },
    { key: "qty", label: "Quantity" },
    { key: "amount", label: "Order amount", render: (row) => inr(row.amount) },
    { key: "paymentStatus", label: "Payment", render: (row) => <Status value={row.paymentStatus} /> },
    { key: "status", label: "Order status", render: (row) => <Status value={row.status} /> },
    { key: "view", label: "View", sort: false, render: (row) => <button type="button" className="text-xs font-semibold text-pink-700" onClick={() => navigate(`/brand/orders/item/${row.id}`)}>Details</button> },
  ];

  return (
    <div>
      <PageHead title={title} description={description} />
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
        <input className="toolbar-field w-full lg:max-w-xs" placeholder="Search order, customer, product" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="toolbar-field w-full lg:w-auto" value={payment} onChange={(event) => setPayment(event.target.value)}>
          {["All", "Paid", "Pending", "Refunded", "Failed"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <input className="toolbar-field w-full lg:w-auto" type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="From" />
        <input className="toolbar-field w-full lg:w-auto" type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="To" />
      </div>
      <Surface title={`${table.total} orders`}>
        {table.total === 0 ? <Empty title="No orders in this view" body="Change the status, payment filter, or date range." /> : <Table columns={columns} table={table} />}
      </Surface>
    </div>
  );
}

OrdersPage.moduleId = "orders";
