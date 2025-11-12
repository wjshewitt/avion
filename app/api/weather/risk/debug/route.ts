import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCheckWXClient } from "@/lib/weather/checkwx-client";
import { weatherCache } from "@/lib/weather/cache/index";
import { determineFlightPhase, aggregateRisk } from "@/lib/weather/risk/aggregation";
import { assessSurfaceWind } from "@/lib/weather/risk/factors/surfaceWind";
import { assessVisibility } from "@/lib/weather/risk/factors/visibility";
import { assessCeilingClouds } from "@/lib/weather/risk/factors/ceilingClouds";
import { assessPrecipitation } from "@/lib/weather/risk/factors/precipitation";
import { assessTrendStability } from "@/lib/weather/risk/factors/trendStability";

export const runtime = "nodejs";

const PHASE_WEIGHTS: Record<string, Record<string, number>> = {
  departure: { surface_wind: 0.35, visibility: 0.25, ceiling_clouds: 0.15, precipitation: 0.15, trend_stability: 0.1 },
  arrival: { ceiling_clouds: 0.30, visibility: 0.25, surface_wind: 0.20, precipitation: 0.15, trend_stability: 0.1 },
  planning: { precipitation: 0.25, ceiling_clouds: 0.25, surface_wind: 0.20, visibility: 0.20, trend_stability: 0.1 },
  preflight: { visibility: 0.25, ceiling_clouds: 0.25, surface_wind: 0.20, precipitation: 0.20, trend_stability: 0.1 },
  enroute: { precipitation: 0.30, trend_stability: 0.25, surface_wind: 0.20, visibility: 0.15, ceiling_clouds: 0.1 },
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(req.url);

    const flightId = searchParams.get("flightId");
    const airport = searchParams.get("airport");

    // Auth check
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let icao: string;
    let schedule: { departureUtc?: string; arrivalUtc?: string } = {};

    if (flightId) {
      const { data: flight } = (await (supabase
        .from("user_flights") as any)
        .select("origin_icao, destination_icao, scheduled_at, arrival_at")
        .eq("id", flightId)
        .single()) as { data: any; error: any };

      if (!flight) {
        return NextResponse.json({ error: "Flight not found" }, { status: 404 });
      }

      icao = (flight.origin_icao || "").toUpperCase();
      schedule = {
        departureUtc: flight.scheduled_at || undefined,
        arrivalUtc: flight.arrival_at || undefined,
      };
    } else if (airport) {
      icao = airport.toUpperCase().trim();
      if (!/^[A-Z]{4}$/.test(icao)) {
        return NextResponse.json({ error: "Invalid ICAO code" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Provide flightId or airport" }, { status: 400 });
    }

    const now = new Date();
    const client = getCheckWXClient();

    // Fetch weather data
    const metarKey = { icao, dataset: "metar_decoded" as const, mode: "full" as const };
    const tafKey = { icao, dataset: "taf_decoded" as const, mode: "full" as const };
    
    const cachedMetar = await weatherCache.read<any>(metarKey);
    const cachedTaf = await weatherCache.read<any>(tafKey);

    let metar = cachedMetar?.data?.data?.[0] ?? cachedMetar?.data ?? undefined;
    let taf = cachedTaf?.data?.data?.[0] ?? cachedTaf?.data ?? undefined;

    if (!metar) {
      try {
        const metars = await client.getMetar([icao]);
        metar = metars[0];
      } catch (e) {
        console.error("Failed to fetch METAR:", e);
      }
    }

    if (!taf) {
      try {
        const tafs = await client.getTaf([icao]);
        taf = tafs[0];
      } catch (e) {
        console.error("Failed to fetch TAF:", e);
      }
    }

    const phase = determineFlightPhase(schedule, now);
    const inputs = { icao, metar, taf, now };

    // Calculate all factors
    const surfaceWind = assessSurfaceWind(inputs);
    const visibility = assessVisibility(inputs);
    const ceilingClouds = assessCeilingClouds(inputs);
    const precipitation = assessPrecipitation(inputs);
    const trendStability = assessTrendStability(inputs);

    const factors = [surfaceWind, visibility, ceilingClouds, precipitation, trendStability];

    // Get phase weights
    const weights = PHASE_WEIGHTS[phase] || {};
    
    // Calculate weighted scores
    let weightedTotal = 0;
    let sumWeights = 0;
    const factorsWithWeights = factors.map((f) => {
      const w = weights[f.name] ?? 0.1;
      const weightedScore = f.score * w;
      weightedTotal += weightedScore;
      sumWeights += w;
      return {
        ...f,
        weight: w,
        weightedScore,
      };
    });

    const rawScore = sumWeights > 0 ? Math.min(100, Math.max(0, Math.round(weightedTotal / sumWeights))) : 0;

    // Calculate confidence
    const datasetsAvailable = [metar, taf].filter(Boolean).length;
    const metarObserved = metar?.observed ? new Date(metar.observed).getTime() : undefined;
    const tafIssued = taf?.issued ? new Date(taf.issued).getTime() : undefined;
    const newestTs = Math.max(metarObserved ?? 0, tafIssued ?? 0);
    const dataAgeHours = newestTs ? (Date.now() - newestTs) / 3600000 : 999;
    const missingInputsPenalty = datasetsAvailable >= 2 ? 0 : 0.15;

    let baseConfidence = 1.0;
    if (dataAgeHours <= 3) baseConfidence = 1.0;
    else if (dataAgeHours <= 6) baseConfidence = 0.95;
    else if (dataAgeHours <= 12) baseConfidence = 0.85;
    else if (dataAgeHours <= 24) baseConfidence = 0.7;
    else if (dataAgeHours <= 36) baseConfidence = 0.5;
    else baseConfidence = 0.2;

    let confidence = baseConfidence - missingInputsPenalty;
    confidence = Math.max(0, Math.min(1, confidence));

    // Apply insufficient data rule
    let finalScore: number | null = rawScore;
    let tier: string | null = rawScore <= 30 ? "on_track" : rawScore <= 60 ? "monitor" : "high_disruption";
    let status = "ok";

    if (confidence < 0.15 || datasetsAvailable < 1) {
      status = "insufficient_data";
      finalScore = null;
      tier = null;
    }

    // Build aggregation result
    const agg = aggregateRisk(icao, phase as any, factors, datasetsAvailable, dataAgeHours, missingInputsPenalty, false);

    // If this is a flight, also calculate for destination and show combination
    let combinationData = null;
    if (flightId) {
      // For flights, we would fetch both origin and destination here
      // For now, just show the logic for single airport
      combinationData = {
        note: "For flights, both origin and destination risks are calculated and combined",
        phaseWeights: {
          preflight: { origin: 0.50, destination: 0.50 },
          planning: { origin: 0.60, destination: 0.40 },
          departure: { origin: 0.75, destination: 0.25 },
          enroute: { origin: 0.30, destination: 0.70 },
          arrival: { origin: 0.25, destination: 0.75 },
        },
        currentPhase: phase,
        currentWeights: PHASE_WEIGHTS[phase] || PHASE_WEIGHTS.preflight,
      };
    }

    const debugData = {
      inputs: {
        icao,
        phase,
        metar: metar || null,
        taf: taf || null,
        datasetsAvailable,
      },
      factors: factorsWithWeights,
      combination: combinationData,
      aggregation: {
        sumWeights,
        weightedTotal,
        rawScore,
        confidence,
        finalScore,
        tier,
        status,
        dataAgeHours: Math.round(dataAgeHours * 10) / 10,
        missingInputsPenalty,
      },
      result: agg,
    };

    return NextResponse.json({ success: true, data: debugData });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
