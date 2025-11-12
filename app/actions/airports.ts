"use server";

import {
  searchAirports,
  getAirportsByIcaos,
  getAirportByIcao,
  cacheAirportInSearchDB,
  convertApiToSearchRecord,
  type AirportSearchRecord,
} from "@/lib/airports/search-database";
import { POPULAR_AIRPORTS } from "@/types/airports";
import { getAirportDBClient } from "@/lib/airports/airportdb-client";

export async function searchAirportsAction(
  query: string,
  limit = 10
): Promise<AirportSearchRecord[]> {
  // First, search local database
  const localResults = await searchAirports(query, limit);

  // If we found results locally, return them
  if (localResults.length > 0) {
    return localResults;
  }

  // If no local results and query looks like ICAO/IATA code, try external API
  const trimmed = query.trim().toUpperCase();
  const isIcaoCode = /^[A-Z]{4}$/.test(trimmed);
  const isIataCode = /^[A-Z]{3}$/.test(trimmed);

  if (isIcaoCode || isIataCode) {
    try {
      console.log(`No local results for ${trimmed}, trying AirportDB API...`);
      const client = getAirportDBClient();

      // AirportDB only accepts ICAO codes, so only try if it's 4 characters
      if (isIcaoCode) {
        const apiResponse = await client.getAirportByIcao(trimmed);

        // Cache the airport for future searches
        await cacheAirportInSearchDB(apiResponse);

        // Convert and return the result
        const searchRecord = convertApiToSearchRecord(apiResponse);
        console.log(`Successfully fetched ${trimmed} from AirportDB API`);
        return [searchRecord];
      }
    } catch (error) {
      console.error(`Failed to fetch airport ${trimmed} from API:`, error);
      // Return empty array - don't throw to avoid breaking the UI
    }
  }

  // No results found locally or via API
  return [];
}

export async function getPopularAirportsAction(
  limit = 10
): Promise<AirportSearchRecord[]> {
  const icaos = POPULAR_AIRPORTS.slice(0, limit);
  return getAirportsByIcaos(icaos as string[]);
}

export async function getAirportByIcaoAction(
  icao: string
): Promise<AirportSearchRecord | null> {
  // First, try local database
  const localResult = await getAirportByIcao(icao);

  if (localResult) {
    return localResult;
  }

  // If not found locally, try external API
  const trimmed = icao.trim().toUpperCase();
  if (!/^[A-Z]{4}$/.test(trimmed)) {
    return null;
  }

  try {
    console.log(`Airport ${trimmed} not in local DB, fetching from AirportDB API...`);
    const client = getAirportDBClient();
    const apiResponse = await client.getAirportByIcao(trimmed);

    // Cache the airport for future lookups
    await cacheAirportInSearchDB(apiResponse);

    // Convert and return the result
    const searchRecord = convertApiToSearchRecord(apiResponse);
    console.log(`Successfully fetched ${trimmed} from AirportDB API`);
    return searchRecord;
  } catch (error) {
    console.error(`Failed to fetch airport ${trimmed} from API:`, error);
    return null;
  }
}
