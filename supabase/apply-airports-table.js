#!/usr/bin/env node

/**
 * Apply airports table migration directly
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyAirportsMigration() {
  console.log("🔧 Applying airports table migration...\n");

  const migrationFile = path.join(
    __dirname,
    "migrations",
    "20251107120000_create_airports_table.sql"
  );
  
  if (!fs.existsSync(migrationFile)) {
    console.error("❌ Migration file not found:", migrationFile);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(migrationFile, "utf8");

  console.log("📦 Executing airports table migration SQL...\n");
  console.log(sql);
  console.log("\n" + "━".repeat(50) + "\n");

  try {
    // Execute the SQL using raw query
    const { data, error } = await supabase.rpc("exec", { sql });

    if (error) {
      console.error("❌ Error executing migration:", error.message);
      console.log("\n⚠️  Trying alternative approach...\n");
      
      // Try splitting into statements
      const statements = sql
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement) continue;

        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          await supabase.rpc("exec", { sql: statement + ";" });
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (err) {
          console.error(`⚠️  Statement ${i + 1} failed:`, err.message);
        }
      }
    } else {
      console.log("✅ Migration executed successfully!");
    }
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }

  console.log("\n🔍 Verifying airports table was created...");

  // Check if table exists
  const { data: airports, error: airportsError } = await supabase
    .from("airports")
    .select("icao")
    .limit(1);

  console.log("\n" + "━".repeat(50));

  if (!airportsError) {
    console.log("✨ Airports table migration completed successfully!");
    console.log("\n📝 Table created:");
    console.log("   ✅ airports");
    console.log("\n💡 The table is ready to cache airport data from AirportDB API");
  } else {
    console.log("❌ Verification failed:", airportsError.message);
    console.log("\n⚠️  Please apply the migration manually:");
    console.log("   1. Go to Supabase Dashboard > SQL Editor");
    console.log("   2. Paste the contents of:");
    console.log("      supabase/migrations/20251107120000_create_airports_table.sql");
    console.log("   3. Run the SQL");
  }
}

applyAirportsMigration().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  console.log(
    "\n📝 Please apply the migration manually via Supabase Dashboard"
  );
  process.exit(1);
});
