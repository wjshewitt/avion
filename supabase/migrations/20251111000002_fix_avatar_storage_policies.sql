-- Fix storage RLS policies for profile avatars
-- The previous policies incorrectly tried to parse folder structure
-- The actual file path is: avatars/USER_ID-TIMESTAMP.ext

-- Drop old broken policies
drop policy if exists "Users can upload their own avatars" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;
drop policy if exists "Users can delete their own avatars" on storage.objects;

-- Policy 1: Allow authenticated users to upload their own avatars
-- File format: avatars/USER_ID-TIMESTAMP.ext
create policy "Users can upload their own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND starts_with(split_part(name, '/', 2), auth.uid()::text || '-')
);

-- Policy 2: Allow authenticated users to update their own avatars
create policy "Users can update their own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND starts_with(split_part(name, '/', 2), auth.uid()::text || '-')
);

-- Policy 3: Allow authenticated users to delete their own avatars
create policy "Users can delete their own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND starts_with(split_part(name, '/', 2), auth.uid()::text || '-')
);
