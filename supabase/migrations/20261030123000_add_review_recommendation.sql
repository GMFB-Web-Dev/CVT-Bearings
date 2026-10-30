alter table public.reviews
  add column if not exists recommended boolean not null default true;

comment on column public.reviews.recommended is
  'Whether the reviewer would recommend this product to others.';
