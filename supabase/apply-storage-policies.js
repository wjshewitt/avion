#!/usr/bin/env node

/**
 * Apply Storage RLS policies for avatar uploads
 * 
 * Usage: node supabase/apply-storage-policies.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyStoragePolicies() {
  console.log("🔒 Applying Storage RLS policies...\n");

  // Read the SQL migration file
  const sqlPath = path.join(__dirname, "migrations", "20251111000001_setup_storage_policies.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  // Split into individual statements (policies)
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s + ";");

  console.log(`📝 Found ${statements.length} policy statements\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const policyName = statement.match(/"([^"]+)"/)?.[1] || `Policy ${i + 1}`;
    
    console.log(`⏳ Applying: ${policyName}...`);

    try {
      // Execute via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_query: statement }),
      });

      if (response.ok) {
        console.log(`   ✅ Applied\n`);
        success++;
      } else {
        const error = await response.text();
        if (error.includes("already exists") || error.includes("duplicate")) {
          console.log(`   ⚠️  Already exists, skipping\n`);
          skipped++;
        } else {
          console.log(`   ❌ Failed: ${error}\n`);
          failed++;
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log("═".repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Applied: ${success}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}\n`);

  if (failed > 0) {
    console.log("⚠️  Some policies failed to apply.");
    console.log("Please apply them manually via Supabase Dashboard:\n");
    console.log("1. Go to: https://app.supabase.com/project/_/sql");
    console.log("2. Copy the SQL from: supabase/migrations/20251111000001_setup_storage_policies.sql");
    console.log("3. Paste and run it\n");
    process.exit(1);
  }

  console.log("✨ All storage policies applied successfully!");
  console.log("\n🧪 Test the avatar upload in onboarding now.\n");
}

applyStoragePolicies().catch((err) => {
  console.error("\n❌ Failed to apply policies:", err.message);
  console.log("\n📖 Manual Setup Required:");
  console.log("──────────────────────────────────────────────────────────────");
  console.log("Go to Supabase Dashboard > SQL Editor and run:");
  console.log("\nFile: supabase/migrations/20251111000001_setup_storage_policies.sql\n");
  process.exit(1);
});
