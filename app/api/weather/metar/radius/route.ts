// METAR Radius API Route - Server-side proxy for CheckWX area weather searches
import { NextRequest, NextResponse } from "next/server";
import {
  getCheckWXClient,
  CheckWXApiError,
} from "@/lib/weather/checkwx-client";
import { MetarApiResponseSchema } from "@/types/checkwx";
import {
  checkRateLimit,
  getClientId,
  parseSingleIcao,
  parseRadius,
  createErrorResponse,
  createRateLimitResponse,
  logApiUsage,
  SECURITY_HEADERS,
} from "@/lib/weather/api-utils";

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const { searchParams } = new URL(request.url);
  const icaoParam = searchParams.get("icao");
  const milesParam = searchParams.get("miles");

  try {
    // Rate limiting check
    const rateLimitResult = checkRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      logApiUsage(
        "metar-radius",
        clientId,
        undefined,
        false,
        "Rate limit exceeded"
      );
      return createRateLimitResponse(
        rateLimitResult.remaining,
        rateLimitResult.resetTime
      );
    }

    // Parse and validate ICAO code
    const icaoResult = parseSingleIcao(icaoParam);
    if (!icaoResult.success) {
      logApiUsage("metar-radius", clientId, undefined, false, icaoResult.error);
      return createErrorResponse(icaoResult.error!, 400);
    }

    const icao = icaoResult.data!;

    // Parse and validate radius
    const radiusResult = parseRadius(milesParam);
    if (!radiusResult.success) {
      logApiUsage("metar-radius", clientId, [icao], false, radiusResult.error);
      return createErrorResponse(radiusResult.error!, 400);
    }

    const miles = radiusResult.data!;

    // Get CheckWX client and fetch data
    const client = getCheckWXClient();
    const metarData = await client.getMetarRadius(icao, miles);

    // Log successful usage
    logApiUsage("metar-radius", clientId, [icao], true);

    // Return successful response
    const response = {
      success: true,
      data: metarData,
      timestamp: new Date().toISOString(),
    };

    // Validate response format
    const validatedResponse = MetarApiResponseSchema.parse(response);

    return NextResponse.json(validatedResponse, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=600, stale-while-revalidate=300", // 10 min cache, 5 min stale
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": Math.floor(
          rateLimitResult.resetTime / 1000
        ).toString(),
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    console.error("METAR Radius API route error:", error);

    // Log error usage
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logApiUsage("metar-radius", clientId, undefined, false, errorMessage);

    // Handle CheckWX API errors
    if (error instanceof CheckWXApiError) {
      const statusCode = error.statusCode === 0 ? 500 : error.statusCode;

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          data: [],
          timestamp: new Date().toISOString(),
        },
        {
          status: statusCode,
          headers: SECURITY_HEADERS,
        }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error occurred while fetching area weather data",
        data: [],
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: SECURITY_HEADERS,
      }
    );
  }
}
