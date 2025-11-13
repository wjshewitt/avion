#!/usr/bin/env tsx

import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import * as dotenv from "dotenv";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_IMPORTER_OPTIONS,
  type ImporterOptions,
  type OpsRequirement,
  type ImportSummary,
  type TrimmedProcessedAirport,
  type OurAirportsAirport,
  type OurAirportsRunway,
  type OurAirportsFrequency,
  type OurAirportsNavaid,
} from "@/lib/ourairports/types";
import {
  parseAirports,
  parseRunways,
  parseFrequencies,
  parseNavaids,
  parseCountries,
  parseRegions,
} from "@/lib/ourairports/parser";
import { mapAirportToAirportDbResponse } from "@/lib/ourairports/mapping";
import type { ProcessedAirportData } from "@/types/airportdb";
import { processAirportData } from "@/lib/airports/airport-data-processor";
import { mergeAirportData } from "@/lib/airports/airport-data-merger";
import {
  serializeProcessedAirport,
  deserializeCacheEntry,
} from "@/lib/airports/cache-service";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AirportCache, Database } from "@/lib/supabase/types";
import { haversineNm } from "@/lib/weather/geo";

// Load environment variables from .env and .env.local if present
dotenv.config();
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

const BASE_DATA_URL =
  process.env.OURAIRPORTS_DATA_URL ??
  "https://raw.githubusercontent.com/davidmegginson/ourairports-data/master";

const SURFACE_ALIASES: Record<string, string> = {
  ASPH: "ASP",
  ASP: "ASP",
  CONC: "CON",
  CON: "CON",
  BITU: "ASP",
  BIT: "ASP",
  MAC: "ASP",
  CEM: "CON",
  CONCRETE: "CON",
  ASPHALT: "ASP",
};

const NAV_AID_ALLOWED = new Set([
  "ILS",
  "LOC",
  "GS",
  "DME",
  "VOR",
  "VORTAC",
  "VOR/DME",
  "VOR-DME",
  "ILS/DME",
  "ILS-DME",
  "LOC/DME",
  "LOC-DME",
]);

const OPS_FREQUENCY_MAP: Record<OpsRequirement, string[]> = {
  tower: ["TWR"],
  ground: ["GND"],
  approach: ["APP", "DEP"],
  atis: ["ATIS"],
  clearance: ["CLD"],
};

const BATCH_SIZE = 50;
const COMM_FREQ_MIN = 100;
const COMM_FREQ_MAX = 400;
const FLAGS_EXPECT_VALUE = new Set([
  "--min-runway-ft",
  "--surface-allow",
  "--types",
  "--countries",
  "--regions",
  "--ops-required",
  "--require-scheduled",
  "--navaid-radius-nm",
  "--keep-runway-details",
  "--limit",
  "--only",
  "--dry-run",
  "--upsert-db",
  "--output-json",
  "--report",
  "--persist-raw",
  "--cache-dir",
  "--force-download",
]);

interface CliParseResult {
  options: ImporterOptions;
  showHelp?: boolean;
}

function normalizeIcao(value?: string | null): string | null {
  if (!value) return null;
  return value.trim().toUpperCase();
}

function normalizeSurface(value?: string | null): string {
  if (!value) return "";
  const upper = value.trim().toUpperCase();
  return SURFACE_ALIASES[upper] ?? upper.slice(0, 3);
}

function parseBooleanFlag(arg: string): boolean {
  return ["true", "1", "yes", "y"].includes(arg.toLowerCase());
}

