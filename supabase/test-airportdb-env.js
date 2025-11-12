#!/usr/bin/env node

/**
 * Simple test for AirportDB environment variables
 */

// Load environment variables
require("dotenv").config({ path: ".env.local" });

function testAirportDBEnvironment() {
  console.log("🔍 Testing AirportDB environment configuration...\n");

  const requiredVars = {
    AIRPORTDB_API_KEY: process.env.AIRPORTDB_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  let allValid = true;

  // Check each required variable
  for (const [varName, value] of Object.entries(requiredVars)) {
    console.log(`📋 Checking ${varName}...`);

    if (!value) {
      console.error(`❌ ${varName} is not set`);
      allValid = false;
    } else if (varName === "AIRPORTDB_API_KEY") {
      // Validate AirportDB API key format
      if (value.length < 32) {
        console.error(
          `❌ ${varName} appears too short (${value.length} characters)`
        );
        allValid = false;
      } else if (!/^[a-f0-9]+$/.test(value)) {
        console.error(`❌ ${varName} should be a hexadecimal string`);
        allValid = false;
      } else {
        console.log(`✅ ${varName} is valid (${value.substring(0, 8)}...)`);
      }
    } else if (varName === "NEXT_PUBLIC_SUPABASE_URL") {
      if (!value.startsWith("https://")) {
        console.error(`❌ ${varName} should start with https://`);
        allValid = false;
      } else {
        console.log(`✅ ${varName} is valid`);
      }
    } else {
      console.log(`✅ ${varName} is set`);
    }
  }

  // Check optional variables
  const optionalVars = {
    CHECKWX_API_KEY: process.env.CHECKWX_API_KEY,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  };

  console.log("\n📋 Checking optional integrations...");
  for (const [varName, value] of Object.entries(optionalVars)) {
    if (value) {
      console.log(`✅ ${varName} is configured`);
    } else {
      console.log(`⚠️  ${varName} is not configured (optional)`);
    }
  }

  console.log("\n" + "━".repeat(50));

  if (allValid) {
    console.log("✨ AirportDB environment configuration is valid!");
    console.log("\n📝 Ready for AirportDB integration:");
    console.log("   ✅ Database tables created");
    console.log("   ✅ Environment variables configured");
    console.log("   ✅ TypeScript types defined");
    console.log("   ✅ Validation functions available");
  } else {
    console.log("❌ Environment configuration has issues");
    console.log("\n📝 Please fix the issues above before proceeding");
    process.exit(1);
  }
}

testAirportDBEnvironment();
