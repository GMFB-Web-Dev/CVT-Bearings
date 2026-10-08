-- Cover CVT Bearings foreign keys used by RLS and customer account queries.
create index if not exists cart_items_site_product_idx on public.cart_items (site_key, product_id);
create index if not exists carts_user_idx on public.carts (user_id);
create index if not exists enquiries_site_idx on public.enquiries (site_key);
create index if not exists enquiries_site_product_idx on public.enquiries (site_key, product_id);
create index if not exists enquiries_user_idx on public.enquiries (user_id);
create index if not exists order_items_site_product_idx on public.order_items (site_key, product_id);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists profiles_user_idx on public.profiles (user_id);
create index if not exists reviews_user_idx on public.reviews (user_id);
