#!/usr/bin/env node

/**
 * Verify Auth Setup Script
 * Checks if user_profiles table and trigger exist in Supabase
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .limit(1);

  if (error) {
    if (error.message.includes("does not exist")) {
      return { exists: false, error: error.message };
    }
    return { exists: false, error: error.message };
  }

  return { exists: true };
}

async function checkTrigger() {
  const { data, error } = await supabase.rpc("pg_trigger_exists", {
    trigger_name: "on_auth_user_created",
  });

  // If the RPC doesn't exist, we'll check via direct query
  if (error) {
    // Try raw SQL query
    const { data: triggerData, error: triggerError } = await supabase
      .from("pg_trigger")
      .select("*")
      .eq("tgname", "on_auth_user_created")
      .limit(1);

    if (triggerError) {
      return { exists: false, needsManualCheck: true };
    }

    return { exists: triggerData && triggerData.length > 0 };
  }

  return { exists: data };
}

async function checkAuthSettings() {
  console.log("\n🔍 Checking Supabase Auth Setup...\n");

  // Check user_profiles table
  console.log("1. Checking user_profiles table...");
  const tableCheck = await checkTable("user_profiles");
  if (tableCheck.exists) {
    console.log("   ✅ user_profiles table exists");
  } else {
    console.log("   ❌ user_profiles table NOT found");
    console.log("   Error:", tableCheck.error);
    console.log("\n   📝 Action Required: Apply migration 20251105212034_create_user_profiles.sql");
  }

  // Check trigger
  console.log("\n2. Checking user creation trigger...");
  const triggerCheck = await checkTrigger();
  if (triggerCheck.needsManualCheck) {
    console.log("   ⚠️  Cannot auto-check trigger - needs manual verification");
    console.log(
      "   Go to: https://app.supabase.com/project/weivxhdfturzlyaaxwvb/editor"
    );
    console.log("   Run: SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';");
  } else if (triggerCheck.exists) {
    console.log("   ✅ on_auth_user_created trigger exists");
  } else {
    console.log("   ❌ on_auth_user_created trigger NOT found");
    console.log("   📝 Action Required: Apply migration or run fix-user-trigger.sql");
  }

  // Check if we can read from user_profiles
  if (tableCheck.exists) {
    console.log("\n3. Testing user_profiles access...");
    const { data, error } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.log("   ⚠️  Cannot read from user_profiles:", error.message);
    } else {
      console.log("   ✅ user_profiles is accessible");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n📋 NEXT STEPS TO FIX EMAIL ISSUES:\n");
  console.log("1. Go to Supabase Dashboard:");
  console.log("   https://app.supabase.com/project/weivxhdfturzlyaaxwvb/auth/providers\n");
  console.log("2. Click on 'Email' provider\n");
  console.log("3. UNCHECK 'Enable email confirmations'\n");
  console.log("4. Save changes\n");
  console.log("5. Try signing up again - should work immediately!\n");
  console.log("=".repeat(60) + "\n");

  if (!tableCheck.exists) {
    console.log("\n⚠️  WARNING: Migrations need to be applied first!\n");
    console.log("Run: cd supabase && node apply-migrations.js\n");
    console.log("Or manually apply SQL from supabase/migrations/ folder\n");
  }
}

checkAuthSettings().catch((error) => {
  console.error("❌ Error checking auth setup:", error.message);
  process.exit(1);
});
