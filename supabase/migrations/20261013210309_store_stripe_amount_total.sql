alter table public.orders
  add column total_nzd_from_stripe numeric(12,2);

update public.orders
set total_nzd_from_stripe = subtotal_nzd + shipping_nzd;

alter table public.orders
  alter column total_nzd_from_stripe set default 0,
  alter column total_nzd_from_stripe set not null,
  drop column total_nzd;

alter table public.orders
  rename column total_nzd_from_stripe to total_nzd;

comment on column public.orders.total_nzd is
  'Authoritative final total from Stripe Checkout amount_total. Draft orders initially use the catalogue subtotal.';
