import { assertServerOnly } from "@/lib/config/airports";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAirportByIata } from "@/lib/airports/store";
import { getAirportDBClient } from "./airportdb-client";
import { getOrRefreshAirport } from "./airportdb";

const ICAO_REGEX = /^[A-Z]{4}$/;
const IATA_REGEX = /^[A-Z]{3}$/;

export async function convertToIcao(code: string): Promise<string> {
  assertServerOnly();

  const normalized = code.trim().toUpperCase();

  if (!normalized) {
    throw new Error("Airport code cannot be empty");
  }

  if (ICAO_REGEX.test(normalized)) {
    return normalized;
  }

  if (!IATA_REGEX.test(normalized)) {
    throw new Error(
      `Invalid airport code format: "${code}". Provide a valid IATA or ICAO code.`
    );
  }

  const supabase = await createServerSupabase();
  const detail = await getAirportByIata(normalized, { client: supabase });
  if (detail?.icao) {
    return detail.icao;
  }

  try {
    const client = getAirportDBClient();
    const results = await client.searchAirports(normalized, {
      type: "iata",
      limit: 1,
    });

    const match = results[0];
    const matchIcao = match?.ident || match?.icao_code;

    if (!matchIcao) {
      throw new Error(
        `Cannot convert IATA code "${code}" to ICAO. Airport not found in database or external API.`
      );
    }

    const airport = await getOrRefreshAirport(matchIcao);
    if (!airport?.icao) {
      throw new Error(
        `Airport lookup succeeded but no ICAO code returned for IATA "${code}".`
      );
    }

    return airport.icao;
  } catch (apiError) {
    console.error("Fallback conversion via AirportDB failed", apiError);
    const message = apiError instanceof Error ? apiError.message : "Unexpected error";
    throw new Error(
      `Cannot convert IATA code "${code}" to ICAO. ${message}`
    );
  }
}
