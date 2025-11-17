#!/usr/bin/env tsx
// @ts-nocheck

import path from "node:path";
import { existsSync } from "node:fs";
import * as dotenv from "dotenv";
import tzLookup from "tz-lookup";

import { createAdminClient } from "@/lib/supabase/admin";
import { describeTimezoneOffsets } from "@/lib/time/format";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
dotenv.config();
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

async function main() {
  REQUIRED_ENV.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing ${key} in environment`);
    }
  });

  const client = createAdminClient();
  const pageSize = 500;
  let processed = 0;
  let updated = 0;
  let cursor: string | null = null;

  while (true) {
    let query = client
      .from("airport_cache")
      .select("icao_code, core_data, raw_api_response, last_verified_at")
      .order("icao_code")
      .limit(pageSize);

    if (cursor) {
      query = query.gt("icao_code", cursor);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const rows = data ?? [];
    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      processed += 1;
      cursor = row.icao_code;

      const coreData = (row.core_data as any) ?? {};
      const coordinates = coreData.coordinates ?? {};
      const location = coreData.location ?? {};
      const latitude = coordinates.latitude ?? location.latitude;
      const longitude = coordinates.longitude ?? location.longitude;
      let timezone = location.timezone;

      if (latitude == null || longitude == null) {
        continue;
      }

      if (!timezone) {
        try {
          timezone = tzLookup(latitude, longitude);
        } catch {
          timezone = "UTC";
        }
      }

      const offsets = describeTimezoneOffsets(timezone ?? "UTC");
      const metadata = {
        timezone,
        computedAt: new Date().toISOString(),
        offsets,
      };

      const raw = (row.raw_api_response as Record<string, any> | null) ?? {};
      const hasRawMetadata = !!raw.timezone_metadata;
      const hasLocationTz = !!timezone && location?.timezone === timezone;

      if (hasLocationTz && hasRawMetadata) {
        continue;
      }

      const updatedCore = {
        ...coreData,
        location: {
          ...location,
          timezone,
        },
      };

      const mergedRaw = {
        ...raw,
        timezone_metadata: metadata,
      };

      const { error: updateError } = await client
        .from("airport_cache")
        .update({
          core_data: updatedCore,
          raw_api_response: mergedRaw,
          last_verified_at: row.last_verified_at ?? new Date().toISOString(),
        })
        .eq("icao_code", row.icao_code);

      if (updateError) {
        console.error(`Failed to update ${row.icao_code}`, updateError.message);
        continue;
      }

      updated += 1;
      console.log(`Updated ${row.icao_code} → ${timezone}`);
    }
  }

  console.log(`Processed ${processed} airports, updated ${updated}.`);
}

main().catch((error) => {
  console.error("Timezone backfill failed", error);
  process.exitCode = 1;
});