function parseCliArguments(argv: string[]): CliParseResult {
  const options: ImporterOptions = { ...DEFAULT_IMPORTER_OPTIONS };
  let showHelp = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--help" || token === "-h") {
      showHelp = true;
      break;
    }

    let key = token;
    let value: string | undefined = undefined;
    if (token.includes("=")) {
      [key, value] = token.split("=", 2) as [string, string | undefined];
    } else if (FLAGS_EXPECT_VALUE.has(token)) {
      const next = argv[index + 1];
      if (next && !next.startsWith("--")) {
        value = next;
        index += 1;
      }
    }

    switch (key) {
      case "--min-runway-ft":
        options.minRunwayFt = value ? Number(value) : options.minRunwayFt;
        break;
      case "--surface-allow":
        options.surfaceAllow = value
          ? value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
          : options.surfaceAllow;
        break;
      case "--types":
        options.types = value
          ? value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : options.types;
        break;
      case "--countries":
        options.countries = value
          ? value
              .split(",")
              .map((s) => s.trim().toUpperCase())
              .filter(Boolean)
          : undefined;
        break;
      case "--regions":
        options.regions = value
          ? value
              .split(",")
              .map((s) => s.trim().toUpperCase())
              .filter(Boolean)
          : undefined;
        break;
      case "--ops-required":
        options.opsRequired = value
          ? (value
              .split(",")
              .map((s) => s.trim().toLowerCase())
              .filter(Boolean) as OpsRequirement[])
          : [];
        break;
      case "--require-scheduled":
        options.requireScheduledService = value ? parseBooleanFlag(value) : true;
        break;
      case "--navaid-radius-nm":
        options.navaidRadiusNm = value ? Number(value) : options.navaidRadiusNm;
        break;
      case "--keep-runway-details":
        options.keepRunwayDetails = value ? Number(value) : options.keepRunwayDetails;
        break;
      case "--limit":
        options.limit = value ? Number(value) : options.limit;
        break;
      case "--only":
        options.only = value
          ? value
              .split(",")
              .map((s) => s.trim().toUpperCase())
              .filter(Boolean)
          : undefined;
        break;
      case "--dry-run":
        options.dryRun = value ? parseBooleanFlag(value) : true;
        break;
      case "--upsert-db":
        options.upsertDb = value ? parseBooleanFlag(value) : true;
        if (options.upsertDb) {
          options.dryRun = false;
        }
        break;
      case "--output-json":
        options.outputJson = value;
        break;
      case "--report":
        options.reportPath = value;
        break;
      case "--persist-raw":
        options.persistRawPayload = value ? parseBooleanFlag(value) : true;
        break;
      case "--cache-dir":
        options.cacheDir = value;
        break;
      case "--force-download":
        options.forceDownload = value ? parseBooleanFlag(value) : true;
        break;
      default:
        console.warn(`Unknown argument: ${token}`);
        break;
    }
  }

  return { options, showHelp };
}

function showCliHelp(): void {
  console.log(`OurAirports Importer

Usage: npm run import:ourairports -- [options]

Options:
  --min-runway-ft=<feet>        Minimum runway length (default 5000)
  --surface-allow=ASP,CON       Surface allow list (default ASP,CON)
  --types=large_airport,...     Airport types to include
  --countries=US,CA             ISO country filter (optional)
  --regions=US-CA,US-NY         Region filter (optional)
  --ops-required=tower,atis     Require presence of radio types
  --require-scheduled           Require scheduled service
  --navaid-radius-nm=25         Navaid radius in NM (default 25)
  --keep-runway-details=2       Number of runway details to persist (default 2)
  --limit=500                   Limit airports processed (optional)
  --only=KJFK,KLAX              Restrict to ICAO list
  --dry-run                     Disable Supabase writes (default true)
  --upsert-db                   Enable Supabase upserts (implies dry-run=false)
  --output-json=path.json       Write trimmed airport payload to disk
  --report=path.json            Write summary report to disk
  --persist-raw                 Keep raw API payload in cache entries
  --cache-dir=./data/cache      Directory for cached CSV downloads
  --force-download              Re-download datasets even if cached locally
  --help                        Show this help message
`);
}

async function ensureDirectory(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function loadDataset(
  filename: string,
  cacheDir: string,
  forceDownload: boolean
): Promise<string> {
  const cachedPath = path.join(cacheDir, filename);

  if (!forceDownload && existsSync(cachedPath)) {
    const data = await fs.readFile(cachedPath, "utf8");
    console.log(`Using cached dataset: ${cachedPath}`);
    return data;
  }

  const url = `${BASE_DATA_URL}/${filename}`;
  console.log(`Downloading ${filename} from ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${filename} (${response.status})`);
  }

  const text = await response.text();
  await ensureDirectory(cacheDir);
  await fs.writeFile(cachedPath, text, "utf8");
  console.log(`Cached dataset at ${cachedPath}`);
  return text;
}

function groupByAirport<T extends { airport_ident: string | null | undefined }>(
  rows: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();

  for (const row of rows) {
    const ident = normalizeIcao(row.airport_ident);
    if (!ident) continue;
    const bucket = map.get(ident);
    if (bucket) {
      bucket.push(row);
    } else {
      map.set(ident, [row]);
    }
  }

  return map;
}

