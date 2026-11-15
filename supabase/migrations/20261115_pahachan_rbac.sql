-- Pahachan multi-brand RBAC foundation
-- Apply to a DEDICATED Pahachan Supabase project (not the live/gifts app).
-- Tables are prefixed pahachan_ to avoid colliding with unrelated schemas.

-- Extensions
create extension if not exists "pgcrypto";

-- Brands
create table if not exists public.pahachan_brands (
  id text primary key,
  name text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profiles linked to auth.users
create table if not exists public.pahachan_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  status text not null default 'active' check (status in ('active', 'invited', 'disabled', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exactly six role templates (enum-like check)
create table if not exists public.pahachan_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.pahachan_profiles (id) on delete cascade,
  role text not null check (role in (
    'platform_owner',
    'platform_admin',
    'internal_staff',
    'brand_owner',
    'brand_admin',
    'brand_staff'
  )),
  -- Scope
  scope_type text not null check (scope_type in ('all_brands', 'selected_brands', 'assigned_records', 'brand')),
  -- For brand / selected_brands
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.pahachan_membership_brands (
  membership_id uuid not null references public.pahachan_memberships (id) on delete cascade,
  brand_id text not null references public.pahachan_brands (id) on delete cascade,
  primary key (membership_id, brand_id)
);

create table if not exists public.pahachan_membership_records (
  membership_id uuid not null references public.pahachan_memberships (id) on delete cascade,
  record_type text not null,
  record_id text not null,
  primary key (membership_id, record_type, record_id)
);

-- Granular permissions (default-deny)
create table if not exists public.pahachan_permissions (
  id text primary key,
  group_id text not null,
  label text not null
);

create table if not exists public.pahachan_membership_permissions (
  membership_id uuid not null references public.pahachan_memberships (id) on delete cascade,
  permission_id text not null references public.pahachan_permissions (id) on delete cascade,
  primary key (membership_id, permission_id)
);

-- Orders always carry brand_id
create table if not exists public.pahachan_orders (
  id text primary key,
  brand_id text not null references public.pahachan_brands (id),
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'new',
  customer_id text,
  total_paise bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.pahachan_order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.pahachan_orders (id) on delete cascade,
  sku text not null,
  qty int not null check (qty > 0),
  unit_price_paise bigint not null default 0,
  -- supplier cost: platform-only; never expose via brand RLS policies
  unit_supply_paise bigint
);

create table if not exists public.pahachan_audit_events (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  actor_id uuid references public.pahachan_profiles (id),
  action text not null,
  result text not null default 'success',
  brand_id text references public.pahachan_brands (id),
  record_type text,
  record_id text,
  meta jsonb not null default '{}'::jsonb
);

-- Helper: current membership
create or replace function public.pahachan_my_membership()
returns public.pahachan_memberships
language sql
stable
security definer
set search_path = public
as $$
  select m.*
  from public.pahachan_memberships m
  join public.pahachan_profiles p on p.id = m.user_id
  where m.user_id = auth.uid()
    and p.status = 'active'
  limit 1;
$$;

create or replace function public.pahachan_has_permission(perm text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pahachan_my_membership() m
    where m.role = 'platform_owner'
       or exists (
         select 1 from public.pahachan_membership_permissions mp
         where mp.membership_id = m.id and mp.permission_id = perm
       )
  );
$$;

create or replace function public.pahachan_can_access_brand(target_brand text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pahachan_my_membership() m
    where m.scope_type = 'all_brands'
       or (m.scope_type in ('brand', 'selected_brands') and exists (
         select 1 from public.pahachan_membership_brands mb
         where mb.membership_id = m.id and mb.brand_id = target_brand
       ))
  );
$$;

-- RLS
alter table public.pahachan_brands enable row level security;
alter table public.pahachan_profiles enable row level security;
alter table public.pahachan_memberships enable row level security;
alter table public.pahachan_membership_brands enable row level security;
alter table public.pahachan_membership_permissions enable row level security;
alter table public.pahachan_orders enable row level security;
alter table public.pahachan_order_lines enable row level security;
alter table public.pahachan_audit_events enable row level security;

-- Brands: only if in scope + brands.view
create policy pahachan_brands_select on public.pahachan_brands
  for select using (
    public.pahachan_has_permission('brands.view')
    and public.pahachan_can_access_brand(id)
  );

create policy pahachan_brands_insert on public.pahachan_brands
  for insert with check (public.pahachan_has_permission('brands.create'));

create policy pahachan_brands_update on public.pahachan_brands
  for update using (
    public.pahachan_has_permission('brands.edit')
    and public.pahachan_can_access_brand(id)
  );

-- Orders isolation by brand_id
create policy pahachan_orders_select on public.pahachan_orders
  for select using (
    public.pahachan_has_permission('orders.view')
    and public.pahachan_can_access_brand(brand_id)
  );

create policy pahachan_orders_update on public.pahachan_orders
  for update using (
    public.pahachan_has_permission('orders.edit')
    and public.pahachan_can_access_brand(brand_id)
  );

create policy pahachan_order_lines_select on public.pahachan_order_lines
  for select using (
    exists (
      select 1 from public.pahachan_orders o
      where o.id = order_id
        and public.pahachan_has_permission('orders.view')
        and public.pahachan_can_access_brand(o.brand_id)
    )
  );

-- Never select unit_supply_paise for brand roles without supplier_cost.view —
-- enforce in API views; RLS cannot column-mask easily. Use a view:
create or replace view public.pahachan_order_lines_safe as
select
  l.id,
  l.order_id,
  l.sku,
  l.qty,
  l.unit_price_paise,
  case
    when public.pahachan_has_permission('supplier_cost.view') then l.unit_supply_paise
    else null
  end as unit_supply_paise
from public.pahachan_order_lines l;

-- Audit: actors see events in scope; platform owner sees all with audit.view
create policy pahachan_audit_select on public.pahachan_audit_events
  for select using (
    public.pahachan_has_permission('audit.view')
    and (
      brand_id is null
      or public.pahachan_can_access_brand(brand_id)
    )
  );

create policy pahachan_audit_insert on public.pahachan_audit_events
  for insert with check (actor_id = auth.uid());

-- Last platform owner protection (trigger)
create or replace function public.pahachan_protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_count int;
begin
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and (new.role is distinct from 'platform_owner' or new.status = 'revoked')) then
    select count(*) into owner_count
    from public.pahachan_memberships m
    join public.pahachan_profiles p on p.id = m.user_id
    where m.role = 'platform_owner' and p.status = 'active'
      and m.user_id is distinct from old.user_id;
    if owner_count < 1 then
      raise exception 'Cannot remove or demote the last Platform Owner';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- Note: attach triggers after profiles/memberships are stable in your project.
-- create trigger pahachan_membership_owner_guard ...
