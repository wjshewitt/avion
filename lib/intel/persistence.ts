import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { CitationLike } from './source-ranking';
import { buildIntelDedupeHash, calculateSourceRank, sanitizeValue, inferSourceRank } from './source-ranking';

export interface StructuredIntelEntryInput {
  category: string;
  field: string;
  summary: string;
  value?: unknown;
  confidence?: number;
  citations?: CitationLike[];
  source_type?: string;
  source_label?: string;
}

type AdminSupabase = SupabaseClient<Database, 'public'>;
type Tables = Database['public']['Tables'];
type AirportIntelInsert = Tables['airport_intel_entries']['Insert'];
type AirportIntelRow = Tables['airport_intel_entries']['Row'];
type OperatorIntelInsert = Tables['operator_intel_entries']['Insert'];
type OperatorIntelRow = Tables['operator_intel_entries']['Row'];
type AirportsUpdate = Tables['airports']['Update'];

export async function persistAirportIntelEntries(
  supabase: AdminSupabase,
  airportIcao: string,
  entries: StructuredIntelEntryInput[],
): Promise<number> {
  let upserts = 0;
  for (const entry of entries) {
    const normalizedField = normalizeField(entry.field);
    const dedupeHash = buildIntelDedupeHash('airport', airportIcao, normalizedField, entry.value ?? entry.summary);
    const sourceRank = calculateSourceRank(entry.citations, entry.confidence ?? 0.5);
    const payload: AirportIntelInsert = {
      airport_icao: airportIcao,
      category: entry.category || 'general',
      field: normalizedField,
      summary: entry.summary,
      value: normalizeStoredValue(entry.value ?? entry.summary),
      confidence: entry.confidence ?? null,
      source_rank: sourceRank,
      source_type: entry.source_type ?? inferPrimarySourceType(entry.citations),
      source_label: entry.source_label ?? entry.citations?.[0]?.title ?? null,
      source_url: entry.citations?.[0]?.url ?? null,
      dedupe_hash: dedupeHash,
    };

    const existing = await (supabase.from('airport_intel_entries') as any)
      .select('id, source_rank')
      .eq('dedupe_hash', dedupeHash)
      .maybeSingle();

    if (existing.error) {
      console.error('Failed to read airport intel entry', existing.error);
      continue;
    }

    const existingRow = existing.data as Pick<AirportIntelRow, 'id' | 'source_rank'> | null;
    const shouldUpdate = existingRow && (existingRow.source_rank ?? 0) <= sourceRank;

    let entryId = existingRow?.id ?? null;

    if (!existingRow) {
      const insertResult = await (supabase.from('airport_intel_entries') as any)
        .insert(payload)
        .select('id')
        .single();

      if (insertResult.error) {
        console.error('Failed to insert airport intel entry', insertResult.error);
        continue;
      }
      entryId = (insertResult.data as Pick<AirportIntelRow, 'id'>).id;
      upserts++;
    } else if (shouldUpdate) {
      const updateResult = await (supabase.from('airport_intel_entries') as any)
        .update(payload)
        .eq('id', existingRow.id)
        .select('id')
        .single();

      if (updateResult.error) {
        console.error('Failed to update airport intel entry', updateResult.error);
        continue;
      }
      entryId = (updateResult.data as Pick<AirportIntelRow, 'id'>).id;
      upserts++;
    }

    if (entryId) {
      await replaceCitations(supabase, 'airport_intel_citations', entryId, entry.citations ?? []);
      await maybeUpdateAirportColumn(supabase, airportIcao, normalizedField, entry.summary, sourceRank);
    }
  }

  return upserts;
}

