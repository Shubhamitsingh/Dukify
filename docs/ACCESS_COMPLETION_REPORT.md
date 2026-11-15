# Privilege-based Admin Panel — completion report

## 1. Six roles and how permissions / scopes work

| Role | Access model |
|------|----------------|
| **platform_owner** | Implicit full permission set; `all_brands` scope; can invite platform + brand users; protected as last owner |
| **platform_admin** | Full default grants; cannot assign/remove/demote last Platform Owner or transfer ownership; cannot self-escalate beyond grants (enforced in directory updates) |
| **internal_staff** | Role alone grants **no** ops access; Owner/Admin assigns permission sets + scope (`all_brands` \| `selected_brands` \| `assigned_records`). Empty selected brands → “No brands assigned” |
| **brand_owner** | Single brand; brand dashboard/orders/storefront/sales; invite `brand_admin` / `brand_staff` only; no platform settings, other brands, supplier cost |
| **brand_admin** | Single brand; manage brand ops + invite `brand_staff`; no platform roles |
| **brand_staff** | Single brand; only explicitly granted permission sets |

Concepts are separate in `src/access/{roles,permissions,scopes}.js`.

## 2. Routes, APIs, and queries that enforce access

| Surface | Enforcement |
|---------|-------------|
| Platform routes (`SuperAdminApp`) | `RequireAccess` + `routeMap.js` permission checks |
| Nav (SA + Brand) | Filtered by `canPath` |
| Global search | Scoped to allowed brands/orders only |
| Store reads/writes | `AccessStoreBridge` scopes collections by `brand_id` and gates mutations |
| Dashboard totals | Built from scoped orders; margin/supply hidden without permission; banner when not all-brands |
| Staff / permissions / audit pages | `/access/staff`, `/access/permissions`, `/access/audit` |
| Invite / revoke / grant | `src/access/directory.js` + `authorize.js` (role grant rules, last-owner guard) |
| SQL/RLS | `supabase/migrations/20261115_pahachan_rbac.sql` — **apply on a dedicated project** |

There is **no** production API yet in this repo. Client gates are the demo foundation only.

## 3. Permission matrix

See [PERMISSION_MATRIX.md](./PERMISSION_MATRIX.md).

## 4. Files changed / added

**Added:** `src/access/**` (roles, permissions, scopes, authorize, templates, routeMap, directory, audit, seedUsers, AccessContext, AccessGate, AccessStoreBridge, useScopedStore, Staff/Permission/Audit pages), `supabase/migrations/20261115_pahachan_rbac.sql`, `docs/PERMISSION_MATRIX.md`, `docs/ACCESS_SETUP.md`, `docs/ACCESS_COMPLETION_REPORT.md`, `.env.example`.

**Updated:** `src/auth.js`, `src/login.jsx`, `src/App.jsx`, `src/SuperAdminApp.jsx`, `src/shell.jsx`, `src/pages.jsx` (Dashboard), `src/store.jsx` (export StoreContext), `src/brand/shell.jsx`.

**Setup:** Copy `.env.example` → `.env.local`. Clear old `pahachan-unified-session` localStorage. Optional: apply SQL on a **new** Supabase project.

## 5. Environment / credentials still needed

- Dedicated Supabase URL + anon key
- Service role key for server only
- First Platform Owner auth user
- Production: disable `VITE_DEMO_MODE`

## 6. Still demo-only / not secured until backend

- Authentication (localStorage session + demo passwords)
- Audit log (browser localStorage)
- User directory (localStorage)
- All commerce data (in-memory seed)
- Brand Partner seed IDs (`brand-k`) vs SA brand IDs (`BRD-*`) not fully unified
- No Edge Functions / JWT session revocation pipeline
- Public storefront is out of scope of this CRM app

## 7. Assumptions

- Brand isolation key is stable `brand_id` on orders (name only as legacy fallback).
- Brand users do not see supplier costs or platform margins unless explicitly granted (defaults deny).
- Cross-brand customer history is **not** exposed to brand users.
- Internal staff never get all brands by default.
- Payment status and fulfilment status remain separate fields.
- Inventory adjustments are permission-gated; line-level SKU data remains the order model.
- Existing Cursor MCP Supabase is a different product — Pahachan needs its own project.
