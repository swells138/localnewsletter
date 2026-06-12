alter table events
  add column if not exists has_start_time boolean not null default true,
  add column if not exists has_end_time boolean not null default true;

alter table events
  alter column venue_name drop not null,
  alter column address drop not null,
  alter column price_text drop not null,
  alter column event_url drop not null,
  alter column organizer_name drop not null,
  alter column organizer_email drop not null;
