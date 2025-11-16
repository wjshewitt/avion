import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Flight } from "@/lib/supabase/types";
import {
  deriveFlightAlerts,
  type FlightAlert,
  type FlightAlertSeverity,
} from "@/lib/utils/flight-alerts";

function parseSeverityFilter(searchParams: URLSearchParams): FlightAlertSeverity[] | null {
  const raw = searchParams.get("severity");
  if (!raw) return null;
  const parts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as FlightAlertSeverity[];
  return parts.length ? parts : null;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const severityFilter = parseSeverityFilter(searchParams);
    const limit = Number(searchParams.get("limit") ?? 20);

    const { data, error } = await supabase
      .from("user_flights")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching flights for alerts", error);
      return NextResponse.json(
        { error: "Failed to load flight alerts" },
        { status: 500 },
      );
    }

    const now = new Date();
    const allAlerts: FlightAlert[] = [];

    for (const flight of (data as Flight[]) ?? []) {
      allAlerts.push(...deriveFlightAlerts(flight, now));
    }

    let filtered = allAlerts;
    if (severityFilter && severityFilter.length) {
      filtered = allAlerts.filter((a) => severityFilter.includes(a.severity));
    }

    filtered.sort((a, b) => {
      if (a.createdAt === b.createdAt) return 0;
      return a.createdAt < b.createdAt ? 1 : -1;
    });

    const limited = filtered.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 20);

    return NextResponse.json({ alerts: limited });
  } catch (error) {
    console.error("Unhandled error in flight alerts API", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
