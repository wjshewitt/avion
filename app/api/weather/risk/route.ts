import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAirportRisk, getFlightRisk } from "@/lib/weather/riskEngine";

export const runtime = "nodejs";

function badRequest(message: string, status = 400, details?: any) {
  const isDev = process.env.NODE_ENV === "development";
  return NextResponse.json({ 
    success: false, 
    error: message, 
    timestamp: new Date().toISOString(),
    ...(isDev && details ? { debug: details } : {})
  }, { status });
}

export async function GET(req: NextRequest) {
  const t0 = Date.now();
  let supabase;
  let accountId: string | undefined;
  
  try {
    supabase = await createServerSupabase();
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return badRequest("Server configuration error", 500, { error: "Failed to initialize database client" });
  }

  const {
    searchParams
  } = new URL(req.url);

  const airport = searchParams.get("airport");
  const mode = (searchParams.get("mode") as "lite" | "full") || "lite";
  const scheduledDeparture = searchParams.get("scheduledDeparture");
  const scheduledArrival = searchParams.get("scheduledArrival");
  const flightId = searchParams.get("flightId");

  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      return badRequest("Unauthorized - please log in", 401, { hint: "Session may have expired" });
    }
    accountId = user.id; // account scoping
  } catch (authError) {
    console.error("Authentication error:", authError);
    return badRequest("Authentication failed", 401, { error: authError instanceof Error ? authError.message : "Unknown auth error" });
  }

  try {
    let payload: any;
    
    if (flightId) {
      try {
        payload = await getFlightRisk({ accountId, flightId });
      } catch (flightError) {
        console.error(`Error getting flight risk for ${flightId}:`, flightError);
        const errorMessage = flightError instanceof Error ? flightError.message : "Unknown error";
        
        // Provide helpful error messages based on error type
        if (errorMessage.includes("not found")) {
          return badRequest("Flight not found or you don't have permission to access it", 404, { flightId });
        } else if (errorMessage.includes("ICAO")) {
          return badRequest("Flight has invalid airport data", 400, { flightId, hint: "Check origin/destination ICAO codes" });
        } else if (errorMessage.includes("Database error")) {
          return badRequest("Database error while fetching flight", 500, { hint: "Please try again" });
        } else {
          return badRequest(`Failed to compute flight risk: ${errorMessage}`, 500, { flightId });
        }
      }
    } else if (airport) {
      const icaoUpper = airport.toUpperCase().trim();
      if (!/^[A-Z]{4}$/.test(icaoUpper)) {
        return badRequest("Invalid ICAO code format", 400, { 
          provided: airport, 
          expected: "4-letter ICAO code (e.g., KJFK)" 
        });
      }
      
      try {
        payload = await getAirportRisk({
          accountId,
          icao: icaoUpper,
          mode,
          schedule: { departureUtc: scheduledDeparture, arrivalUtc: scheduledArrival },
        });
      } catch (airportError) {
        console.error(`Error getting airport risk for ${icaoUpper}:`, airportError);
        const errorMessage = airportError instanceof Error ? airportError.message : "Unknown error";
        
        if (errorMessage.includes("CheckWX") || errorMessage.includes("weather")) {
          return badRequest("Weather data service error", 503, { 
            icao: icaoUpper,
            hint: "Weather service may be temporarily unavailable" 
          });
        } else {
          return badRequest(`Failed to compute airport risk: ${errorMessage}`, 500, { icao: icaoUpper });
        }
      }
    } else {
      return badRequest("Missing required parameter", 400, { 
        hint: "Provide either 'flightId' or 'airport' parameter" 
      });
    }

    const t1 = Date.now();
    const headers = new Headers();
    headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=600");
    headers.set("X-SLA-Mode", mode);
    headers.set("X-SLA-Latency", `${t1 - t0}`);

    return new NextResponse(
      JSON.stringify({ success: true, data: payload, timestamp: new Date().toISOString() }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("Unexpected error in weather risk API:", error);
    return badRequest(
      error?.message || "Unexpected error computing risk", 
      500,
      { error: error?.stack }
    );
  }
}
