import { NextRequest, NextResponse } from "next/server";
import { getAirfieldWeatherSnapshot } from "@/lib/weather/riskEngine";

interface Params {
  params: Promise<{
    icao: string;
  }>;
}

function normalizeIcao(value: string | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{4}$/.test(normalized)) {
    return null;
  }
  return normalized;
}

function parseMode(mode: string | null | undefined): "lite" | "full" {
  if (mode === "lite") return "lite";
  return "full";
}

function parseDataset(dataset: string | null | undefined): Array<"metar" | "taf"> {
  if (!dataset || dataset === "both") {
    return ["metar", "taf"];
  }
  const normalized = dataset.toLowerCase();
  if (normalized === "metar" || normalized === "taf") {
    return [normalized];
  }
  return ["metar", "taf"];
}

export async function GET(request: NextRequest, { params }: Params) {
  const { icao: icaoParam } = await params;
  const icao = normalizeIcao(icaoParam);
  if (!icao) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid ICAO provided",
      },
      { status: 400 }
    );
  }

  const search = request.nextUrl.searchParams;
  const datasets = parseDataset(search.get("dataset"));
  const requestedMode = parseMode(search.get("mode"));
  const mode = datasets.includes("taf") ? requestedMode : "lite";

  try {
    const snapshot = await getAirfieldWeatherSnapshot(icao, mode);
    const responseData: Record<string, unknown> = {
      icao,
      isStale: snapshot.isStale,
      dataStalenessMinutes: snapshot.dataStalenessMinutes,
      lastUpdated: snapshot.weatherData.lastUpdated ?? null,
      expiresAt: snapshot.weatherData.expiresAt ?? null,
    };

    if (datasets.includes("metar")) {
      responseData.metar = snapshot.weatherData.metar ?? null;
    }

    if (datasets.includes("taf")) {
      responseData.taf = snapshot.weatherData.taf ?? null;
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error(`[Weather] Failed to load airfield weather for ${icao}`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load airfield weather",
      },
      { status: 500 }
    );
  }
}