function buildFrequencyTypeSet(frequencies: OurAirportsFrequency[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const freq of frequencies) {
    const ident = normalizeIcao(freq.airport_ident);
    if (!ident) continue;
    const type = (freq.type ?? "").toUpperCase();
    if (!type) continue;
    if (!map.has(ident)) {
      map.set(ident, new Set([type]));
    } else {
      map.get(ident)!.add(type);
    }
  }

  return map;
}

function evaluateOpsRequirements(
  freqSet: Set<string> | undefined,
  requirements: OpsRequirement[]
): boolean {
  if (!requirements.length) return true;
  if (!freqSet) return false;

  return requirements.every((requirement) => {
    const codes = OPS_FREQUENCY_MAP[requirement] ?? [];
    return codes.some((code) => freqSet.has(code));
  });
}

interface RunwayStats {
  maxLengthFt: number;
  qualifying: OurAirportsRunway[];
}

function buildRunwayStats(
  runways: OurAirportsRunway[],
  options: ImporterOptions
): Map<string, RunwayStats> {
  const map = new Map<string, RunwayStats>();
  const allowedSurfaces = new Set(options.surfaceAllow.map((s) => s.toUpperCase()));

  for (const runway of runways) {
    const ident = normalizeIcao(runway.airport_ident);
    if (!ident) continue;

    const surface = normalizeSurface(runway.surface);
    const lengthFt = Number(runway.length_ft ?? 0);
    const qualifies =
      allowedSurfaces.has(surface) && Number.isFinite(lengthFt) && lengthFt >= options.minRunwayFt;

    const current = map.get(ident);
    if (!current) {
      map.set(ident, {
        maxLengthFt: Number.isFinite(lengthFt) ? lengthFt : 0,
        qualifying: qualifies && Number.isFinite(lengthFt) ? [runway] : [],
      });
    } else {
      if (Number.isFinite(lengthFt) && lengthFt > current.maxLengthFt) {
        current.maxLengthFt = lengthFt;
      }
      if (qualifies && Number.isFinite(lengthFt)) {
        current.qualifying.push(runway);
      }
    }
  }

  return map;
}

function filterNavaidsForAirport(
  airport: OurAirportsAirport,
  candidates: OurAirportsNavaid[],
  radiusNm: number
): OurAirportsNavaid[] {
  const ident = normalizeIcao(airport.ident);
  if (!ident) return [];

  const airportCoords = {
    lat: Number(airport.latitude_deg),
    lon: Number(airport.longitude_deg),
  };

  if (!Number.isFinite(airportCoords.lat) || !Number.isFinite(airportCoords.lon)) {
    return [];
  }

  const selected: OurAirportsNavaid[] = [];
  const seen = new Set<string>();

  for (const navaid of candidates) {
    const typeNormalized = (navaid.type ?? "").toUpperCase();
    const canonical = NAV_AID_ALLOWED.has(typeNormalized)
      ? typeNormalized
      : typeNormalized.replace(/[-\s]/g, "/");

    const allowed = NAV_AID_ALLOWED.has(typeNormalized) || NAV_AID_ALLOWED.has(canonical);
    if (!allowed) continue;

    const key = navaid.id;
    if (seen.has(key)) continue;

    const associatedIcao = normalizeIcao(navaid.associated_airport);
    if (associatedIcao === ident) {
      selected.push(navaid);
      seen.add(key);
      continue;
    }

    if (radiusNm <= 0) continue;

    const lat = Number(navaid.latitude_deg);
    const lon = Number(navaid.longitude_deg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      continue;
    }

    const distance = haversineNm(airportCoords, { lat, lon });
    if (distance <= radiusNm) {
      selected.push(navaid);
      seen.add(key);
    }
  }

  return selected;
}

function trimRunwayDetails(data: ProcessedAirportData, keep: number): void {
  if (!data.runways?.details?.length) return;
  const sorted = [...data.runways.details].sort((a, b) => b.length_ft - a.length_ft);
  data.runways.details = sorted.slice(0, keep);
}

