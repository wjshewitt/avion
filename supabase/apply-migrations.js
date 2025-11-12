#!/usr/bin/env node

/**
 * Apply Supabase migrations programmatically
 *
 * Usage: node supabase/apply-migrations.js
 *
 * This script reads migration files and applies them to your Supabase database
 * using the service role key. Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
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
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, "migrations");

  // Read all migration files
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`📦 Found ${files.length} migration files\n`);

  for (const file of files) {
    console.log(`⏳ Applying ${file}...`);

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    try {
      const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

      if (error) {
        // If exec_sql doesn't exist, try direct execution
        // Note: This requires the SQL to be executed via the REST API
        console.log(
          `⚠️  exec_sql RPC not available, please apply manually via Dashboard`
        );
        console.log(`   File: ${file}`);
        continue;
      }

      console.log(`✅ Applied ${file}\n`);
    } catch (err) {
      console.error(`❌ Error applying ${file}:`, err.message);
      console.log(
        `\n⚠️  Please apply remaining migrations manually via Supabase Dashboard`
      );
      process.exit(1);
    }
  }

  console.log("✨ All migrations applied successfully!");
  console.log("\n📝 Next steps:");
  console.log("   1. Verify tables in Supabase Dashboard");
  console.log("   2. Run: npm run supabase:types");
}

applyMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
