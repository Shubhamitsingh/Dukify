# Pahachan Super Admin

Multi-brand commerce / fulfilment CRM (Vite + React). Privilege model: six roles, granular permissions, and brand/record scope.

## Quick start

```bash
npm install
npm run dev
```

Demo login is available in development (or when `VITE_DEMO_MODE=true`). See the login screen for role accounts.

## Access control

- **Matrix:** [docs/PERMISSION_MATRIX.md](docs/PERMISSION_MATRIX.md)
- **Setup / Supabase:** [docs/ACCESS_SETUP.md](docs/ACCESS_SETUP.md)
- **Completion report:** [docs/ACCESS_COMPLETION_REPORT.md](docs/ACCESS_COMPLETION_REPORT.md)
- **RLS migration:** [supabase/migrations/20261115_pahachan_rbac.sql](supabase/migrations/20261115_pahachan_rbac.sql)

Client-side checks support the UI demo. **Production requires server-side auth + RLS** on a dedicated Pahachan Supabase project.

## Stack

Vite 8 · React 19 · React Router 7 · Tailwind 4
