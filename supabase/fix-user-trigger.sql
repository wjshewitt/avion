-- Fix the handle_new_user function to handle missing metadata and errors gracefully
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
