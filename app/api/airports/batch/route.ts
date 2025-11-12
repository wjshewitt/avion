import { NextRequest, NextResponse } from "next/server";
import { isValidIcaoCode } from "@/types/airports";
import { getAirportService } from "@/lib/airports/airport-service";
import { z } from "zod";

const BatchRequestSchema = z.object({
  icao_codes: z.array(z.string()).min(1).max(20),
  include_details: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const { icao_codes, include_details } = BatchRequestSchema.parse(body);

    // Validate ICAO formats first
    const invalid = icao_codes.filter((c) => !isValidIcaoCode(c));
    const validIcaos = icao_codes.filter((c) => isValidIcaoCode(c)).map((c) => c.toUpperCase());

    const errors = invalid.map((icao) => ({ icao, error: "Invalid ICAO code format" }));

    // Always use cache-first AirportService (production architecture)
    const service = getAirportService();
    const batch = await service.getAirportsBatch(validIcaos);
    
    // Return ProcessedAirportData directly for proper typing
    errors.push(...batch.errors);

    return NextResponse.json({
      success: true,
      data: {
        airports: batch.airports,
        errors,
        total_requested: icao_codes.length,
        total_found: batch.airports.length,
        total_errors: errors.length,
      },
    });
  } catch (error) {
    console.error("Airport batch lookup error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          details: error.message,
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    const isRateLimit = message.includes("Rate limit exceeded");
    return NextResponse.json(
      {
        success: false,
        error: isRateLimit ? "Rate limit exceeded" : "Internal server error",
        details: isRateLimit ? message : undefined,
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
