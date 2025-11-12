#!/usr/bin/env node

/**
 * Apply airport cache migration directly
 */

const fs = require("fs");
const path = require("path");
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

async function applyAirportMigration() {
  console.log("🔧 Applying airport cache migration...\n");

  const migrationFile = path.join(
    __dirname,
    "migrations",
    "20251106170000_create_airport_cache_tables.sql"
  );
  const sql = fs.readFileSync(migrationFile, "utf8");

  // Split the SQL into individual statements
  const statements = sql
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

  console.log(`📦 Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

    try {
      // Use the REST API to execute SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
        body: JSON.stringify({
          sql: statement + ";",
        }),
      });

      if (!response.ok) {
        // Try alternative approach using supabase client
        const { error } = await supabase.rpc("exec", { sql: statement + ";" });
        if (error) {
          console.error(
            `❌ Error executing statement ${i + 1}:`,
            error.message
          );
          console.log(`Statement: ${statement.substring(0, 100)}...`);
          continue;
        }
      }

      console.log(`✅ Statement ${i + 1} executed successfully`);
    } catch (err) {
      console.error(`❌ Error executing statement ${i + 1}:`, err.message);
      console.log(`Statement: ${statement.substring(0, 100)}...`);
    }
  }

  console.log("\n🔍 Verifying tables were created...");

  // Check if tables exist
  const { data: airportCache, error: airportCacheError } = await supabase
    .from("airport_cache")
    .select("*")
    .limit(0);

  const { data: rateLimits, error: rateLimitsError } = await supabase
    .from("api_rate_limits")
    .select("*")
    .limit(0);

  console.log("\n" + "━".repeat(50));

  if (!airportCacheError && !rateLimitsError) {
    console.log("✨ Airport cache migration completed successfully!");
    console.log("\n📝 Tables created:");
    console.log("   ✅ airport_cache");
    console.log("   ✅ api_rate_limits");
  } else {
    console.log("⚠️  Migration may have failed. Manual application required.");
    console.log(
      "\n📝 Please apply the migration manually via Supabase Dashboard:"
    );
    console.log("   1. Go to SQL Editor");
    console.log("   2. Copy and paste the migration file contents");
    console.log("   3. Run the SQL");
  }
}

applyAirportMigration().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  console.log(
    "\n📝 Please apply the migration manually via Supabase Dashboard"
  );
  process.exit(1);
});
