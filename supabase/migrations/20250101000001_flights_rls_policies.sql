-- Enable Row Level Security on flights table
alter table flights enable row level security;

-- Allow authenticated users to read all flights
create policy "Authenticated users can read flights"
  on flights for select
  using (auth.role() = 'authenticated');

-- Prevent client-side writes (only server with service key can write)
create policy "No client writes to flights"
  on flights for insert
  with check (false);

create policy "No client updates to flights"
  on flights for update
  using (false);

create policy "No client deletes to flights"
  on flights for delete
  using (false);
