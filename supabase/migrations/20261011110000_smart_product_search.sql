create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create or replace function public.search_cvt_products(
  search_query text default null,
  vehicle_brand text default null,
  product_bearing_type text default null,
  inner_diameter numeric default null,
  outer_diameter numeric default null,
  bearing_width numeric default null,
  dimension_values numeric[] default null,
  dimension_tolerance numeric default 1,
  result_limit integer default 8
)
returns table (
  id text,
  slug text,
  sku text,
  title text,
  manufacturer text,
  manufacturer_part_number text,
  bearing_type text,
  vehicle_brands text[],
  transmission_text text,
  price_nzd numeric,
  commerce_mode text,
  dimensions jsonb,
  images jsonb,
  relevance double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  with searchable as (
    select
      p.*,
      lower(extensions.unaccent(concat_ws(' ',
        p.title,
        p.sku,
        p.manufacturer,
        p.manufacturer_part_number,
        p.product_kind,
        replace(coalesce(p.bearing_type, ''), '_', ' '),
        p.transmission_text,
        array_to_string(p.vehicle_brands, ' '),
        concat_ws('x',
          nullif(p.dimensions ->> 'inner_diameter_mm', ''),
          nullif(p.dimensions ->> 'outer_diameter_mm', ''),
          nullif(p.dimensions ->> 'width_mm', '')
        )
      ))) as search_text,
      regexp_replace(lower(extensions.unaccent(concat_ws(' ',
        p.title,
        p.sku,
        p.manufacturer_part_number
      ))), '[^a-z0-9]+', '', 'g') as compact_text,
      case when (p.dimensions ->> 'inner_diameter_mm') ~ '^[0-9]+(\.[0-9]+)?$'
        then (p.dimensions ->> 'inner_diameter_mm')::numeric end as inner_mm,
      case when (p.dimensions ->> 'outer_diameter_mm') ~ '^[0-9]+(\.[0-9]+)?$'
        then (p.dimensions ->> 'outer_diameter_mm')::numeric end as outer_mm,
      case when (p.dimensions ->> 'width_mm') ~ '^[0-9]+(\.[0-9]+)?$'
        then (p.dimensions ->> 'width_mm')::numeric end as width_mm
    from public.products p
    where p.site_key = 'cvt-bearings' and p.visible
  ), prepared as (
    select
      nullif(trim(lower(extensions.unaccent(search_query))), '') as query_text,
      regexp_replace(lower(extensions.unaccent(coalesce(search_query, ''))), '[^a-z0-9]+', '', 'g') as compact_query,
      greatest(coalesce(dimension_tolerance, 1), 0) as tolerance
  )
  select
    s.id,
    s.slug,
    s.sku,
    s.title,
    s.manufacturer,
    s.manufacturer_part_number,
    s.bearing_type,
    s.vehicle_brands,
    s.transmission_text,
    s.price_nzd,
    s.commerce_mode,
    s.dimensions,
    s.images,
    (
      case
        when q.query_text is null then 0
        when regexp_replace(lower(coalesce(s.sku, '')), '[^a-z0-9]+', '', 'g') = q.compact_query then 12
        when regexp_replace(lower(coalesce(s.manufacturer_part_number, '')), '[^a-z0-9]+', '', 'g') = q.compact_query then 12
        when regexp_replace(lower(s.title), '[^a-z0-9]+', '', 'g') = q.compact_query then 10
        when s.compact_text like q.compact_query || '%' then 8
        when s.compact_text like '%' || q.compact_query || '%' then 6
        when s.search_text like '%' || q.query_text || '%' then 5
        else 0
      end
      + (case when q.query_text is null then 0 else
          ts_rank_cd(to_tsvector('simple', s.search_text), websearch_to_tsquery('simple', q.query_text)) * 5
        end)
      + (case when q.query_text is null then 0 else
          extensions.similarity(s.search_text, q.query_text) * 3
        end)
      - coalesce(abs(s.inner_mm - inner_diameter), 0) * 0.02
      - coalesce(abs(s.outer_mm - outer_diameter), 0) * 0.02
      - coalesce(abs(s.width_mm - bearing_width), 0) * 0.02
    )::double precision as relevance
  from searchable s
  cross join prepared q
  where
    (
      q.query_text is null
      or s.search_text like '%' || q.query_text || '%'
      or s.compact_text like '%' || q.compact_query || '%'
      or to_tsvector('simple', s.search_text) @@ websearch_to_tsquery('simple', q.query_text)
      or extensions.similarity(s.search_text, q.query_text) >= 0.12
    )
    and (
      nullif(trim(vehicle_brand), '') is null
      or exists (
        select 1 from unnest(s.vehicle_brands) as brand
        where lower(extensions.unaccent(brand)) = lower(extensions.unaccent(trim(vehicle_brand)))
      )
    )
    and (
      nullif(trim(product_bearing_type), '') is null
      or lower(coalesce(s.bearing_type, '')) = lower(trim(product_bearing_type))
      or s.search_text like '%' || lower(extensions.unaccent(replace(trim(product_bearing_type), '_', ' '))) || '%'
    )
    and (inner_diameter is null or (s.inner_mm is not null and abs(s.inner_mm - inner_diameter) <= q.tolerance))
    and (outer_diameter is null or (s.outer_mm is not null and abs(s.outer_mm - outer_diameter) <= q.tolerance))
    and (bearing_width is null or (s.width_mm is not null and abs(s.width_mm - bearing_width) <= q.tolerance))
    and (
      coalesce(cardinality(dimension_values), 0) = 0
      or (
        select count(*)
        from unnest(dimension_values) as requested(value)
        where exists (
          select 1
          from unnest(array[s.inner_mm, s.outer_mm, s.width_mm]) as actual(value)
          where actual.value is not null and abs(actual.value - requested.value) <= q.tolerance
        )
      ) = cardinality(dimension_values)
    )
  order by relevance desc, s.title
  limit least(greatest(coalesce(result_limit, 8), 1), 30);
$$;

revoke all on function public.search_cvt_products(text, text, text, numeric, numeric, numeric, numeric[], numeric, integer) from public;
grant execute on function public.search_cvt_products(text, text, text, numeric, numeric, numeric, numeric[], numeric, integer) to anon, authenticated;
