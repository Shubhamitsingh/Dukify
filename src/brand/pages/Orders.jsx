import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { orderSectionStatus } from "../nav";
import { formatDate, inr, withQuote } from "../lib/metrics";
import { usePartner } from "../store";
import { Empty, PageHead, Status, Surface, Table, useTable } from "../ui";

export default function Orders() {
  const { section = "all" } = useParams();
  const navigate = useNavigate();
  const { orders, products, customers, brand } = usePartner();
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(() => {
    const quoted = withQuote(orders, brand);
    return quoted
      .filter((order) => {
        if (section === "refunds") return order.paymentStatus === "Refunded" || order.status === "Return requested";
        const expected = orderSectionStatus[section];
        if (expected && order.status !== expected) return false;
        if (payment !== "All" && order.paymentStatus !== payment) return false;
        if (from && order.date < from) return false;
        if (to && order.date > to) return false;
        const product = products.find((item) => item.id === order.productId);
        const customer = customers.find((item) => item.id === order.customerId);
        const hay = `${order.id} ${product?.name || ""} ${customer?.name || ""}`.toLowerCase();
        return hay.includes(query.trim().toLowerCase());
      })
      .map((order) => ({
        ...order,
        customer: customers.find((item) => item.id === order.customerId)?.name || "Customer",
        product: products.find((item) => item.id === order.productId)?.name || "Product",
        amount: order.quote.amount,
      }));
  }, [brand, customers, from, orders, payment, products, query, section, to]);

  const table = useTable(rows, 8);

  return (
    <div>
      <PageHead title={section === "all" ? "All orders" : section === "refunds" ? "Refund status" : `${orderSectionStatus[section] || "Orders"}`} description="Monitor orders placed on your store. You cannot mark central fulfilment steps complete." />
      <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-gray-200/80 bg-white p-3 sm:flex-row sm:flex-wrap dark:border-gray-700 dark:bg-gray-800">
        <input className="toolbar-field flex-1" placeholder="Search order, customer, product" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="toolbar-field" value={payment} onChange={(event) => setPayment(event.target.value)}>
          {["All", "Paid", "Pending", "Refunded", "Failed"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <input className="toolbar-field" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input className="toolbar-field" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </div>
      <Surface>
        {rows.length === 0 ? <Empty title="No orders in this view" body="Try another status or date. Orders from other brands are not loaded." /> : (
          <Table
            table={table}
            columns={[
              { key: "id", label: "Order ID", render: (row) => <button type="button" className="font-semibold text-pink-700" onClick={() => navigate(`/brand/orders/item/${row.id}`)}>{row.id}</button> },
              { key: "date", label: "Order date", render: (row) => formatDate(row.date) },
              { key: "customer", label: "Customer" },
              { key: "product", label: "Product" },
              { key: "qty", label: "Qty" },
              { key: "amount", label: "Amount", render: (row) => inr(row.amount) },
              { key: "paymentStatus", label: "Payment", render: (row) => <Status value={row.paymentStatus} /> },
              { key: "status", label: "Status", render: (row) => <Status value={row.status} /> },
              { key: "open", label: "Details", sort: false, render: (row) => <button type="button" className="btn-soft" onClick={() => navigate(`/brand/orders/item/${row.id}`)}>View</button> },
            ]}
          />
        )}
      </Surface>
    </div>
  );
}
