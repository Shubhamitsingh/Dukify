import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Download,
  IndianRupee,
  Package,
  PackageX,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { downloadBlob } from "./catalogue";
import { commerceSnapshot, isBookedSalesOrder } from "./commerce/metrics";
import { inr, sum } from "./data";
import {
  ORDER_PERIODS,
  brandOrderMatrix,
  brandOrderPerformance,
  filterOrders,
  formatSampleDay,
  money,
  orderSummary,
  parseOrderDate,
  sampleToday,
} from "./orderDesk";
import { blanks, partnerMoney, related } from "./local";
import { navGroups } from "./shell";
import { useStore } from "./store";
import { settingsCurrency } from "./settings";
import { DrawerShell, FilterChip, Kpi, ModalShell, PageHead, SoftButton, Status, Surface, Toolbar } from "./ui";
import { approvals as approvalRows, exceptions, orderItems } from "./work";

export { SettingsPage } from "./settings";

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportModuleCsv(filename, columns, rows) {
  const header = columns.map(([, label]) => label).join(",");
  const lines = rows.map((row) => columns.map(([key]) => csvEscape(row[key])).join(","));
  downloadBlob(filename, [header, ...lines].join("\n"), "text/csv;charset=utf-8");
}

function exportModuleXlsx(filename, sheetName, columns, rows) {
  const header = columns.map(([, label]) => label);
  const data = [header, ...rows.map((row) => columns.map(([key]) => row[key] ?? ""))];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName.slice(0, 31));
  XLSX.writeFile(book, filename);
}

function moduleEyebrow(id) {
  const group = navGroups.find((entry) => entry.items.some((item) => item.to === `/${id}`));
  return group?.label || "Workspace";
}

// Same soft mix family as the order-mix ring — avoid dark navy / deep browns.
const brandPalette = ["#ec4899", "#38bdf8", "#34d399", "#fbbf24", "#818cf8", "#fb7185", "#2dd4bf", "#a78bfa"];

function brandStats(db) {
  return db.brands
    .map((brand, index) => {
      const orders = db.orders.filter((order) => order.brand === brand.name && isBookedSalesOrder(order));
      return {
        ...brand,
        orders: orders.length,
        sales: sum(orders, "value"),
        color: brandPalette[index % brandPalette.length],
      };
    })
    .sort((left, right) => right.sales - left.sales || left.name.localeCompare(right.name));
}

export function Dashboard() {
  const { db } = useStore();
  const navigate = useNavigate();
  const brands = brandStats(db);
  const snap = commerceSnapshot(db);
  const paidOrders = db.orders.filter((order) => order.payment === "Captured" || order.payment === "COD pending");
  const sales = snap.bookedSales;
  const margin = snap.grossMarginOnPaid;
  const supply = snap.supplyOnPaid;
  const low = db.inventory.filter((row) => row.available <= (Number(row.reorderAt) || 11));
  const pending = db.orders.filter((order) =>
    ["Confirmed", "Packing", "Ready to ship", "Payment failed", "New", "Processing"].includes(order.fulfilment) ||
    ["New", "Processing", "Confirmed"].includes(order.fulfillmentStatus),
  ).length;
  const attention = exceptions(db).filter((row) => row.priority === "High" || row.priority === "Medium");
  const topProducts = [...db.products]
    .map((product) => {
      const orders = db.orders.filter((order) => order.product === product.name && isBookedSalesOrder(order));
      return { ...product, orders: orders.length, sales: sum(orders, "value") };
    })
    .sort((left, right) => right.sales - left.sales)
    .slice(0, 5);

  const pipeline = ["Confirmed", "Packing", "Ready to ship", "Shipped", "Delivered", "Returned", "Cancelled", "Payment failed"].map((name) => ({
    name,
    count: db.orders.filter((order) => order.fulfilment === name).length,
  }));
  const aov = snap.bookedOrders ? sales / snap.bookedOrders : 0;
  const ndrOpen = (db.shipments || []).filter((row) => row.status === "NDR").length;
  const openApprovals = approvalRows(db).length;
  const refunded = db.orders.filter((order) => order.payment === "Refunded").length;

  return (
    <div className="w-full space-y-5">
      <section className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 xl:grid-cols-4 2xl:grid-cols-7">
        <Kpi
          label="Booked GMV"
          value={inr(sales)}
          note={snap.labels.bookedSalesNote}
          tone="hero"
          icon={<IndianRupee className="h-4 w-4" />}
          trend={{ up: true, label: `${paidOrders.length} paid/COD` }}
          onClick={() => navigate("/reports")}
        />
        <Kpi
          label="Gross margin"
          value={inr(margin)}
          note={snap.labels.grossMarginNote}
          tone="sky"
          icon={<TrendingUp className="h-4 w-4" />}
          onClick={() => navigate("/finance")}
        />
        <Kpi
          label="Orders"
          value={snap.totalOrders}
          note={`${snap.liveOrders} live · ${pending} in ops`}
          tone="pink"
          icon={<ClipboardList className="h-4 w-4" />}
          onClick={() => navigate("/orders")}
        />
        <Kpi
          label="AOV"
          value={inr(aov)}
          note="On booked GMV orders"
          tone="emerald"
          icon={<IndianRupee className="h-4 w-4" />}
          onClick={() => navigate("/reports")}
        />
        <Kpi
          label="Active brands"
          value={brands.filter((brand) => brand.status === "Active").length}
          note={`${brands.length} on file`}
          tone="violet"
          icon={<Store className="h-4 w-4" />}
          onClick={() => navigate("/brands")}
        />
        <Kpi
          label="NDR open"
          value={ndrOpen}
          note="Courier follow-up"
          tone="amber"
          icon={<PackageX className="h-4 w-4" />}
          onClick={() => navigate("/ndr")}
        />
        <Kpi
          label="Exceptions"
          value={attention.length}
          note="High / medium"
          tone="rose"
          icon={<AlertTriangle className="h-4 w-4" />}
          onClick={() => navigate("/exceptions")}
        />
      </section>

      <SalesTrendSection orders={db.orders} pipeline={pipeline} />

      <section className="grid gap-3 md:grid-cols-3">
        <DeliveryRateCard pipeline={pipeline} total={db.orders.length} />
        <MoneyCompareCard sales={sales} margin={margin} supply={supply} />
        <PaymentMixCard orders={db.orders} />
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
        <Kpi
          label="Pending work"
          value={pending}
          note="Ops queue"
          tone="amber"
          icon={<Truck className="h-4 w-4" />}
          onClick={() => navigate("/orders")}
        />
        <Kpi
          label="Low stock"
          value={low.length}
          note="At reorder point"
          tone="rose"
          icon={<Boxes className="h-4 w-4" />}
          onClick={() => navigate("/inventory")}
        />
        <Kpi
          label="Approvals"
          value={openApprovals}
          note="Waiting review"
          tone="pink"
          icon={<ClipboardCheck className="h-4 w-4" />}
          onClick={() => navigate("/approvals")}
        />
        <Kpi
          label="Refunded"
          value={refunded}
          note="Payment refunded"
          tone="slate"
          icon={<Package className="h-4 w-4" />}
          onClick={() => navigate("/finance")}
        />
      </section>

      <section>
        <CentralOrdersPanel compact />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface title="Recent orders" action={<button type="button" className="btn-soft" onClick={() => navigate("/orders")}>View all</button>}>
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
        <Surface title="Needs a decision" action={<button type="button" className="btn-soft" onClick={() => navigate("/exceptions")}>Open desk</button>}>
          <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
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
        <Surface title="Brand performance" action={<span className="text-xs text-gray-500">Share of sample sales</span>}>
          <ul className="space-y-3.5 p-4">
            {(() => {
              const totalSales = brands.reduce((bag, brand) => bag + brand.sales, 0) || 1;
              return brands.map((brand) => {
                const share = (brand.sales / totalSales) * 100;
                return (
                  <li key={brand.id}>
                    <button type="button" className="w-full text-left" onClick={() => navigate(`/brands?record=${brand.id}`)}>
                      <span className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: brand.color }} />
                          <span className="truncate font-medium">{brand.name}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-gray-500">
                          {inr(brand.sales)} · {share.toFixed(0)}%
                        </span>
                      </span>
                      <span className="mt-1.5 block h-2.5 rounded-full bg-gray-100 dark:bg-gray-700">
                        <span
                          className="block h-2.5 rounded-full transition-[width]"
                          style={{
                            width: `${share}%`,
                            background: brand.color,
                          }}
                        />
                      </span>
                    </button>
                  </li>
                );
              });
            })()}
          </ul>
        </Surface>
        <Surface title="Top products" action={<button type="button" className="btn-soft" onClick={() => navigate("/products")}>Catalogue</button>}>
          <Table
            columns={["Product", "Orders", "Sales"]}
            rows={topProducts.map((product) => [product.name, product.orders, inr(product.sales)])}
            onRow={(index) => navigate(`/products?record=${topProducts[index].id}`)}
          />
        </Surface>
      </div>

      <section>
        <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Every desk</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
          {navGroups.flatMap((group) => group.items).filter((item) => item.to !== "/dashboard").map((item) => {
            const signal = deskSignal(db, item.to);
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className="rounded-2xl border border-gray-200/80 bg-white px-3 py-3 text-left shadow-[var(--app-shadow)] transition hover:-translate-y-0.5 hover:border-pink-200 dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${signal.problem ? "text-rose-600" : "text-gray-900 dark:text-white"}`}>{signal.value}</span>
                </span>
                <span className="mt-2 block truncate text-xs font-semibold text-gray-800 dark:text-gray-100">{item.label}</span>
                <span className="block truncate text-[11px] text-gray-500">{signal.note}</span>
              </button>
            );
          })}
        </div>
      </section>
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
    "/inventory": [open(db.inventory, (row) => row.available <= (Number(row.reorderAt) || 11)), "low or empty"],
    "/orders": [open(db.orders, (row) => row.fulfilment !== "Delivered"), "not delivered"],
    "/fulfilment": [open(db.fulfilment, (row) => row.status !== "Shipped"), "still in the warehouse"],
    "/shipping": [open(db.shipments, (row) => row.status === "RTO" || row.status === "Exception" || row.status === "NDR"), "RTO, NDR or exception"],
    "/ndr": [open(db.shipments || [], (row) => row.status === "NDR"), "need follow-up"],
    "/quality": [open(db.inspections || [], (row) => row.result === "Pending"), "waiting"],
    "/approvals": [approvalRows(db).length, "waiting"],
    "/exceptions": [exceptions(db).length, "open"],
    "/integrations": [open(db.integrations || [], (row) => row.status !== "Connected"), "not connected"],
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
    "/reports": ["View", "sales & margin"],
    "/staff": [open(db.staff, (row) => row.status === "Active"), "desks active"],
    "/roles": [db.roles.length, "access sets"],
    "/settings": [settingsCurrency(db.settings), "company currency"],
    "/security": [db.audit.length, "activity lines"],
  };
  const quiet = new Set(["/pricing", "/warehouses", "/customers", "/finance", "/marketing", "/reports", "/staff", "/roles", "/settings", "/security", "/fulfilment"]);
  const [value, note] = signals[path] || [0, "open"];
  return { value, note, problem: !quiet.has(path) && Number(value) > 0 };
}

