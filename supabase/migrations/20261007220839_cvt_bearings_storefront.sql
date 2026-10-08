create extension if not exists pgcrypto;

create table public.storefronts (
  key text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.storefronts (key, name) values ('cvt-bearings', 'CVT Bearings');

create table public.products (
  site_key text not null references public.storefronts(key),
  id text not null,
  slug text not null,
  sku text,
  title text not null,
  description text not null default '',
  product_kind text not null,
  bearing_type text,
  manufacturer text,
  manufacturer_part_number text,
  vehicle_brands text[] not null default '{}',
  transmission_text text,
  price_nzd numeric(12,2),
  commerce_mode text not null check (commerce_mode in ('fixed_price','quote')),
  dimensions jsonb not null default '{}',
  images jsonb not null default '[]',
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (site_key, id),
  unique (site_key, slug),
  check ((commerce_mode = 'quote') or price_nzd is not null)
);

create index products_site_title_idx on public.products (site_key, title);
create index products_site_sku_idx on public.products (site_key, sku) where sku is not null;
create index products_vehicle_brands_idx on public.products using gin (vehicle_brands);

create table public.profiles (
  site_key text not null references public.storefronts(key),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (site_key, user_id)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  site_key text not null references public.storefronts(key),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','converted','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_key, id)
);
create unique index carts_one_active_per_user on public.carts(site_key,user_id) where status='active';

create table public.cart_items (
  site_key text not null,
  cart_id uuid not null,
  product_id text not null,
  quantity integer not null check (quantity > 0),
  unit_price_nzd numeric(12,2) not null check (unit_price_nzd >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (site_key, cart_id, product_id),
  foreign key (site_key, cart_id) references public.carts(site_key,id) on delete cascade,
  foreign key (site_key, product_id) references public.products(site_key,id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  site_key text not null references public.storefronts(key),
  user_id uuid not null references auth.users(id),
  status text not null default 'draft' check (status in ('draft','pending','paid','processing','shipped','completed','cancelled')),
  subtotal_nzd numeric(12,2) not null default 0,
  shipping_nzd numeric(12,2) not null default 0,
  tax_nzd numeric(12,2) not null default 0,
  total_nzd numeric(12,2) generated always as (subtotal_nzd + shipping_nzd + tax_nzd) stored,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_key, id)
);

create table public.order_items (
  site_key text not null,
  order_id uuid not null,
  product_id text not null,
  product_title text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price_nzd numeric(12,2) not null check (unit_price_nzd >= 0),
  primary key (site_key, order_id, product_id),
  foreign key (site_key, order_id) references public.orders(site_key,id) on delete cascade,
  foreign key (site_key, product_id) references public.products(site_key,id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  site_key text not null,
  product_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text check (char_length(title) <= 120),
  body text not null check (char_length(body) between 5 and 4000),
  display_name text not null check (char_length(display_name) between 1 and 80),
  verified_purchase boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (site_key, product_id) references public.products(site_key,id),
  unique (site_key, product_id, user_id)
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  site_key text not null references public.storefronts(key),
  product_id text,
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (char_length(phone) <= 40),
  service text not null check (char_length(service) <= 80),
  message text not null check (char_length(message) between 5 and 4000),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'new' check (status in ('new','in_progress','resolved','spam')),
  created_at timestamptz not null default now(),
  foreign key (site_key, product_id) references public.products(site_key,id)
);

alter table public.storefronts enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.enquiries enable row level security;

create policy storefront_public_read on public.storefronts for select to anon, authenticated using (key = 'cvt-bearings');
create policy products_public_read on public.products for select to anon, authenticated using (site_key = 'cvt-bearings' and visible);
create policy profiles_read_own on public.profiles for select to authenticated using (site_key='cvt-bearings' and (select auth.uid())=user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check (site_key='cvt-bearings' and (select auth.uid())=user_id);
create policy profiles_update_own on public.profiles for update to authenticated using (site_key='cvt-bearings' and (select auth.uid())=user_id) with check (site_key='cvt-bearings' and (select auth.uid())=user_id);
create policy carts_read_own on public.carts for select to authenticated using (site_key='cvt-bearings' and (select auth.uid())=user_id);
create policy carts_insert_own on public.carts for insert to authenticated with check (site_key='cvt-bearings' and (select auth.uid())=user_id);
create policy carts_update_own on public.carts for update to authenticated using (site_key='cvt-bearings' and (select auth.uid())=user_id) with check (site_key='cvt-bearings' and (select auth.uid())=user_id);
create policy cart_items_read_own on public.cart_items for select to authenticated using (site_key='cvt-bearings' and exists(select 1 from public.carts c where c.site_key=cart_items.site_key and c.id=cart_items.cart_id and c.user_id=(select auth.uid())));
create policy cart_items_insert_own on public.cart_items for insert to authenticated with check (site_key='cvt-bearings' and exists(select 1 from public.carts c where c.site_key=cart_items.site_key and c.id=cart_items.cart_id and c.user_id=(select auth.uid())) and exists(select 1 from public.products p where p.site_key=cart_items.site_key and p.id=cart_items.product_id and p.commerce_mode='fixed_price' and p.price_nzd=cart_items.unit_price_nzd));
create policy cart_items_update_own on public.cart_items for update to authenticated using (site_key='cvt-bearings' and exists(select 1 from public.carts c where c.site_key=cart_items.site_key and c.id=cart_items.cart_id and c.user_id=(select auth.uid()))) with check (site_key='cvt-bearings' and quantity>0);
create policy cart_items_delete_own on public.cart_items for delete to authenticated using (site_key='cvt-bearings' and exists(select 1 from public.carts c where c.site_key=cart_items.site_key and c.id=cart_items.cart_id and c.user_id=(select auth.uid())));
create policy orders_read_own on public.orders for select to authenticated using (site_key='cvt-bearings' and (select auth.uid())=user_id);
create policy order_items_read_own on public.order_items for select to authenticated using (site_key='cvt-bearings' and exists(select 1 from public.orders o where o.site_key=order_items.site_key and o.id=order_items.order_id and o.user_id=(select auth.uid())));
create policy reviews_public_or_own_read on public.reviews for select to anon, authenticated using (site_key='cvt-bearings' and (status='approved' or (select auth.uid())=user_id));
create policy reviews_insert_own on public.reviews for insert to authenticated with check (site_key='cvt-bearings' and (select auth.uid())=user_id and status='pending' and verified_purchase=false);
create policy reviews_update_own_pending on public.reviews for update to authenticated using (site_key='cvt-bearings' and (select auth.uid())=user_id and status='pending') with check (site_key='cvt-bearings' and (select auth.uid())=user_id and status='pending' and verified_purchase=false);
create policy enquiries_public_insert on public.enquiries for insert to anon, authenticated with check (site_key='cvt-bearings' and (user_id is null or user_id=(select auth.uid())));

grant usage on schema public to anon, authenticated;
grant select on public.storefronts, public.products to anon, authenticated;
grant select, insert, update on public.profiles, public.carts, public.cart_items, public.reviews to authenticated;
grant delete on public.cart_items to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant insert on public.enquiries to anon, authenticated;
