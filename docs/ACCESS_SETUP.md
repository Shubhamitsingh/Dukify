# Access control setup

## Current state

This Vite + React app ships with:

1. A six-role access model in `src/access/`
2. Demo login when `import.meta.env.DEV` or `VITE_DEMO_MODE=true`
3. Client-side permission/scope checks and brand-scoped store reads
4. SQL + RLS foundation in `supabase/migrations/20261115_pahachan_rbac.sql`

**The connected Supabase project in Cursor MCP may be a different product.** Do **not** apply Pahachan migrations there. Create a dedicated Pahachan project.

**Demo mode is not production-ready.** localStorage sessions can be forged. Treat it as UX prototyping only.

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|----------|---------|
| `VITE_DEMO_MODE` | `true` to allow demo directory login outside DEV |
| `VITE_ALLOW_DEMO_TENANT_SWITCH` | `true` only for intentional multi-tenant UI demos |
| `VITE_SUPABASE_URL` | Pahachan Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Publishable anon key (never service role in the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/Edge only — never ship to the client |

## Production checklist

1. Create a new Supabase project for Pahachan commerce.
2. Apply `supabase/migrations/20261115_pahachan_rbac.sql`.
3. Seed `pahachan_permissions` from `src/access/permissions.js`.
4. Create the first `platform_owner` membership for your auth user.
5. Replace `authenticate()` in `src/auth.js` with Supabase Auth (email magic link / password).
6. Load membership + permissions + scope from the database after sign-in; put only a session token in the client.
7. Route all reads/writes through PostgREST/Edge with RLS — never trust `role` / `brand_id` from the browser.
8. On revoke: set `pahachan_profiles.status = 'revoked'` and invalidate refresh tokens / short JWT TTL.
9. Set `VITE_DEMO_MODE=false` in production builds.

## Demo accounts (local only)

See the login screen when demo mode is on. Accounts live in `src/access/seedUsers.js`. Clear `pahachan-access-directory` and `pahachan-unified-session` in localStorage to reset.

## Public storefront

Storefront visitors and shopping customers must use separate public routes/apps with no CRM session. Do not reuse admin JWT cookies on the storefront origin without strict isolation.
