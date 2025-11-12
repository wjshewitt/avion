// Airport Search Utilities
// Provides search functionality for airports by various criteria

import { AirportDBResponse } from "@/types/airportdb";
import { getAirportDBClient } from "./airportdb-client";

/**
 * Search airports by ICAO code
 */
export async function searchAirports(
  query: string
): Promise<AirportDBResponse[]> {
  const client = getAirportDBClient();

  // If it looks like an ICAO code, try exact match first
  if (/^[A-Z][A-Z0-9]{3}$/i.test(query.trim())) {
    try {
      const airport = await client.getAirportByIcao(query.trim().toUpperCase());
      return [airport];
    } catch (error) {
      // Fall through to general search
    }
  }

  // General search
  return await client.searchAirports(query);
}

/**
 * Validate ICAO code format
 */
export function validateIcaoCode(icao: string): boolean {
  return /^[A-Z][A-Z0-9]{3}$/.test(icao.trim().toUpperCase());
}

/**
 * Normalize ICAO code to standard format
 */
export function normalizeIcaoCode(icao: string): string {
  return icao.trim().toUpperCase();
}

/**
 * Search airports by name
 */
export async function searchAirportsByName(
  name: string
): Promise<AirportDBResponse[]> {
  const client = getAirportDBClient();
  return await client.searchAirports(name, { type: "name" });
}

/**
 * Search airports by city
 */
export async function searchAirportsByCity(
  city: string
): Promise<AirportDBResponse[]> {
  const client = getAirportDBClient();
  return await client.searchAirports(city);
}

/**
 * Search airports by country
 */
export async function searchAirportsByCountry(
  country: string
): Promise<AirportDBResponse[]> {
  const client = getAirportDBClient();
  return await client.searchAirports(country);
}

/**
 * Get airports by region
 */
export async function getAirportsByRegion(
  region: string
): Promise<AirportDBResponse[]> {
  const client = getAirportDBClient();
  return await client.searchAirports(region);
}
