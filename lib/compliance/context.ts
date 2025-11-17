import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AircraftRecord,
  AirportRow,
  Database,
  Jurisdiction,
  Operator,
} from '@/lib/supabase/types';
import { describeRegistry } from '@/lib/aircraft/registry';

type Client = SupabaseClient<Database>;

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

let jurisdictionCache: Jurisdiction[] | null = null;

async function getJurisdictions(client: Client): Promise<Jurisdiction[]> {
  if (jurisdictionCache) return jurisdictionCache;
  const { data } = await client.from<Jurisdiction>('jurisdictions').select('*');
  jurisdictionCache = data ?? [];
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

  const { data } = await client
    .from<Operator>('operators')
    .select('*')
    .ilike('name', normalized)
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

async function getAirportCountryCode(client: Client, icao?: string | null): Promise<string | null> {
  const normalized = normalize(icao);
  if (!normalized) return null;

  const { data } = await client
    .from<Pick<AirportRow, 'country'>>('airports')
    .select('country')
    .eq('icao', normalized)
    .maybeSingle();

  if (!data?.country) return null;
  return lookupJurisdictionCode(client, data.country);
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
  const updatePayload: Partial<AircraftRecord> = {
    operator_id: operator?.id ?? null,
    operator_name: operator?.name ?? operatorName,
    registry_country_code: registryCode,
  };

  const { data: existing } = await client
    .from<Pick<AircraftRecord, 'tail_number'>>('aircraft')
    .select('tail_number')
    .eq('tail_number', tailNumber)
    .maybeSingle();

  if (existing) {
    await client
      .from('aircraft')
      .update(updatePayload)
      .eq('tail_number', tailNumber);
  } else {
    await client
      .from('aircraft')
      .insert({
        tail_number: tailNumber,
        manufacturer: null,
        model: null,
        mtow_kg: null,
        equipment: {},
        ...updatePayload,
      });
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
