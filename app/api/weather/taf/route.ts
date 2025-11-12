// TAF API Route - Server-side proxy for CheckWX TAF data
import { NextRequest, NextResponse } from "next/server";
import {
  getCheckWXClient,
  CheckWXApiError,
} from "@/lib/weather/checkwx-client";
import { TafApiResponseSchema } from "@/types/checkwx";
import {
  checkRateLimit,
  getClientId,
  parseIcaos,
  createErrorResponse,
  createRateLimitResponse,
  logApiUsage,
  SECURITY_HEADERS,
} from "@/lib/weather/api-utils";

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const { searchParams } = new URL(request.url);
  const icaosParam = searchParams.get("icaos");

  try {
    // Rate limiting check
    const rateLimitResult = checkRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      logApiUsage("taf", clientId, undefined, false, "Rate limit exceeded");
      return createRateLimitResponse(
        rateLimitResult.remaining,
        rateLimitResult.resetTime
      );
    }

    // Parse and validate ICAO codes
    const icaoResult = parseIcaos(icaosParam);
    if (!icaoResult.success) {
      logApiUsage("taf", clientId, undefined, false, icaoResult.error);
      return createErrorResponse(icaoResult.error!, 400);
    }

    const icaos = icaoResult.data!;

    // Get CheckWX client and fetch data
    const client = getCheckWXClient();
    const tafData = await client.getTaf(icaos);

    // Log successful usage
    logApiUsage("taf", clientId, icaos, true);

    // Return successful response
    const response = {
      success: true,
      data: tafData,
      timestamp: new Date().toISOString(),
    };

    // Validate response format
    const validatedResponse = TafApiResponseSchema.parse(response);

    return NextResponse.json(validatedResponse, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=900, stale-while-revalidate=300", // 15 min cache, 5 min stale
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": Math.floor(
          rateLimitResult.resetTime / 1000
        ).toString(),
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    console.error("TAF API route error:", error);

    // Log error usage
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logApiUsage("taf", clientId, undefined, false, errorMessage);

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
        error: "Internal server error occurred while fetching TAF data",
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