function trimCommunications(data: ProcessedAirportData): void {
  const allowed = new Set(["TWR", "GND", "APP", "DEP", "ATIS", "CLD"]);
  const filtered: Record<string, any> = {};

  for (const [type, freqs] of Object.entries(data.communications.frequencies_by_type || {})) {
    if (allowed.has(type)) {
      const cleaned = (freqs as any[]).filter((item) => {
        const value = typeof item.frequency_mhz === "number"
          ? item.frequency_mhz
          : parseFloat(String(item.frequency_mhz ?? ""));
        if (Number.isNaN(value)) return false;
        return value >= COMM_FREQ_MIN && value <= COMM_FREQ_MAX;
      });
      if (cleaned.length > 0) {
        filtered[type] = cleaned;
      }
    }
  }

  data.communications.frequencies_by_type = filtered;

  const primary = data.communications.primary_frequencies;
  const primaryMap: typeof primary = {};
  const isValidPrimary = (value?: string) => {
    if (!value) return false;
    const numeric = parseFloat(value);
    return !Number.isNaN(numeric) && numeric >= COMM_FREQ_MIN && numeric <= COMM_FREQ_MAX;
  };
  if (isValidPrimary(primary.tower) && filtered.TWR) primaryMap.tower = primary.tower;
  if (isValidPrimary(primary.ground) && filtered.GND) primaryMap.ground = primary.ground;
  if (isValidPrimary(primary.approach) && (filtered.APP || filtered.DEP)) {
    primaryMap.approach = primary.approach;
  }
  if (isValidPrimary(primary.atis) && filtered.ATIS) primaryMap.atis = primary.atis;
  data.communications.primary_frequencies = primaryMap;
}

