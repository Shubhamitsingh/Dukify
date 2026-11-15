import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Eye,
  IndianRupee,
  LifeBuoy,
  Package,
  ShoppingBag,
  TrendingUp,
  Truck,
  Undo2,
  Users,
  Wallet,
} from "lucide-react";
import { usePartner } from "../store";
import {
  DateRange,
  FilterChip,
  Kpi,
  LineChart,
  OrderMixPanel,
  PageHead,
  PerformanceChart,
  SoftButton,
  Status,
  Surface,
  Swatch,
} from "../ui";
import {
  customerStats,
  dailySeries,
  delta,
  formatDate,
  inr,
  statusCounts,
  summarize,
  topProducts,
  trafficTotals,
} from "../lib/metrics";
import { menu, pathFor } from "../nav";

const copy = {
  overview: ["Business overview", "How your brand is performing in the selected window."],
  sales: ["Sales overview", "Sales are summed from this brand's orders. Cancelled orders are left out of the sales total."],
  orders: ["Order overview", "You can follow fulfilment. Packing, shipping, and delivery stay with Pahachan."],
  revenue: ["Revenue overview", "Estimated earnings are not the final payout. Central settlement rules still apply."],
  activity: ["Recent activity", "Orders, notices, and tickets for this brand only."],
};

const rangeChips = [
  ["all", "All dates"],
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["last7", "Last 7 days"],
  ["last30", "Last 30 days"],
  ["thisMonth", "This month"],
  ["lastMonth", "Last month"],
];

