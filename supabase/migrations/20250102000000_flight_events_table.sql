-- Flight events table for audit trail and future automation
create table flight_events (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid references flights(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'updated', 'deleted', 'status_changed')),
  user_id uuid references auth.users(id),
  changed_data jsonb,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_flight_events_flight_id on flight_events(flight_id);
create index idx_flight_events_created_at on flight_events(created_at desc);

-- Enable Row Level Security on flight_events table
alter table flight_events enable row level security;

-- Allow authenticated users to read events
create policy "Authenticated users can read events"
  on flight_events for select
  using (auth.role() = 'authenticated');

-- Prevent client-side writes to events (only server can write)
create policy "No client writes to events"
  on flight_events for insert
  with check (false);
