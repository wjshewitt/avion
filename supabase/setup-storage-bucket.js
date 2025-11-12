#!/usr/bin/env node

/**
 * Setup Supabase Storage bucket for avatar uploads
 * 
 * Usage: node supabase/setup-storage-bucket.js
 * 
 * This script creates a 'profiles' storage bucket for avatar uploads
 * with the correct permissions and policies.
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorageBucket() {
  console.log("🪣 Setting up Supabase Storage bucket for avatars...\n");

  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const profilesBucket = buckets?.find(b => b.name === 'profiles');

    if (profilesBucket) {
      console.log("✅ 'profiles' bucket already exists");
      console.log(`   Public: ${profilesBucket.public}`);
      console.log(`   Created: ${profilesBucket.created_at}\n`);
    } else {
      console.log("⏳ Creating 'profiles' bucket...");
      
      const { data, error } = await supabase.storage.createBucket('profiles', {
        public: true, // Make avatars publicly accessible
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });

      if (error) {
        throw error;
      }

      console.log("✅ 'profiles' bucket created successfully\n");
    }

    console.log("📝 Note: You may need to set up RLS policies manually in Supabase Dashboard:");
    console.log("\n1. Go to Storage > profiles bucket > Policies");
    console.log("2. Add these policies:\n");
    
    console.log("   Policy 1: Allow authenticated users to upload their own avatars");
    console.log("   ──────────────────────────────────────────────────────────────");
    console.log("   Operation: INSERT");
    console.log("   Name: Users can upload their own avatars");
    console.log("   Policy definition:");
    console.log("   ```sql");
    console.log("   (bucket_id = 'profiles')");
    console.log("   AND (auth.uid()::text = (storage.foldername(name))[1])");
    console.log("   ```\n");

    console.log("   Policy 2: Allow authenticated users to update their own avatars");
    console.log("   ──────────────────────────────────────────────────────────────");
    console.log("   Operation: UPDATE");
    console.log("   Name: Users can update their own avatars");
    console.log("   Policy definition:");
    console.log("   ```sql");
    console.log("   (bucket_id = 'profiles')");
    console.log("   AND (auth.uid()::text = (storage.foldername(name))[1])");
    console.log("   ```\n");

    console.log("   Policy 3: Allow authenticated users to delete their own avatars");
    console.log("   ──────────────────────────────────────────────────────────────");
    console.log("   Operation: DELETE");
    console.log("   Name: Users can delete their own avatars");
    console.log("   Policy definition:");
    console.log("   ```sql");
    console.log("   (bucket_id = 'profiles')");
    console.log("   AND (auth.uid()::text = (storage.foldername(name))[1])");
    console.log("   ```\n");

    console.log("   Policy 4: Allow public read access to avatars");
    console.log("   ──────────────────────────────────────────────────────────────");
    console.log("   Operation: SELECT");
    console.log("   Name: Public can view avatars");
    console.log("   Policy definition:");
    console.log("   ```sql");
    console.log("   bucket_id = 'profiles'");
    console.log("   ```\n");

    console.log("✨ Storage bucket setup complete!");
    console.log("\n🧪 Test the avatar upload in the onboarding flow now.\n");

  } catch (error) {
    console.error("❌ Error setting up storage bucket:", error.message);
    console.log("\n📖 Manual Setup Instructions:");
    console.log("──────────────────────────────────────────────────────────────");
    console.log("1. Go to your Supabase Dashboard");
    console.log("2. Navigate to Storage section");
    console.log("3. Click 'New bucket'");
    console.log("4. Name: profiles");
    console.log("5. Public bucket: YES");
    console.log("6. File size limit: 5MB");
    console.log("7. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif");
    console.log("8. Create the bucket");
    console.log("9. Add RLS policies as shown above\n");
    process.exit(1);
  }
}

setupStorageBucket().catch((err) => {
  console.error("\n❌ Script failed:", err);
  process.exit(1);
});
