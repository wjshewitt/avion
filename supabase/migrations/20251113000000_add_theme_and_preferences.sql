-- Add theme, role, timezone, and HQ/operations preferences to user_profiles
alter table user_profiles
  add column if not exists role text,
  add column if not exists timezone text,
  add column if not exists theme_preference text default 'light',
  add column if not exists hq_location text,
  add column if not exists hq_timezone_same_as_main boolean default true,
  add column if not exists operations_date date;

-- Clean up any invalid existing role values (set to NULL)
update user_profiles 
set role = null 
where role is not null 
  and role not in ('flight_ops', 'broker');

-- Clean up any invalid theme values (set to 'light')
update user_profiles 
set theme_preference = 'light' 
where theme_preference is not null 
  and theme_preference not in ('light', 'dark', 'system');

-- Add check constraint for valid roles
alter table user_profiles
  add constraint valid_role check (role in ('flight_ops', 'broker') or role is null);

-- Add check constraint for valid themes
alter table user_profiles
  add constraint valid_theme check (theme_preference in ('light', 'dark', 'system'));

-- Add comment explaining the columns
comment on column user_profiles.role is 'User operational role: flight_ops or broker';
comment on column user_profiles.timezone is 'User preferred timezone for display';
comment on column user_profiles.theme_preference is 'UI theme preference: light, dark, or system';
comment on column user_profiles.hq_location is 'Primary headquarters city/location for the user''s operations';
comment on column user_profiles.hq_timezone_same_as_main is 'Whether HQ local time matches the user''s main operations timezone';
comment on column user_profiles.operations_date is 'Default operations/briefing date (if set)';
