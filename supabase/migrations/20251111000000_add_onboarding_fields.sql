-- Add username and onboarding_completed fields to user_profiles
alter table user_profiles
  add column username text unique,
  add column onboarding_completed boolean default false;

-- Create index for username lookups
create index idx_user_profiles_username on user_profiles(username);

-- Add constraint for username format (3-20 characters, alphanumeric + underscore)
alter table user_profiles
  add constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- Create function to check username availability
create or replace function is_username_available(check_username text)
returns boolean as $$
begin
  return not exists (
    select 1 from user_profiles 
    where lower(username) = lower(check_username)
  );
end;
$$ language plpgsql security definer;
