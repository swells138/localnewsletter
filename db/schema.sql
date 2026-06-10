create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_status') then
    create type event_status as enum ('draft', 'pending', 'published', 'rejected');
  end if;
end $$;

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  county text not null,
  state text not null default 'OH',
  latitude numeric(9,6),
  longitude numeric(9,6),
  seo_title text not null,
  seo_description text not null,
  intro_text text not null
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  venue_name text not null,
  address text not null,
  city_id uuid not null references cities(id) on delete restrict,
  category_id uuid not null references categories(id) on delete restrict,
  price_text text not null,
  is_free boolean not null default false,
  is_family_friendly boolean not null default false,
  event_url text not null,
  organizer_name text not null,
  organizer_email text not null,
  image_url text,
  source_url text,
  imported_at timestamptz,
  import_confidence numeric(4,3),
  raw_import_data jsonb,
  status event_status not null default 'pending',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  city_id uuid references cities(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  is_active boolean not null default true,
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  preferred_city_id uuid references cities(id) on delete set null,
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists events_status_start_idx on events(status, start_datetime);
create index if not exists events_city_idx on events(city_id);
create index if not exists events_category_idx on events(category_id);
create index if not exists events_featured_idx on events(is_featured) where is_featured = true;
create index if not exists events_source_url_idx on events(source_url);
create index if not exists event_sources_active_idx on event_sources(is_active);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at
before update on events
for each row execute function set_updated_at();

drop trigger if exists event_sources_set_updated_at on event_sources;
create trigger event_sources_set_updated_at
before update on event_sources
for each row execute function set_updated_at();
