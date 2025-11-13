import type {
  AirportDBResponse,
  RunwayData,
  FrequencyData,
  NavaidData,
  CountryData,
  RegionData,
} from "@/types/airportdb";

import type {
  OurAirportsAirport,
  OurAirportsRunway,
  OurAirportsFrequency,
  OurAirportsNavaid,
  OurAirportsCountry,
  OurAirportsRegion,
} from "./types";

function coerceRunway(runway: OurAirportsRunway): RunwayData {
  return {
    id: runway.id,
    airport_ref: runway.airport_ref,
    airport_ident: runway.airport_ident,
    length_ft: runway.length_ft ?? "0",
    width_ft: runway.width_ft ?? "0",
    surface: (runway.surface || "").toUpperCase(),
    lighted: runway.lighted ?? "0",
    closed: runway.closed ?? "0",
    le_ident: runway.le_ident ?? "",
    le_latitude_deg: runway.le_latitude_deg ?? "0",
    le_longitude_deg: runway.le_longitude_deg ?? "0",
    le_elevation_ft: runway.le_elevation_ft ?? "0",
    le_heading_degT: runway.le_heading_degT ?? "0",
    le_displaced_threshold_ft: runway.le_displaced_threshold_ft ?? undefined,
    he_ident: runway.he_ident ?? "",
    he_latitude_deg: runway.he_latitude_deg ?? "0",
    he_longitude_deg: runway.he_longitude_deg ?? "0",
    he_elevation_ft: runway.he_elevation_ft ?? "0",
    he_heading_degT: runway.he_heading_degT ?? "0",
    he_displaced_threshold_ft: runway.he_displaced_threshold_ft ?? undefined,
    le_ils: undefined,
    he_ils: undefined,
  };
}

function coerceFrequency(freq: OurAirportsFrequency): FrequencyData {
  return {
    id: freq.id,
    airport_ref: freq.airport_ref,
    airport_ident: freq.airport_ident,
    type: (freq.type || "").toUpperCase(),
    description: freq.description ?? "",
    frequency_mhz: freq.frequency_mhz ?? "0",
  };
}

function coerceNavaid(navaid: OurAirportsNavaid): NavaidData {
  return {
    id: navaid.id,
    filename: navaid.filename,
    ident: navaid.ident,
    name: navaid.name,
    type: (navaid.type || "").toUpperCase(),
    frequency_khz: navaid.frequency_khz ?? undefined,
    latitude_deg: navaid.latitude_deg,
    longitude_deg: navaid.longitude_deg,
    elevation_ft: navaid.elevation_ft ?? undefined,
    iso_country: navaid.iso_country,
    dme_frequency_khz: navaid.dme_frequency_khz ?? undefined,
    dme_channel: navaid.dme_channel ?? undefined,
    dme_latitude_deg: navaid.dme_latitude_deg ?? undefined,
    dme_longitude_deg: navaid.dme_longitude_deg ?? undefined,
    dme_elevation_ft: navaid.dme_elevation_ft ?? undefined,
    slaved_variation_deg: navaid.slaved_variation_deg ?? undefined,
    magnetic_variation_deg: navaid.magnetic_variation_deg ?? "0",
    usageType: navaid.usageType ?? undefined,
    power: navaid.power ?? undefined,
    associated_airport: navaid.associated_airport ?? undefined,
  };
}

function mapCountry(country?: OurAirportsCountry | null): CountryData {
  if (!country) {
    return {
      id: "",
      code: "",
      name: "",
      continent: "",
      wikipedia_link: undefined,
      keywords: undefined,
    };
  }

  return {
    id: country.id,
    code: country.code,
    name: country.name,
    continent: country.continent,
    wikipedia_link: country.wikipedia_link ?? undefined,
    keywords: country.keywords ?? undefined,
  };
}

function mapRegion(region?: OurAirportsRegion | null): RegionData {
  if (!region) {
    return {
      id: "",
      code: "",
      local_code: "",
      name: "",
      continent: "",
      iso_country: "",
      wikipedia_link: undefined,
      keywords: undefined,
    } as RegionData;
  }

  return {
    id: region.id,
    code: region.code,
    local_code: region.local_code ?? "",
    name: region.name,
    continent: region.continent,
    iso_country: region.iso_country,
    wikipedia_link: region.wikipedia_link ?? undefined,
    keywords: region.keywords ?? undefined,
  };
}

export interface AirportContext {
  runways: OurAirportsRunway[];
  frequencies: OurAirportsFrequency[];
  navaids: OurAirportsNavaid[];
  country?: OurAirportsCountry | null;
  region?: OurAirportsRegion | null;
}

export function mapAirportToAirportDbResponse(
  airport: OurAirportsAirport,
  context: AirportContext
): AirportDBResponse {
  const latitude = Number(airport.latitude_deg);
  const longitude = Number(airport.longitude_deg);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(`Airport ${airport.ident} is missing valid coordinates`);
  }

  const runways = context.runways.map(coerceRunway);
  const freqs = context.frequencies.map(coerceFrequency);
  const navaids = context.navaids.map(coerceNavaid);

  return {
    ident: airport.ident,
    icao_code: airport.ident,
    iata_code: airport.iata_code ?? undefined,
    gps_code: airport.gps_code ?? undefined,
    local_code: airport.local_code ?? undefined,
    type: airport.type,
    name: airport.name,
    latitude_deg: latitude,
    longitude_deg: longitude,
    elevation_ft: airport.elevation_ft ?? undefined,
    continent: airport.continent,
    iso_country: airport.iso_country,
    iso_region: airport.iso_region,
    municipality: airport.municipality ?? "",
    scheduled_service: airport.scheduled_service ?? "no",
    home_link: airport.home_link ?? undefined,
    wikipedia_link: airport.wikipedia_link ?? undefined,
    keywords: airport.keywords ?? undefined,
    runways: runways.length > 0 ? runways : [],
    freqs: freqs.length > 0 ? freqs : [],
    navaids: navaids.length > 0 ? navaids : [],
    country: mapCountry(context.country),
    region: mapRegion(context.region),
    station: undefined,
    updatedAt: new Date().toISOString(),
  };
}
