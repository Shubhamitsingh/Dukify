# CENTRAL ORDER MANAGEMENT AUDIT

**Product:** Pahachan Super Admin (Vite + React local session panel)  
**Business model:** Centralised multi-brand fashion commerce — company owns inventory, warehouse, packing, shipping, returns; Brand Partners own brand, storefront and acquisition.  
**Audit date:** 11 Nov 2026  
**Scope:** Inspect only. No code, schema or route changes in this pass.  
**Data reality for this repo:** There is **no live database and no Supabase client** in this Super Admin app. Orders live in an in-memory seed (`src/data.js`) cloned into React state (`src/store.jsx`). Refresh resets to seed unless the operator imports a JSON session. All “counts” below describe **sample session logic**, not production DB queries.

---

## Executive summary

| Area | Verdict |
|---|---|
| Unified Super Admin order list across brands | **Exists (partial)** — `/orders` ModulePage |
| Brand field on every order | **Exists** — string `order.brand` |
| Dedicated Central Order Overview (today / brand matrix / reconciliation) | **Missing** |
| Brand-wise order performance workspace | **Partial** — brand drawer links related orders; no analytics page |
| Customer ↔ order identity model | **Incorrect / incomplete** for cross-brand customer history |
| Date-range filters driving cards + tables together | **Missing** |
| Production-grade filters (brand, payment, date, sort, pagination) | **Mostly missing** |
| Order detail depth (tax, addresses, txn, warehouse allocation) | **Partial** |
| Real DB / RLS / uniqueness enforcement | **Not applicable in this app** (local mock) |

**Bottom line:** The panel already understands the *business idea* (central company fulfils all brands; each order carries a brand name). It does **not** yet deliver a true Central Order Overview, reliable customer identity, or production order analytics. Treat current numbers as **local sample UI**, not real platform totals.

---

## 1. Existing Order Management routes and pages

| Route | Component | Role |
|---|---|---|
| `/dashboard` | `Dashboard` in `src/pages.jsx` | Ops overview: sample sales, order-mix ring, pending work, recent orders, brand performance bars |
| `/orders` | `ModulePage id="orders"` | Central list of all seed orders + status strip + record drawer |
| `/fulfilment` | `ModulePage` | Warehouse tasks linked by `order` id + `brand` |
| `/shipping` | `ModulePage` | Shipments linked by `order` id; NDR queue strip |
| `/returns` | `ModulePage` | Returns linked by `order` + `brand` |
| `/payments` | `ModulePage` | Payments linked by `order` |
| `/customers` | `ModulePage` | Brand-tied buyer rows |
| `/brands` | `ModulePage` | Brand master; drawer can list related orders via `related()` |
| `/reports` | `Reports` | Brand sales / product sales / stock tables from same seed |
| `/settings` | `SettingsPage` | Hosts `DataTools` (JSON / orders CSV export-import) |
| `/exceptions` | `ExceptionsPage` | Derived issues including failed pay, NDR, returns |
| `/approvals` | `ApprovalsPage` | Includes return approvals, not order intake |

**Nav:** `src/shell.jsx` → Orders group → Orders / Fulfilment / Shipping / Private label / Packaging / Returns.

**Not present:**

- `/order-overview` or `/orders/overview` dedicated Central Order Overview  
- `/brands/:id/orders` brand order analytics route  
- `/orders/:id` dedicated full-page order detail (only query `?record=` drawer)  
- Partner-facing order portal (out of scope for this Super Admin-only product)

---

## 2. Existing order-related components

