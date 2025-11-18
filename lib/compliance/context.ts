import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AircraftRecord,
  Database,
  Jurisdiction,
  Operator,
} from '@/lib/supabase/types';
import { describeRegistry } from '@/lib/aircraft/registry';

type Client = SupabaseClient<Database>;
type Tables = Database['public']['Tables'];

const TABLES = {
  jurisdictions: 'jurisdictions',
  operators: 'operators',
  airports: 'airports',
  aircraft: 'aircraft',
} as const satisfies Record<string, keyof Tables>;

function table<T extends keyof Tables>(client: Client, tableName: T) {
  return client.from(tableName) as any;
}

export interface FlightComplianceContextOptions {
  supabase: Client;
  operatorName?: string | null;
  tailNumber?: string | null;
  originIcao?: string | null;
  destinationIcao?: string | null;
  persistAircraft?: boolean;
}

export interface FlightComplianceContextResult {
  operatorId: string | null;
  operatorCountryCode: string | null;
  operatorType: Operator['operator_type'];
  aircraftTailNumber: string | null;
  aircraftRegistryCode: string | null;
  originCountryCode: string | null;
  destinationCountryCode: string | null;
  contextPayload: Record<string, any>;
}

let jurisdictionCache: Jurisdiction[] | undefined;

async function getJurisdictions(client: Client): Promise<Jurisdiction[]> {
  if (jurisdictionCache) return jurisdictionCache;
  const { data, error } = await table(client, TABLES.jurisdictions).select('*');
  if (error) {
    console.error('Failed to load jurisdictions:', error);
    jurisdictionCache = [];
    return jurisdictionCache;
  }
  jurisdictionCache = (data ?? []) as Jurisdiction[];
  return jurisdictionCache;
}

function normalize(text?: string | null): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  return trimmed.length ? trimmed : null;
}

async function lookupJurisdictionCode(client: Client, raw?: string | null): Promise<string | null> {
  const normalized = normalize(raw);
  if (!normalized) return null;

  const list = await getJurisdictions(client);
  const target = normalized.toLowerCase();

  const match = list.find((entry) => {
    if (entry.name.toLowerCase() === target) return true;
    if (entry.code.toLowerCase() === target) return true;
    return entry.alt_names.some((alias) => alias.toLowerCase() === target);
  });

  return match?.code ?? null;
}

async function findOperatorByName(client: Client, name?: string | null): Promise<Operator | null> {
  const normalized = normalize(name);
  if (!normalized) return null;

  const { data } = await table(client, TABLES.operators)
    .select('*')
    .ilike('name', normalized)
    .limit(1)
    .maybeSingle();

  return (data as Operator | null) ?? null;
}

async function getAirportCountryCode(client: Client, icao?: string | null): Promise<string | null> {
  const normalized = normalize(icao);
  if (!normalized) return null;

  const { data } = await table(client, TABLES.airports)
    .select('country')
    .eq('icao', normalized)
    .maybeSingle();

  const airport = data as { country: string | null } | null;
  if (!airport?.country) return null;
  return lookupJurisdictionCode(client, airport.country);
}

async function ensureAircraftRecord(
  client: Client,
  tailNumber: string,
  registryCode: string | null,
  operator: Operator | null,
  operatorName: string | null,
  persist: boolean
) {
  if (!persist) return;
  const updatePayload: Tables['aircraft']['Update'] = {
    operator_id: operator?.id ?? null,
    operator_name: operator?.name ?? operatorName,
    registry_country_code: registryCode,
  };

  const { data: existing } = await table(client, TABLES.aircraft)
    .select('tail_number')
    .eq('tail_number', tailNumber)
    .maybeSingle();

  const existingRecord = existing as Pick<AircraftRecord, 'tail_number'> | null;

  if (existingRecord) {
    await table(client, TABLES.aircraft)
      .update(updatePayload)
      .eq('tail_number', tailNumber);
  } else {
    const insertPayload: Tables['aircraft']['Insert'] = {
      tail_number: tailNumber,
      operator_id: updatePayload.operator_id ?? null,
      operator_name: updatePayload.operator_name ?? null,
      registry_country_code: updatePayload.registry_country_code ?? null,
      manufacturer: null,
      model: null,
      mtow_kg: null,
      equipment: {},
    };
    await table(client, TABLES.aircraft).insert(insertPayload);
  }
}

export async function buildFlightComplianceContext({
  supabase,
  operatorName,
  tailNumber,
  originIcao,
  destinationIcao,
  persistAircraft = true,
}: FlightComplianceContextOptions): Promise<FlightComplianceContextResult> {
  const operator = await findOperatorByName(supabase, operatorName);
  const operatorCountryCode = operator?.jurisdiction_code ?? operator?.country_code ?? null;
  const operatorType = operator?.operator_type ?? 'charter';

  const normalizedOperatorName = normalize(operatorName);

  const { tail, registryCountryCode } = describeRegistry(tailNumber);
  if (tail) {
    await ensureAircraftRecord(
      supabase,
      tail,
      registryCountryCode,
      operator,
      normalizedOperatorName,
      persistAircraft
    );
  }

  const [originCountryCode, destinationCountryCode] = await Promise.all([
    getAirportCountryCode(supabase, originIcao),
    getAirportCountryCode(supabase, destinationIcao),
  ]);

  const contextPayload = {
    operatorName: normalizedOperatorName,
    operatorId: operator?.id ?? null,
    operatorCountryCode,
    operatorType,
    tailNumber: tail,
    aircraftRegistryCode: registryCountryCode,
    originIcao: normalize(originIcao),
    destinationIcao: normalize(destinationIcao),
    originCountryCode,
    destinationCountryCode,
  } satisfies Record<string, any>;

  return {
    operatorId: operator?.id ?? null,
    operatorCountryCode,
    operatorType,
    aircraftTailNumber: tail,
    aircraftRegistryCode: registryCountryCode,
    originCountryCode,
    destinationCountryCode,
    contextPayload,
  };
}
