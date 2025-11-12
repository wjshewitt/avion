-- Add affiliated_organization column to user_profiles
alter table user_profiles 
add column if not exists affiliated_organization text;

-- Add comment for documentation
comment on column user_profiles.affiliated_organization is 'The organization that the user is affiliated with (e.g. airline, charter company)';