| Piece | Location | Notes |
|---|---|---|
| Generic CRUD table + drawer | `ModulePage`, `RecordDrawer` | Shared by orders and most modules |
| Orders status strip | `DeskExtras` when `id === "orders"` | Counts by `fulfilment` status from session data |
| Shipping NDR strip | `DeskExtras` shipping | NDR list with deep-link |
| Line items helper | `orderItems()` in `src/work.js` | Uses `order.items[]` if present; else synthesises one line from top-level product fields |
| Cascades | `cascade()` in `src/local.js` | Packing reserves stock; Shipped depletes stock + may create shipment; returns can restock / refund |
| Search (global shell) | `shell.jsx` | Can jump to an order by id / brand text |
| Export | `DataTools` in `ops.jsx` | Full JSON session + **all** orders CSV (not filter-aware) |
| Exceptions / approvals | `work.js` | Derives open work from orders and related collections |

There is **no** dedicated `OrderOverview`, `BrandOrderBoard`, date-range provider, or order analytics chart component beyond dashboard sales-by-day / order-mix.

---

## 3. Existing “database” tables and relationships

### 3.1 Storage model (this app)

```
seed (data.js)
  → structuredClone on load (store.jsx)
  → React state `db`
  → optional JSON import/export
```

No Postgres/Supabase tables, migrations, RLS, triggers or server functions exist in this repository.

### 3.2 Logical collections (session objects)

| Collection | Order relevance |
|---|---|
| `orders` | Primary order header (+ optional `items[]`) |
| `brands` | Brand master (`id`, `name`, …). Orders store **brand name string**, not `BRD-####` FK |
| `partners` | Partner desk; orders store partner name string |
| `websites` | Storefront per brand name |
| `customers` | Pseudo-customer per brand (`label` + `brand`) |
| `payments` | One payment row per order (created on add) |
| `fulfilment` | Ops tasks keyed by `order` |
| `shipments` | Courier/AWB keyed by `order` |
| `returns` | Return cases keyed by `order` + `brand` |
| `inventory` / `products` | Stock and catalogue; order holds `sku` / `product` |
| `inspections` | QC, sometimes return-linked |

### 3.3 Relationship diagram (as implemented)

```
Brand.name  ←—— string ——→  Order.brand
Partner.name ←—— string ——→  Order.partner
Customer.label + Customer.brand ←—— strings ——→ Order.customer (+ brand match in related())
Order.id ←——→ Payment.order / Fulfilment.order / Shipment.order / Return.order
Order.sku / product ←——→ Inventory / Product (loose, by name or sku)
```

**No foreign keys. No referential integrity. Join = string equality.**

---

## 4. Current customer-to-order logic

### What exists

- Each order has a free-text `customer` label (e.g. `Customer · Delhi`) and sometimes `address`.
- `customers[]` rows have `label`, `brand`, `orders`, `spend`, `returns`, `phone` — **no email**, no stable global customer id used on orders.
- Brand drawer / order drawer `related()` matches customers with `item.label === row.customer && item.brand === row.brand`.
- Customer drawer lists orders with the same label **and** same brand only.

### Answers to the required customer questions

| # | Question | Finding |
|---|---|---|
| 1 | Order via Brand A associated with Brand A? | **Yes** — `order.brand = "Aisa Clothing"` etc. |
| 2 | Order via Brand B associated with Brand B? | **Yes** |
| 3 | Super Admin sees both in one system? | **Yes** — single `db.orders` list |
| 4 | Can admin see which brand generated the order? | **Yes** — brand column / field |
| 5 | Same person buy from multiple brands? | **Not modelled correctly** — customers are brand-scoped labels |
| 6 | Same customer on Brand A and B linked? | **No** — e.g. `Customer · Delhi` on Aisa and Royal Ethnic are separate silos; no phone/email identity merge |
| 7 | Customer can have multiple orders? | **Yes within one brand label**, via count field / related list |
| 8 | Each order keeps brand attribution? | **Yes** |
| 9 | Unnecessary duplication? | **Yes risk** — city-style labels can collide across brands without meaning the same person; also customers missing for some order labels (e.g. Ahmedabad) |
| 10 | Cross-brand order history for one person? | **Missing** |

### Distinctions required vs available

