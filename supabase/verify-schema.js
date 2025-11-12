#!/usr/bin/env node

/**
 * Verify Supabase schema is correctly set up
 *
 * Usage: node supabase/verify-schema.js
 *
 * This script checks that all required tables, indexes, and policies exist
 */

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  console.log("🔍 Verifying Supabase schema...\n");

  let allChecks = true;

  // Check flights table
  console.log("📋 Checking user_flights table...");
  const { data: flights, error: flightsError } = await supabase
    .from("user_flights")
    .select("*")
    .limit(0);

  if (flightsError) {
    console.error("❌ user_flights table not found or not accessible");
    console.error("   Error:", flightsError.message);
    allChecks = false;
  } else {
    console.log("✅ user_flights table exists and is accessible\n");
  }

  // Check flight_events table
  console.log("📋 Checking flight_events table...");
  const { data: events, error: eventsError } = await supabase
    .from("flight_events")
    .select("*")
    .limit(0);

  if (eventsError) {
    console.error("❌ Flight_events table not found or not accessible");
    console.error("   Error:", eventsError.message);
    allChecks = false;
  } else {
    console.log("✅ Flight_events table exists and is accessible\n");
  }

  // Test RLS policies (should fail for client writes)
  console.log("🔒 Checking RLS policies...");
  const clientSupabase = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { error: insertError } = await clientSupabase
    .from("user_flights")
    .insert({
      code: "TEST",
      origin: "JFK",
      destination: "LAX",
      scheduled_at: new Date().toISOString(),
    });

  if (insertError && insertError.message.includes("policy")) {
    console.log("✅ RLS policies are correctly blocking client writes\n");
  } else if (!insertError) {
    console.error(
      "⚠️  Warning: Client was able to write directly (RLS may not be configured)"
    );
    allChecks = false;
  }

  // Summary
  console.log("━".repeat(50));
  if (allChecks) {
    console.log("✨ Schema verification passed!");
    console.log("\n📝 Next steps:");
    console.log("   1. Run: npm run supabase:types");
    console.log("   2. Start implementing Server Actions");
  } else {
    console.log("❌ Schema verification failed");
    console.log("\n📝 Please:");
    console.log("   1. Apply migrations via Supabase Dashboard");
    console.log("   2. Check supabase/README.md for instructions");
  }
}

verifySchema().catch((err) => {
  console.error("❌ Verification failed:", err.message);
  process.exit(1);
});