function buildDaySeries(orders) {
  const dated = orders
    .map((order) => ({ order, when: parseOrderDate(order.date) }))
    .filter((row) => row.when);
  if (!dated.length) return [];
  const start = startOfDay(new Date(Math.min(...dated.map((row) => row.when.getTime()))));
  const end = startOfDay(new Date(Math.max(...dated.map((row) => row.when.getTime()))));
  const byKey = {};
  dated.forEach(({ order, when }) => {
    const key = formatSampleDay(when);
    const bucket = byKey[key] || { date: key, when: startOfDay(when), orders: [], sales: 0, orderCount: 0, failed: 0 };
    bucket.orders.push(order);
    bucket.orderCount += 1;
    if (order.payment === "Failed") bucket.failed += 1;
    else bucket.sales += Number(order.value) || 0;
    byKey[key] = bucket;
  });
  const days = [];
  for (let cursor = new Date(start); cursor.getTime() <= end.getTime(); cursor.setDate(cursor.getDate() + 1)) {
    const key = formatSampleDay(cursor);
    days.push(
      byKey[key] || {
        date: key,
        when: startOfDay(cursor),
        orders: [],
        sales: 0,
        orderCount: 0,
        failed: 0,
      },
    );
  }
  return days;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function niceCeiling(value) {
  if (value <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  const n = value / exp;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * exp;
}

function moneyAxis(maxValue, targetTicks = 7) {
  const raw = Math.max(maxValue, 1);
  const rough = raw / Math.max(targetTicks - 1, 1);
  const exp = 10 ** Math.floor(Math.log10(rough));
  const n = rough / exp;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * exp;
  const ceiling = Math.ceil(raw / step) * step;
  const ticks = [];
  for (let value = 0; value <= ceiling + step / 1000; value += step) {
    ticks.push(Math.round(value));
  }
  return { max: ceiling || step, ticks };
}

function formatAxisMoney(value) {
  if (value >= 100000) {
    const lakhs = value / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `₹${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
  }
  return `₹${value}`;
}

function smoothLine(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

function PerformanceChart({ series }) {
  const ranges = [
    { id: "7", label: "This week", size: 7 },
    { id: "14", label: "Last 14 days", size: 14 },
    { id: "all", label: "All days", size: Infinity },
  ];
  const [rangeId, setRangeId] = useState("7");
  const range = ranges.find((item) => item.id === rangeId) || ranges[0];
  const visible = useMemo(() => {
    if (!series.length) return [];
    const size = Math.min(range.size, series.length);
    return series.slice(Math.max(0, series.length - size));
  }, [range.size, series]);
  const [activeDate, setActiveDate] = useState(null);

  useEffect(() => {
    setActiveDate(visible[visible.length - 1]?.date || null);
  }, [visible]);

  const active = visible.find((day) => day.date === activeDate) || visible[visible.length - 1] || null;
  // Scale follows real peak sales in the visible range (not a fixed ₹6k).
  // Small headroom keeps the tallest bar from touching the top edge.
  const peakSales = Math.max(...visible.map((day) => day.sales), 1);
  const salesAxis = moneyAxis(peakSales * 1.08, 7);
  const salesMax = salesAxis.max;
  const yTicks = salesAxis.ticks;
  const ordersMax = niceCeiling(Math.max(...visible.map((day) => day.orderCount), 1));

  const width = 560;
  const height = 168;
  const pad = { top: 12, right: 12, bottom: 26, left: 40 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const gap = plotW / Math.max(visible.length, 1);
  const barW = Math.min(22, Math.max(9, gap * 0.38));

  const points = visible.map((day, index) => {
    const x = pad.left + gap * index + gap / 2;
    const salesRatio = day.sales / salesMax;
    const salesH = salesRatio * plotH;
    const ordersH = (day.orderCount / ordersMax) * plotH * 0.88;
    return {
      day,
      x,
      barX: x - barW / 2,
      barY: pad.top + plotH - Math.max(day.sales > 0 ? 6 : 3, salesH),
      barH: Math.max(day.sales > 0 ? 6 : 3, salesH),
      lineY: pad.top + plotH - ordersH,
      // Always bold by sales strength — not by hover
      fill: day.sales <= 0 ? "#e5e7eb" : salesRatio >= 0.75 ? "#f59e0b" : salesRatio >= 0.4 ? "#fb923c" : "#fdba74",
    };
  });

  const linePath = smoothLine(points.map((point) => ({ x: point.x, y: point.lineY })));
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${pad.top + plotH} L ${points[0].x} ${pad.top + plotH} Z`
    : "";
  const activePoint = points.find((point) => point.day.date === active?.date) || null;
  const tipW = 100;
  const tipH = 40;
  const tipX = activePoint ? Math.min(Math.max(activePoint.x - tipW / 2, pad.left), width - pad.right - tipW) : 0;
  const tipY = activePoint ? Math.max(2, activePoint.barY - tipH - 8) : 0;

  return (
    <div className="px-3.5 pt-3 pb-2.5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Performance</h2>
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
              Sales
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#34d399]" />
              Orders
            </span>
          </div>
        </div>
        <label className="relative inline-flex shrink-0">
          <select
            value={rangeId}
            onChange={(event) => setRangeId(event.target.value)}
            className="appearance-none rounded-full border border-gray-200 bg-white py-1 pr-7 pl-2.5 text-[11px] font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            {ranges.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        </label>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Sales and orders performance">
          <defs>
            <linearGradient id="ordersArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = pad.top + plotH - (tick / salesMax) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={y}
                  y2={y}
                  stroke="#eef2f7"
                  strokeDasharray="2 4"
                  strokeWidth="1"
                />
                <text x={pad.left - 6} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="9">
                  {formatAxisMoney(tick)}
                </text>
              </g>
            );
          })}

          {areaPath ? <path d={areaPath} fill="url(#ordersArea)" /> : null}
          {linePath ? <path d={linePath} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" /> : null}

          {points.map((point) => {
            const selected = active?.date === point.day.date;
            return (
              <g key={point.day.date}>
                <rect
                  x={point.barX}
                  y={point.barY}
                  width={barW}
                  height={point.barH}
                  rx={barW / 2}
                  ry={barW / 2}
                  fill={point.fill}
                  opacity={1}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveDate(point.day.date)}
                  onFocus={() => setActiveDate(point.day.date)}
                  onClick={() => setActiveDate(point.day.date)}
                />
                <circle
                  cx={point.x}
                  cy={point.lineY}
                  r={selected ? 3.5 : 2.5}
                  fill="#fff"
                  stroke="#34d399"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
                <text
                  x={point.x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight={selected ? 600 : 500}
                  fill={selected ? "#111827" : "#9ca3af"}
                >
                  {point.day.date.replace(/ 20\d{2}$/, "")}
                </text>
                <rect
                  x={point.barX - 4}
                  y={pad.top}
                  width={barW + 8}
                  height={plotH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveDate(point.day.date)}
                  onClick={() => setActiveDate(point.day.date)}
                />
              </g>
            );
          })}

          {active && activePoint ? (
            <g className="pointer-events-none">
              <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="8" fill="#fff" stroke="#e5e7eb" />
              <text x={tipX + 10} y={tipY + 16} fill="#6b7280" fontSize="9">
                Sales
              </text>
              <text x={tipX + tipW - 10} y={tipY + 16} textAnchor="end" fill="#111827" fontSize="10" fontWeight="600">
                {inr(active.sales)}
              </text>
              <text x={tipX + 10} y={tipY + 30} fill="#6b7280" fontSize="9">
                Orders
              </text>
              <text x={tipX + tipW - 10} y={tipY + 30} textAnchor="end" fill="#111827" fontSize="10" fontWeight="600">
                {active.orderCount}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}

function DeliveryRateCard({ pipeline, total }) {
  const navigate = useNavigate();
  const delivered = pipeline.find((step) => step.name === "Delivered")?.count || 0;
  const shipped = pipeline.find((step) => step.name === "Shipped")?.count || 0;
  const moving = pipeline
    .filter((step) => ["Confirmed", "Packing", "Ready to ship", "Shipped"].includes(step.name))
    .reduce((bag, step) => bag + step.count, 0);
  const pct = total ? Math.min(100, (delivered / total) * 100) : 0;
  const radius = 54;
  const half = Math.PI * radius;
  const progress = (pct / 100) * half;

  const stats = [
    { label: "Delivered", value: delivered, color: "#34d399" },
    { label: "Shipped", value: shipped, color: "#38bdf8" },
    { label: "In flow", value: moving, color: "#fbbf24" },
  ];

  return (
    <Surface title="Fulfilment gauge">
      <div className="flex h-full flex-col gap-3 p-4 pt-2">
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <svg viewBox="0 0 140 86" className="h-auto w-full max-w-[210px]" role="img" aria-label="Delivered percentage">
            <path d="M 16 78 A 54 54 0 0 1 124 78" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="12" strokeLinecap="round" />
            <path
              d="M 16 78 A 54 54 0 0 1 124 78"
              fill="none"
              stroke="#34d399"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${half}`}
            />
            <text x="70" y="58" textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize="24" fontWeight="700">
              {pct >= 10 ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`}
            </text>
            <text x="70" y="74" textAnchor="middle" className="fill-gray-400" fontSize="10" fontWeight="600">
              Delivered
            </text>
          </svg>
          <ul className="grid w-full grid-cols-3 gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
            {stats.map((stat) => (
              <li key={stat.label} className="min-w-0 text-center">
                <p className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="mt-0.5 inline-flex items-center justify-center gap-1 text-[10px] font-medium text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: stat.color }} />
                  <span className="truncate">{stat.label}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
        <button type="button" className="btn-soft w-full" onClick={() => navigate("/orders")}>
          Open orders
        </button>
      </div>
    </Surface>
  );
}

function MoneyCompareCard({ sales, margin, supply }) {
  const peak = Math.max(sales, margin, supply, 1);
  const rings = [
    { label: "Sales", value: sales, color: "#ec4899", radius: 46 },
    { label: "Supply", value: supply, color: "#38bdf8", radius: 34 },
    { label: "Margin", value: margin, color: "#34d399", radius: 22 },
  ];
  const marginPct = sales ? Math.round((margin / sales) * 100) : 0;

  return (
    <Surface title="Sales / Margin / Supply">
      <div className="flex h-full flex-col gap-3 p-4 pt-2">
        <div className="flex flex-1 items-center justify-center gap-4">
          <div className="relative shrink-0">
            <svg viewBox="0 0 120 120" className="h-36 w-36" role="img" aria-label="Sales margin supply compare">
              {rings.map((ring) => {
                const length = 2 * Math.PI * ring.radius;
                const share = Math.max(0.08, Math.min(1, ring.value / peak));
                const dash = share * length;
                return (
                  <g key={ring.label}>
                    <circle
                      cx="60"
                      cy="60"
                      r={ring.radius}
                      fill="none"
                      className="stroke-gray-100 dark:stroke-gray-800"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={ring.radius}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${length}`}
                      transform="rotate(-90 60 60)"
                      opacity="0.95"
                    />
                  </g>
                );
              })}
              <text x="60" y="58" textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize="14" fontWeight="700">
                {marginPct}%
              </text>
              <text x="60" y="72" textAnchor="middle" className="fill-gray-400" fontSize="9" fontWeight="600">
                margin
              </text>
            </svg>
          </div>
          <ul className="min-w-0 flex-1 space-y-2">
            {rings.map((ring) => (
              <li key={ring.label} className="flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ring.color }} />
                  <span className="truncate">{ring.label}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-900 dark:text-gray-100">{inr(ring.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Surface>
  );
}

function PaymentMixCard({ orders }) {
  const navigate = useNavigate();
  const buckets = [
    { name: "Captured", count: orders.filter((order) => order.payment === "Captured").length, color: "#34d399" },
    { name: "COD", count: orders.filter((order) => order.payment === "COD pending").length, color: "#fbbf24" },
    { name: "Failed", count: orders.filter((order) => order.payment === "Failed").length, color: "#e11d48" },
  ];
  const total = buckets.reduce((bag, item) => bag + item.count, 0) || 1;
  const radius = 34;
  const length = 2 * Math.PI * radius;
  let cursor = 0;

  return (
    <Surface title="Payment mix">
      <div className="flex h-full flex-col gap-3 p-4 pt-2">
        <div className="flex flex-1 items-center justify-center gap-4">
          <div className="relative shrink-0">
            <svg viewBox="0 0 100 100" className="h-36 w-36" role="img" aria-label="Payment mix donut">
              <g transform="rotate(-90 50 50)">
                {buckets.map((bucket) => {
                  const slice = (bucket.count / total) * length;
                  const node = (
                    <circle
                      key={bucket.name}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={bucket.color}
                      strokeWidth="12"
                      strokeDasharray={`${slice} ${length - slice}`}
                      strokeDashoffset={-cursor}
                    />
                  );
                  cursor += slice;
                  return node;
                })}
              </g>
              <text x="50" y="48" textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize="16" fontWeight="700">
                {orders.length}
              </text>
              <text x="50" y="62" textAnchor="middle" className="fill-gray-400" fontSize="9" fontWeight="600">
                payments
              </text>
            </svg>
          </div>
          <ul className="min-w-0 flex-1 space-y-2">
            {buckets.map((bucket) => (
              <li key={bucket.name} className="flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: bucket.color }} />
                  <span className="truncate">{bucket.name}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                  {bucket.count}
                  <span className="ml-1 font-medium text-gray-400">· {orderMixPct(bucket.count, orders.length || 1)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <button type="button" className="btn-soft w-full" onClick={() => navigate("/payments")}>
          Open payments
        </button>
      </div>
    </Surface>
  );
}

function SalesTrendSection({ orders, pipeline }) {
  const series = useMemo(() => buildDaySeries(orders), [orders]);

  return (
    <section className="w-full">
      <div className="grid w-full gap-3 xl:grid-cols-[1.45fr_0.9fr]">
        <Surface className="overflow-visible">
          <PerformanceChart series={series} />
        </Surface>

        <Surface title="Order mix" className="overflow-visible">
          <OrderMixPanel pipeline={pipeline} total={orders.length} />
        </Surface>
      </div>
    </section>
  );
}

const orderMixColors = {
  Delivered: "#34d399",
  Packing: "#ec4899",
  Shipped: "#38bdf8",
  "Ready to ship": "#fbbf24",
  Returned: "#fb7185",
  "Payment failed": "#e11d48",
  Cancelled: "#a1a1aa",
  Confirmed: "#818cf8",
};

function orderMixPct(count, total) {
  if (!total) return "0%";
  const value = (count / total) * 100;
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)}%`;
}

function OrderMixRow({ step, align = "left", total, active, onHover }) {
  const color = orderMixColors[step.name] || "#52525b";
  const selected = active === step.name;
  return (
    <li>
      <button
        type="button"
        onMouseEnter={() => onHover(step.name)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(step.name)}
        onBlur={() => onHover(null)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${
          selected ? "ring-1" : "bg-gray-50 dark:bg-gray-900/50"
        } ${align === "right" ? "flex-row-reverse text-right" : ""}`}
        style={
          selected
            ? {
                backgroundColor: `${color}22`,
                boxShadow: `inset 0 0 0 1px ${color}66`,
              }
            : undefined
        }
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        <span className="min-w-0 flex-1 truncate text-xs text-gray-600 dark:text-gray-300">{step.name}</span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-900 dark:text-white">{step.count}</span>
        <span className="hidden shrink-0 text-[10px] tabular-nums text-gray-400 sm:inline">{orderMixPct(step.count, total)}</span>
      </button>
    </li>
  );
}

function MixRing({ steps, total, activeStatus, onHover }) {
  const radius = 38;
  const length = 2 * Math.PI * radius;
  let cursor = 0;
  const active = steps.filter((step) => step.count > 0);
  const hovered = active.find((step) => step.name === activeStatus) || null;
  return (
    <div className="relative mx-auto h-[7.25rem] w-[7.25rem] shrink-0" onMouseLeave={() => onHover(null)}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Orders by fulfilment">
        <g transform="rotate(-90 50 50)">
          {active.map((step) => {
            const slice = (step.count / Math.max(total, 1)) * length;
            const dash = `${slice} ${length - slice}`;
            const selected = !activeStatus || activeStatus === step.name;
            const node = (
              <circle
                key={step.name}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={orderMixColors[step.name] || "#52525b"}
                strokeWidth={activeStatus === step.name ? 14 : 12}
                strokeDasharray={dash}
                strokeDashoffset={-cursor}
                opacity={selected ? 1 : 0.28}
                className="cursor-pointer transition-[stroke-width,opacity] duration-150"
                style={{ pointerEvents: "stroke" }}
                onMouseEnter={() => onHover(step.name)}
                onFocus={() => onHover(step.name)}
                tabIndex={0}
              />
            );
            cursor += slice;
            return node;
          })}
        </g>
        <text x="50" y="54" textAnchor="middle" fontSize="16" fontWeight="600" fill="#111827" className="pointer-events-none dark:fill-white">
          {hovered ? orderMixPct(hovered.count, total) : total}
        </text>
      </svg>
      {hovered ? (
        <div className="pointer-events-none absolute top-[calc(100%+0.35rem)] left-1/2 z-10 w-max max-w-[12rem] -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: orderMixColors[hovered.name] || "#52525b" }} />
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{hovered.name}</p>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            <span className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">{orderMixPct(hovered.count, total)}</span>
            {" · "}
            {hovered.count} of {total} orders
          </p>
        </div>
      ) : null}
    </div>
  );
}

function OrderMixPanel({ pipeline, total }) {
  const [activeStatus, setActiveStatus] = useState(null);
  const active = pipeline.filter((step) => step.count > 0);
  const right = active.slice(Math.max(0, active.length - 5));
  const left = active.slice(0, Math.max(0, active.length - 5));

  return (
    <div className="flex flex-col items-center gap-3 p-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
      <ul className="hidden min-w-0 flex-col justify-center gap-1.5 sm:flex">
        {left.map((step) => (
          <OrderMixRow key={step.name} step={step} align="right" total={total} active={activeStatus} onHover={setActiveStatus} />
        ))}
      </ul>
      <MixRing steps={pipeline} total={total} activeStatus={activeStatus} onHover={setActiveStatus} />
      <ul className="hidden min-w-0 flex-col justify-center gap-1.5 sm:flex">
        {right.map((step) => (
          <OrderMixRow key={step.name} step={step} align="left" total={total} active={activeStatus} onHover={setActiveStatus} />
        ))}
      </ul>
      <ul className="grid w-full grid-cols-2 gap-1.5 sm:hidden">
        {active.map((step) => (
          <OrderMixRow key={step.name} step={step} align="left" total={total} active={activeStatus} onHover={setActiveStatus} />
        ))}
      </ul>
    </div>
  );
}

function Table({ columns, rows, onRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:border-gray-700 dark:bg-gray-900/40">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.join("-")}
              className={`border-b border-gray-50 last:border-0 dark:border-gray-700 ${onRow ? "cursor-pointer transition hover:bg-pink-50/40 dark:hover:bg-gray-700/40" : ""}`}
              onClick={onRow ? () => onRow(rowIndex) : undefined}
            >
              {row.map((cell, index) => (
                <td key={`${columns[index]}-${cell}`} className="px-4 py-3.5">
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
    description:
      "Master catalogue (demo). Partners should sell only published SKUs. Brand Partner browse currently uses a richer clothing seed with shared style fields; unify product IDs in production so Admin and Brand never diverge.",
    collection: "products",
    statusKey: "status",
    statuses: ["Active", "Hidden", "Draft"],
    columns: [
      ["name", "Product"],
      ["sku", "SKU"],
      ["barcode", "Barcode"],
      ["category", "Category"],
      ["sizes", "Sizes"],
      ["colors", "Colours"],
      ["cost", "Company cost"],
      ["supply", "Supply price"],
      ["retail", "Retail"],
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
      ["reorderAt", "Reorder at"],
      ["damaged", "Damaged"],
    ],
  },
  orders: {
    title: "Orders",
    description: "Central order desk for every brand storefront. Packing reserves the SKU. Shipped reduces stock and opens a local shipment.",
    collection: "orders",
    statusKey: "fulfilment",
    statuses: ["Confirmed", "Packing", "Ready to ship", "Shipped", "Delivered", "Cancelled", "Returned", "Payment failed"],
    columns: [
      ["id", "Order"],
      ["brand", "Brand"],
      ["customer", "Customer"],
      ["product", "Product"],
      ["value", "Value"],
      ["date", "Date"],
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
    statuses: ["In transit", "NDR", "Delivered", "RTO", "Exception"],
    columns: [
      ["order", "Order"],
      ["courier", "Courier"],
      ["awb", "AWB"],
      ["ndrReason", "NDR"],
      ["attempts", "Attempts"],
      ["status", "Status"],
    ],
    map(rows) {
      return rows.map((row) => ({ ...row, charge: inr(row.charge), attempts: row.attempts ?? 0 }));
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

const fieldMeta = {
  brand: { label: "Brand", placeholder: "e.g. Aisa Clothing", hint: "Must match a brand already on the platform" },
  url: { label: "Storefront URL", placeholder: "e.g. aisa.platformdomain.in", hint: "Subdomain on the company domain — no https://" },
  domain: { label: "Domain", placeholder: "e.g. aisa.platformdomain.in" },
  theme: { label: "Theme", placeholder: "e.g. Ivory editorial" },
  color: { label: "Brand colour", placeholder: "#9D174D", hint: "Hex colour for the storefront accent" },
  ssl: { label: "SSL", placeholder: "Pending" },
  name: { label: "Name", placeholder: "Record name" },
  partner: { label: "Partner", placeholder: "e.g. Aisa Studio" },
  email: { label: "Email", placeholder: "name@brand.com" },
  phone: { label: "Phone", placeholder: "+91 98xxx xxxxx" },
  category: { label: "Category", placeholder: "e.g. Ethnic wear" },
  description: { label: "Description", placeholder: "Short note for this record" },
  city: { label: "City", placeholder: "e.g. Jaipur" },
  verification: { label: "Verification", placeholder: "Not started" },
  product: { label: "Product", placeholder: "e.g. Kurti A" },
  sku: { label: "SKU", placeholder: "e.g. KUR-001-M-RED" },
  handle: { label: "Handle", placeholder: "e.g. kurti-a" },
  supplier: { label: "Supplier", placeholder: "Supplier name" },
  warehouse: { label: "Warehouse", placeholder: "e.g. Central warehouse" },
  customer: { label: "Customer", placeholder: "Customer · City" },
  address: { label: "Address", placeholder: "Delivery address" },
  notes: { label: "Notes", placeholder: "Optional note" },
};

function fieldLabel(key) {
  return fieldMeta[key]?.label || key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

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
  const [brandFilter, setBrandFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [period, setPeriod] = useState(id === "orders" ? "all" : "all");
  const [sort, setSort] = useState("newest");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(null);
  const recordId = params.get("record");
  const isOrders = id === "orders";

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

  useEffect(() => {
    if (!isOrders) return;
    const brand = params.get("brand");
    if (brand) setBrandFilter(brand);
  }, [isOrders, params]);

  const rows = useMemo(() => {
    if (isOrders) {
      const today = sampleToday(db.orders);
      const filtered = filterOrders(
        db.orders,
        { period, brand: brandFilter, payment: paymentFilter, fulfilment: status, query },
        today,
      );
      const sorted = [...filtered].sort((left, right) => {
        if (sort === "value-high") return (Number(right.value) || 0) - (Number(left.value) || 0);
        if (sort === "value-low") return (Number(left.value) || 0) - (Number(right.value) || 0);
        if (sort === "oldest") {
          return (parseOrderDate(left.date)?.getTime() || 0) - (parseOrderDate(right.date)?.getTime() || 0);
        }
        return (parseOrderDate(right.date)?.getTime() || 0) - (parseOrderDate(left.date)?.getTime() || 0);
      });
      return spec.map ? spec.map(sorted) : sorted;
    }
    const source = spec.map ? spec.map(db[spec.collection]) : db[spec.collection];
    const needle = query.trim().toLowerCase();
    return source.filter((row) => {
      const matchesStatus = status === "All" || !spec.statusKey || row[spec.statusKey] === status;
      const haystack = spec.columns.map(([key]) => row[key]).join(" ").toLowerCase();
      return matchesStatus && (needle.length === 0 || haystack.includes(needle));
    });
  }, [brandFilter, db, isOrders, paymentFilter, period, query, sort, spec, status]);

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
        eyebrow={moduleEyebrow(id)}
        title={spec.title}
        description={spec.description}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SoftButton
              onClick={() =>
                exportModuleCsv(`pahachan-${id}.csv`, spec.columns, rows)
              }
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </SoftButton>
            <SoftButton
              onClick={() =>
                exportModuleXlsx(`pahachan-${id}.xlsx`, spec.title, spec.columns, rows)
              }
            >
              <Download className="h-3.5 w-3.5" />
              Excel
            </SoftButton>
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
          </div>
        }
      />
      <DeskExtras
        id={id}
        period={isOrders ? period : undefined}
        onPeriod={isOrders ? setPeriod : undefined}
        brandFilter={isOrders ? brandFilter : undefined}
        onBrand={isOrders ? setBrandFilter : undefined}
        status={status}
        onStatus={setStatus}
      />
      <Toolbar meta={`${rows.length} records`}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isOrders ? "Search order, brand, customer, product, SKU" : `Search ${spec.title.toLowerCase()}`}
          className="input-field sm:max-w-sm"
        />
        {isOrders ? (
          <>
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className="input-field sm:w-44">
              {ORDER_PERIODS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} className="input-field sm:w-44">
              <option>All</option>
              {db.brands.map((brand) => (
                <option key={brand.id}>{brand.name}</option>
              ))}
            </select>
            <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="input-field sm:w-40">
              <option>All</option>
              {["Captured", "COD pending", "Pending", "Failed", "Refunded"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </>
        ) : null}
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
        {isOrders ? (
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="input-field sm:w-44">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="value-high">Value high to low</option>
            <option value="value-low">Value low to high</option>
          </select>
        ) : null}
      </Toolbar>
      <Surface>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:border-gray-700 dark:bg-gray-900/40">
              <tr>
                {spec.columns.map(([, label]) => (
                  <th key={label} className="px-4 py-3 font-semibold">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={spec.columns.length} className="px-4 py-10 text-center text-sm text-gray-500">
                    No records match.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-gray-50 transition hover:bg-pink-50/40 dark:border-gray-700 dark:hover:bg-gray-700/40"
                    onClick={() => open(db[spec.collection].find((item) => item.id === row.id))}
                  >
                    {spec.columns.map(([key, label]) => (
                      <td key={label} className="px-4 py-3.5">
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
      {draft && creating && id === "websites" ? (
        <WebsiteCreateDrawer
          brands={db.brands}
          websites={db.websites}
          onClose={close}
          onCreate={(payload) => {
            const createdId = add("websites", payload);
            setCreating(false);
            setDraft(null);
            setParams({ record: createdId });
          }}
        />
      ) : null}
      {draft && !(creating && id === "websites") ? (
        <RecordDrawer
          title={creating ? `New ${spec.title.toLowerCase()}` : draft.id}
          draft={draft}
          creating={creating}
          collection={spec.collection}
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

function normalizeWebsiteUrl(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function WebsiteCreateDrawer({ brands, websites, onClose, onCreate }) {
  const assigned = new Set(
    (websites || [])
      .filter((site) => site.brand && site.url && site.url !== "Not assigned")
      .map((site) => site.brand),
  );
  const availableBrands = (brands || []).filter((brand) => !assigned.has(brand.name));
  const takenUrls = new Set(
    (websites || [])
      .map((site) => normalizeWebsiteUrl(site.url))
      .filter((entry) => entry && entry !== "not assigned"),
  );

  const [brandName, setBrandName] = useState("");
  const [url, setUrl] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const cleanUrl = normalizeWebsiteUrl(url);
  const urlValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(cleanUrl);
  const urlTaken = Boolean(cleanUrl && takenUrls.has(cleanUrl));
  const canSubmit = Boolean(brandName) && availableBrands.length > 0 && urlValid && !urlTaken;

  const error = !availableBrands.length
    ? "Every brand already has a website record."
    : !brandName
      ? "Choose the brand for this record."
      : !cleanUrl
        ? "Enter the website URL."
        : !urlValid
          ? "Enter a valid website URL."
          : urlTaken
            ? "This URL is already on another record."
            : "";

  const submit = (event) => {
    event.preventDefault();
    setShowErrors(true);
    if (!canSubmit) return;
    onCreate({
      brand: brandName,
      url: cleanUrl,
      theme: "Ivory editorial",
      color: "#9D174D",
      status: "Draft",
      ssl: "Pending",
    });
  };

  return (
    <ModalShell
      title="Add website record"
      eyebrow="Websites & domains"
      align="left"
      size="md"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-gray-900"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="website-create-form"
            className="inline-flex min-w-[8.5rem] items-center justify-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-700/55"
            disabled={!canSubmit}
          >
            Add record
          </button>
        </div>
      }
    >
      <form id="website-create-form" className="space-y-5" onSubmit={submit}>
        <p className="text-sm font-medium text-gray-500">Website information</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Brand</span>
            <select
              className="input-field"
              value={brandName}
              disabled={!availableBrands.length}
              onChange={(event) => setBrandName(event.target.value)}
            >
              <option value="">{availableBrands.length ? "Select brand" : "No brands available"}</option>
              {availableBrands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <div className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Status</span>
            <div className="flex h-[42px] items-center rounded-[var(--app-radius-sm)] border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900">
              <Status value="Draft" />
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Website URL</span>
          <input
            className="input-field"
            value={url}
            placeholder="Type the storefront URL"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>

        {showErrors && error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
        {!availableBrands.length ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      </form>
    </ModalShell>
  );
}

function RecordDrawer({ title, draft, creating, collection, statusKey, statuses, links, onChange, onStatus, onClose, onSave }) {
  const { db } = useStore();
  const navigate = useNavigate();
  const fields = Object.keys(draft).filter((key) => {
    if (lockedKeys.has(key) || key === statusKey) return false;
    return ["string", "number", "boolean"].includes(typeof draft[key]);
  });
  const items = orderItems(draft);
  const brandPerf = collection === "brands" && draft?.name ? brandOrderPerformance(draft.name, db.orders) : null;
  const Shell = creating ? ModalShell : DrawerShell;

  return (
    <Shell
      title={title}
      onClose={onClose}
      eyebrow={creating ? "New record" : "Record"}
      footer={
        <button form="record-drawer-form" className="btn-primary w-full" type="submit">
          {creating ? "Add to this session" : "Save edits"}
        </button>
      }
    >
      <form id="record-drawer-form" className="space-y-3" onSubmit={onSave}>
        {brandPerf ? (
          <section className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Order performance</p>
              <button type="button" className="text-xs font-semibold text-pink-700" onClick={() => navigate(`/orders?brand=${encodeURIComponent(draft.name)}`)}>
                Open brand orders
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Total orders", brandPerf.total],
                ["Today", brandPerf.today],
                ["Yesterday", brandPerf.yesterday],
                ["Last 7 days", brandPerf.week],
                ["This month", brandPerf.month],
                ["Pending", brandPerf.pending],
                ["Processing", brandPerf.processing],
                ["Shipped", brandPerf.shipped],
                ["Delivered", brandPerf.delivered],
                ["Cancelled", brandPerf.cancelled],
                ["Returned", brandPerf.returned],
                ["Customers", brandPerf.customers],
                ["Revenue", money(brandPerf.revenue)],
                ["Avg order", money(brandPerf.aov)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200/70 bg-gray-50 px-2.5 py-2 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-[11px] text-gray-500">{label}</p>
                  <p className="text-sm font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
            {brandPerf.products.length ? (
              <div className="mt-3">
                <p className="mb-1 text-[11px] font-medium text-gray-500">Top products</p>
                <ul className="space-y-1">
                  {brandPerf.products.map((product) => (
                    <li key={product.product} className="flex justify-between gap-2 text-xs">
                      <span>{product.product}</span>
                      <span className="tabular-nums text-gray-500">
                        {product.orders} · {money(product.sales)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className={`rounded-2xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-900 ${creating ? "p-4" : "p-3"}`}>
          <div className={creating ? "mb-4 flex items-end justify-between gap-3" : "mb-3"}>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Details</p>
              {creating ? (
                <p className="mt-1 text-xs text-gray-500">Fill the fields below. Placeholders show the expected format.</p>
              ) : null}
            </div>
            {creating && collection === "websites" && draft.color ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: draft.color }} />
                Accent preview
              </span>
            ) : null}
          </div>
          <div className={creating ? "grid gap-3.5 sm:grid-cols-2" : "space-y-3"}>
            {fields.map((key) => {
              const meta = fieldMeta[key] || {};
              const wide = creating && (key === "url" || key === "domain" || key === "notes" || key === "description" || key === "address");
              const isColor = key === "color";
              return (
                <label key={key} className={`block text-sm ${wide ? "sm:col-span-2" : ""}`}>
                  <span className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{fieldLabel(key)}</span>
                    {creating && meta.hint ? <span className="truncate text-[10px] font-medium text-gray-400">{meta.hint}</span> : null}
                  </span>
                  <span className={isColor ? "flex items-center gap-2" : "block"}>
                    {isColor ? (
                      <input
                        type="color"
                        aria-label="Pick colour"
                        className="h-10 w-11 shrink-0 cursor-pointer rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800"
                        value={/^#[0-9A-Fa-f]{6}$/.test(String(draft[key] || "")) ? draft[key] : "#9D174D"}
                        onChange={(event) => onChange(key, event.target.value)}
                      />
                    ) : null}
                    {creating && collection === "websites" && key === "brand" ? (
                      <select className="input-field" value={draft[key] ?? ""} onChange={(event) => onChange(key, event.target.value)}>
                        <option value="">Select brand</option>
                        {db.brands.map((brand) => (
                          <option key={brand.id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="input-field"
                        value={draft[key] ?? ""}
                        placeholder={creating ? meta.placeholder || `Enter ${fieldLabel(key).toLowerCase()}` : undefined}
                        onChange={(event) => onChange(key, event.target.value)}
                      />
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {items.length ? (
          <section className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Line items</p>
            <ul className="space-y-1.5 text-sm">
              {items.map((item, index) => (
                <li
                  key={`${item.sku}-${index}`}
                  className="flex justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-2.5 py-2 dark:border-gray-700 dark:bg-gray-800"
                >
                  <span>
                    {item.product} · {item.sku} · ×{item.qty}
                  </span>
                  <span className="tabular-nums text-gray-500">{inr(item.value)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {statuses ? (
          <section className={`rounded-2xl border border-gray-200/80 bg-white shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-900 ${creating ? "p-4" : "p-3"}`}>
            <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">Status</p>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Publish state</span>
              <select className="input-field" value={draft[statusKey] || statuses[0]} onChange={(event) => onStatus(event.target.value)}>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              {creating ? (
                <span className="mt-1.5 block text-[11px] text-gray-400">Start as Draft until the domain and SSL are ready.</span>
              ) : null}
            </label>
          </section>
        ) : null}

        {links.map((group) => (
          <section
            key={group.title}
            className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">{group.title}</p>
            <div className="space-y-1.5">
              {group.rows.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="block w-full rounded-xl border border-gray-100 bg-gray-50 px-2.5 py-2 text-left text-sm hover:border-pink-200 hover:bg-pink-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50"
                  onClick={() => navigate(`${group.path}?record=${item.id}`)}
                >
                  <span className="font-medium">{item.id}</span>
                  <span className="text-gray-500"> · {item.text}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </form>
    </Shell>
  );
}

function StatStrip({ items, activeLabel, onSelect }) {
  const cols =
    items.length > 4
      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
      : items.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2 md:grid-cols-4";
  return (
    <div className={`mb-4 grid gap-2.5 ${cols}`}>
      {items.map(([label, value, tone, filterValue]) => {
        const clickable = typeof onSelect === "function";
        const active = activeLabel === label || (filterValue != null && activeLabel === filterValue);
        const Tag = clickable ? "button" : "div";
        return (
          <Tag
            key={label}
            type={clickable ? "button" : undefined}
            onClick={clickable ? () => onSelect(filterValue ?? label) : undefined}
            className={`rounded-2xl border px-3.5 py-3 text-left shadow-[var(--app-shadow)] transition dark:bg-gray-800 ${
              active
                ? "border-pink-300 bg-pink-50/70 dark:border-pink-800 dark:bg-pink-950/30"
                : "border-gray-200/80 bg-white dark:border-gray-700"
            } ${clickable ? "hover:-translate-y-0.5 hover:border-pink-200" : ""}`}
          >
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p
              className={`mt-1 text-base font-semibold tabular-nums ${
                tone === "rose" ? "text-rose-600" : tone === "amber" ? "text-amber-700" : "text-gray-900 dark:text-white"
              }`}
            >
              {value}
            </p>
          </Tag>
        );
      })}
    </div>
  );
}

function CentralOrdersPanel({ compact = false, period = "today", onPeriod, brandFilter = "All", onBrand }) {
  const { db } = useStore();
  const navigate = useNavigate();
  const [localPeriod, setLocalPeriod] = useState(period);
  const activePeriod = onPeriod ? period : localPeriod;
  const setPeriod = onPeriod || setLocalPeriod;
  const today = sampleToday(db.orders);
  const scoped = filterOrders(db.orders, { period: activePeriod, brand: brandFilter }, today);
  const summary = orderSummary(db.orders, db.brands, scoped);
  const matrix = brandOrderMatrix(db.brands, db.orders, scoped, today);
  const recent = [...scoped]
    .sort((left, right) => (parseOrderDate(right.date)?.getTime() || 0) - (parseOrderDate(left.date)?.getTime() || 0))
    .slice(0, compact ? 5 : 8);

  const cards = [
    ["Orders in period", summary.received, "slate"],
    ["Brands with orders", summary.brandsWithOrders, "pink"],
    ["Brands with zero", summary.brandsWithZero, "amber"],
    ["Pending / confirmed", summary.pending, "amber"],
    ["Processing / packed", summary.processing + summary.packed, "sky"],
    ["Shipped", summary.shipped, "sky"],
    ["Delivered", summary.delivered, "emerald"],
    ["Cancelled / returned / failed", summary.cancelled + summary.returnsOnly + summary.failedPay, "rose"],
  ];

  const showCards = compact ? cards.slice(0, 4) : cards;

  return (
    <div className={`w-full ${compact ? "space-y-3" : "mb-3 space-y-3"}`}>
      <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <p className={`shrink-0 ${compact ? "text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase" : "text-sm font-semibold text-gray-900 dark:text-white"}`}>
          {compact ? "Central orders" : "Central order overview"}
        </p>
        <div className="flex flex-wrap items-center justify-start gap-1.5 lg:justify-end">
          {ORDER_PERIODS.map((item) => (
            <FilterChip key={item.id} active={activePeriod === item.id} onClick={() => setPeriod(item.id)}>
              {item.label}
            </FilterChip>
          ))}
          {compact ? (
            <button type="button" className="btn-primary px-2.5 py-1.5 text-[11px]" onClick={() => navigate("/orders")}>
              Orders desk
            </button>
          ) : null}
        </div>
      </div>
      <div className={`grid gap-2.5 ${compact ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-4 xl:grid-cols-8"}`}>
        {showCards.map(([label, value, tone]) => (
          <div key={label} className="rounded-2xl border border-gray-200/80 bg-white px-3 py-2.5 shadow-[var(--app-shadow)] dark:border-gray-700 dark:bg-gray-800">
            <p className="text-[11px] font-medium text-gray-500">{label}</p>
            <p className={`mt-1 text-base font-semibold tabular-nums ${tone === "rose" ? "text-rose-600" : tone === "amber" ? "text-amber-700" : "text-gray-900 dark:text-white"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="grid w-full gap-3 xl:grid-cols-12">
        <Surface
          className="min-w-0 xl:col-span-8"
          title="Brand-wise orders"
          action={<span className="text-xs text-gray-500">Period sales {money(summary.salesValue)}</span>}
        >
          <BrandOrdersTable
            matrix={matrix}
            compact={compact}
            onBrand={(name) => {
              if (onBrand) onBrand(name);
              navigate(`/orders?brand=${encodeURIComponent(name)}`);
            }}
          />
        </Surface>
        <Surface className="min-w-0 xl:col-span-4" title="Recent orders in period">
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {recent.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-gray-500">No orders in this period.</li>
            ) : (
              recent.map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    onClick={() => navigate(`/orders?record=${order.id}`)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{order.id} · {order.brand}</span>
                      <span className="block truncate text-xs text-gray-500">{order.customer || "Customer"} · {order.product} · {order.date}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold tabular-nums">{inr(order.value)}</span>
                      <Status value={order.fulfilment} />
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Surface>
      </div>
    </div>
  );
}

function BrandOrdersTable({ matrix, onBrand, compact = false }) {
  const rows = compact ? matrix.rows.slice(0, 6) : matrix.rows;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[9%]" />
          <col className="w-[11%]" />
          <col className="w-[9%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead className="border-b border-gray-100 text-xs font-semibold text-gray-500 dark:border-gray-700">
          <tr>
            <th className="px-3 py-2">Brand</th>
            <th className="px-2 py-2 text-right">Today</th>
            <th className="px-2 py-2 text-right">In period</th>
            <th className="px-2 py-2 text-right">Total</th>
            <th className="px-2 py-2 text-right">Pending</th>
            <th className="px-2 py-2 text-right">Shipped</th>
            <th className="px-2 py-2 text-right">Delivered</th>
            <th className="px-3 py-2 text-right">Sales</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-50 last:border-0 dark:border-gray-700">
              <td className="px-3 py-2.5">
                <button type="button" className="truncate text-left font-medium hover:text-pink-700" onClick={() => onBrand?.(row.name)}>
                  {row.name}
                </button>
                <span className="mt-0.5 block truncate text-xs text-gray-500">{row.status}</span>
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.today}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.period}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.total}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.pending}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.shipped}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{row.delivered}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{money(row.sales)}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold dark:bg-gray-900/40">
            <td className="px-3 py-2.5">Platform total</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{matrix.totals.today}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{matrix.totals.period}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{matrix.totals.total}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{matrix.totals.pending}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{matrix.totals.shipped}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{matrix.totals.delivered}</td>
            <td className="px-3 py-2.5 text-right tabular-nums">{money(matrix.totals.sales)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function DeskExtras({ id, period = "all", onPeriod, brandFilter, onBrand, status = "All", onStatus }) {
  const { db } = useStore();
  const navigate = useNavigate();
  const count = (rows, test) => rows.filter(test).length;
  const pickStatus = (next) => {
    if (!onStatus) return;
    onStatus((current) => (current === next ? "All" : next));
  };

  if (id === "brands") {
    const pending = db.brands.filter((row) => row.status === "Pending approval");
    const today = sampleToday(db.orders);
    const matrix = brandOrderMatrix(db.brands, db.orders, db.orders, today);
    return (
      <div className="mb-3 space-y-3">
        <StatStrip
          items={[
            ["Active", count(db.brands, (row) => row.status === "Active")],
            ["Pending approval", pending.length, "amber"],
            ["Suspended / closed", count(db.brands, (row) => ["Temporarily suspended", "Deactivated", "Closed"].includes(row.status)), "rose"],
            ["Live websites", count(db.websites, (row) => row.status === "Published")],
          ]}
        />
        <Surface title="Brand-wise orders" action={<span className="text-xs text-gray-500">All sample dates</span>}>
          <BrandOrdersTable matrix={matrix} onBrand={(name) => navigate(`/orders?brand=${encodeURIComponent(name)}`)} />
        </Surface>
        {pending.length ? (
          <Surface title="Waiting on brand approval">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {pending.map((brand) => (
                <li key={brand.id}>
                  <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-pink-50/40 dark:hover:bg-gray-700/40" onClick={() => navigate(`/brands?record=${brand.id}`)}>
                    <span>
                      <span className="block text-sm font-medium">{brand.name}</span>
                      <span className="text-xs text-gray-500">{brand.partner} · {brand.category}</span>
                    </span>
                    <Status value={brand.status} />
                  </button>
                </li>
              ))}
            </ul>
          </Surface>
        ) : null}
      </div>
    );
  }

  if (id === "partners") {
    return (
      <StatStrip
        items={[
          ["Active", count(db.partners, (row) => row.status === "Active")],
          ["Pending approval", count(db.partners, (row) => row.status === "Pending approval"), "amber"],
          ["Verified", count(db.partners, (row) => row.verification === "Verified")],
          ["Open tickets", count(db.tickets, (row) => row.status === "Open"), "rose"],
        ]}
      />
    );
  }

  if (id === "websites") {
    return (
      <StatStrip
        items={[
          ["Published", count(db.websites, (row) => row.status === "Published")],
          ["Setup pending", count(db.websites, (row) => row.status === "Setup pending"), "amber"],
          ["Suspended", count(db.websites, (row) => row.status === "Suspended"), "rose"],
          ["SSL live", count(db.websites, (row) => row.ssl === "Active" || row.ssl === "Live" || String(row.ssl).toLowerCase().includes("active"))],
        ]}
      />
    );
  }

  if (id === "products") {
    return (
      <StatStrip
        items={[
          ["Active", count(db.products, (row) => row.status === "Active")],
          ["Hidden", count(db.products, (row) => row.status === "Hidden"), "amber"],
          ["Draft", count(db.products, (row) => row.status === "Draft")],
          ["With barcode", count(db.products, (row) => Boolean(row.barcode))],
        ]}
      />
    );
  }

  if (id === "pricing") {
    const margins = db.products.map((row) => row.supply - row.cost);
    const avg = margins.length ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length) : 0;
    const low = margins.length ? Math.min(...margins) : 0;
    const high = margins.length ? Math.max(...margins) : 0;
    return (
      <StatStrip
        items={[
          ["SKUs priced", db.products.length],
          ["Avg company margin", inr(avg)],
          ["Lowest margin", inr(low)],
          ["Highest margin", inr(high)],
        ]}
      />
    );
  }

  if (id === "purchasing") {
    return (
      <StatStrip
        items={[
          ["Draft", count(db.purchases, (row) => row.status === "Draft"), "amber"],
          ["In transit", count(db.purchases, (row) => row.status === "In transit")],
          ["Inspection", count(db.purchases, (row) => row.status === "Inspection"), "amber"],
          ["Received", count(db.purchases, (row) => row.status === "Received")],
        ]}
      />
    );
  }

  if (id === "orders") {
    return (
      <CentralOrdersPanel
        period={period}
        onPeriod={onPeriod}
        brandFilter={brandFilter}
        onBrand={onBrand}
      />
    );
  }

  if (id === "inventory") {
    return (
      <StatStrip
        items={[
          ["Available", sum(db.inventory, "available")],
          ["Reserved", sum(db.inventory, "reserved"), "amber"],
          ["Damaged", sum(db.inventory, "damaged"), "rose"],
          ["At reorder", count(db.inventory, (row) => row.available <= (Number(row.reorderAt) || 11)), "rose"],
        ]}
      />
    );
  }

  if (id === "shipping") {
    const exceptionCount = count(db.shipments, (row) => row.status === "Exception");
    return (
      <StatStrip
        activeLabel={status}
        onSelect={pickStatus}
        items={[
          ["In transit", count(db.shipments, (row) => row.status === "In transit"), null, "In transit"],
          ["NDR", count(db.shipments, (row) => row.status === "NDR"), "amber", "NDR"],
          ["RTO", count(db.shipments, (row) => row.status === "RTO"), "rose", "RTO"],
          ["Delivered", count(db.shipments, (row) => row.status === "Delivered"), null, "Delivered"],
          ["Exception", exceptionCount, "rose", "Exception"],
        ]}
      />
    );
  }

  if (id === "payments") {
    return (
      <StatStrip
        items={[
          ["Captured", count(db.payments, (row) => row.status === "Captured")],
          ["Pending", count(db.payments, (row) => row.status === "Pending"), "amber"],
          ["Failed", count(db.payments, (row) => row.status === "Failed"), "rose"],
          ["Refunded", count(db.payments, (row) => row.status === "Refunded")],
        ]}
      />
    );
  }

  if (id === "returns") {
    return (
      <StatStrip
        items={[
          ["Pending approval", count(db.returns, (row) => row.status === "Pending approval"), "amber"],
          ["Inspection", count(db.returns, (row) => row.status === "Inspection"), "amber"],
          ["Restock approved", count(db.returns, (row) => row.status === "Restock approved")],
          ["Rejected / refunded", count(db.returns, (row) => row.status === "Rejected" || row.status === "Refunded"), "rose"],
        ]}
      />
    );
  }

  if (id === "support") {
    return (
      <StatStrip
        items={[
          ["Open", count(db.tickets, (row) => row.status === "Open"), "rose"],
          ["High priority", count(db.tickets, (row) => row.status === "Open" && row.priority === "High"), "rose"],
          ["In review", count(db.tickets, (row) => row.status === "In review"), "amber"],
          ["Resolved", count(db.tickets, (row) => row.status === "Resolved")],
        ]}
      />
    );
  }

  if (id === "finance") {
    const sales = sum(db.orders.filter((order) => order.payment === "Captured" || order.payment === "COD pending"), "value");
    const refunds = sum(db.orders.filter((order) => order.payment === "Refunded"), "value");
    const expenses = sum(db.expenses, "amount");
    return <StatStrip items={[["Captured and COD", inr(sales)], ["Refunded orders", inr(refunds), "rose"], ["Expense lines", inr(expenses)]]} />;
  }

  if (id === "fulfilment") {
    return (
      <StatStrip
        items={[
          ["Waiting payment", count(db.fulfilment, (row) => row.status === "Waiting payment check"), "amber"],
          ["Packing", count(db.fulfilment, (row) => row.status === "Packing"), "amber"],
          ["Ready to ship", count(db.fulfilment, (row) => row.status === "Ready to ship")],
          ["Shipped", count(db.fulfilment, (row) => row.status === "Shipped")],
        ]}
      />
    );
  }

  if (id === "settlements") return <SettlementBoard />;
  if (id === "suppliers") {
    return (
      <StatStrip
        items={[
          ["Active", count(db.suppliers, (row) => row.status === "Active")],
          ["On hold", count(db.suppliers, (row) => row.status === "On hold"), "amber"],
          ["Open POs", count(db.purchases, (row) => row.status !== "Received"), "amber"],
          ["Supplier cities", new Set(db.suppliers.map((row) => row.city)).size],
        ]}
      />
    );
  }

  if (id === "private-label") {
    return (
      <StatStrip
        items={[
          ["Active labels", count(db.labels, (row) => row.status === "Active")],
          ["Pending approval", count(db.labels, (row) => row.status === "Pending approval"), "amber"],
          ["Paused", count(db.labels, (row) => row.status === "Paused")],
          ["Zero stock", count(db.labels, (row) => Number(row.stock) === 0), "rose"],
        ]}
      />
    );
  }

  if (id === "packaging") {
    return (
      <StatStrip
        items={[
          ["Available", count(db.packaging, (row) => row.status === "Available")],
          ["Low", count(db.packaging, (row) => row.status === "Low"), "amber"],
          ["Partner packs", count(db.packaging, (row) => row.type === "Partner")],
          ["Company packs", count(db.packaging, (row) => row.type === "Company")],
        ]}
      />
    );
  }

  if (id === "customers") {
    return (
      <StatStrip
        items={[
          ["Buyers on file", db.customers.length],
          ["With returns", count(db.customers, (row) => Number(row.returns) > 0), "amber"],
          ["Top spend", inr(Math.max(0, ...db.customers.map((row) => Number(row.spend) || 0)))],
          ["Brands represented", new Set(db.customers.map((row) => row.brand)).size],
        ]}
      />
    );
  }

  if (id === "notifications") {
    return (
      <StatStrip
        items={[
          ["Delivered", count(db.notices, (row) => row.status === "Delivered")],
          ["Draft", count(db.notices, (row) => row.status === "Draft"), "amber"],
          ["Failed", count(db.notices, (row) => row.status === "Failed"), "rose"],
          ["Channels", new Set(db.notices.map((row) => row.channel)).size],
        ]}
      />
    );
  }

  return null;
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

export { Reports } from "./reports";

