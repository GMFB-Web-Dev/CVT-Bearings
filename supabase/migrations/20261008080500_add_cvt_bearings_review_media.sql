-- CVT Bearings review attachments. The objects themselves live in Cloudflare R2;
-- this array stores only the site-scoped object key and display metadata.
alter table public.reviews
  add column if not exists media jsonb not null default '[]'::jsonb;

alter table public.reviews
  drop constraint if exists reviews_media_array_check;

alter table public.reviews
  add constraint reviews_media_array_check
  check (
    jsonb_typeof(media) = 'array'
    and jsonb_array_length(media) <= 5
  );

comment on column public.reviews.media is
  'CVT Bearings review media stored in R2 under cvt-bearings/reviews.';
