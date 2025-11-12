# Avatar Upload Setup

## ✅ Storage Bucket Created

The `profiles` storage bucket has been created successfully!

## 🔒 Required: Set Up RLS Policies

For security, you need to add Row Level Security (RLS) policies to the storage bucket. Here's how:

### Option 1: Apply via SQL Editor (Recommended)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the following SQL:

```sql
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
```

5. Click **Run** or press `Ctrl/Cmd + Enter`

### Option 2: Apply via Dashboard UI

1. Go to **Storage** > **profiles** bucket
2. Click on **Policies** tab
3. Click **New Policy** for each policy below:

#### Policy 1: Upload
- **Operation:** INSERT
- **Name:** Users can upload their own avatars
- **Target roles:** authenticated
- **Policy definition:**
```sql
(bucket_id = 'profiles')
AND (storage.foldername(name))[1] = 'avatars'
AND auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
```

#### Policy 2: Update
- **Operation:** UPDATE
- **Name:** Users can update their own avatars
- **Target roles:** authenticated
- **Policy definition:**
```sql
(bucket_id = 'profiles')
AND (storage.foldername(name))[1] = 'avatars'
AND auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
```

#### Policy 3: Delete
- **Operation:** DELETE
- **Name:** Users can delete their own avatars
- **Target roles:** authenticated
- **Policy definition:**
```sql
(bucket_id = 'profiles')
AND (storage.foldername(name))[1] = 'avatars'
AND auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
```

#### Policy 4: Read (Public)
- **Operation:** SELECT
- **Name:** Public can view avatars
- **Target roles:** public
- **Policy definition:**
```sql
bucket_id = 'profiles'
```

## 🧪 Test Avatar Upload

After setting up the policies:

1. Start your dev server: `npm run dev`
2. Log in with a test user (e.g., `test1@flightops.local` / `test1234`)
3. Go through the onboarding flow
4. On Step 2, try uploading a profile picture
5. Should work without errors now! 🎉

## 📁 Bucket Configuration

- **Bucket name:** `profiles`
- **Public:** Yes (for viewing avatars)
- **File size limit:** 5MB
- **Allowed types:** JPEG, PNG, WebP, GIF
- **Storage path:** `avatars/{user_id}-{timestamp}.{ext}`

## 🔧 Troubleshooting

### Error: "Storage bucket not configured"
- Make sure you ran: `node supabase/setup-storage-bucket.js`
- Check that the bucket exists in Supabase Dashboard > Storage

### Error: "new row violates row-level security policy"
- You need to add the RLS policies above
- Make sure policies are applied to `storage.objects` table

### Upload succeeds but image doesn't show
- Check that Policy 4 (public read) is applied
- Verify the bucket is set to "Public"
- Check browser console for CORS or permission errors

## 🔐 Security Notes

The policies ensure:
- ✅ Users can only upload/update/delete their own avatars
- ✅ File paths include user ID for security
- ✅ Public can read avatars (for display)
- ✅ No anonymous uploads allowed
- ✅ File size and type restrictions enforced at API level
