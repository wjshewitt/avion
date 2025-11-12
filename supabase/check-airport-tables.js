#!/usr/bin/env node

/**
 * Check if airport cache tables exist
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

async function checkAirportTables() {
  console.log("🔍 Checking airport cache tables...\n");

  // Check airport_cache table
  console.log("📋 Checking airport_cache table...");
  const { data: airportCache, error: airportCacheError } = await supabase
    .from("airport_cache")
    .select("*")
    .limit(0);

  if (airportCacheError) {
    console.error("❌ airport_cache table not found");
    console.error("   Error:", airportCacheError.message);
    console.log(
      "   Please apply the migration manually via Supabase Dashboard"
    );
  } else {
    console.log("✅ airport_cache table exists and is accessible");
  }

  // Check api_rate_limits table
  console.log("\n📋 Checking api_rate_limits table...");
  const { data: rateLimits, error: rateLimitsError } = await supabase
    .from("api_rate_limits")
    .select("*")
    .limit(0);

  if (rateLimitsError) {
    console.error("❌ api_rate_limits table not found");
    console.error("   Error:", rateLimitsError.message);
    console.log(
      "   Please apply the migration manually via Supabase Dashboard"
    );
  } else {
    console.log("✅ api_rate_limits table exists and is accessible");
  }

  console.log("\n" + "━".repeat(50));

  if (!airportCacheError && !rateLimitsError) {
    console.log("✨ Airport cache tables are ready!");
  } else {
    console.log(
      "❌ Some tables are missing. Please apply the migration manually."
    );
    console.log("\n📝 To apply manually:");
    console.log("   1. Go to Supabase Dashboard > SQL Editor");
    console.log("   2. Copy and paste the contents of:");
    console.log(
      "      supabase/migrations/20251106170000_create_airport_cache_tables.sql"
    );
    console.log("   3. Run the SQL");
  }
}

checkAirportTables().catch((err) => {
  console.error("❌ Check failed:", err.message);
  process.exit(1);
});
