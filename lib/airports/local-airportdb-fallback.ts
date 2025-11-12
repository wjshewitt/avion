import airportsSeed from "@/data/airports-seed.json";
import type {
  AirportDBBatchResponse,
  AirportDBResponse,
} from "@/types/airportdb";

type SeedRecord = {
  icao: string;
  iata?: string | null;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  elevation_ft?: number | null;
  type?: string | null;
  continent?: string | null;
  scheduled_service?: boolean | null;
};

const FALLBACK_AIRPORTS = (airportsSeed as SeedRecord[]).filter(
  (airport) => airport.icao
);

const AIRPORT_MAP = new Map<string, SeedRecord>();
for (const airport of FALLBACK_AIRPORTS) {
  AIRPORT_MAP.set(airport.icao.toUpperCase(), airport);
}

const COUNTRY_CODE_MAP: Record<string, { code: string; continent: string }> = {
  "United States": { code: "US", continent: "NA" },
  Canada: { code: "CA", continent: "NA" },
  Mexico: { code: "MX", continent: "NA" },
  "United Kingdom": { code: "GB", continent: "EU" },
  France: { code: "FR", continent: "EU" },
  Germany: { code: "DE", continent: "EU" },
  Spain: { code: "ES", continent: "EU" },
  Italy: { code: "IT", continent: "EU" },
  Australia: { code: "AU", continent: "OC" },
  Brazil: { code: "BR", continent: "SA" },
  Japan: { code: "JP", continent: "AS" },
  China: { code: "CN", continent: "AS" },
  India: { code: "IN", continent: "AS" },
  "United Arab Emirates": { code: "AE", continent: "AS" },
};

const US_STATE_CODES: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

function resolveCountryInfo(
  countryName?: string | null
): { code: string; continent: string; name: string } {
  if (!countryName) {
    return { code: "ZZ", continent: "UN", name: "Unknown" };
  }

  const normalized = countryName.trim();
  const match = COUNTRY_CODE_MAP[normalized];

  if (match) {
    return { code: match.code, continent: match.continent, name: normalized };
  }

  // Default heuristic: use first two uppercase letters
  const code = normalized.slice(0, 2).toUpperCase();
  return { code, continent: "UN", name: normalized };
}

function resolveRegionCode(
  countryCode: string,
  stateName?: string | null
): { code: string; name: string } {
  if (!stateName) {
    return { code: `${countryCode}-UNK`, name: "Unknown" };
  }

  const trimmed = stateName.trim();
  const stateCode = US_STATE_CODES[trimmed] || trimmed.toUpperCase();
  return { code: `${countryCode}-${stateCode}`, name: trimmed };
}

function createSyntheticRecord(icao: string): SeedRecord {
  const prefix = icao.charAt(0).toUpperCase();
  let country = "Unknown";
  let state: string | undefined;
  let continent: string | undefined;

  switch (prefix) {
    case "K":
      country = "United States";
      continent = "NA";
      break;
    case "C":
      country = "Canada";
      continent = "NA";
      break;
    case "E":
      country = "United Kingdom";
      continent = "EU";
      break;
    case "L":
      country = "France";
      continent = "EU";
      break;
    case "Y":
      country = "Australia";
      continent = "OC";
      break;
    case "Z":
      country = "New Zealand";
      continent = "OC";
      break;
    case "S":
      country = "Brazil";
      continent = "SA";
      break;
    case "R":
      country = "China";
      continent = "AS";
      break;
    case "V":
      country = "India";
      continent = "AS";
      break;
    default:
      country = "Unknown";
      continent = "UN";
  }

  return {
    icao,
    name: `${icao} Fallback Airport`,
    city: `${icao} City`,
    state,
    country,
    latitude: 0,
    longitude: 0,
    elevation_ft: 0,
    type: "small_airport",
    continent,
    scheduled_service: false,
  };
}

function toAirportDBResponse(record: SeedRecord): AirportDBResponse {
  const countryInfo = resolveCountryInfo(record.country);
  const regionInfo = resolveRegionCode(countryInfo.code, record.state);
  const latitude = record.latitude ?? 0;
  const longitude = record.longitude ?? 0;
  const nowIso = new Date().toISOString();

  return {
    ident: record.icao,
    icao_code: record.icao,
    iata_code: record.iata ?? undefined,
    gps_code: record.icao,
    local_code: record.iata ?? record.icao,
    type: (record.type as string) || "medium_airport",
    name: record.name,
    latitude_deg: latitude,
    longitude_deg: longitude,
    elevation_ft: record.elevation_ft
      ? String(record.elevation_ft)
      : undefined,
    continent: record.continent || countryInfo.continent,
    iso_country: countryInfo.code,
    iso_region: regionInfo.code,
    municipality: record.city || record.name,
    scheduled_service: record.scheduled_service ? "yes" : "no",
    home_link: undefined,
    wikipedia_link: undefined,
    keywords: undefined,
    runways: [],
    freqs: [],
    navaids: [],
    country: {
      id: countryInfo.code,
      code: countryInfo.code,
      name: countryInfo.name,
      continent: countryInfo.continent,
    },
    region: {
      id: regionInfo.code,
      code: regionInfo.code,
      local_code: regionInfo.code.split("-")[1] || regionInfo.code,
      name: regionInfo.name,
      continent: countryInfo.continent,
      iso_country: countryInfo.code,
    },
    station: {
      icao_code: record.icao,
      distance: 0,
    },
    updatedAt: nowIso,
  };
}

export function getFallbackAirport(icao: string): AirportDBResponse | null {
  const normalized = icao.trim().toUpperCase();
  let record = AIRPORT_MAP.get(normalized);

  if (!record) {
    record = createSyntheticRecord(normalized);
    AIRPORT_MAP.set(normalized, record);
  }

  return toAirportDBResponse(record);
}

export function searchFallbackAirports(
  query: string,
  limit: number
): AirportDBResponse[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }

  const results: AirportDBResponse[] = [];

  // Direct ICAO lookup
  const direct = AIRPORT_MAP.get(trimmed.toUpperCase());
  if (direct) {
    results.push(toAirportDBResponse(direct));
  }

  for (const record of FALLBACK_AIRPORTS) {
    if (results.length >= limit) {
      break;
    }

    const haystack = [
      record.icao,
      record.iata,
      record.name,
      record.city,
      record.state,
      record.country,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack) {
      continue;
    }

    if (haystack.includes(trimmed)) {
      results.push(toAirportDBResponse(record));
    }
  }

  return results.slice(0, limit);
}

export function getFallbackBatch(
  icaos: string[]
): AirportDBBatchResponse {
  const airports: AirportDBResponse[] = [];
  const errors: Array<{ icao: string; error: string }> = [];

  for (const code of icaos) {
    const fallback = getFallbackAirport(code);
    if (fallback) {
      airports.push(fallback);
    } else {
      errors.push({ icao: code, error: "Airport not found in fallback dataset" });
    }
  }

  return {
    airports,
    errors,
  };
}
