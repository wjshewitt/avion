-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Flights table
create table flights (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  origin text not null,
  destination text not null,
  status text check (status in ('On Time', 'Delayed', 'Cancelled')) default 'On Time',
  scheduled_at timestamptz not null,
  arrival_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index idx_flights_scheduled_at on flights(scheduled_at desc);
create index idx_flights_status on flights(status);

-- Updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to flights table
create trigger update_flights_updated_at
  before update on flights
  for each row
  execute function update_updated_at_column();
