import type { ProcessedAirportData } from "@/types/airportdb";

export interface OurAirportsAirport {
  id: string;
  ident: string;
  type: string;
  name: string;
  latitude_deg: string;
  longitude_deg: string;
  elevation_ft: string | null;
  continent: string;
  iso_country: string;
  iso_region: string;
  municipality: string | null;
  scheduled_service: string | null;
  gps_code: string | null;
  iata_code: string | null;
  local_code: string | null;
  home_link: string | null;
  wikipedia_link: string | null;
  keywords: string | null;
}

export interface OurAirportsRunway {
  id: string;
  airport_ref: string;
  airport_ident: string;
  length_ft: string | null;
  width_ft: string | null;
  surface: string | null;
  lighted: string | null;
  closed: string | null;
  le_ident: string | null;
  le_latitude_deg: string | null;
  le_longitude_deg: string | null;
  le_elevation_ft: string | null;
  le_heading_degT: string | null;
  le_displaced_threshold_ft: string | null;
  he_ident: string | null;
  he_latitude_deg: string | null;
  he_longitude_deg: string | null;
  he_elevation_ft: string | null;
  he_heading_degT: string | null;
  he_displaced_threshold_ft: string | null;
}

export interface OurAirportsFrequency {
  id: string;
  airport_ref: string;
  airport_ident: string;
  type: string;
  description: string | null;
  frequency_mhz: string | null;
}

export interface OurAirportsNavaid {
  id: string;
  filename: string;
  ident: string;
  name: string;
  type: string;
  frequency_khz: string | null;
  latitude_deg: string;
  longitude_deg: string;
  elevation_ft: string | null;
  iso_country: string;
  dme_frequency_khz: string | null;
  dme_channel: string | null;
  dme_latitude_deg: string | null;
  dme_longitude_deg: string | null;
  dme_elevation_ft: string | null;
  slaved_variation_deg: string | null;
  magnetic_variation_deg: string | null;
  usageType: string | null;
  power: string | null;
  associated_airport: string | null;
}

export interface OurAirportsCountry {
  id: string;
  code: string;
  name: string;
  continent: string;
  wikipedia_link: string | null;
  keywords: string | null;
}

export interface OurAirportsRegion {
  id: string;
  code: string;
  local_code: string | null;
  name: string;
  continent: string;
  iso_country: string;
  wikipedia_link: string | null;
  keywords: string | null;
}

export type OpsRequirement = "tower" | "ground" | "approach" | "atis" | "clearance";

export interface ImporterOptions {
  minRunwayFt: number;
  surfaceAllow: string[];
  types: string[];
  countries?: string[];
  regions?: string[];
  opsRequired: OpsRequirement[];
  requireScheduledService: boolean;
  navaidRadiusNm: number;
  keepRunwayDetails: number;
  limit?: number;
  only?: string[];
  dryRun: boolean;
  upsertDb: boolean;
  outputJson?: string;
  reportPath?: string;
  persistRawPayload: boolean;
  cacheDir?: string;
  forceDownload: boolean;
}

export interface ImportSummary {
  totalAirports: number;
  eligibleAirports: number;
  skippedByIdent: number;
  skippedByRunway: number;
  skippedByType: number;
  skippedByLocation: number;
  skippedByOps: number;
  skippedBySchedule: number;
  imported: number;
  merged: number;
  dryRun: boolean;
  limitApplied?: number;
  options: ImporterOptions;
}

export interface TrimmedProcessedAirport {
  airport: ProcessedAirportData;
  mergedFrom?: "existing" | "none";
}

export const DEFAULT_IMPORTER_OPTIONS: ImporterOptions = {
  minRunwayFt: 5000,
  surfaceAllow: ["ASP", "CON"],
  types: ["large_airport", "medium_airport", "small_airport", "airport"],
  countries: undefined,
  regions: undefined,
  opsRequired: [],
  requireScheduledService: false,
  navaidRadiusNm: 25,
  keepRunwayDetails: 2,
  limit: undefined,
  only: undefined,
  dryRun: true,
  upsertDb: false,
  outputJson: undefined,
  reportPath: undefined,
  persistRawPayload: false,
  cacheDir: undefined,
  forceDownload: false,
};
