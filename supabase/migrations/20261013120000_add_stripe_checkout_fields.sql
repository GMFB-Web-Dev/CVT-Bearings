alter table public.orders
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists customer_email text,
  add column if not exists paid_at timestamptz;

create unique index if not exists orders_stripe_checkout_session_id_key
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_stripe_payment_intent_id_idx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

comment on column public.orders.stripe_checkout_session_id is
  'Stripe Checkout Session used to collect payment for this order.';
comment on column public.orders.stripe_payment_intent_id is
  'Stripe PaymentIntent confirmed by the signed webhook.';
