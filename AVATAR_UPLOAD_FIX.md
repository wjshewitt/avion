# Avatar Upload Fix - RLS Policy Error

## Issue
Getting error: **"new row violates row-level security policy"** when uploading profile pictures during onboarding.

## Root Cause
The storage RLS policies were incorrectly parsing the file path. The actual path structure is:
- **Actual:** `avatars/USER_ID-TIMESTAMP.ext`
- **Policy expected:** Nested folder structure

## Quick Fix (Copy & Paste)

Go to your Supabase Dashboard SQL Editor and run this:

### 1. Open SQL Editor
https://app.supabase.com/project/weivxhdfturzlyaaxwvb/sql/new

### 2. Copy and Paste This SQL

```sql
-- Fix avatar storage RLS policies
-- Drop old broken policies
drop policy if exists "Users can upload their own avatars" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;
drop policy if exists "Users can delete their own avatars" on storage.objects;

-- Create corrected policies with proper path parsing
-- File path format: avatars/USER_ID-TIMESTAMP.ext

-- Policy 1: Upload (corrected)
create policy "Users can upload their own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND starts_with(split_part(name, '/', 2), auth.uid()::text || '-')
);

-- Policy 2: Update (corrected)
create policy "Users can update their own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND starts_with(split_part(name, '/', 2), auth.uid()::text || '-')
);

-- Policy 3: Delete (corrected)
create policy "Users can delete their own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND starts_with(split_part(name, '/', 2), auth.uid()::text || '-')
);
```

### 3. Click "Run" (or press Ctrl/Cmd + Enter)

## Verify the Fix

After running the SQL:

1. Go back to your app
2. Refresh the onboarding page
3. Try uploading a profile picture
4. Should work without errors! ✅

## What Changed

**Before (broken):**
```sql
-- Tried to split nested folders that don't exist
split_part((storage.foldername(name))[2], '-', 1)
```

**After (fixed):**
```sql
-- Correctly checks if filename starts with USER_ID-
starts_with(split_part(name, '/', 2), auth.uid()::text || '-')
```

## Test Case

With a user ID of `abc-123` and file `avatar.jpg`:

- **Path:** `avatars/abc-123-1699999999999.jpg`
- **Check:** Does filename start with `abc-123-`? ✅ Yes!
- **Result:** Upload allowed

## Alternative: Apply Migration File

If you prefer using migrations:

```bash
# Run the migration via Supabase CLI
supabase db push

# Or apply the file: supabase/migrations/20251111000002_fix_avatar_storage_policies.sql
```

## Troubleshooting

### Still getting RLS error?
1. Verify policies exist:
   - Go to Storage > profiles > Policies
   - Should see 3 policies for authenticated + 1 for public

2. Check bucket settings:
   - Go to Storage > profiles
   - Should be set to "Public" for reads

3. Clear browser cache and try again

### Policy not created?
- Make sure you're connected to the right project
- Check for SQL errors in the dashboard
- Try creating policies one at a time

## Security Note

The new policies ensure:
- ✅ Users can only upload files with their own user ID in the name
- ✅ Files must be in the `avatars/` folder
- ✅ Bucket must be `profiles`
- ✅ Public can still read avatars for display
