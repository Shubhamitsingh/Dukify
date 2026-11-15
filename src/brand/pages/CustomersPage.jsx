import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePartner } from "../store";
import { Empty, PageHead, Surface, Table, useTable } from "../ui";
import { customerStats, formatDate, inr, inRange, boundsFor } from "../lib/metrics";

const copy = {
  all: ["All customers", "People who have a record on this brand. Other brands' customers are not loaded."],
  new: ["New customers", "Customers whose first record date is inside the last 30 demo days."],
  returning: ["Returning customers", "Customers with more than one non-cancelled order."],
  profiles: ["Customer profiles", "Open a profile for contact details and spend. Phone is visible because this demo login is the brand owner."],
  history: ["Customer order history", "Spend and last purchase are calculated from this brand's orders."],
};

export default function CustomersPage({ section }) {
  const partner = usePartner();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const stats = customerStats(partner.customers, partner.orders);
    const recent = boundsFor("last30");
    return stats.filter((customer) => {
      if (section === "new" && !inRange(customer.since, recent)) return false;
      if (section === "returning" && !customer.returning) return false;
      const needle = query.trim().toLowerCase();
      if (needle && !`${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [partner, query, section]);
  const table = useTable(rows);
  const [title, description] = copy[section];
  const columns = [
    { key: "name", label: "Customer", render: (row) => <button type="button" className="font-medium text-pink-700" onClick={() => navigate(`/brand/customers/item/${row.id}`)}>{row.name}</button> },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "orderCount", label: "Total orders" },
    { key: "spend", label: "Total spending", render: (row) => inr(row.spend) },
    { key: "lastPurchase", label: "Last purchase", render: (row) => formatDate(row.lastPurchase) },
    { key: "since", label: "Customer since", render: (row) => formatDate(row.since) },
  ];

  return (
    <div>
      <PageHead title={title} description={description} />
      <input className="toolbar-field mb-4 w-full sm:max-w-xs" placeholder="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} />
      <Surface title={`${table.total} customers`}>
        {table.total === 0 ? <Empty title="No customers in this view" body="Orders create the customer relationship in this demo." /> : <Table columns={columns} table={table} />}
      </Surface>
    </div>
  );
}

CustomersPage.moduleId = "customers";
