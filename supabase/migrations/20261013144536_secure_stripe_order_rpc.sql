create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table if not exists private.storefront_server_secrets (
  site_key text primary key,
  secret_sha256 text not null check (secret_sha256 ~ '^[0-9a-f]{64}$'),
  updated_at timestamptz not null default now()
);

revoke all on table private.storefront_server_secrets from public, anon, authenticated;

insert into private.storefront_server_secrets (site_key, secret_sha256)
values ('cvt-bearings', '6f631df57659eeaef6c58278b19e82cb8a58d107b1e535511a2ee37927eb92cc')
on conflict (site_key) do update
set secret_sha256 = excluded.secret_sha256,
    updated_at = now();

create or replace function private.valid_storefront_server_secret(
  p_site_key text,
  p_server_secret text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.storefront_server_secrets secrets
    where secrets.site_key = p_site_key
      and secrets.secret_sha256 = encode(extensions.digest(coalesce(p_server_secret, ''), 'sha256'), 'hex')
  );
$$;

revoke all on function private.valid_storefront_server_secret(text, text) from public, anon, authenticated;

create or replace function public.create_storefront_checkout_order(
  p_server_secret text,
  p_user_id uuid,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_item_count integer;
  v_subtotal numeric(12,2);
begin
  if not private.valid_storefront_server_secret('cvt-bearings', p_server_secret) then
    raise exception 'Invalid storefront server credential' using errcode = '42501';
  end if;

  if p_user_id is null or not exists (select 1 from auth.users users where users.id = p_user_id) then
    raise exception 'Invalid checkout user' using errcode = '22023';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Checkout items must be an array' using errcode = '22023';
  end if;

  select count(*), coalesce(sum(item.quantity * item.unit_price_nzd), 0)
  into v_item_count, v_subtotal
  from jsonb_to_recordset(p_items) as item(
    product_id text,
    product_title text,
    sku text,
    quantity integer,
    unit_price_nzd numeric(12,2)
  );

  if v_item_count < 1 or v_item_count > 30 then
    raise exception 'Checkout requires between 1 and 30 products' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      product_id text,
      product_title text,
      sku text,
      quantity integer,
      unit_price_nzd numeric(12,2)
    )
    left join public.products products
      on products.site_key = 'cvt-bearings'
     and products.id = item.product_id
    where item.product_id is null
       or item.product_title is null
       or item.quantity not between 1 and 20
       or item.unit_price_nzd is null
       or item.unit_price_nzd < 0
       or products.id is null
       or products.visible is not true
       or products.commerce_mode <> 'fixed_price'
       or products.price_nzd is distinct from item.unit_price_nzd
       or (products.track_inventory and (
         products.stock_status <> 'in_stock'
         or coalesce(products.stock_quantity, 0) < item.quantity
       ))
  ) then
    raise exception 'Checkout product validation failed' using errcode = '22023';
  end if;

  if (
    select count(*)
    from (
      select distinct item.product_id
      from jsonb_to_recordset(p_items) as item(product_id text)
    ) unique_items
  ) <> v_item_count then
    raise exception 'Duplicate checkout products are not allowed' using errcode = '22023';
  end if;

  insert into public.orders (site_key, user_id, status, subtotal_nzd, total_nzd)
  values ('cvt-bearings', p_user_id, 'draft', v_subtotal, v_subtotal)
  returning id into v_order_id;

  insert into public.order_items (
    site_key,
    order_id,
    product_id,
    product_title,
    sku,
    quantity,
    unit_price_nzd
  )
  select
    'cvt-bearings',
    v_order_id,
    item.product_id,
    item.product_title,
    item.sku,
    item.quantity,
    item.unit_price_nzd
  from jsonb_to_recordset(p_items) as item(
    product_id text,
    product_title text,
    sku text,
    quantity integer,
    unit_price_nzd numeric(12,2)
  );

  return v_order_id;
end;
$$;

