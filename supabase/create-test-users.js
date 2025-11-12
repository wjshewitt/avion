#!/usr/bin/env node

/**
 * Create test user accounts for onboarding flow testing
 * 
 * Usage: node supabase/create-test-users.js
 * 
 * Creates test users with:
 * - Email already confirmed (no email verification needed)
 * - onboarding_completed = false (will see onboarding wizard)
 * - Simple passwords for easy testing
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

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_USERS = [
  {
    email: "test1@flightops.local",
    password: "test1234",
    name: "Test Pilot 1",
  },
  {
    email: "test2@flightops.local",
    password: "test1234",
    name: "Test Crew 2",
  },
  {
    email: "test3@flightops.local",
    password: "test1234",
    name: "Test Dispatcher 3",
  },
  {
    email: "test4@flightops.local",
    password: "test1234",
    name: "Test Admin 4",
  },
  {
    email: "test5@flightops.local",
    password: "test1234",
    name: "Test Pilot 5",
  },
];

async function createTestUsers() {
  console.log("🚀 Creating test users for onboarding flow...\n");

  const createdUsers = [];
  const errors = [];

  for (const testUser of TEST_USERS) {
    try {
      console.log(`⏳ Creating ${testUser.email}...`);

      // Create user with admin API (bypasses email confirmation)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true, // Skip email verification
        user_metadata: {
          display_name: testUser.name,
        },
      });

      if (authError) {
        // Check if user already exists
        if (authError.message.includes("already") || authError.message.includes("User already registered")) {
          console.log(`   ⚠️  User already exists, updating profile...`);
          
          // Get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === testUser.email);
          
          if (existingUser) {
            // Update their profile to reset onboarding
            const { error: profileError } = await supabase
              .from('user_profiles')
              .update({
                onboarding_completed: false,
                username: null, // Clear username so they can test again
                display_name: testUser.name,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', existingUser.id);

            if (profileError) {
              console.log(`   ❌ Failed to update profile: ${profileError.message}`);
            } else {
              console.log(`   ✅ Profile reset for testing`);
              createdUsers.push({
                ...testUser,
                userId: existingUser.id,
                status: 'updated',
              });
            }
          }
          continue;
        }

        throw authError;
      }

      if (!authData.user) {
        throw new Error("User creation returned no data");
      }

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ensure profile exists and set onboarding_completed to false
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, onboarding_completed')
        .eq('user_id', authData.user.id)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            display_name: testUser.name,
            onboarding_completed: false,
          });

        if (insertError) {
          console.log(`   ⚠️  Profile creation warning: ${insertError.message}`);
        }
      } else if (profile.onboarding_completed) {
        // Update if already completed
        await supabase
          .from('user_profiles')
          .update({ onboarding_completed: false })
          .eq('user_id', authData.user.id);
      }

      console.log(`   ✅ Created successfully`);
      createdUsers.push({
        ...testUser,
        userId: authData.user.id,
        status: 'created',
      });

    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      errors.push({
        email: testUser.email,
        error: error.message,
      });
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✨ Test User Creation Complete!\n");

  if (createdUsers.length > 0) {
    console.log("📋 Test Users Ready:");
    console.log("─".repeat(60));
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email:    ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Status:   ${user.status === 'created' ? '✅ New user' : '🔄 Reset for testing'}`);
      console.log("─".repeat(60));
    });

    console.log("\n🧪 How to test:");
    console.log("1. Go to http://localhost:3000/login");
    console.log("2. Log in with any test user credentials above");
    console.log("3. You'll be redirected to /onboarding");
    console.log("4. Complete the onboarding wizard");
    console.log("5. Log out and test with another user\n");

    console.log("🔄 To reset a user for re-testing:");
    console.log("   Run this script again, or manually set:");
    console.log("   - onboarding_completed = false");
    console.log("   - username = null\n");
  }

  if (errors.length > 0) {
    console.log("\n⚠️  Errors:");
    errors.forEach(err => {
      console.log(`   ${err.email}: ${err.error}`);
    });
  }

  console.log("\n💡 Tip: Use 'test1@flightops.local' with password 'test1234' for quick testing");
  console.log("\n" + "=".repeat(60) + "\n");
}

createTestUsers().catch((err) => {
  console.error("\n❌ Script failed:", err);
  process.exit(1);
});