| Metric | Available? |
|---|---|
| Total Customers | Partial count of `customers.length` (seed rows), not unique people |
| New / Returning Customers | **Missing** |
| Total Orders | Yes (`orders.length`) |
| Orders Per Customer | Partial static `customers.orders` field (not always derived live) |
| Brand-wise Customers | Partial (`customer.brand`) |
| Brand-wise Orders | Derivable by filtering `order.brand` |

---

## 5. Current brand-to-order attribution logic

### What works

- Every seed order carries `brand` and usually `partner`.
- Dashboard `brandStats()` groups orders by brand name (excludes `payment === "Failed"` from sales).
- Brand record drawer lists related orders for that brand name.
- Fulfilment / returns / labels also carry brand strings.
- Settlements / partnerMoney use partner name on orders.

### Gaps

- Attribution is **name string**, not `brandId`. Rename brand without cascade → orphaned history.
- No brand-level order KPI page (today / week / month / AOV / top products).
- Brands with zero orders (Zari, Gulmohar) are not called out on a brand-order matrix.
- Multi-brand single checkout is **not supported** (one `brand` per order). That matches central catalogue + brand storefront model if each storefront checkout is single-brand — document as intentional unless cart can span brands later.

---

## 6. Existing overall order counting logic

### Sources of counts today

| Surface | Logic |
|---|---|
| Orders `DeskExtras` | Count rows where `fulfilment === <status>` |
| Dashboard pending work | Confirmed / Packing / Ready to ship / Payment failed |
| Dashboard sales | Sum `value` where payment ≠ Failed |
| Dashboard paid / margin | Captured + COD pending for supply/margin |
| Reports brand sales | Same as brandStats (failed pay excluded from sales) |
| Shell badges / Every desk | Various open-work heuristics |

### Counting rules audit

| Rule | Status |
|---|---|
| Unique Order IDs in seed | Present (`ORD-####`); `nextId()` for new rows in session — **not DB-enforced** |
| One checkout = one order | Seed mostly 1 product; `items[]` exists on one order — **line items ≠ extra orders** when `orderItems()` used correctly |
| Cancelled / returned remain visible | **Yes** — still in `orders` with status |
| Gross vs active vs completed | **Partial** — statuses exist; no dedicated gross/active/completed KPI language on a central overview |
| Failed payment excluded from brand **sales** | **Yes** (intentional business rule in UI) |
| Failed payment still an order | **Yes** (`ORD-1039`) |
| Date-bounded “orders today” | **Missing** — dates are display strings (`"10 Nov 2026"`), not ISO timestamps; no Today filter |
| Hardcoded dashboard stats | **No hardcoded 40/20 style fakes** — counts come from seed arrays — but seed is **mock**, not production DB |

### Issue — Priority: High

- **Current:** Sales and pending KPIs mix different filters (failed out of sales; still in order mix).  
- **Problem:** Admin can confuse “orders received” with “revenue orders”.  
- **Impact:** Wrong ops decisions on volume vs money.  
- **Solution:** Separate cards: Gross orders received / Payable orders / Cancelled / Returned / Failed payment.  
- **Priority:** High

---

## 7. Existing brand-wise order counting logic

| Capability | Status |
|---|---|
| Sum orders per brand | Derivable; shown as sales bars + reports table, not order-status matrix |
| Orders today per brand | **Missing** |
| Pending / Shipped / Delivered per brand columns | **Missing** |
| Platform total reconciles to brand sum | Not presented; would work if built with same filter (by brand name grouping) |
| Brand with zero orders highlighted | **Missing** |
| Compare Brand A vs B vs C KPIs | Only sales amount bars / report rows |

### Issue — Priority: Critical (for the stated requirement)

- **Current:** No brand-wise order summary table with status columns and platform total.  
- **Problem:** Cannot answer “which brands drove today’s 40 orders?” in one view.  
- **Impact:** Central ops cannot allocate packing capacity or partner follow-ups by brand.  
- **Solution:** Add Central Order Overview section: brand matrix + platform footer, driven by one shared filter state.  
- **Priority:** Critical

