alter table public.events
  add column if not exists source_url text,
  add column if not exists imported_at timestamptz,
  add column if not exists import_confidence numeric(4,3),
  add column if not exists raw_import_data jsonb;

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

create index if not exists events_source_url_idx on public.events(source_url);
create index if not exists event_sources_active_idx on public.event_sources(is_active);

drop trigger if exists event_sources_set_updated_at on public.event_sources;
create trigger event_sources_set_updated_at
before update on public.event_sources
for each row execute function public.set_updated_at();

alter table public.event_sources enable row level security;

-- Admin route handlers use SUPABASE_SERVICE_ROLE_KEY for event source reads/writes.
