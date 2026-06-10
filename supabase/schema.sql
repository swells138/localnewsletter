create extension if not exists pgcrypto;

create table if not exists public.cities (
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

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null
);

create type event_status as enum ('draft', 'pending', 'published', 'rejected');

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  venue_name text not null,
  address text not null,
  city_id uuid not null references public.cities(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
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

create table if not exists public.event_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  city_id uuid references public.cities(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  preferred_city_id uuid references public.cities(id) on delete set null,
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists events_status_start_idx on public.events(status, start_datetime);
create index if not exists events_city_idx on public.events(city_id);
create index if not exists events_category_idx on public.events(category_id);
create index if not exists events_featured_idx on public.events(is_featured) where is_featured = true;
create index if not exists events_source_url_idx on public.events(source_url);
create index if not exists event_sources_active_idx on public.event_sources(is_active);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists event_sources_set_updated_at on public.event_sources;
create trigger event_sources_set_updated_at
before update on public.event_sources
for each row execute function public.set_updated_at();

alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.event_sources enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "Public can read cities" on public.cities for select using (true);
create policy "Public can read categories" on public.categories for select using (true);
create policy "Public can read published events" on public.events for select using (status = 'published');

-- Server-side route handlers use SUPABASE_SERVICE_ROLE_KEY for writes and admin reads.
