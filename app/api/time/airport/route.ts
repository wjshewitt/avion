import { NextRequest } from "next/server";
import { getAirportTemporalProfile } from "@/lib/time/authority";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const icao = url.searchParams.get("icao")?.toUpperCase();

  if (!icao || !/^[A-Z]{4}$/.test(icao)) {
    return new Response(JSON.stringify({ error: "Invalid ICAO code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const profile = await getAirportTemporalProfile(icao);
  if (!profile) {
    return new Response(JSON.stringify({ error: "Airport not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(profile), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=60",
    },
  });
}
