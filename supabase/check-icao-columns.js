#!/usr/bin/env node

/**
 * Check and add ICAO columns to user_flights table
 *
 * Usage: node supabase/check-icao-columns.js
 */

const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndAddIcaoColumns() {
  console.log("🔍 Checking ICAO columns in user_flights table...\n");

  // Check if columns exist by trying to select them
  const { data, error } = await supabase
    .from("user_flights")
    .select("id, origin_icao, destination_icao")
    .limit(0);

  if (error) {
    console.log("❌ ICAO columns not found:", error.message);
    console.log("⏳ Adding ICAO columns...\n");

    // Add the missing columns directly
    const alterTableSql = `
      ALTER TABLE user_flights 
      ADD COLUMN IF NOT EXISTS origin_icao VARCHAR(4),
      ADD COLUMN IF NOT EXISTS destination_icao VARCHAR(4),
      ADD COLUMN IF NOT EXISTS weather_data JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS weather_risk_score INTEGER DEFAULT 0 CHECK (weather_risk_score >= 0 AND weather_risk_score <= 100),
      ADD COLUMN IF NOT EXISTS weather_focus VARCHAR(20) DEFAULT 'forecast' CHECK (weather_focus IN ('forecast', 'current', 'live', 'archived')),
      ADD COLUMN IF NOT EXISTS weather_updated_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS weather_cache_expires TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS weather_alert_level VARCHAR(10) DEFAULT 'green' CHECK (weather_alert_level IN ('green', 'yellow', 'red'));
    `;

    try {
      // Use postgres meta to send raw SQL
      const { error: alterError } = await supabase.rpc('exec_sql', { 
        sql_query: alterTableSql 
      });

      if (alterError) {
        console.log("⚠️  Could not execute via RPC, trying SQL Editor format:", alterError.message);
        console.log("📝 Please run this SQL manually in Supabase Dashboard SQL Editor:");
        console.log("\n" + alterTableSql + "\n");
        return;
      }

      console.log("✅ ICAO columns added successfully!");
      
      // Create indexes for performance
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_user_flights_weather_risk ON user_flights(weather_risk_score);
        CREATE INDEX IF NOT EXISTS idx_user_flights_weather_alert ON user_flights(weather_alert_level);
        CREATE INDEX IF NOT EXISTS idx_user_flights_weather_focus ON user_flights(weather_focus);
        CREATE INDEX IF NOT EXISTS idx_user_flights_weather_updated ON user_flights(weather_updated_at);
        CREATE INDEX IF NOT EXISTS idx_user_flights_weather_expires ON user_flights(weather_cache_expires);
      `;

      const { error: indexError } = await supabase.rpc('exec_sql', { 
        sql_query: indexSql 
      });

      if (indexError) {
        console.log("⚠️  Index creation failed, please run manually:", indexError.message);
        console.log("\n" + indexSql + "\n");
      } else {
        console.log("✅ Weather indexes created successfully!");
      }

    } catch (err) {
      console.error("❌ Failed to add columns:", err.message);
    }
  } else {
    console.log("✅ ICAO columns already exist in user_flights table");
  }

  // Verify again
  console.log("\n🔍 Final verification...");
  const { data: verifyData, error: verifyError } = await supabase
    .from("user_flights")
    .select("id, origin_icao, destination_icao, weather_data, weather_risk_score")
    .limit(0);

  if (verifyError) {
    console.error("❌ Final verification failed:", verifyError.message);
    process.exit(1);
  } else {
    console.log("✅ All ICAO and weather columns are available!");
    console.log("\n📝 Next steps:");
    console.log("   1. Try creating a flight with IATA/ICAO codes");
    console.log("   2. Run: npm run dev");
  }
}

checkAndAddIcaoColumns().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
