import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/server/rate-limit";
import type { AirportLite } from "@/types/airport-lite";

const PAGE_SIZE = 1000;

export const revalidate = 900; // 15 minutes

export async function GET(request: NextRequest) {
  const startedAt = performance.now();

  try {
    await rateLimit(request, { limit: 30, windowMs: 60_000 });

    const supabase = await createServerSupabase();
    let from = 0;
    const rows: Array<{
      icao_code: string;
      iata_code: string | null;
      core_data: any;
      runway_data: any;
      capability_data: any;
      updated_at: string;
    }> = [];

    while (true) {
      const { data, error } = await supabase
        .from("airport_cache")
        .select("icao_code, iata_code, core_data, runway_data, capability_data, updated_at")
        .order("icao_code", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("[airports/all-lite] supabase error", error);
        throw error;
      }

      if (!data?.length) {
        break;
      }

      rows.push(...data);
      if (data.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    const airports: AirportLite[] = rows
      .map((row) => {
        const core = row.core_data ?? {};
        const runways = row.runway_data ?? {};

        return {
          icao: row.icao_code,
          iata: row.iata_code,
          name: core.name ?? row.icao_code,
          municipality: core.location?.municipality ?? null,
          country: core.location?.country ?? null,
          region: core.location?.region ?? null,
          latitude: core.coordinates?.latitude ?? 0,
          longitude: core.coordinates?.longitude ?? 0,
          elevation_ft: core.coordinates?.elevation_ft ?? null,
          type: core.classification?.type ?? "small_airport",
          scheduled_service: Boolean(core.classification?.scheduled_service),
          longest_runway_ft: runways.longest_ft ?? 0,
          surface_types: runways.surface_types ?? [],
          ils_equipped: Boolean(runways.ils_equipped),
          all_lighted: Boolean(runways.all_lighted),
          popularity_score: core.data_quality?.completeness_score ?? 0,
        } satisfies AirportLite;
      })
      .filter((airport) => Number.isFinite(airport.latitude) && Number.isFinite(airport.longitude));

    const updatedAt = rows.reduce<string>((latest, row) => {
      if (!row.updated_at) return latest;
      if (!latest) return row.updated_at;
      return latest > row.updated_at ? latest : row.updated_at;
    }, "");

    return NextResponse.json(
      {
        success: true,
        data: {
          airports,
          total: airports.length,
          updatedAt: updatedAt || new Date().toISOString(),
          source: "cache" as const,
        },
      },
      {
        headers: {
          "cache-control": "public, s-maxage=900, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[airports/all-lite] failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to load airport dataset",
      },
      { status: 500 }
    );
  } finally {
    const duration = performance.now() - startedAt;
    if (duration > 2000) {
      console.warn("[airports/all-lite] slow response", { duration });
    }
  }
}
