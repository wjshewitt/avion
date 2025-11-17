import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';

import { getAiRouterModelsConfig } from '@/lib/config/ai';
import { createAdminClient } from '@/lib/supabase/admin';
import type { IntelIngestionQueueRow } from '@/lib/supabase/types';
import { detectEntityFromQuery, extractIcaoCandidates, type EntityType } from '@/lib/intel/entity-detection';
import { persistAirportIntelEntries, persistOperatorIntelEntries, type StructuredIntelEntryInput } from '@/lib/intel/persistence';
import { StructuredIntelEntriesSchema, type StructuredIntelEntriesPayload } from '@/lib/intel/schema';

type AdminClient = ReturnType<typeof createAdminClient>;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!authorizeWorker(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Math.max(1, Math.min(5, Number(req.nextUrl.searchParams.get('limit')) || 3));
  const supabase = createAdminClient();

  const { data: queueItems, error } = await supabase
    .from('intel_ingestion_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!queueItems || queueItems.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No pending items' });
  }

  const results: Array<{ id: string; entries: number; entityType?: EntityType; entityId?: string }> = [];

  for (const item of queueItems) {
    await markQueueStatus(supabase, item.id, 'processing');
    try {
      const resolved = await resolveEntity(item, supabase);
      if (!resolved) {
        await markQueueStatus(supabase, item.id, 'skipped', 'Unable to resolve entity');
        continue;
      }

      const structured = await buildStructuredIntel(item, resolved);
      if (structured.entries.length === 0) {
        await markQueueStatus(supabase, item.id, 'skipped', 'No structured intel produced');
        continue;
      }

      if (resolved.entityType === 'airport') {
        await persistAirportIntelEntries(supabase, resolved.entityId, structured.entries);
      } else {
        await persistOperatorIntelEntries(supabase, resolved.entityId, structured.entries);
      }

      await markQueueStatus(supabase, item.id, 'completed');
      results.push({ id: item.id, entries: structured.entries.length, entityType: resolved.entityType, entityId: resolved.entityId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Intel ingestion failed:', message);
      await markQueueStatus(supabase, item.id, 'failed', message.slice(0, 300));
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

function authorizeWorker(req: NextRequest): boolean {
  const token = process.env.INTEL_WORKER_TOKEN;
  if (!token) {
    return true;
  }
  const header = req.headers.get('authorization');
  return header === `Bearer ${token}`;
}

async function markQueueStatus(
  supabase: AdminClient,
  id: string,
  status: IntelIngestionQueueRow['status'],
  failureReason?: string,
) {
  await supabase
    .from('intel_ingestion_queue')
    .update({ status, failure_reason: failureReason ?? null, processed_at: status === 'completed' ? new Date().toISOString() : null })
    .eq('id', id);
}

async function resolveEntity(
  item: IntelIngestionQueueRow,
  supabase: AdminClient,
): Promise<{ entityType: EntityType; entityId: string } | null> {
  if (item.entity_type === 'airport' && item.entity_id_guess) {
    const exists = await airportExists(supabase, item.entity_id_guess);
    if (exists) {
      return { entityType: 'airport', entityId: exists };
    }
  }

  if (item.entity_type === 'operator' && item.entity_id_guess) {
    const operator = await findOperatorBySlug(supabase, item.entity_id_guess);
    if (operator) {
      return { entityType: 'operator', entityId: operator };
    }
  }

  // Attempt to detect from query/payload
  const aggregatedText = buildSearchableText(item);
  const airportCandidates = extractIcaoCandidates(aggregatedText);
  for (const candidate of airportCandidates) {
    const exists = await airportExists(supabase, candidate);
    if (exists) {
      return { entityType: 'airport', entityId: exists };
    }
  }

  const detection = detectEntityFromQuery(item.query);
  if (detection.entityType === 'airport' && detection.entityIdGuess) {
    const exists = await airportExists(supabase, detection.entityIdGuess);
    if (exists) {
      return { entityType: 'airport', entityId: exists };
    }
  }

  const operatorId = await inferOperatorFromPayload(supabase, aggregatedText, item.exa_payload?.citations);
  if (operatorId) {
    return { entityType: 'operator', entityId: operatorId };
  }

  return null;
}

async function airportExists(supabase: AdminClient, icao: string): Promise<string | null> {
  const normalized = icao.toUpperCase();
  const { data } = await supabase
    .from('airports')
    .select('icao')
    .eq('icao', normalized)
    .maybeSingle();
  return data?.icao ?? null;
}

async function findOperatorBySlug(supabase: AdminClient, slug: string): Promise<string | null> {
  const normalized = slug.replace(/-/g, ' ');
  const { data } = await supabase
    .from('operators')
    .select('id')
    .ilike('name', `%${normalized}%`)
    .maybeSingle();
  return data?.id ?? null;
}

async function inferOperatorFromPayload(
  supabase: AdminClient,
  aggregatedText: string,
  citations: Array<{ url?: string | null }> | undefined,
): Promise<string | null> {
  if (!aggregatedText && (!citations || citations.length === 0)) {
    return null;
  }

  const tokens = Array.from(new Set(aggregatedText.toLowerCase().match(/([a-z]{4,})/g) || []));
  for (const token of tokens) {
    const { data } = await supabase
      .from('operators')
      .select('id')
      .ilike('name', `%${token}%`)
      .limit(1)
      .maybeSingle();
    if (data?.id) {
      return data.id;
    }
  }

  if (citations) {
    for (const citation of citations) {
      if (!citation?.url) continue;
      try {
        const hostname = new URL(citation.url).hostname.replace(/^www\./, '');
        const { data } = await supabase
          .from('operators')
          .select('id')
          .eq('domain', hostname)
          .maybeSingle();
        if (data?.id) {
          return data.id;
        }
      } catch {
        // ignore invalid URLs
      }
    }
  }

  return null;
}

function buildSearchableText(item: IntelIngestionQueueRow): string {
  const parts = [item.query];
  const answer = item.exa_payload?.answer || item.exa_payload?.summary;
  if (answer) parts.push(String(answer));
  const citations = Array.isArray(item.exa_payload?.citations)
    ? item.exa_payload.citations
    : [];
  for (const citation of citations) {
    if (citation?.title) parts.push(String(citation.title));
    if (citation?.text) parts.push(String(citation.text));
    if (citation?.url) parts.push(String(citation.url));
  }
  return parts.join(' \n ');
}

async function buildStructuredIntel(
  item: IntelIngestionQueueRow,
  resolved: { entityType: EntityType; entityId: string },
): Promise<{ entries: StructuredIntelEntryInput[] }> {
  const preStructured = coerceStructuredEntries(item.exa_payload?.structured_entries);
  if (preStructured) {
    return preStructured;
  }

  const aiConfig = getAiRouterModelsConfig();
  const prompt = buildPrompt(item, resolved);
  const { text } = await generateText({
    model: aiConfig.full.model,
    system:
      'You are an aviation data ingestion assistant. Convert EXA web search material into concise JSON facts. Respond ONLY with JSON matching {"entries":[{...}]}. Each entry should describe a single fact with a category, field, summary, optional structured value, confidence (0-1), and up to 3 citations.',
    prompt,
  });

  const parsed = safeParseStructured(text);
  const validated = StructuredIntelEntriesSchema.safeParse(parsed);
  if (!validated.success) {
    console.warn('Structured intel validation failed', validated.error.flatten());
    return { entries: [] };
  }

  const normalized: StructuredIntelEntryInput[] = validated.data.entries.map((entry) => ({
    category: entry.category,
    field: entry.field,
    summary: entry.summary,
    value: entry.value,
    confidence: entry.confidence,
    citations: entry.citations,
  }));

  return { entries: normalized };
}


function coerceStructuredEntries(raw: unknown): { entries: StructuredIntelEntryInput[] } | null {
  if (!raw) return null;
  const parsed = StructuredIntelEntriesSchema.safeParse({ entries: raw as StructuredIntelEntriesPayload['entries'] });
  if (!parsed.success) {
    return null;
  }
  const normalized: StructuredIntelEntryInput[] = parsed.data.entries.map((entry) => ({
    category: entry.category,
    field: entry.field,
    summary: entry.summary,
    value: entry.value,
    confidence: entry.confidence,
    citations: entry.citations,
  }));
  return { entries: normalized };
}
function buildPrompt(item: IntelIngestionQueueRow, resolved: { entityType: EntityType; entityId: string }) {
  const citations = Array.isArray(item.exa_payload?.citations)
    ? item.exa_payload.citations.slice(0, 6)
    : [];
  const citationText = citations
    .map((citation: any, index: number) => `Source ${index + 1}: title="${citation?.title || 'Untitled'}" url=${citation?.url || 'unknown'} snippet=${(citation?.text || '').slice(0, 400)}`)
    .join('\n');

  const summary = item.exa_payload?.answer || item.exa_payload?.summary || 'No summary available.';

  return `Entity Type: ${resolved.entityType}
Entity Identifier: ${resolved.entityId}
Original Query: ${item.query}
Existing Summary: ${summary}
Confidence Hint: ${item.entity_type} guess ${item.entity_id_guess ?? 'none'}
Citations:
${citationText || 'No citations provided'}

Output JSON with up to 6 entries. Categories can include fbo, operations, runway, fees, weather, fleet, general. Fields should be snake_case.
Example:
{"entries":[{"category":"fbo","field":"handling_services","summary":"Jet Aviation provides full-service handling","value":{"services":["fuel","hangar"]},"confidence":0.82,"citations":[{"title":"Jet Aviation Samedan","url":"https://www.jetaviation.com/samedan","confidence":0.9}]}]}`;
}

function safeParseStructured(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Model output did not contain JSON object');
  }
  const jsonText = text.slice(start, end + 1);
  return JSON.parse(jsonText);
}
