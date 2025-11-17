import { createAdminClient } from '@/lib/supabase/admin';
import type { StructuredIntelEntriesPayload } from '@/lib/intel/schema';
import type { EntityDetectionResult } from './entity-detection';

export interface IntelQueueInput {
  query: string;
  composedQuery?: string;
  reason?: string;
  context?: string;
  rawResult: Record<string, any>;
  detection: EntityDetectionResult;
  requestedBy?: string;
  structuredEntries?: StructuredIntelEntriesPayload['entries'];
}

export async function enqueueIntelCandidate(input: IntelQueueInput): Promise<void> {
  const hasAdminKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasAdminKey) {
    return;
  }

  try {
    const supabase = createAdminClient();
    const payload = {
      entity_type: input.detection.entityType,
      entity_id_guess: input.detection.entityIdGuess ?? null,
      query: buildStoredQuery(input),
      exa_payload: {
        ...input.rawResult,
        structured_entries: input.structuredEntries ?? null,
      },
      requested_by: input.requestedBy ?? null,
    };

    await supabase.from('intel_ingestion_queue').insert(payload);
  } catch (error) {
    console.warn('⚠️ Failed to enqueue intel ingestion job:', error);
  }
}

function buildStoredQuery(input: IntelQueueInput): string {
  const pieces = [input.query];
  if (input.context) {
    pieces.push(`Context: ${input.context}`);
  }
  if (input.reason) {
    pieces.push(`Reason: ${input.reason}`);
  }
  if (input.composedQuery && input.composedQuery !== input.query) {
    pieces.push(`Composed: ${input.composedQuery}`);
  }
  return pieces.join('\n');
}