function trimNavigation(data: ProcessedAirportData): void {
  const filtered: Record<string, any> = {};
  let total = 0;

  for (const [type, navaids] of Object.entries(data.navigation.navaids_by_type || {})) {
    if (NAV_AID_ALLOWED.has(type) || NAV_AID_ALLOWED.has(type.replace(/[-\s]/g, "/"))) {
      filtered[type] = navaids;
      total += Array.isArray(navaids) ? navaids.length : 0;
    }
  }

  data.navigation.navaids_by_type = filtered;
  data.navigation.navaids_count = total;

  if (Array.isArray(data.navigation.approach_types)) {
    data.navigation.approach_types = data.navigation.approach_types.filter((approach) => {
      const normalized = approach.toUpperCase();
      return NAV_AID_ALLOWED.has(normalized) || NAV_AID_ALLOWED.has(normalized.replace(/[-\s]/g, "/"));
    });
  }
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchExistingCache(
  client: SupabaseClient<Database>,
  icaos: string[]
): Promise<Map<string, AirportCache>> {
  const map = new Map<string, AirportCache>();
  if (!icaos.length) return map;

  const chunks = chunkArray(icaos, 200);

  for (const chunk of chunks) {
    const { data, error } = await client
      .from("airport_cache")
      .select("*")
      .in("icao_code", chunk);

    if (error) {
      throw new Error(`Failed to fetch existing cache entries: ${error.message}`);
    }

    (data as AirportCache[] | null)?.forEach((row) => {
      map.set(row.icao_code, row);
    });
  }

  return map;
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function logSummary(summary: ImportSummary): void {
  const lines = [
    "OurAirports Import Summary",
    `  Total airports scanned: ${summary.totalAirports}`,
    `  Eligible after filters: ${summary.eligibleAirports}`,
    `  Skipped (ICAO): ${summary.skippedByIdent}`,
    `  Skipped (runway): ${summary.skippedByRunway}`,
    `  Skipped (type): ${summary.skippedByType}`,
    `  Skipped (location): ${summary.skippedByLocation}`,
    `  Skipped (ops): ${summary.skippedByOps}`,
    `  Skipped (schedule): ${summary.skippedBySchedule}`,
    `  Imported (processed): ${summary.imported}`,
    `  Merged with existing: ${summary.merged}`,
    `  Dry run: ${summary.dryRun}`,
  ];

  if (summary.limitApplied) {
    lines.push(`  Limit applied: ${summary.limitApplied}`);
  }

  console.log(lines.join("\n"));
}

async function main() {
  const { options, showHelp } = parseCliArguments(process.argv.slice(2));

  if (showHelp) {
    showCliHelp();
    return;
  }

  const cacheDir = options.cacheDir
    ? path.resolve(process.cwd(), options.cacheDir)
    : path.resolve(process.cwd(), "data/ourairports-cache");

  console.log("Downloading OurAirports datasets...");

  const [
    airportsCsv,
    runwaysCsv,
    freqsCsv,
    navaidsCsv,
    countriesCsv,
    regionsCsv,
  ] = await Promise.all([
    loadDataset("airports.csv", cacheDir, options.forceDownload),
    loadDataset("runways.csv", cacheDir, options.forceDownload),
    loadDataset("airport-frequencies.csv", cacheDir, options.forceDownload),
    loadDataset("navaids.csv", cacheDir, options.forceDownload),
    loadDataset("countries.csv", cacheDir, options.forceDownload),
    loadDataset("regions.csv", cacheDir, options.forceDownload),
  ]);

  const airports = parseAirports(airportsCsv);
  const runways = parseRunways(runwaysCsv);
  const frequencies = parseFrequencies(freqsCsv);
  const navaids = parseNavaids(navaidsCsv);
  const countries = parseCountries(countriesCsv);
  const regions = parseRegions(regionsCsv);

  const countriesByCode = new Map(countries.map((c) => [c.code.toUpperCase(), c]));
  const regionsByCode = new Map(regions.map((r) => [r.code.toUpperCase(), r]));

  const runwayStats = buildRunwayStats(runways, options);
  const runwaysByAirport = groupByAirport(runways);
  const frequenciesMap = groupByAirport(frequencies);
  const frequencyTypes = buildFrequencyTypeSet(frequencies);

  const navaidsByCountry = new Map<string, OurAirportsNavaid[]>();
  for (const navaid of navaids) {
    const code = navaid.iso_country?.toUpperCase();
    if (!code) continue;
    if (!navaidsByCountry.has(code)) {
      navaidsByCountry.set(code, [navaid]);
    } else {
      navaidsByCountry.get(code)!.push(navaid);
    }
  }

  const summary: ImportSummary = {
    totalAirports: airports.length,
    eligibleAirports: 0,
    skippedByIdent: 0,
    skippedByRunway: 0,
    skippedByType: 0,
    skippedByLocation: 0,
    skippedByOps: 0,
    skippedBySchedule: 0,
    imported: 0,
    merged: 0,
    dryRun: options.dryRun,
    options,
  };

  const eligibleAirports: OurAirportsAirport[] = [];

  const onlySet = options.only ? new Set(options.only.map((icao) => icao.toUpperCase())) : null;
  const countrySet = options.countries ? new Set(options.countries) : null;
  const regionSet = options.regions ? new Set(options.regions) : null;

  for (const airport of airports) {
    const ident = normalizeIcao(airport.ident);
    if (!ident) continue;

    if (!/^[A-Z]{4}$/.test(ident)) {
      summary.skippedByIdent++;
      continue;
    }

    if (!options.types.includes(airport.type)) {
      summary.skippedByType++;
      continue;
    }

    if (onlySet && !onlySet.has(ident)) continue;

    const runwayStat = runwayStats.get(ident);
    if (!runwayStat || runwayStat.qualifying.length === 0) {
      summary.skippedByRunway++;
      continue;
    }

    if (!options.types.includes(airport.type)) {
      summary.skippedByType++;
      continue;
    }

    if (countrySet && !countrySet.has(airport.iso_country.toUpperCase())) {
      summary.skippedByLocation++;
      continue;
    }

    if (regionSet && !regionSet.has(airport.iso_region.toUpperCase())) {
      summary.skippedByLocation++;
      continue;
    }

    if (
      options.requireScheduledService &&
      (airport.scheduled_service ?? "no").toLowerCase() !== "yes"
    ) {
      summary.skippedBySchedule++;
      continue;
    }

    if (!evaluateOpsRequirements(frequencyTypes.get(ident), options.opsRequired)) {
      summary.skippedByOps++;
      continue;
    }

    summary.eligibleAirports++;
    eligibleAirports.push(airport);
  }

  let airportsToProcess = eligibleAirports;

  if (options.limit && options.limit > 0 && airportsToProcess.length > options.limit) {
    airportsToProcess = airportsToProcess.slice(0, options.limit);
    summary.limitApplied = options.limit;
  }

  if (airportsToProcess.length === 0) {
    console.log("No airports met the filter criteria. Nothing to do.");
    return;
  }

  if (options.upsertDb) {
    const requiredEnv = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
    for (const key of requiredEnv) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable ${key} for database upsert`);
      }
    }
  }

  const adminClient = options.upsertDb ? createAdminClient() : null;
  const existingCache = adminClient
    ? await fetchExistingCache(
        adminClient as SupabaseClient<Database>,
        airportsToProcess.map((airport) => airport.ident.toUpperCase())
      )
    : new Map<string, AirportCache>();

  const processedAirports: TrimmedProcessedAirport[] = [];
  const cachePayloads: Database["public"]["Tables"]["airport_cache"]["Insert"][] = [];
  const timestamp = new Date().toISOString();

  for (const airport of airportsToProcess) {
    const ident = airport.ident.toUpperCase();
    const airportRunways = runwaysByAirport.get(ident) ?? [];
    const airportFreqs = frequenciesMap.get(ident) ?? [];
    const candidateNavaids = navaidsByCountry.get(airport.iso_country.toUpperCase()) ?? [];
    const selectedNavaids = filterNavaidsForAirport(
      airport,
      candidateNavaids,
      options.navaidRadiusNm
    );

    const airportResponse = mapAirportToAirportDbResponse(airport, {
      runways: airportRunways,
      frequencies: airportFreqs,
      navaids: selectedNavaids,
      country: countriesByCode.get(airport.iso_country.toUpperCase()) ?? null,
      region: regionsByCode.get(airport.iso_region.toUpperCase()) ?? null,
    });

    let processed = processAirportData(airportResponse);
    processed.data_quality.source = "ourairports";
    processed.data_quality.last_updated = timestamp;

    trimRunwayDetails(processed, options.keepRunwayDetails);
    trimCommunications(processed);
    trimNavigation(processed);

    const existingRow = existingCache.get(ident);
    let finalAirport = processed;
    let mergedFrom: "existing" | "none" = "none";

    if (existingRow) {
      const existingProcessed = deserializeCacheEntry(existingRow);
      const merged = mergeAirportData(existingProcessed, processed);
      merged.data_quality = {
        completeness_score: Math.max(
          existingProcessed.data_quality.completeness_score,
          processed.data_quality.completeness_score
        ),
        last_updated: timestamp,
        source:
          existingProcessed.data_quality.source === "airportdb" &&
          processed.data_quality.source === "ourairports"
            ? "merged"
            : existingProcessed.data_quality.source,
      };

      trimRunwayDetails(merged, options.keepRunwayDetails);
      trimCommunications(merged);
      trimNavigation(merged);

      finalAirport = merged;
      mergedFrom = "existing";
      summary.merged++;
    }

    processedAirports.push({ airport: finalAirport, mergedFrom });

    if (!options.dryRun && adminClient) {
      const cacheData = serializeProcessedAirport(
        finalAirport,
        options.persistRawPayload ? airportResponse : null
      );

      cachePayloads.push({
        icao_code: finalAirport.icao,
        iata_code: finalAirport.iata ?? null,
        core_data: cacheData.core_data,
        runway_data: cacheData.runway_data,
        communication_data: cacheData.communication_data,
        navigation_data: cacheData.navigation_data,
        capability_data: cacheData.capability_data,
        raw_api_response: cacheData.raw_api_response,
        data_completeness: finalAirport.data_quality.completeness_score,
        processing_version: "ourairports-filtered-v1",
        last_verified_at: timestamp,
      });
    }
  }

  summary.imported = processedAirports.length;

  if (!options.dryRun && adminClient && cachePayloads.length > 0) {
    console.log(`Upserting ${cachePayloads.length} airports into Supabase...`);
    const chunks = chunkArray(cachePayloads, BATCH_SIZE);

    for (const [index, chunk] of chunks.entries()) {
      const { error } = await adminClient
        .from("airport_cache")
        .upsert(chunk as any, { onConflict: "icao_code" });

      if (error) {
        throw new Error(`Supabase upsert failed on chunk ${index + 1}: ${error.message}`);
      }
    }
  }

  if (options.outputJson) {
    await writeJsonFile(options.outputJson, {
      generatedAt: timestamp,
      total: processedAirports.length,
      airports: processedAirports.map((entry) => entry.airport),
    });
    console.log(`Wrote JSON payload to ${options.outputJson}`);
  }

  if (options.reportPath) {
    await writeJsonFile(options.reportPath, {
      generatedAt: timestamp,
      summary,
    });
    console.log(`Wrote summary report to ${options.reportPath}`);
  }

  logSummary(summary);
}

main().catch((error) => {
  console.error("OurAirports import failed:", error);
  process.exitCode = 1;
});
