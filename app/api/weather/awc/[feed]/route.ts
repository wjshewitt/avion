import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkRateLimit,
  createErrorResponse,
  createRateLimitResponse,
  getClientId,
  logApiUsage,
  parseIcaos,
  SECURITY_HEADERS,
} from "@/lib/weather/api-utils";
import {
  AwcBboxSchema,
  type AwcBoundingBox,
} from "@/lib/weather/validation/awc";
import {
  getAwcWeatherService,
  type HazardQueryOptions,
} from "@/lib/weather/awc";
import type { HazardKind } from "@/types/weather";

const hazardFeeds = [
  "sigmet",
  "isigmet",
  "airsigmet",
  "gairmet",
  "cwa",
  "tcf",
 ] as const;
type HazardFeed = (typeof hazardFeeds)[number];

const hoursSchema = z
  .string()
  .transform((value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error("Hours must be numeric");
    }
    return parsed;
  })
  .refine((value) => value > 0 && value <= 24, {
    message: "Hours must be between 1 and 24",
  });

const cacheHeaders = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=540",
};

function parseHours(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const result = hoursSchema.safeParse(value);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid hours value");
  }
  return result.data;
}

function parseBbox(value: string | null): AwcBoundingBox | undefined {
  if (!value) return undefined;
  const parsed = AwcBboxSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid bbox");
  }
  return parsed.data;
}

function buildSuccessResponse(data: unknown, remaining: number, reset: number) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: "awc",
    },
    {
      status: 200,
      headers: {
        ...cacheHeaders,
        ...SECURITY_HEADERS,
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": Math.floor(reset / 1000).toString(),
      },
    }
  );
}

function isHazardFeed(value: string | undefined): value is HazardFeed {
  if (!value) return false;
  return (hazardFeeds as readonly string[]).includes(value);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ feed: string }> }
) {
  const clientId = getClientId(request);
  const { feed: feedParam } = await context.params;
  const feed = feedParam?.toLowerCase();
  const rate = checkRateLimit(clientId);

  if (!rate.allowed) {
    return createRateLimitResponse(rate.remaining, rate.resetTime);
  }

  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const service = getAwcWeatherService();

    if (feed === "pirep") {
      const bbox = parseBbox(searchParams.get("bbox"));
      const hours = parseHours(searchParams.get("hours"), 3);
      const data = await service.getPireps({ bbox, hours });
      logApiUsage("awc:pirep", clientId, undefined, true);
      return buildSuccessResponse(data, rate.remaining, rate.resetTime);
    }

    if (feed === "stations") {
      const icaosParam = searchParams.get("icaos");
      const parsedIcaos = parseIcaos(icaosParam);
      if (!parsedIcaos.success || !parsedIcaos.data) {
        return createErrorResponse(parsedIcaos.error ?? "Invalid ICAO list", 400);
      }
      const data = await service.getStationInfo(parsedIcaos.data);
      logApiUsage("awc:stations", clientId, parsedIcaos.data, true);
      return buildSuccessResponse(data, rate.remaining, rate.resetTime);
    }

    if (isHazardFeed(feed)) {
      const bbox = parseBbox(searchParams.get("bbox"));
      const hours = parseHours(searchParams.get("hours"), 4);
      const hazardOptions: HazardQueryOptions = { bbox, hours };
      try {
        const data = await service.getHazards(feed, hazardOptions);
        logApiUsage(`awc:${feed}`, clientId, undefined, true);
        return buildSuccessResponse(data, rate.remaining, rate.resetTime);
      } catch (err) {
        console.error("[AWC API] hazard parsing warning", {
          feed,
          bbox,
          hours,
          error: err,
        });
        return buildSuccessResponse(
          [],
          rate.remaining,
          rate.resetTime
        );
      }
    }

    return createErrorResponse("Unknown AWC feed", 404);
  } catch (error) {
    console.error(`[AWC API] ${feedParam} error`, error);
    logApiUsage(`awc:${feedParam}`, clientId, undefined, false, `${error}`);
    return createErrorResponse(
      error instanceof Error
        ? error.message
        : "Internal server error while fetching AWC data",
      500
    );
  }
}
