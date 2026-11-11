import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { inr, sum } from "./data";
import { blanks, partnerMoney, related } from "./local";
import { navGroups } from "./shell";
import { useStore } from "./store";
import { Kpi, PageHead, Status, Surface } from "./ui";

function brandStats(db) {
  return db.brands.map((brand) => {
    const orders = db.orders.filter((order) => order.brand === brand.name && order.payment !== "Failed");
    return {
      ...brand,
      orders: orders.length,
      sales: sum(orders, "value"),
    };
  });
}

export function Dashboard() {
  const { db } = useStore();
  const navigate = useNavigate();
  const brands = brandStats(db);
  const liveOrders = db.orders.filter((order) => order.payment !== "Failed");
  const paidOrders = db.orders.filter((order) => order.payment === "Captured" || order.payment === "COD pending");
  const sales = sum(liveOrders, "value");
  const supply = sum(paidOrders, "supply");
  const margin = sum(paidOrders, "value") - supply;
  const low = db.inventory.filter((row) => row.available <= 11);
  const pending = db.orders.filter((order) =>
    ["Confirmed", "Packing", "Ready to ship", "Payment failed"].includes(order.fulfilment),
  ).length;
  const attention = [
    ...db.orders
      .filter((order) => order.payment === "Failed" || order.payment === "COD pending")
      .map((order) => ({
        id: order.id,
        title: order.payment === "Failed" ? "Payment failed" : "COD not collected",
        detail: `${order.id} · ${order.brand}`,
        to: `/orders?record=${order.id}`,
      })),
    ...db.returns
      .filter((item) => item.status === "Pending approval" || item.status === "Inspection")
      .map((item) => ({
        id: item.id,
        title: `Return · ${item.status}`,
        detail: `${item.order} · ${item.brand}`,
        to: `/returns?record=${item.id}`,
      })),
    ...db.brands
      .filter((brand) => brand.status === "Pending approval")
      .map((brand) => ({
        id: brand.id,
        title: "Brand waiting approval",
        detail: brand.name,
        to: `/brands?record=${brand.id}`,
      })),
    ...db.purchases
      .filter((item) => item.status === "In transit" || item.status === "Inspection")
      .map((item) => ({
        id: item.id,
        title: `Purchase · ${item.status}`,
        detail: `${item.id} · ${item.product} · ${item.qty}`,
        to: `/purchasing?record=${item.id}`,
      })),
    ...low.map((row) => ({
      id: row.id,
      title: row.available === 0 ? "Out of stock" : "Low stock",
      detail: `${row.product} · ${row.sku} · ${row.available} available`,
      to: `/inventory?record=${row.id}`,
    })),
    ...db.tickets
      .filter((ticket) => ticket.status === "Open")
      .map((ticket) => ({
        id: ticket.id,
        title: `Support · ${ticket.topic}`,
        detail: `${ticket.from} · ${ticket.id}`,
        to: `/support?record=${ticket.id}`,
      })),
  ];
  const topProducts = [...db.products]
    .map((product) => {
      const orders = db.orders.filter((order) => order.product === product.name && order.payment !== "Failed");
      return { ...product, orders: orders.length, sales: sum(orders, "value") };
    })
    .sort((left, right) => right.sales - left.sales)
    .slice(0, 5);

  const daySales = Object.values(
    liveOrders.reduce((groups, order) => {
      const bucket = groups[order.date] || { date: order.date, sales: 0 };
      bucket.sales += order.value;
      groups[order.date] = bucket;
      return groups;
    }, {}),
  ).sort((left, right) => new Date(left.date) - new Date(right.date));
  const pipeline = ["Confirmed", "Packing", "Ready to ship", "Shipped", "Delivered", "Returned", "Cancelled", "Payment failed"].map((name) => ({
    name,
    count: db.orders.filter((order) => order.fulfilment === name).length,
  }));

  return (
    <div className="space-y-4">
      <PageHead
        title="Operations overview"
        description="Central company view of brands, stock, orders and money. These records live in the local sample file."
      />
      <section className="rounded-2xl bg-[#161217] p-5 text-white">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_240px]">
          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] text-pink-200 uppercase">Sales in this sample</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">{inr(sales)}</p>
            <p className="mt-1 text-xs text-zinc-400">Each bar is one date on the local orders. The tallest days are pink.</p>
            <DayChart days={daySales} />
          </div>
          <Ring steps={pipeline} total={db.orders.length} />
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Gross margin" value={inr(margin)} note={`Paid sales minus supply ${inr(supply)}. Shipping is not deducted.`} tone="sky" />
        <Kpi label="Pending work" value={pending} note="Packing, ready, confirmed, failed pay" tone="amber" />
        <Kpi label="Low or empty stock" value={low.length} note="Variants at 11 units or below" tone="rose" />
      </div>
      <section>
        <p className="mb-2 text-[11px] font-medium tracking-wide text-gray-500 uppercase">Every desk</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {navGroups.flatMap((group) => group.items).filter((item) => item.to !== "/dashboard").map((item) => {
            const signal = deskSignal(db, item.to);
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-left hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="flex items-center justify-between gap-2">
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                  <span className={`text-sm font-semibold tabular-nums ${signal.problem ? "text-rose-600" : "text-gray-900 dark:text-white"}`}>{signal.value}</span>
                </span>
                <span className="mt-1 block truncate text-xs font-medium">{item.label}</span>
                <span className="block truncate text-[10px] text-gray-500">{signal.note}</span>
              </button>
            );
          })}
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface title="Recent orders">
          <Table
            columns={["Order", "Brand", "Product", "Value", "Fulfilment"]}
            rows={db.orders.slice(0, 6).map((order) => [
              order.id,
              order.brand,
              order.product,
              inr(order.value),
              order.fulfilment,
            ])}
            onRow={(index) => navigate(`/orders?record=${db.orders[index].id}`)}
          />
        </Surface>
        <Surface title="Needs a decision">
          <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
            {attention.map((item) => (
              <li key={item.id}>
                <button type="button" className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40" onClick={() => navigate(item.to)}>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </button>
              </li>
            ))}
          </ul>
        </Surface>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Surface title="Brand performance">
          <ul className="space-y-3 p-4">
            {brands.map((brand) => {
              const peak = Math.max(...brands.map((item) => item.sales), 1);
              return (
                <li key={brand.id}>
                  <button type="button" className="w-full text-left" onClick={() => navigate(`/brands?record=${brand.id}`)}>
                    <span className="flex items-center justify-between text-sm">
                      <span className="font-medium">{brand.name}</span>
                      <span className="tabular-nums text-gray-500">{inr(brand.sales)}</span>
                    </span>
                    <span className="mt-1.5 block h-2.5 rounded-full bg-gray-100 dark:bg-gray-700">
                      <span
                        className="block h-2.5 rounded-full bg-gray-900 dark:bg-white"
                        style={{ width: `${Math.max(6, (brand.sales / peak) * 100)}%` }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Surface>
        <Surface title="Top products">
          <Table
            columns={["Product", "Orders", "Sales"]}
            rows={topProducts.map((product) => [product.name, product.orders, inr(product.sales)])}
            onRow={(index) => navigate(`/products?record=${topProducts[index].id}`)}
          />
        </Surface>
      </div>
    </div>
  );
}

function deskSignal(db, path) {
  const open = (rows, test) => rows.filter(test).length;
  const signals = {
    "/brands": [open(db.brands, (row) => row.status !== "Active"), "not live"],
    "/partners": [open(db.partners, (row) => row.status !== "Active"), "not active"],
    "/websites": [open(db.websites, (row) => row.status !== "Published"), "not published"],
    "/products": [open(db.products, (row) => row.status !== "Active"), "hidden or draft"],
    "/categories": [open(db.categories, (row) => row.status !== "Active"), "draft groups"],
    "/pricing": [db.products.length, "prices on file"],
    "/suppliers": [open(db.suppliers, (row) => row.status !== "Active"), "on hold"],
    "/purchasing": [open(db.purchases, (row) => row.status !== "Received"), "not received"],
    "/warehouses": [db.warehouses.length, "company sites"],
    "/inventory": [open(db.inventory, (row) => row.available <= 11), "low or empty"],
    "/orders": [open(db.orders, (row) => row.fulfilment !== "Delivered"), "not delivered"],
    "/fulfilment": [open(db.fulfilment, (row) => row.status !== "Shipped"), "still in the warehouse"],
    "/shipping": [open(db.shipments, (row) => row.status === "RTO" || row.status === "Exception"), "RTO or exception"],
    "/private-label": [open(db.labels, (row) => row.status !== "Active"), "not approved"],
    "/packaging": [open(db.packaging, (row) => row.status !== "Available"), "low or out"],
    "/returns": [open(db.returns, (row) => row.status === "Pending approval" || row.status === "Inspection"), "waiting"],
    "/customers": [db.customers.length, "buyers on file"],
    "/payments": [open(db.payments, (row) => row.status === "Failed" || row.status === "Pending"), "failed or pending"],
    "/finance": [db.expenses.length, "expense lines"],
    "/settlements": [open(db.settlements, (row) => row.status !== "Paid"), "not paid"],
    "/marketing": [open(db.campaigns, (row) => row.status === "Live"), "live now"],
    "/academy": [open(db.courses, (row) => row.status !== "Published"), "draft lessons"],
    "/support": [open(db.tickets, (row) => row.status === "Open"), "open tickets"],
    "/notifications": [open(db.notices, (row) => row.status === "Failed" || row.status === "Draft"), "failed or draft"],
    "/reports": ["View", "brand, product, stock"],
    "/staff": [open(db.staff, (row) => row.status === "Active"), "desks active"],
    "/roles": [db.roles.length, "access sets"],
    "/settings": [db.settings.currency, "company currency"],
    "/security": [db.audit.length, "activity lines"],
  };
  const quiet = new Set(["/pricing", "/warehouses", "/customers", "/finance", "/marketing", "/reports", "/staff", "/roles", "/settings", "/security", "/fulfilment"]);
  const [value, note] = signals[path] || [0, "open"];
  return { value, note, problem: !quiet.has(path) && Number(value) > 0 };
}

function DayChart({ days }) {
  const peak = Math.max(...days.map((day) => day.sales), 1);
  const width = 640;
  const height = 140;
  const gap = 16;
  const bar = (width - gap * (days.length + 1)) / Math.max(days.length, 1);
  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="mt-4 h-40 w-full" role="img" aria-label="Sales by order date">
      {days.map((day, index) => {
        const barHeight = Math.max(8, (day.sales / peak) * (height - 8));
        const x = gap + index * (bar + gap);
        const y = height - barHeight;
        return (
          <g key={day.date}>
            <rect x={x} y={y} width={bar} height={barHeight} rx="6" fill={day.sales === peak ? "#ec4899" : "#3f3f46"}>
              <title>{`${day.date}: ${day.sales}`}</title>
            </rect>
            <text x={x + bar / 2} y={height + 16} textAnchor="middle" fontSize="11" fill="#a1a1aa">
              {day.date.replace(" 2026", "")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Ring({ steps, total }) {
  const radius = 38;
  const length = 2 * Math.PI * radius;
  const colors = {
    Delivered: "#34d399",
    Packing: "#ec4899",
    Shipped: "#38bdf8",
    "Ready to ship": "#fbbf24",
    Returned: "#fb7185",
    "Payment failed": "#e11d48",
    Cancelled: "#a1a1aa",
    Confirmed: "#818cf8",
  };
  let cursor = 0;
  const active = steps.filter((step) => step.count > 0);
  return (
    <div className="w-full max-w-[240px] justify-self-end">
      <svg viewBox="0 0 100 100" className="mx-auto h-24 w-24" role="img" aria-label="Orders by fulfilment">
        <g transform="rotate(-90 50 50)">
          {active.map((step) => {
            const slice = (step.count / total) * length;
            const dash = `${slice} ${length - slice}`;
            const node = (
              <circle
                key={step.name}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={colors[step.name] || "#52525b"}
                strokeWidth="12"
                strokeDasharray={dash}
                strokeDashoffset={-cursor}
              >
                <title>{`${step.name}: ${step.count}`}</title>
              </circle>
            );
            cursor += slice;
            return node;
          })}
        </g>
        <text x="50" y="54" textAnchor="middle" fontSize="16" fontWeight="600" fill="white">{total}</text>
      </svg>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-zinc-300">
        {active.map((step) => (
          <li key={step.name} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colors[step.name] || "#52525b" }} />
            <span className="truncate">{step.name} {step.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Table({ columns, rows, onRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-gray-100 text-[11px] tracking-wide text-gray-500 uppercase dark:border-gray-700">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.join("-")}
              className={`border-b border-gray-50 last:border-0 dark:border-gray-700 ${onRow ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40" : ""}`}
              onClick={onRow ? () => onRow(rowIndex) : undefined}
            >
              {row.map((cell, index) => (
                <td key={`${columns[index]}-${cell}`} className="px-4 py-2.5">
                  {columns[index] === "Status" || columns[index] === "Fulfilment" ? <Status value={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const modules = {
  brands: {
    title: "Brands",
    description: "Every brand using the company's supply. Suspending a brand also suspends its website and partner in this session.",
    collection: "brands",
    statusKey: "status",
    statuses: ["Active", "Pending approval", "Temporarily suspended", "Draft", "Deactivated", "Closed"],
    columns: [
      ["name", "Brand"],
      ["partner", "Partner"],
      ["domain", "Domain"],
      ["category", "Category"],
      ["status", "Status"],
    ],
  },
  partners: {
    title: "Partners",
    description: "People operating brands. They do not own stock or fulfilment.",
    collection: "partners",
    statusKey: "status",
    statuses: ["Active", "Pending approval", "Suspended", "Draft", "Deactivated"],
    columns: [
      ["name", "Partner"],
      ["brand", "Brand"],
      ["city", "City"],
      ["verification", "Verification"],
      ["status", "Status"],
    ],
  },
  websites: {
    title: "Websites & domains",
    description: "One storefront engine. Logo, colour and domain stay with each brand.",
    collection: "websites",
    statusKey: "status",
    statuses: ["Published", "Setup pending", "Suspended", "Draft"],
    columns: [
      ["brand", "Brand"],
      ["url", "Domain"],
      ["theme", "Theme"],
      ["ssl", "SSL"],
      ["status", "Status"],
    ],
  },
  products: {
    title: "Products",
    description: "Master catalogue. Partners sell only what the company publishes.",
    collection: "products",
    statusKey: "status",
    statuses: ["Active", "Hidden", "Draft"],
    columns: [
      ["name", "Product"],
      ["sku", "SKU"],
      ["category", "Category"],
      ["sizes", "Sizes"],
      ["status", "Status"],
    ],
  },
  categories: {
    title: "Categories",
    description: "How the catalogue is organised for every storefront.",
    collection: "categories",
    statusKey: "status",
    statuses: ["Active", "Draft"],
    columns: [
      ["name", "Category"],
      ["parent", "Parent"],
      ["products", "Products"],
      ["order", "Order"],
      ["status", "Status"],
    ],
  },
  pricing: {
    title: "Pricing & margins",
    description: "Company cost, partner supply price and suggested retail. Orders keep their own prices.",
    collection: "products",
    columns: [
      ["name", "Product"],
      ["cost", "Cost"],
      ["supply", "Supply price"],
      ["retail", "Suggested retail"],
      ["margin", "Company margin"],
    ],
    map(rows) {
      return rows.map((row) => ({
        ...row,
        cost: inr(row.cost),
        supply: inr(row.supply),
        retail: inr(row.retail),
        margin: inr(row.supply - row.cost),
      }));
    },
  },
  suppliers: {
    title: "Suppliers",
    description: "Manufacturers and wholesalers the company buys from.",
    collection: "suppliers",
    statusKey: "status",
    statuses: ["Active", "On hold"],
    columns: [
      ["name", "Supplier"],
      ["city", "City"],
      ["categories", "Categories"],
      ["invoices", "Invoices"],
      ["status", "Status"],
    ],
  },
  purchasing: {
    title: "Purchasing",
    description: "Purchase orders raised by the company. Mark one Received to add its quantity into central stock for this session.",
    collection: "purchases",
    statusKey: "status",
    statuses: ["Draft", "In transit", "Inspection", "Received"],
    columns: [
      ["id", "PO"],
      ["supplier", "Supplier"],
      ["product", "Product"],
      ["qty", "Qty"],
      ["cost", "Cost"],
      ["status", "Status"],
    ],
    map(rows) {
      return rows.map((row) => ({ ...row, cost: inr(row.cost) }));
    },
  },
  warehouses: {
    title: "Warehouses",
    description: "Physical locations controlled by the company.",
    collection: "warehouses",
    columns: [
      ["name", "Warehouse"],
      ["city", "City"],
      ["bins", "Bins"],
      ["inbound", "Inbound"],
      ["status", "Status"],
    ],
  },
  inventory: {
    title: "Inventory",
    description: "One stock pool. Reserved units cannot be sold twice. Returns stay unsellable until inspection.",
    collection: "inventory",
    columns: [
      ["sku", "SKU"],
      ["product", "Product"],
      ["size", "Size"],
      ["available", "Available"],
      ["reserved", "Reserved"],
      ["damaged", "Damaged"],
    ],
  },
  orders: {
    title: "Orders",
    description: "Every storefront order. Packing reserves the SKU. Shipped reduces stock and opens a local shipment.",
    collection: "orders",
    statusKey: "fulfilment",
    statuses: ["Confirmed", "Packing", "Ready to ship", "Shipped", "Delivered", "Cancelled", "Returned", "Payment failed"],
    columns: [
      ["id", "Order"],
      ["brand", "Brand"],
      ["product", "Product"],
      ["value", "Value"],
      ["payment", "Payment"],
      ["fulfilment", "Fulfilment"],
    ],
    map(rows) {
      return rows.map((row) => ({ ...row, value: inr(row.value) }));
    },
  },
  fulfilment: {
    title: "Fulfilment",
    description: "Pick, check, brand, pack and hand over from the central warehouse.",
    collection: "fulfilment",
    statusKey: "status",
    statuses: ["Waiting payment check", "Packing", "Ready to ship", "Shipped"],
    columns: [
      ["order", "Order"],
      ["brand", "Brand"],
      ["task", "Task"],
      ["branding", "Branding"],
      ["status", "Status"],
    ],
  },
  shipping: {
    title: "Shipping",
    description: "Courier, tracking and delivery for company-packed orders.",
    collection: "shipments",
    statusKey: "status",
    statuses: ["In transit", "Delivered", "RTO", "Exception"],
    columns: [
      ["order", "Order"],
      ["courier", "Courier"],
      ["awb", "AWB"],
      ["charge", "Charge"],
      ["status", "Status"],
    ],
    map(rows) {
      return rows.map((row) => ({ ...row, charge: inr(row.charge) }));
    },
  },
  "private-label": {
    title: "Private label",
    description: "Partner labels are used only after approval, and only on new orders.",
    collection: "labels",
    statusKey: "status",
    statuses: ["Pending approval", "Active", "Paused"],
    columns: [
      ["brand", "Brand"],
      ["type", "Type"],
      ["artwork", "Artwork"],
      ["stock", "Label stock"],
      ["status", "Status"],
    ],
  },
  packaging: {
    title: "Packaging",
    description: "Company mailers and partner packaging, with stock and cost.",
    collection: "packaging",
    statusKey: "status",
    statuses: ["Available", "Low", "Out"],
    columns: [
      ["name", "Material"],
      ["type", "Type"],
      ["stock", "Stock"],
      ["cost", "Cost"],
      ["status", "Status"],
    ],
    map(rows) {
      return rows.map((row) => ({ ...row, cost: inr(row.cost) }));
    },
  },
  returns: {
    title: "Returns & exchanges",
    description: "Restock approved returns one unit when the order is in this sample. Refunded updates the linked payment.",
    collection: "returns",
    statusKey: "status",
    statuses: ["Pending approval", "Inspection", "Restock approved", "Refunded", "Rejected"],
    columns: [
      ["order", "Order"],
      ["brand", "Brand"],
      ["reason", "Reason"],
      ["condition", "Condition"],
      ["status", "Status"],
    ],
  },
  customers: {
    title: "Customers",
    description: "Buyers stay tied to the brand they ordered from.",
    collection: "customers",
    columns: [
      ["label", "Customer"],
      ["brand", "Brand"],
      ["orders", "Orders"],
      ["spend", "Spend"],
      ["returns", "Returns"],
    ],
    map(rows) {
      return rows.map((row) => ({ ...row, spend: inr(row.spend) }));
    },
  },
  payments: {
    title: "Payments",
    description: "Each payment stays linked to one order. Changing the status updates that order.",
    collection: "payments",
    statusKey: "status",
    statuses: ["Pending", "Captured", "Failed", "Refunded"],
    columns: [
      ["order", "Order"],
      ["method", "Method"],
      ["amount", "Amount"],
      ["reference", "Reference"],
      ["status", "Status"],
    ],
    map(rows) {
      return rows.map((row) => ({ ...row, amount: inr(row.amount) }));
    },
  },
  finance: {
    title: "Finance",
    description: "Company costs and charges from the sample ledger, not from today's product prices.",
    collection: "expenses",
    columns: [
      ["head", "Head"],
      ["amount", "Amount"],
      ["month", "Month"],
      ["note", "Note"],
    ],
    map(rows) {
      return rows.map((row) => ({ ...row, amount: inr(row.amount) }));
    },
  },
  settlements: {
    title: "Settlements",
    description: "Stored settlement rows, plus a live margin from the current orders. Shipping is shown beside the margin and is not deducted.",
    collection: "settlements",
    statusKey: "status",
    statuses: ["Pending", "Approved", "On hold", "Paid"],
    columns: [
      ["partner", "Partner"],
      ["sales", "Sales"],
      ["margin", "Margin"],
      ["adjustments", "Adjustments"],
      ["status", "Status"],
    ],
    map(rows) {
      return rows.map((row) => ({
        ...row,
        sales: inr(row.sales),
        margin: inr(row.margin),
        adjustments: inr(row.adjustments),
      }));
    },
  },
  marketing: {
    title: "Marketing",
    description: "Platform and brand campaigns. Partners cannot exceed the discount the company allows.",
    collection: "campaigns",
    statusKey: "status",
    statuses: ["Live", "Scheduled", "Ended"],
    columns: [
      ["name", "Campaign"],
      ["scope", "Scope"],
      ["discount", "Discount"],
      ["ends", "Ends"],
      ["status", "Status"],
    ],
  },
  academy: {
    title: "Business academy",
    description: "Lessons that teach partners how to run a clothing brand.",
    collection: "courses",
    statusKey: "status",
    statuses: ["Published", "Draft"],
    columns: [
      ["title", "Course"],
      ["lessons", "Lessons"],
      ["partners", "Partners enrolled"],
      ["status", "Status"],
    ],
  },
  support: {
    title: "Support",
    description: "Partner and customer requests handled by the company.",
    collection: "tickets",
    statusKey: "status",
    statuses: ["Open", "In review", "Resolved"],
    columns: [
      ["id", "Ticket"],
      ["from", "From"],
      ["topic", "Topic"],
      ["priority", "Priority"],
      ["status", "Status"],
    ],
  },
  notifications: {
    title: "Notifications",
    description: "In-app, email and SMS messages, each with a delivery result.",
    collection: "notices",
    statusKey: "status",
    statuses: ["Draft", "Delivered", "Failed"],
    columns: [
      ["title", "Notice"],
      ["channel", "Channel"],
      ["audience", "Audience"],
      ["status", "Status"],
    ],
  },
  staff: {
    title: "Staff",
    description: "Desks that run warehouse, catalogue, finance and support.",
    collection: "staff",
    statusKey: "status",
    statuses: ["Active", "Inactive"],
    columns: [
      ["desk", "Desk"],
      ["department", "Department"],
      ["role", "Role"],
      ["status", "Status"],
    ],
  },
  roles: {
    title: "Roles & permissions",
    description: "Warehouse staff do not change prices. Finance does not edit stock.",
    collection: "roles",
    columns: [
      ["name", "Role"],
      ["access", "Can open"],
      ["people", "People"],
    ],
  },
  security: {
    title: "Security & activity",
    description: "Who changed a record in this session, plus the sample history.",
    collection: "audit",
    columns: [
      ["when", "When"],
      ["actor", "Actor"],
      ["what", "What"],
      ["detail", "Detail"],
    ],
  },
};

const lockedKeys = new Set(["id"]);
const dangerStatuses = new Set(["Temporarily suspended", "Suspended", "Deactivated", "Closed", "Refunded", "Rejected", "Cancelled", "Failed"]);

function coerce(original, value) {
  if (typeof original === "number") return Number(value) || 0;
  return value;
}

export function ModulePage({ id }) {
  const spec = modules[id];
  const { db, patch, add } = useStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const recordId = params.get("record");

  useEffect(() => {
    if (!recordId) return;
    const raw = db[spec.collection].find((row) => row.id === recordId);
    if (raw) {
      setCreating(false);
      setDraft(raw);
    }
    // Open the record from the URL. Later edits stay in the drawer until save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, spec.collection]);

  const rows = useMemo(() => {
    const source = spec.map ? spec.map(db[spec.collection]) : db[spec.collection];
    const needle = query.trim().toLowerCase();
    return source.filter((row) => {
      const matchesStatus = status === "All" || !spec.statusKey || row[spec.statusKey] === status;
      const haystack = spec.columns.map(([key]) => row[key]).join(" ").toLowerCase();
      return matchesStatus && (needle.length === 0 || haystack.includes(needle));
    });
  }, [db, query, spec, status]);

  const open = (row) => {
    setCreating(false);
    setDraft(row);
    setParams({ record: row.id });
  };

  const close = () => {
    setCreating(false);
    setDraft(null);
    setParams({});
  };

  const save = (event) => {
    event.preventDefault();
    if (creating) {
      const id = add(spec.collection, draft);
      setCreating(false);
      setParams({ record: id });
      return;
    }
    const original = db[spec.collection].find((row) => row.id === draft.id);
    const changes = {};
    Object.keys(draft).forEach((key) => {
      if (key === "id" || key === spec.statusKey) return;
      const value = coerce(original?.[key], draft[key]);
      if (value !== original?.[key]) changes[key] = value;
    });
    if (Object.keys(changes).length) {
      patch(spec.collection, draft.id, changes, `${spec.title} ${draft.id} edited`);
    }
  };

  const applyStatus = (next) => {
    if (creating) {
      setDraft((current) => ({ ...current, [spec.statusKey]: next }));
      return;
    }
    if (dangerStatuses.has(next) && !window.confirm(`Set ${draft.id} to ${next}? Linked local records update with it.`)) return;
    patch(spec.collection, draft.id, { [spec.statusKey]: next }, `${spec.title} ${draft.id} set to ${next}`);
    setDraft((current) => ({ ...current, [spec.statusKey]: next }));
  };

  return (
    <div>
      <PageHead
        title={spec.title}
        description={spec.description}
        action={
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setCreating(true);
              setDraft({ ...blanks[spec.collection] });
              setParams({});
            }}
          >
            Add record
          </button>
        }
      />
      {id === "orders" ? <OrderBoard /> : null}
      {id === "inventory" ? <StockBoard /> : null}
      {id === "finance" ? <FinanceBoard /> : null}
      {id === "settlements" ? <SettlementBoard /> : null}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${spec.title.toLowerCase()}`}
          className="input-field sm:max-w-sm"
        />
        {spec.statuses ? (
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="input-field sm:w-56"
          >
            <option>All</option>
            {spec.statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        ) : null}
        <p className="self-center text-xs text-gray-500">{rows.length} records</p>
      </div>
      <Surface>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-100 text-[11px] tracking-wide text-gray-500 uppercase dark:border-gray-700">
              <tr>
                {spec.columns.map(([, label]) => (
                  <th key={label} className="px-4 py-2 font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={spec.columns.length} className="px-4 py-8 text-center text-gray-500">
                    No records match.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-gray-50 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40"
                    onClick={() => open(db[spec.collection].find((item) => item.id === row.id))}
                  >
                    {spec.columns.map(([key, label]) => (
                      <td key={label} className="px-4 py-2.5">
                        {key === "status" || key === spec.statusKey || key === "payment" ? (
                          <Status value={row[key]} />
                        ) : (
                          row[key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Surface>
      {draft ? (
        <RecordDrawer
          title={creating ? `New ${spec.title.toLowerCase()}` : draft.id}
          draft={draft}
          creating={creating}
          statusKey={spec.statusKey}
          statuses={spec.statuses}
          links={creating ? [] : related(db, spec.collection, draft)}
          onChange={(key, value) => setDraft((current) => ({ ...current, [key]: value }))}
          onStatus={applyStatus}
          onClose={close}
          onSave={save}
        />
      ) : null}
    </div>
  );
}

function RecordDrawer({ title, draft, creating, statusKey, statuses, links, onChange, onStatus, onClose, onSave }) {
  const navigate = useNavigate();
  const fields = Object.keys(draft).filter((key) => !lockedKeys.has(key) && key !== statusKey);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#071525]/40">
      <aside className="flex h-full w-full max-w-md flex-col bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <p className="text-sm font-semibold">{title}</p>
          <button type="button" className="text-sm text-gray-500" onClick={onClose}>Close</button>
        </div>
        <form className="flex-1 space-y-4 overflow-y-auto p-4" onSubmit={onSave}>
          {fields.map((key) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block text-[11px] tracking-wide text-gray-500 uppercase">{key}</span>
              <input className="input-field" value={draft[key] ?? ""} onChange={(event) => onChange(key, event.target.value)} />
            </label>
          ))}
          {statuses ? (
            <label className="block text-sm">
              <span className="mb-1 block text-[11px] tracking-wide text-gray-500 uppercase">{statusKey}</span>
              <select className="input-field" value={draft[statusKey] || statuses[0]} onChange={(event) => onStatus(event.target.value)}>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          ) : null}
          {links.map((group) => (
            <div key={group.title}>
              <p className="mb-1 text-[11px] tracking-wide text-gray-500 uppercase">{group.title}</p>
              <div className="space-y-1">
                {group.rows.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => navigate(`${group.path}?record=${item.id}`)}
                  >
                    <span className="font-medium">{item.id}</span>
                    <span className="text-gray-500"> · {item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-primary" type="submit">{creating ? "Add to this session" : "Save edits"}</button>
        </form>
      </aside>
    </div>
  );
}

function OrderBoard() {
  const { db } = useStore();
  const steps = ["Confirmed", "Packing", "Ready to ship", "Shipped", "Delivered", "Payment failed", "Returned", "Cancelled"];
  return (
    <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      {steps.map((step) => (
        <div key={step} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-[11px] text-gray-500">{step}</p>
          <p className="text-sm font-semibold tabular-nums">{db.orders.filter((order) => order.fulfilment === step).length}</p>
        </div>
      ))}
    </div>
  );
}

function StockBoard() {
  const { db } = useStore();
  return (
    <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      {[
        ["Available", sum(db.inventory, "available")],
        ["Reserved", sum(db.inventory, "reserved")],
        ["Damaged", sum(db.inventory, "damaged")],
        ["Out of stock", db.inventory.filter((row) => row.available === 0).length],
      ].map(([label, value]) => (
        <div key={label} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-[11px] text-gray-500">{label}</p>
          <p className="text-sm font-semibold tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}

function FinanceBoard() {
  const { db } = useStore();
  const sales = sum(db.orders.filter((order) => order.payment === "Captured" || order.payment === "COD pending"), "value");
  const refunds = sum(db.orders.filter((order) => order.payment === "Refunded"), "value");
  const expenses = sum(db.expenses, "amount");
  return (
    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
      {[
        ["Captured and COD", inr(sales)],
        ["Refunded orders", inr(refunds)],
        ["Expense lines", inr(expenses)],
      ].map(([label, value]) => (
        <div key={label} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-[11px] text-gray-500">{label}</p>
          <p className="text-sm font-semibold tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}

function SettlementBoard() {
  const { db } = useStore();
  const rows = partnerMoney(db);
  return (
    <Surface title="Margin from current orders" className="mb-3">
      <Table
        columns={["Partner", "Paid sales", "Supply", "Gross margin", "Refunds", "Shipping shown"]}
        rows={rows.map((row) => [row.partner, inr(row.sales), inr(row.supply), inr(row.margin), inr(row.refunds), inr(row.shipping)])}
      />
    </Surface>
  );
}

export function Reports() {
  const { db } = useStore();
  const brands = brandStats(db);
  const products = db.products.map((product) => {
    const orders = db.orders.filter((order) => order.product === product.name && order.payment !== "Failed");
    return { ...product, orders: orders.length, sales: sum(orders, "value") };
  });

  return (
    <div className="space-y-4">
      <PageHead
        title="Reports"
        description="Brand, product, stock and money summaries from the same local records."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Surface title="Brand sales">
          <Table
            columns={["Brand", "Orders", "Sales", "Status"]}
            rows={brands.map((brand) => [brand.name, brand.orders, inr(brand.sales), brand.status])}
          />
        </Surface>
        <Surface title="Product sales">
          <Table
            columns={["Product", "Orders", "Sales", "Supply price"]}
            rows={products.map((product) => [product.name, product.orders, inr(product.sales), inr(product.supply)])}
          />
        </Surface>
      </div>
      <Surface title="Partner margin from current orders">
        <Table
          columns={["Partner", "Paid sales", "Supply", "Gross margin", "Refunds"]}
          rows={partnerMoney(db).map((row) => [row.partner, inr(row.sales), inr(row.supply), inr(row.margin), inr(row.refunds)])}
        />
      </Surface>
      <Surface title="Stock position">
        <Table
          columns={["SKU", "Available", "Reserved", "Damaged"]}
          rows={db.inventory.map((row) => [row.sku, row.available, row.reserved, row.damaged])}
        />
      </Surface>
    </div>
  );
}

export function SettingsPage() {
  const { db, saveSettings } = useStore();
  const [form, setForm] = useState(db.settings);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div>
      <PageHead
        title="Settings"
        description="Company defaults for this panel. Saving stays in the browser session."
      />
      <Surface>
        <form
          className="grid gap-4 p-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            saveSettings(form);
          }}
        >
          {[
            ["company", "Company name"],
            ["email", "Support email"],
            ["phone", "Phone"],
            ["city", "City"],
            ["currency", "Currency"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm">
              <span className="mb-1 block text-xs text-gray-500">{label}</span>
              <input className="input-field" value={form[key]} onChange={set(key)} />
            </label>
          ))}
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs text-gray-500">Tax note</span>
            <textarea className="input-field min-h-20" value={form.tax} onChange={set("tax")} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs text-gray-500">Shipping rule</span>
            <textarea className="input-field min-h-20" value={form.shipping} onChange={set("shipping")} />
          </label>
          <div>
            <button className="btn-primary" type="submit">Save settings</button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