---

## 8. Missing pages, widgets and capabilities

### Missing pages

1. **Central Order Overview** (summary cards + brand matrix + recent activity)  
2. **Brand Order Performance** (open brand → period KPIs, revenue, AOV, customers, top products, order list)  
3. **Full-page Order Detail** (structured sections vs generic field drawer)  
4. **Cross-brand Customer Profile** (optional later; needs identity model)

### Missing filters / list capabilities on `/orders`

| Capability | Status |
|---|---|
| Search Order ID | Partial (global search + table search on columns) |
| Search customer name / phone / email | **Weak / missing** — customer not in table columns; no email; phone only on customers collection |
| Filter by Brand | **Missing** |
| Filter by Order Status | **Exists** (fulfilment dropdown) |
| Filter by Date / range | **Missing** |
| Filter by Payment Status | **Missing** (payment shown but not filterable) |
| Filter by Product | Only free-text if product in columns |
| Sort newest / oldest / value | **Missing** |
| Pagination | **Missing** |
| Export **filtered** set | **Missing** (CSV exports entire `db.orders`) |

### Missing order detail fields (vs requirement)

| Block | Present in seed/UI | Missing |
|---|---|---|
| Order info | id, date string, brand, fulfilment, payment, delivery, method | timestamp, separate order vs fulfilment status model clarity, source channel |
| Brand info | brand, partner names | brand id on order, storefront link structured |
| Customer | label, optional address, phone via related customer | real name, email, billing address, history across brands |
| Products | product, sku, qty, value, optional items[] | image, size/colour structured, discount, tax lines |
| Financial | value, supply, method, payment reference via payments | subtotal/discount/tax/shipping breakdown, refund ledger |
| Fulfilment | fulfilment tasks, shipments, returns loosely related | warehouse allocation detail, packaging status on order, structured exchange |

---

## 9. Data accuracy and security problems

### Accuracy

| Issue | Impact | Priority |
|---|---|---|
| Local seed only — not production DB | Any “today 40 orders” style KPI would be demo unless wired to real store | Critical (for go-live) |
| String dates, not timezone-aware timestamps | Cannot implement trustworthy Today / IST ranges | Critical |
| Brand/customer joins by display name | Rename / typo breaks history | High |
| `customers.orders` / `spend` can drift from live orders | Wrong customer metrics | High |
| Stock cascade uses header `sku`/`qty`, not full `items[]` | Multi-line orders under-reserve / under-ship | High |
| Some returns reference orders not in seed (`ORD-1032`, `ORD-1028`) | Incomplete linked history | Medium |
| Map display formats `value` with `inr()` in table while raw stays numeric in drawer | Easy to confuse formatted vs raw when editing | Medium |

### Security

| Issue | Impact | Priority |
|---|---|---|
| Single Super Admin session login (any email/password locally) | No real auth roles in this app | High (production) |
| No RLS / partner scoping in this repo | Partner data isolation not implemented here (partner app is separate product) | High (platform) |
| Customer PII in plain session JSON / export | Export downloads phone + addresses to disk | Medium |
| No service-role keys in this app | Good — nothing to leak here | — |

**Supabase:** Not used in this Super Admin codebase. Do not invent tables for this audit. When a real DB product is connected, re-audit schemas, RLS and triggers separately.

---

## 10. UI/UX audit (Orders surfaces)

### What feels solid

- Clear brand column on order list  
- Fulfilment status badges  
- Orders desk strip for pipeline counts  
- Drawer with related brand / payment / shipment / customer links  
- Dashboard order-mix + recent orders for ops glance  
- Pink brand accent vs amber/rose semantic statuses

### Gaps vs premium OMS

- Orders page still looks like a **generic module table**, not a command centre  
- No date range control above cards  
- No brand filter chips  
- Customer column absent from main grid  
- Drawer is a flat key/value form — not sectioned Order / Customer / Lines / Money / Fulfilment  
- Empty/loading/error states are minimal (session never “loads” remotely)  
- No pagination for large catalogues  
- Mobile: table is wide; drawer works, but filters will need wrapping when added  

