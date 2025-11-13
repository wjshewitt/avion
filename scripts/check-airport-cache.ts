#!/usr/bin/env tsx

import path from "node:path";
import { existsSync } from "node:fs";
import * as dotenv from "dotenv";

import { createAdminClient } from "@/lib/supabase/admin";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
dotenv.config();
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

async function main() {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing ${key}`);
    }
  }

  const client = createAdminClient();

  const { count, error: countError } = await client
    .from("airport_cache")
    .select("icao_code", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  console.log(`airport_cache rows: ${count ?? 0}`);

  const { data, error } = await client
    .from("airport_cache")
    .select("icao_code, data_completeness, core_data->>name")
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  console.log("Latest entries:");
  type CacheRow = {
    icao_code: string;
    data_completeness: number | null;
    "core_data->>name": string | null;
  };

  const rows = (data ?? []) as CacheRow[];

  rows.forEach((row) => {
    console.log(
      ` - ${row.icao_code}: ${row["core_data->>name"] ?? "Unknown"} (completeness ${row.data_completeness ?? "n/a"})`
    );
  });
}

main().catch((error) => {
  console.error("Failed to inspect airport_cache:", error);
  process.exitCode = 1;
});
