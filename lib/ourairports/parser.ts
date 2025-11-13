import Papa from "papaparse";

import type {
  OurAirportsAirport,
  OurAirportsRunway,
  OurAirportsFrequency,
  OurAirportsNavaid,
  OurAirportsCountry,
  OurAirportsRegion,
} from "./types";

function parseCsv<T extends Record<string, any>>(csv: string, dataset: string): T[] {
  const result = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
    transform(value) {
      if (value === "") return null as any;
      return typeof value === "string" ? value.trim() : value;
    },
  });

  if (result.errors.length > 0) {
    const [firstError] = result.errors;
    throw new Error(
      `Failed to parse ${dataset} CSV: ${firstError.message} at row ${firstError.row}`
    );
  }

  return result.data.filter(Boolean) as T[];
}

export function parseAirports(csv: string): OurAirportsAirport[] {
  return parseCsv<OurAirportsAirport>(csv, "airports");
}

export function parseRunways(csv: string): OurAirportsRunway[] {
  return parseCsv<OurAirportsRunway>(csv, "runways");
}

export function parseFrequencies(csv: string): OurAirportsFrequency[] {
  return parseCsv<OurAirportsFrequency>(csv, "airport-frequencies");
}

export function parseNavaids(csv: string): OurAirportsNavaid[] {
  return parseCsv<OurAirportsNavaid>(csv, "navaids");
}

export function parseCountries(csv: string): OurAirportsCountry[] {
  return parseCsv<OurAirportsCountry>(csv, "countries");
}

export function parseRegions(csv: string): OurAirportsRegion[] {
  return parseCsv<OurAirportsRegion>(csv, "regions");
}