### Visual recommendation (ideal Central Order Overview)

1. **Page title:** Central orders  
2. **Sticky filter bar:** Date preset + Brand + Status + Payment + Search  
3. **Row 1 — Summary cards** (8–10 max, not 20): Received / Pending action / In packing / Shipped / Delivered / Cancelled / Returns / Brands with orders  
4. **Row 2 — Brand-wise table** with platform total footer (reconciled)  
5. **Row 3 — Order list** (same filters) with customer + brand + payment + fulfilment  
6. Keep deep fulfilment work on Fulfilment / Shipping pages to avoid overcrowding

---

## 11. Recommended page structure

```
/orders                     → upgrade into Central Order Overview + list
  ?record=ORD-####          → keep drawer short-term OR promote to /orders/:id
/brands?record=BRD-####     → add “Order performance” panel inside brand drawer/page
/customers                  → later: identity model + cross-brand history
/reports                    → keep financial/product summaries; link into filtered /orders
```

**Do not** create a second competing “Orders 2” menu item. Extend `/orders` and brand detail.

### Ideal Central Order Overview content

**A. Overall Order Summary (filter-aware)**  
Total received · Brands active · Brands with orders · Brands with zero · Pending · Confirmed · Processing/Packing · Packed/Ready · Shipped · Delivered · Cancelled · Return/Refund  

**B. Brand-wise Order Summary table**  
Brand · Orders in period · Total (all-time or period toggle) · Pending · Shipped · Delivered · Platform total footer  

**C. Individual order table**  
Order ID · Brand · Customer · Product/lines summary · Value · Date · Payment · Fulfilment  

**D. Drill-downs**  
Brand name → brand performance · Order ID → full detail · Customer → history (after identity fix)

### How customer / brand / order relationships should work

```
Customer (stable id: phone/email hash)
   └── many Orders
         ├── brandId + brandName (immutable snapshot on order)
         ├── partnerId snapshot
         ├── storefrontId snapshot
         ├── paymentStatus (separate)
         ├── fulfilmentStatus (separate)
         └── OrderLines[] (sku, qty, prices)  → inventory movements per line

Brand
   └── many Orders (via brandId)
   └── many Customers who purchased that brand (projection / link table)
```

Rules:

- Count **orders**, not lines, for platform order totals.  
- Keep cancelled/returned in historical counts; use separate “active pipeline” metrics.  
- Failed payments remain orders but stay out of brand **sales** (already the company rule).  
- Same customer may buy Brand A and Brand B; history is on Customer, attribution stays on each Order.  
- Do not double-count multi-line carts.

---

## 12. Priority-wise implementation roadmap

### P0 — Critical (approve before build)

1. Design Central Order Overview on `/orders` (summary + brand matrix + list) using **session data first**, with clear “local sample” labelling until DB exists.  
2. Introduce shared filter state: date preset (even if approximate until timestamps exist), brand, fulfilment, payment.  
3. Document counting definitions (gross / sales / pipeline) in UI notes.

### P1 — High

4. Add customer + date columns to order list; search across customer/phone.  
5. Brand Order Performance block on brand record (period KPIs + top products + linked orders).  
6. Structured order detail sections in drawer or dedicated page.  
7. Fix stock cascade to honour `items[]`.  
8. Derive customer spend/order counts from orders (or show as computed).

### P2 — Medium

9. Sort + pagination.  
10. Filter-aware CSV export.  
11. Replace string dates with ISO + IST display when real intake exists.  
12. Snapshot `brandId` on new orders; migrate seed to ids.  
13. Customer identity (phone/email) for cross-brand history.

### P3 — Low / later (needs real platform)

14. Wire to production DB / RLS.  
15. Partner-permissioned order views (partner app).  
16. Multi-brand parent/child orders **only if** storefront carts can span brands.