export default function Dashboard({ section }) {
  const navigate = useNavigate();
  const partner = usePartner();
  const [range, setRange] = useState("last30");
  const [custom, setCustom] = useState({ start: "2026-10-12", end: "2026-11-11" });
  const summary = useMemo(() => summarize(partner.orders, partner.brand, range, custom), [partner, range, custom]);
  const series = useMemo(() => dailySeries(partner.orders, partner.brand, summary.bounds), [partner, summary.bounds]);
  const today = useMemo(() => summarize(partner.orders, partner.brand, "today"), [partner]);
  const tops = topProducts(summary.rows, partner.products, 5);
  const people = customerStats(partner.customers, partner.orders);
  const visits = trafficTotals(partner.traffic, summary.bounds);
  const listed = partner.products.filter((product) => product.selected && product.approval === "Approved").length;
  const [title, description] = copy[section];
  const pipeline = statusCounts(summary.rows);
  const allPipeline = statusCounts(partner.orders);
  const recent = [...partner.orders].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 6);
  const pending = partner.orders.filter((order) => ["New", "Confirmed", "Processing", "Packed"].includes(order.status)).length;
  const lowStock = partner.products.filter((product) => product.selected && product.availability === "Out of stock").length;
  const openTickets = partner.tickets.filter((ticket) => ticket.status === "Open").length;
  const unread = partner.notifications.filter((note) => !note.read).length;
  const attention = [
    ...partner.tickets
      .filter((ticket) => ticket.status === "Open")
      .slice(0, 4)
      .map((ticket) => ({ id: ticket.id, title: ticket.subject, detail: ticket.status, to: "/brand/support/tickets" })),
    ...partner.notifications
      .filter((note) => !note.read)
      .slice(0, 3)
      .map((note) => ({ id: note.id, title: note.title, detail: note.body, to: "/brand/notifications/all" })),
  ];
  const activityFeed = useMemo(() => {
    const orders = [...partner.orders]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .slice(0, 8)
      .map((order) => {
        const customer = partner.customers.find((item) => item.id === order.customerId);
        const product = partner.products.find((item) => item.id === order.productId);
        return {
          id: `order-${order.id}`,
          kind: "order",
          title: order.id,
          body: `${customer?.name || "Customer"} · ${product?.name || "Product"}`,
          meta: order.status,
          at: `${order.date}T12:00:00`,
          to: `/brand/orders/item/${order.id}`,
          unread: false,
        };
      });
    const notices = [...partner.notifications]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 8)
      .map((note) => ({
        id: `note-${note.id}`,
        kind: "notice",
        title: note.title,
        body: note.body,
        meta: note.type,
        at: note.at,
        to: "/brand/notifications/all",
        unread: !note.read,
      }));
    const tickets = [...partner.tickets]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6)
      .map((ticket) => ({
        id: `ticket-${ticket.id}`,
        kind: "ticket",
        title: ticket.subject,
        body: ticket.message,
        meta: ticket.status,
        at: ticket.createdAt,
        to: "/brand/support/tickets",
        unread: ticket.status === "Open",
      }));
    return [...orders, ...notices, ...tickets].sort((a, b) => b.at.localeCompare(a.at));
  }, [partner.customers, partner.notifications, partner.orders, partner.products, partner.tickets]);

  const deskCards = menu
    .filter((group) => group.id !== "dashboard")
    .map((group) => {
      const to = pathFor(group.id, group.items[0][0]);
      const Icon = group.icon;
      let value = "Open";
      let note = group.label;
      let problem = false;
      if (group.id === "orders") {
        value = pending;
        note = "open fulfilment";
        problem = pending > 0;
      } else if (group.id === "products") {
        value = listed;
        note = "listed styles";
      } else if (group.id === "customers") {
        value = people.length;
        note = "on your store";
      } else if (group.id === "earnings") {
        value = inr(summary.current.earnings);
        note = "estimated";
      } else if (group.id === "support") {
        value = openTickets;
        note = "open tickets";
        problem = openTickets > 0;
      } else if (group.id === "notifications") {
        value = unread;
        note = "unread";
        problem = unread > 0;
      } else if (group.id === "marketing") {
        value = partner.coupons?.length || 0;
        note = "coupons";
      } else if (group.id === "analytics") {
        value = summary.current.orders;
        note = "orders in range";
      } else if (group.id === "store") {
        value = partner.brand.status;
        note = "store status";
      } else if (group.id === "academy") {
        value = Object.keys(partner.lessons || {}).length;
        note = "completed";
      } else if (group.id === "settings") {
        value = "Edit";
        note = "profile & bank";
      }
      return { id: group.id, label: group.label, Icon, to, value, note, problem };
    });

  if (section === "activity") {
    return <ActivityPage feed={activityFeed} unread={unread} openTickets={openTickets} pending={pending} navigate={navigate} />;
  }

  if (section === "overview") {
    const aov = summary.current.orders ? summary.current.sales / summary.current.orders : 0;
    const returnsOpen = partner.orders.filter((order) =>
      ["Return requested", "Returned", "Refunded"].includes(order.status),
    ).length;

    return (
      <div className="w-full space-y-3">
        <section className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 xl:grid-cols-4 2xl:grid-cols-7">
          <Kpi
            label="Sales"
            value={inr(summary.current.sales)}
            note="Failed / cancelled excluded"
            tone="hero"
            icon={<IndianRupee className="h-4 w-4" />}
            trend={delta(summary.current.sales, summary.prior.sales)}
            onClick={() => navigate("/brand/analytics/sales")}
          />
          <Kpi
            label="Est. earnings"
            value={inr(summary.current.earnings)}
            note="Before settlement"
            tone="sky"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={delta(summary.current.earnings, summary.prior.earnings)}
            onClick={() => navigate("/brand/earnings/overview")}
          />
          <Kpi
            label="Orders"
            value={summary.current.orders}
            note={`${today.current.orders} today`}
            tone="pink"
            icon={<ShoppingBag className="h-4 w-4" />}
            onClick={() => navigate("/brand/orders/all")}
          />
          <Kpi
            label="AOV"
            value={inr(aov)}
            note="Avg order value"
            tone="emerald"
            icon={<Wallet className="h-4 w-4" />}
            onClick={() => navigate("/brand/analytics/sales")}
          />
          <Kpi
            label="Pending"
            value={pending}
            note="New → packed"
            tone="amber"
            icon={<Package className="h-4 w-4" />}
            onClick={() => navigate("/brand/orders/processing")}
          />
          <Kpi
            label="Customers"
            value={people.length}
            note={`${listed} listed`}
            tone="slate"
            icon={<Users className="h-4 w-4" />}
            onClick={() => navigate("/brand/customers/all")}
          />
          <Kpi
            label="Store visits"
            value={visits.visits}
            note={`${visits.views} product views`}
            tone="violet"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => navigate("/brand/analytics/traffic")}
          />
        </section>

        <section className="grid w-full gap-3 xl:grid-cols-[1.45fr_0.9fr]">
          <Surface className="overflow-visible">
            <PerformanceChart series={series} />
          </Surface>
          <Surface title="Order mix" className="!overflow-visible">
            <OrderMixPanel pipeline={allPipeline} total={partner.orders.length} />
          </Surface>
        </section>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
          <Kpi
            label="Out of stock"
            value={lowStock}
            note="Listed styles with no stock"
            tone="rose"
            icon={<Package className="h-4 w-4" />}
            onClick={() => navigate("/brand/products/availability")}
          />
          <Kpi
            label="Returns"
            value={returnsOpen}
            note="Return / refund open"
            tone="amber"
            icon={<Undo2 className="h-4 w-4" />}
            onClick={() => navigate("/brand/orders/returns")}
          />
          <Kpi
            label="Needs a decision"
            value={openTickets + unread}
            note="Tickets + unread notices"
            tone="pink"
            icon={<AlertTriangle className="h-4 w-4" />}
            onClick={() => navigate("/brand/support/tickets")}
          />
        </section>

        <section className="space-y-2.5">
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="flex items-center justify-between gap-2">
              <p className="shrink-0 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Brand orders</p>
              <button type="button" className="btn-primary px-2.5 py-1.5 text-[11px] lg:hidden" onClick={() => navigate("/brand/orders/all")}>
                Orders desk
              </button>
            </div>
            <div className="chip-scroll items-center lg:justify-end">
              {rangeChips.map(([id, label]) => (
                <FilterChip key={id} active={range === id} onClick={() => setRange(id)}>
                  {label}
                </FilterChip>
              ))}
              <button type="button" className="btn-primary hidden shrink-0 px-2.5 py-1.5 text-[11px] lg:inline-flex" onClick={() => navigate("/brand/orders/all")}>
                Orders desk
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {[
              ["Orders in period", summary.current.orders, "slate"],
              ["Sales in period", inr(summary.current.sales), "pink"],
              ["Store visits", visits.visits.toLocaleString("en-IN"), "sky"],
              ["Estimated pay", inr(summary.current.earnings), "amber"],
            ].map(([label, value, tone]) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200/80 bg-white px-3 py-2.5 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800"
              >
                <p className="text-[11px] font-medium text-gray-500">{label}</p>
                <p
                  className={`mt-1 text-base font-semibold tabular-nums ${
                    tone === "amber" ? "text-amber-700" : tone === "pink" ? "text-pink-700" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Every desk</p>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {deskCards.map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="rounded-2xl border border-gray-200/80 bg-white px-3 py-3 text-left shadow-[var(--app-shadow)] transition hover:-translate-y-0.5 hover:border-pink-200 dark:border-gray-700 dark:bg-gray-800"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className={`text-sm font-semibold tabular-nums ${item.problem ? "text-rose-600" : "text-gray-900 dark:text-white"}`}>
                      {item.value}
                    </span>
                  </span>
                  <span className="mt-2 block truncate text-xs font-semibold text-gray-800 dark:text-gray-100">{item.label}</span>
                  <span className="block truncate text-[11px] text-gray-500">{item.note}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <Surface title="Recent orders" action={<SoftButton onClick={() => navigate("/brand/orders/all")}>View all</SoftButton>}>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {recent.map((order) => {
                const customer = partner.customers.find((item) => item.id === order.customerId);
                const product = partner.products.find((item) => item.id === order.productId);
                return (
                  <li key={order.id}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left hover:bg-gray-50 sm:items-center sm:px-4 dark:hover:bg-gray-800"
                      onClick={() => navigate(`/brand/orders/item/${order.id}`)}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{order.id}</span>
                        <span className="block truncate text-xs text-gray-500">
                          {customer?.name} · {product?.name} · {formatDate(order.date)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-semibold tabular-nums">{inr(order.retailUnit * order.qty - order.discount)}</span>
                        <Status value={order.status} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Surface>
          <Surface title="Needs a decision" action={<SoftButton onClick={() => navigate("/brand/support/tickets")}>Open desk</SoftButton>}>
            <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
              {attention.length === 0 ? <li className="px-4 py-8 text-center text-sm text-gray-500">Nothing waiting right now.</li> : null}
              {attention.map((item) => (
                <li key={item.id}>
                  <button type="button" className="w-full px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40" onClick={() => navigate(item.to)}>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.detail}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Surface>
        </div>

        <div className="grid w-full gap-4 xl:grid-cols-2">
          <Surface title="Top products" action={<SoftButton onClick={() => navigate("/brand/products/browse")}>Catalogue</SoftButton>}>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {tops.length === 0 ? <li className="px-4 py-8 text-sm text-gray-500">No sold units in this period.</li> : null}
              {tops.map((row) => (
                <li key={row.product.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => navigate(`/brand/products/item/${row.product.id}`)}
                  >
                    <Swatch color={row.product.color} label={row.product.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{row.product.name}</span>
                      <span className="block text-xs text-gray-500">
                        {row.product.sku} · {row.units} units
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{inr(row.sales)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Surface>
          <Surface title="Store performance" padded>
            <p className="mb-3 text-xs text-gray-500">Demo traffic for {summary.bounds.label}.</p>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Store visits", visits.visits.toLocaleString("en-IN")],
                ["Product views", visits.views.toLocaleString("en-IN")],
                ["Add to cart", visits.carts.toLocaleString("en-IN")],
                ["Conversion", visits.visits ? `${((summary.current.orders / visits.visits) * 100).toFixed(1)}%` : "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-gray-50 px-3 py-3 dark:bg-gray-900">
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </Surface>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHead
        eyebrow="Dashboard"
        title={title}
        description={description}
        action={
          <>
            <DateRange value={range} custom={custom} onChange={setRange} onCustom={setCustom} />
            <button type="button" className="btn-soft" onClick={() => navigate("/brand/store/preview")}>
              View store
            </button>
            <button type="button" className="btn-primary" onClick={() => navigate("/brand/store/editor")}>
              Edit store
            </button>
          </>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <Kpi label="Total orders" value={summary.current.orders} trend={delta(summary.current.orders, summary.prior.orders)} note="vs previous period" tone="pink" icon={<ShoppingBag className="h-4 w-4" />} onClick={() => navigate("/brand/orders/all")} />
        <Kpi label="Orders today" value={today.current.orders} note="11 Nov 2026" tone="sky" icon={<Truck className="h-4 w-4" />} onClick={() => navigate("/brand/orders/new")} />
        <Kpi label="Total sales" value={inr(summary.current.sales)} trend={delta(summary.current.sales, summary.prior.sales)} note="excludes cancelled" tone="emerald" icon={<IndianRupee className="h-4 w-4" />} onClick={() => navigate("/brand/analytics/sales")} />
        <Kpi label="Estimated earnings" value={inr(summary.current.earnings)} trend={delta(summary.current.earnings, summary.prior.earnings)} note="before final settlement" tone="amber" icon={<Wallet className="h-4 w-4" />} onClick={() => navigate("/brand/earnings/overview")} />
        {section === "orders" ? (
          <Kpi label="Pending orders" value={pending} note="open with Pahachan now" tone="rose" icon={<Package className="h-4 w-4" />} onClick={() => navigate("/brand/orders/processing")} />
        ) : null}
      </div>
      {(section === "sales" || section === "revenue") && (
        <div className="mb-4 grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
          <Surface className="overflow-visible">
            <PerformanceChart series={series} rangeLabel={summary.bounds.label} />
          </Surface>
          <Surface title="Order mix" className="!overflow-visible">
            <OrderMixPanel pipeline={pipeline} total={summary.rows.length} />
          </Surface>
        </div>
      )}
      {section === "orders" ? (
        <Surface title="Status in this period" className="mb-4">
          <ul className="grid gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-4 dark:bg-gray-800">
            {pipeline.map((row) => (
              <li key={row.status} className="bg-white px-4 py-4 dark:bg-gray-900">
                <Status value={row.status} />
                <p className="mt-2 text-xl font-semibold tabular-nums">{row.count}</p>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}
      {section === "sales" ? (
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Surface title="Top selling products">
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {tops.length === 0 ? <li className="px-4 py-8 text-sm text-gray-500">No sold units in this period.</li> : null}
              {tops.map((row) => (
                <li key={row.product.id}>
                  <button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate(`/brand/products/item/${row.product.id}`)}>
                    <Swatch color={row.product.color} label={row.product.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{row.product.name}</span>
                      <span className="block text-xs text-gray-500">
                        {row.product.sku} · {row.units} units
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{inr(row.sales)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Surface>
          <Surface title="Recent orders" action={<button type="button" className="text-xs font-semibold text-pink-700" onClick={() => navigate("/brand/orders/all")}>View all</button>}>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {recent.map((order) => {
                const customer = partner.customers.find((item) => item.id === order.customerId);
                const product = partner.products.find((item) => item.id === order.productId);
                return (
                  <li key={order.id}>
                    <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate(`/brand/orders/item/${order.id}`)}>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{order.id}</span>
                        <span className="block truncate text-xs text-gray-500">
                          {customer?.name} · {product?.name} · {formatDate(order.date)}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-semibold tabular-nums">{inr(order.retailUnit * order.qty - order.discount)}</span>
                        <Status value={order.status} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Surface>
        </div>
      ) : null}
      {section === "revenue" ? (
        <>
          <Surface title="Earnings trend" className="mb-4" padded>
            <LineChart series={series} field="earnings" />
            <p className="text-xs text-gray-500">Pink line is estimated earnings per day for {summary.bounds.label}.</p>
          </Surface>
          <Surface title="How this estimate is built" padded>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
              Partner supply price stays visible. Central purchase cost does not. Estimated earning for an order is gross margin, minus this brand&apos;s{" "}
              {Math.round(partner.brand.commissionRate * 100)}% commission, {Math.round(partner.brand.gatewayRate * 1000) / 10}% gateway deduction, and{" "}
              {inr(partner.brand.shippingShare)} shipping share once the order has shipped. Refunded and returned orders contribute zero. Pahachan approves what is actually paid.
            </p>
          </Surface>
        </>
      ) : null}
    </div>
  );
}

function ActivityPage({ feed, unread, openTickets, pending, navigate }) {
  const [filter, setFilter] = useState("all");
  const rows = filter === "all" ? feed : feed.filter((item) => item.kind === filter);
  const kindMeta = {
    order: { label: "Order", icon: ShoppingBag, tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
    notice: { label: "Notice", icon: Bell, tone: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300" },
    ticket: { label: "Ticket", icon: LifeBuoy, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  };
  const filters = [
    ["all", "All", feed.length],
    ["order", "Orders", feed.filter((item) => item.kind === "order").length],
    ["notice", "Notices", feed.filter((item) => item.kind === "notice").length],
    ["ticket", "Tickets", feed.filter((item) => item.kind === "ticket").length],
  ];

  return (
    <div className="space-y-4">
      <PageHead
        eyebrow="Dashboard"
        title="Recent activity"
        description="A single feed of orders, notices, and support tickets for this brand. Tap a row to open the related desk."
        action={
          <>
            <SoftButton onClick={() => navigate("/brand/notifications/all")}>Notifications</SoftButton>
            <button type="button" className="btn-primary" onClick={() => navigate("/brand/support/tickets")}>
              Support desk
            </button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Kpi label="In this feed" value={feed.length} note="Orders, notices, tickets" tone="pink" icon={<TrendingUp className="h-4 w-4" />} />
        <Kpi label="Unread notices" value={unread} note="Need a look" tone="amber" icon={<Bell className="h-4 w-4" />} onClick={() => navigate("/brand/notifications/all")} />
        <Kpi label="Open tickets" value={openTickets} note="Waiting on support" tone="rose" icon={<LifeBuoy className="h-4 w-4" />} onClick={() => navigate("/brand/support/tickets")} />
        <Kpi label="Pending orders" value={pending} note="New through packed" tone="sky" icon={<Package className="h-4 w-4" />} onClick={() => navigate("/brand/orders/processing")} />
      </section>

      <div className="chip-scroll items-center gap-1.5">
        {filters.map(([id, label, count]) => (
          <FilterChip key={id} active={filter === id} count={count} onClick={() => setFilter(id)}>
            {label}
          </FilterChip>
        ))}
      </div>

      <Surface title={`${rows.length} updates`}>
        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Nothing in this filter</p>
            <p className="mt-1 text-sm text-gray-500">Try All, or open another desk from the chips above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((item) => {
              const meta = kindMeta[item.kind];
              const Icon = meta.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`flex w-full items-start gap-3 px-3 py-3.5 text-left transition hover:bg-gray-50 sm:px-4 dark:hover:bg-gray-800/60 ${
                      item.unread ? "bg-pink-50/40 dark:bg-pink-950/15" : ""
                    }`}
                    onClick={() => navigate(item.to)}
                  >
                    <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-800">
                          {meta.label}
                        </span>
                        {item.unread ? <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> : null}
                      </span>
                      <span className="mt-0.5 block text-xs leading-4 text-gray-500">{item.body}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-2">
                        {item.kind === "order" || item.kind === "ticket" ? <Status value={item.meta} /> : (
                          <span className="text-[11px] capitalize text-gray-400">{item.meta}</span>
                        )}
                        <span className="text-[11px] text-gray-400">{formatDate(item.at.slice(0, 10))}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Surface>
    </div>
  );
}

Dashboard.moduleId = "dashboard";
