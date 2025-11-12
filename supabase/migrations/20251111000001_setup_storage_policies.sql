-- Storage RLS policies for profile avatars bucket

-- Policy 1: Allow authenticated users to upload their own avatars
create policy "Users can upload their own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
);

-- Policy 2: Allow authenticated users to update their own avatars
create policy "Users can update their own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
);

-- Policy 3: Allow authenticated users to delete their own avatars
create policy "Users can delete their own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
);

-- Policy 4: Allow public read access to avatars
create policy "Public can view avatars"
on storage.objects for select
to public
using (bucket_id = 'profiles');
