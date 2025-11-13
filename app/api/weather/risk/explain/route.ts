import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isWeatherRiskExplanationEnabled } from "@/lib/config/featureFlags";
import { explainWeatherRisk, type WeatherRiskExplanationInput } from "@/lib/gemini/weather-risk-explainer";
import { getAirportRisk, getFlightRisk } from "@/lib/weather/riskEngine";

export const runtime = "nodejs";

function badRequest(message: string, status = 400, details?: any) {
  const isDev = process.env.NODE_ENV === "development";
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      ...(isDev && details ? { debug: details } : {}),
    },
    { status }
  );
}

export async function POST(req: NextRequest) {
  // Check feature flag first
  if (!isWeatherRiskExplanationEnabled()) {
    return badRequest("Weather risk explanation feature is not enabled", 503, {
      hint: "Set NEXT_PUBLIC_WEATHER_RISK_EXPLANATION_ENABLED=1 to enable this feature",
    });
  }

  let supabase;
  let accountId: string | undefined;

  try {
    supabase = await createServerSupabase();
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return badRequest("Server configuration error", 500);
  }

  // Authenticate user
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      return badRequest("Unauthorized - please log in", 401);
    }
    accountId = user.id;
  } catch (authError) {
    console.error("Authentication error:", authError);
    return badRequest("Authentication failed", 401);
  }

  // Parse request body
  let body: {
    flightId?: string;
    airport?: string;
    riskData?: WeatherRiskExplanationInput;
  };

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON in request body", 400);
  }

  const { flightId, airport, riskData } = body;

  try {
    let explanationInput: WeatherRiskExplanationInput;

    if (riskData) {
      // Use pre-computed risk data
      explanationInput = riskData;
    } else if (flightId) {
      // Fetch flight risk
      try {
        const flightRiskResult = await getFlightRisk({ accountId, flightId });
        
        // Extract origin risk data (primary for explanation)
        explanationInput = {
          score: flightRiskResult.result.score,
          tier: flightRiskResult.result.tier,
          confidence: flightRiskResult.result.confidence,
          phase: flightRiskResult.phase,
          factorBreakdown: flightRiskResult.result.factorBreakdown || [],
          metar: flightRiskResult.weatherData?.metar,
          taf: flightRiskResult.weatherData?.taf,
        };
      } catch (flightError) {
        console.error(`Error getting flight risk for ${flightId}:`, flightError);
        const errorMessage = flightError instanceof Error ? flightError.message : "Unknown error";
        return badRequest(`Failed to fetch flight risk data: ${errorMessage}`, 500, { flightId });
      }
    } else if (airport) {
      // Fetch airport risk
      const icaoUpper = airport.toUpperCase().trim();
      if (!/^[A-Z]{4}$/.test(icaoUpper)) {
        return badRequest("Invalid ICAO code format", 400, {
          provided: airport,
          expected: "4-letter ICAO code (e.g., KJFK)",
        });
      }

      try {
        const airportRiskResult = await getAirportRisk({
          accountId,
          icao: icaoUpper,
          mode: "full",
        });

        explanationInput = {
          score: airportRiskResult.result.score,
          tier: airportRiskResult.result.tier,
          confidence: airportRiskResult.result.confidence,
          phase: airportRiskResult.phase,
          factorBreakdown: airportRiskResult.result.factorBreakdown || [],
          metar: airportRiskResult.weatherData?.metar,
          taf: airportRiskResult.weatherData?.taf,
        };
      } catch (airportError) {
        console.error(`Error getting airport risk for ${icaoUpper}:`, airportError);
        const errorMessage = airportError instanceof Error ? airportError.message : "Unknown error";
        return badRequest(`Failed to fetch airport risk data: ${errorMessage}`, 500, { icao: icaoUpper });
      }
    } else {
      return badRequest("Missing required parameter", 400, {
        hint: "Provide either 'flightId', 'airport', or 'riskData' in request body",
      });
    }

    // Generate explanation
    const result = await explainWeatherRisk(explanationInput);

    return NextResponse.json(
      {
        success: true,
        explanation: result.explanation,
        metadata: {
          tokensUsed: result.tokensUsed,
          cost: result.cost,
          model: result.model,
          timestamp: result.timestamp,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=900", // 15 minutes
        },
      }
    );
  } catch (error: any) {
    console.error("Unexpected error in weather risk explanation API:", error);
    return badRequest(error?.message || "Unexpected error generating explanation", 500, {
      error: error?.stack,
    });
  }
}
