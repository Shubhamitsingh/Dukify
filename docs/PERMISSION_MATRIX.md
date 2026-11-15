# Pahachan permission matrix

Role, permission, and scope are separate. **Default-deny:** if a permission or scope is not granted, the action is denied.

> Browser demo authorization is **not** production security. Production must enforce the same rules in Supabase RLS / API (`supabase/migrations/20261115_pahachan_rbac.sql`).

## Six roles

| Role | Relationship | Default permissions | Default scope |
|------|--------------|---------------------|---------------|
| `platform_owner` | Owns the platform | All permissions | `all_brands` |
| `platform_admin` | Platform staff with broad ops | All permissions (cannot assign/remove last owner; cannot transfer ownership) | `all_brands` |
| `internal_staff` | Central company employee | **None** until permission sets assigned | **Not** all brands by default — `selected_brands` (empty until configured), or `assigned_records` |
| `brand_owner` | Owns one brand account | Brand ops + invite brand_admin/brand_staff; sales view; **no** supplier cost / platform margin / other brands | `brand` (assigned brand only) |
| `brand_admin` | Manages one brand | Brand ops + invite brand_staff; no platform roles | `brand` |
| `brand_staff` | Works inside one brand | **None** until sets assigned | `brand` |

### Internal staff permission sets

| Set | Typical grants |
|-----|----------------|
| Orders | dashboard.view, orders.view/edit, customers.view |
| Catalog and inventory | catalog.*, inventory.view/adjust, prices.manage |
| Fulfilment and shipping | orders.view, fulfillment/shipping/returns.manage, inventory.view |
| Finance and settlements | finance.*, settlements.*, margin.view, brand_sales.view, refunds.process, export.data |
| Customer support and brand success | support.*, customers.view, orders.view, brands.view |
| Reports (read-only) | dashboard.view, reports.view, orders.view, brand_sales.view |

### Brand staff permission sets

| Set | Typical grants |
|-----|----------------|
| Brand orders | orders.view/edit, customers.view, support.view |
| Brand catalogue & content | catalog.view/edit, storefront.view/publish, inventory.view |
| Reports (read-only) | reports.view |

## Permission groups

See `src/access/permissions.js` for the full ID list. Groups: Overview, Brands, Catalog & inventory, Orders & fulfilment, Finance, Customers & support, Reports, Storefront & marketing, Users & access, Settings.

## Sensitive visibility rules

| Data | Platform (with grant) | Brand users |
|------|----------------------|-------------|
| Orders for assigned brands | Yes | Own brand only (`brand_id`) |
| All-brand dashboard totals | `dashboard.all_brands` | Never |
| Supplier / procurement cost | `supplier_cost.view` | Never by default |
| Platform margin | `margin.view` | Not granted on brand_owner/admin defaults |
| Brand sales (permitted) | `brand_sales.view` | Yes for owner/admin |
| Cross-brand customer history | Deliberate product decision — **not** auto-exposed to brand users | Own-brand customers only |
| Payment vs fulfilment status | Separate fields on orders | Same |

## UI vs server

| Layer | What it does |
|-------|----------------|
| Nav / buttons | Hides actions the user cannot perform |
| `AccessStoreBridge` + `authorize.js` | Demo client gate + scoped queries |
| Supabase RLS / API | **Required** for production isolation |

Hiding a menu item is **not** security.
