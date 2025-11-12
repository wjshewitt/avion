import { NextRequest, NextResponse } from "next/server";
import { isValidIcaoCode, sanitizeIcaoCode } from "@/types/airports";
import { getAirportService } from "@/lib/airports/airport-service";
import { rateLimit } from "@/lib/server/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ icao: string }> }
) {
  try {
    await rateLimit(request);
    const { icao } = await params;

    // Validate ICAO code format
    if (!isValidIcaoCode(icao)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ICAO code format",
          details: "ICAO code must be exactly 4 letters",
        },
        { status: 400 }
      );
    }

    const refresh = new URL(request.url).searchParams.get("refresh") === "1";
    
    // Always use cache-first AirportService (production architecture)
    const service = getAirportService();
    
    let result;
    if (refresh) {
      // Force refresh bypasses cache
      result = await service.refreshAirport(icao);
    } else {
      // Normal cache-first lookup
      result = await service.getAirport(icao);
    }
    
    // Return ProcessedAirportData directly for proper typing
    if (!result.data) {
      return NextResponse.json(
        {
          success: false,
          error: "Airport not found",
          details: `No airport found with ICAO code: ${icao.toUpperCase()}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Airport lookup error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const isRateLimit = (error as any)?.status === 429 || message.includes("Rate limit exceeded");
    return NextResponse.json(
      {
        success: false,
        error: isRateLimit ? "Rate limit exceeded" : "Internal server error",
        details: isRateLimit ? message : undefined,
      },
      {
        status: isRateLimit ? 429 : 500,
        headers: isRateLimit && (error as any)?.retryAfter
          ? { "Retry-After": String((error as any).retryAfter) }
          : undefined,
      }
    );
  }
}
