-- User profiles table
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  avatar_url text,
  role text check (role in ('pilot', 'crew', 'admin', 'dispatcher')) default 'pilot',
  status text check (status in ('online', 'offline', 'away', 'busy')) default 'offline',
  bio text,
  phone text,
  timezone text default 'UTC',
  language text default 'en',
  theme text check (theme in ('light', 'dark', 'system')) default 'system',
  notifications_email boolean default true,
  notifications_push boolean default true,
  notifications_flight_updates boolean default true,
  notifications_weather_alerts boolean default true,
  preferences jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index idx_user_profiles_user_id on user_profiles(user_id);
create index idx_user_profiles_role on user_profiles(role);
create index idx_user_profiles_status on user_profiles(status);

-- RLS (Row Level Security) policies
alter table user_profiles enable row level security;

-- Users can view their own profile
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = user_id);

-- Function to automatically create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
exception
  when others then
    raise log 'Error creating user profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Apply updated_at trigger
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function update_updated_at_column();