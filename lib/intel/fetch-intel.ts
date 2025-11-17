import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export interface IntelCitationsResponse {
  title?: string | null;
  url: string;
  confidence?: number | null;
  ranking?: number | null;
}

export interface IntelEntryResponse {
  id: string;
  category: string;
  field: string;
  summary: string | null;
  value: unknown;
  confidence: number | null;
  source_rank: number;
  source_type: string | null;
  source_label: string | null;
  source_url: string | null;
  citations: IntelCitationsResponse[];
}

type Client = SupabaseClient<Database>;

export async function fetchAirportIntel(
  supabase: Client,
  icao: string,
  limit = 20,
): Promise<IntelEntryResponse[]> {
  const { data, error } = await supabase
    .from('airport_intel_entries')
    .select(
      `id, category, field, summary, value, confidence, source_rank, source_type, source_label, source_url,
        citations:airport_intel_citations (title, url, confidence, ranking)`
    )
    .eq('airport_icao', icao)
    .order('source_rank', { ascending: false })
    .order('confidence', { ascending: false, nullsLast: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((entry) => ({
    id: entry.id,
    category: entry.category,
    field: entry.field,
    summary: entry.summary,
    value: entry.value,
    confidence: entry.confidence,
    source_rank: entry.source_rank,
    source_type: entry.source_type,
    source_label: entry.source_label,
    source_url: entry.source_url,
    citations: entry.citations || [],
  }));
}

export async function fetchOperatorIntel(
  supabase: Client,
  operatorId: string,
  limit = 20,
): Promise<IntelEntryResponse[]> {
  const { data, error } = await supabase
    .from('operator_intel_entries')
    .select(
      `id, category, field, summary, value, confidence, source_rank, source_type, source_label, source_url,
        citations:operator_intel_citations (title, url, confidence, ranking)`
    )
    .eq('operator_id', operatorId)
    .order('source_rank', { ascending: false })
    .order('confidence', { ascending: false, nullsLast: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((entry) => ({
    id: entry.id,
    category: entry.category,
    field: entry.field,
    summary: entry.summary,
    value: entry.value,
    confidence: entry.confidence,
    source_rank: entry.source_rank,
    source_type: entry.source_type,
    source_label: entry.source_label,
    source_url: entry.source_url,
    citations: entry.citations || [],
  }));
}