create or replace function public.attach_storefront_checkout_session(
  p_server_secret text,
  p_order_id uuid,
  p_session_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.valid_storefront_server_secret('cvt-bearings', p_server_secret) then
    raise exception 'Invalid storefront server credential' using errcode = '42501';
  end if;
  if p_session_id is null or p_session_id !~ '^cs_' then
    raise exception 'Invalid Checkout Session identifier' using errcode = '22023';
  end if;

  update public.orders
  set stripe_checkout_session_id = p_session_id,
      status = 'pending',
      updated_at = now()
  where id = p_order_id
    and site_key = 'cvt-bearings'
    and status = 'draft';

  return found;
end;
$$;

create or replace function public.complete_storefront_checkout_order(
  p_server_secret text,
  p_order_id uuid,
  p_subtotal_nzd numeric,
  p_shipping_nzd numeric,
  p_tax_nzd numeric,
  p_total_nzd numeric,
  p_shipping_address jsonb,
  p_customer_email text,
  p_payment_intent_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  if not private.valid_storefront_server_secret('cvt-bearings', p_server_secret) then
    raise exception 'Invalid storefront server credential' using errcode = '42501';
  end if;
  if p_subtotal_nzd < 0 or p_shipping_nzd < 0 or p_tax_nzd < 0 or p_total_nzd < 0
     or p_tax_nzd > p_total_nzd
     or abs(p_total_nzd - (p_subtotal_nzd + p_shipping_nzd)) > 0.01 then
    raise exception 'Invalid Stripe order totals' using errcode = '22023';
  end if;

  update public.orders
  set status = 'paid',
      subtotal_nzd = p_subtotal_nzd,
      shipping_nzd = p_shipping_nzd,
      tax_nzd = p_tax_nzd,
      total_nzd = p_total_nzd,
      shipping_address = p_shipping_address,
      customer_email = p_customer_email,
      stripe_payment_intent_id = p_payment_intent_id,
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
  where id = p_order_id
    and site_key = 'cvt-bearings'
    and status <> 'cancelled'
  returning user_id into v_user_id;

  if v_user_id is null then
    return false;
  end if;

  update public.carts
  set status = 'converted',
      updated_at = now()
  where site_key = 'cvt-bearings'
    and user_id = v_user_id
    and status = 'active';

  return true;
end;
$$;

create or replace function public.cancel_storefront_checkout_order(
  p_server_secret text,
  p_order_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.valid_storefront_server_secret('cvt-bearings', p_server_secret) then
    raise exception 'Invalid storefront server credential' using errcode = '42501';
  end if;

  update public.orders
  set status = 'cancelled',
      updated_at = now()
  where id = p_order_id
    and site_key = 'cvt-bearings'
    and status in ('draft', 'pending');

  return found;
end;
$$;

revoke all on function public.create_storefront_checkout_order(text, uuid, jsonb) from public, authenticated, service_role;
revoke all on function public.attach_storefront_checkout_session(text, uuid, text) from public, authenticated, service_role;
revoke all on function public.complete_storefront_checkout_order(text, uuid, numeric, numeric, numeric, numeric, jsonb, text, text) from public, authenticated, service_role;
revoke all on function public.cancel_storefront_checkout_order(text, uuid) from public, authenticated, service_role;

grant execute on function public.create_storefront_checkout_order(text, uuid, jsonb) to anon;
grant execute on function public.attach_storefront_checkout_session(text, uuid, text) to anon;
grant execute on function public.complete_storefront_checkout_order(text, uuid, numeric, numeric, numeric, numeric, jsonb, text, text) to anon;
grant execute on function public.cancel_storefront_checkout_order(text, uuid) to anon;

comment on table private.storefront_server_secrets is
  'One-way hashes of high-entropy server credentials used by narrowly scoped storefront RPCs.';
comment on function public.create_storefront_checkout_order(text, uuid, jsonb) is
  'Creates a validated CVT Bearings draft order for the server-side Stripe Checkout route.';
comment on function public.complete_storefront_checkout_order(text, uuid, numeric, numeric, numeric, numeric, jsonb, text, text) is
  'Finalizes one CVT Bearings order after the application verifies a signed Stripe webhook.';
