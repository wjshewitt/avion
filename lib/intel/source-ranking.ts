import { createHash } from 'node:crypto';

export interface CitationLike {
  title?: string | null;
  url?: string | null;
  confidence?: number | null;
}

export function inferSourceRank(url?: string | null): number {
  if (!url) return 0.5;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (/(?:\.gov|\.mil|\.aero)$/.test(hostname) || hostname.includes('airport')) {
      return 1.0;
    }
    if (hostname.includes('vista') || hostname.includes('netjets') || hostname.includes('operator')) {
      return 0.9;
    }
    if (hostname.includes('wikipedia.org')) {
      return 0.7;
    }
    if (hostname.includes('aviation') || hostname.includes('flightglobal') || hostname.includes('ainonline')) {
      return 0.65;
    }
    if (hostname.includes('blogspot') || hostname.includes('medium.com')) {
      return 0.4;
    }
    return 0.55;
  } catch {
    return 0.5;
  }
}

export function calculateSourceRank(
  citations: CitationLike[] | undefined,
  fallbackConfidence = 0.5
): number {
  if (!citations || citations.length === 0) {
    return fallbackConfidence;
  }

  let best = 0;
  for (const citation of citations) {
    const rank = inferSourceRank(citation.url) * (citation.confidence ?? 1);
    if (rank > best) {
      best = rank;
    }
  }

  return Math.max(best, fallbackConfidence);
}

export function buildIntelDedupeHash(
  entityType: 'airport' | 'operator',
  entityId: string,
  field: string,
  value: unknown
): string {
  const hash = createHash('sha256');
  const normalizedValue = sanitizeValue(value);
  const normalizedField = field.trim().toLowerCase().replace(/\s+/g, '_');
  hash.update(entityType);
  hash.update(':');
  hash.update(entityId.toUpperCase());
  hash.update(':');
  hash.update(normalizedField);
  hash.update(':');
  hash.update(JSON.stringify(normalizedValue));
  return hash.digest('hex');
}

export function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item));
  }
  if (typeof value === 'object') {
    const record: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      record[key] = sanitizeValue(val);
    });
    return record;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return String(value).slice(0, 2000);
}