export async function persistOperatorIntelEntries(
  supabase: AdminSupabase,
  operatorId: string,
  entries: StructuredIntelEntryInput[],
): Promise<number> {
  let upserts = 0;
  for (const entry of entries) {
    const normalizedField = normalizeField(entry.field);
    const dedupeHash = buildIntelDedupeHash('operator', operatorId, normalizedField, entry.value ?? entry.summary);
    const sourceRank = calculateSourceRank(entry.citations, entry.confidence ?? 0.5);
    const payload: OperatorIntelInsert = {
      operator_id: operatorId,
      category: entry.category || 'general',
      field: normalizedField,
      summary: entry.summary,
      value: normalizeStoredValue(entry.value ?? entry.summary),
      confidence: entry.confidence ?? null,
      source_rank: sourceRank,
      source_type: entry.source_type ?? inferPrimarySourceType(entry.citations),
      source_label: entry.source_label ?? entry.citations?.[0]?.title ?? null,
      source_url: entry.citations?.[0]?.url ?? null,
      dedupe_hash: dedupeHash,
    };

    const existing = await (supabase.from('operator_intel_entries') as any)
      .select('id, source_rank')
      .eq('dedupe_hash', dedupeHash)
      .maybeSingle();

    if (existing.error) {
      console.error('Failed to read operator intel entry', existing.error);
      continue;
    }

    const existingRow = existing.data as Pick<OperatorIntelRow, 'id' | 'source_rank'> | null;
    const shouldUpdate = existingRow && (existingRow.source_rank ?? 0) <= sourceRank;

    let entryId = existingRow?.id ?? null;

    if (!existingRow) {
      const insertResult = await (supabase.from('operator_intel_entries') as any)
        .insert(payload)
        .select('id')
        .single();

      if (insertResult.error) {
        console.error('Failed to insert operator intel entry', insertResult.error);
        continue;
      }
      entryId = (insertResult.data as Pick<OperatorIntelRow, 'id'>).id;
      upserts++;
    } else if (shouldUpdate) {
      const updateResult = await (supabase.from('operator_intel_entries') as any)
        .update(payload)
        .eq('id', existingRow.id)
        .select('id')
        .single();

      if (updateResult.error) {
        console.error('Failed to update operator intel entry', updateResult.error);
        continue;
      }
      entryId = (updateResult.data as Pick<OperatorIntelRow, 'id'>).id;
      upserts++;
    }

    if (entryId) {
      await replaceCitations(supabase, 'operator_intel_citations', entryId, entry.citations ?? []);
    }
  }

  return upserts;
}

async function replaceCitations(
  supabase: AdminSupabase,
  table: 'airport_intel_citations' | 'operator_intel_citations',
  entryId: string,
  citations: CitationLike[],
) {
  const citationTable = supabase.from(table) as any;
  await citationTable.delete().eq('intel_entry_id', entryId);
  if (!citations.length) return;

  const rows = citations.slice(0, 5).map((citation) => ({
    intel_entry_id: entryId,
    title: citation.title ?? null,
    url: citation.url ?? '',
    confidence: citation.confidence ?? null,
    ranking: inferSourceRank(citation.url ?? undefined),
  }));

  await citationTable.insert(rows);
}

async function maybeUpdateAirportColumn(
  supabase: AdminSupabase,
  airportIcao: string,
  field: string,
  summary: string,
  sourceRank: number,
) {
  if (field !== 'fbo_overview' || !summary) {
    return;
  }

  if (sourceRank < 0.5) {
    return;
  }

  const updatePayload: AirportsUpdate = {
    fbo_overview: summary,
    intel_updated_at: new Date().toISOString(),
  };

  await (supabase.from('airports') as any)
    .update(updatePayload)
    .eq('icao', airportIcao);
}

function inferPrimarySourceType(citations?: CitationLike[]): string | null {
  if (!citations || citations.length === 0) {
    return null;
  }
  const url = citations[0].url ?? '';
  if (url.includes('wikipedia.org')) return 'reference';
  if (url.includes('.gov') || url.includes('airport')) return 'official';
  return 'web';
}

function normalizeField(field: string): string {
  return field.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 120);
}

function normalizeStoredValue(value: unknown): Record<string, any> | null {
  const sanitized = sanitizeValue(value);
  if (sanitized === null || typeof sanitized === 'object') {
    return sanitized as Record<string, any> | null;
  }
  return { value: sanitized };
}
