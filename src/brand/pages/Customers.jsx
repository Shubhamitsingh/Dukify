import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerStats, formatDate, inr } from "../lib/metrics";
import { usePartner } from "../store";
import { ANCHOR, addDays } from "../lib/metrics";
import { Empty, PageHead, Surface, Table, useTable } from "../ui";

export default function Customers() {
  const { section = "all" } = useParams();
  const navigate = useNavigate();
  const { customers, orders } = usePartner();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const stats = customerStats(customers, orders);
    const recent = addDays(ANCHOR, -30);
    return stats.filter((customer) => {
      if (section === "new" && customer.since < recent) return false;
      if (section === "returning" && !customer.returning) return false;
      const hay = `${customer.name} ${customer.email} ${customer.city}`.toLowerCase();
      return hay.includes(query.trim().toLowerCase());
    });
  }, [customers, orders, query, section]);
  const table = useTable(rows, 8);

  return (
    <div>
      <PageHead
        title={{ all: "All customers", new: "New customers", returning: "Returning customers", profiles: "Customer profiles", history: "Customer order history" }[section] || "Customers"}
        description="Only customers who bought from this brand are listed."
      />
      <input className="toolbar-field mb-4 w-full" placeholder="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} />
      <Surface>
        {rows.length === 0 ? <Empty title="No customers in this view" body="Orders create the customer relationship. Other brands' buyers are excluded." /> : (
          <Table
            table={table}
            columns={[
              { key: "name", label: "Customer", render: (row) => <button type="button" className="font-medium text-leaf-700" onClick={() => navigate(`/brand/customers/item/${row.id}`)}>{row.name}</button> },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "orderCount", label: "Orders" },
              { key: "spend", label: "Spending", render: (row) => inr(row.spend) },
              { key: "lastPurchase", label: "Last purchase", render: (row) => formatDate(row.lastPurchase) },
              { key: "since", label: "Customer since", render: (row) => formatDate(row.since) },
            ]}
          />
        )}
      </Surface>
    </div>
  );
}