---

## Issue register (condensed)

| ID | Current implementation | Exact problem | Business impact | Recommended solution | Priority |
|---|---|---|---|---|---|
| OM-01 | `/orders` = generic ModulePage | No Central Order Overview | Admin cannot see platform + brand order picture | Build overview on `/orders` | Critical |
| OM-02 | No brand×status matrix | Cannot allocate ops by brand | Delayed packing / weak partner coaching | Brand summary table + totals | Critical |
| OM-03 | Display-string dates | No Today/7D/30D truth | Wrong daily management | ISO timestamps + shared date filter | Critical |
| OM-04 | Local seed, no DB | Not production analytics | False confidence if treated as live | Keep session labels; plan DB wiring separately | Critical |
| OM-05 | Customer = brand-scoped label | No cross-brand person | Broken CRM / LTV | Customer id + order snapshots | High |
| OM-06 | Weak list filters | Hard to find work | Slow exception handling | Brand/payment/date/sort | High |
| OM-07 | Flat order drawer | Incomplete ops view | Missed fulfilment/payment context | Sectioned order detail | High |
| OM-08 | Cascade uses header sku only | Multi-item stock wrong | Oversell / wrong bins | Line-level stock moves | High |
| OM-09 | Brand join by name | Fragile attribution | Broken history on rename | brandId on order | High |
| OM-10 | CSV exports all orders | Cannot export filtered ops set | Manual spreadsheet work | Export current filter | Medium |
| OM-11 | No pagination | Will fail at volume | UI freeze | Page or virtualise | Medium |
| OM-12 | Returns to missing orders | Incomplete audit trail | Confusing QC/returns desk | Seed consistency or soft links | Medium |
| OM-13 | No partner scoping here | OK for Super Admin-only app | Risk if same UI reused | Keep Super Admin global; partner app separate | Low (this repo) |

---

## Capability matrix (exists / partial / missing)

| Requirement | Status |
|---|---|
| Central list of all brand orders | Exists |
| Brand on each order | Exists |
| Unique order ids in sample | Exists |
| Payment vs fulfilment fields | Exists (separate fields) |
| Cancelled/returned retained | Exists |
| Line items without inflating order count | Partial (`items[]` rare; helper exists) |
| Overall summary cards (today, pipeline, brands with/without orders) | Missing / partial on dashboard only |
| Brand-wise summary table + platform total | Missing |
| Brand performance page | Partial (links only) |
| Date presets updating all widgets | Missing |
| Full search/filter/sort set | Partial |
| Rich order detail | Partial |
| Cross-brand customer model | Missing |
| Real DB accuracy / RLS | N/A in this app — Missing for production |

---

## What already exists / missing / incorrect / improve

### Already exists
- Central `/orders` list with brand attribution  
- Fulfilment pipeline strip and related shipping/returns/payments modules  
- Dashboard sales, order mix, pending work, brand sales bars, recent orders  
- Session cascades for pack/ship/return  
- Orders CSV / JSON export tools on Settings  

### Missing
- Dedicated Central Order Overview  
- Brand-wise order status matrix and reconciliation footer  
- Date-range system  
- Brand order analytics workspace  
- Production filters/sort/pagination  
- True customer identity and cross-brand history  
- Full financial/fulfilment detail model  

### Incorrect (for the target enterprise OMS)
- Treating city labels as customers  
- Joining brand/customer by mutable display names  
- Stock updates ignoring multi-line `items`  
- Implying analytics are DB-backed when they are local seed  

### Should be improved
- Upgrade `/orders` into the overview (do not duplicate routes)  
- Make counting language explicit (received vs sales vs pipeline)  
- Section the order detail UI  
- Prepare brandId + ISO dates before any real DB cutover  

---

## STOP

Audit complete. **No application code was modified for implementation.**  

Await review and explicit approval of the implementation plan (recommended start: P0 on `/orders` Central Order Overview using existing session collections, without inventing a second Orders page or a new database).
