import Exa, { type AnswerResponse, type SearchResult } from 'exa-js';
import { z } from 'zod';

import { StructuredIntelEntriesSchema, type StructuredIntelEntriesPayload } from '@/lib/intel/schema';

const ExaCitationSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  title: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  publishedDate: z.string().nullable().optional(),
  text: z.string().optional(),
  image: z.string().url().optional(),
  favicon: z.string().url().optional(),
});

const ExaAnswerResponseSchema = z.object({
  answer: z.union([z.string(), z.record(z.string(), z.any())]).optional(),
  citations: z.array(ExaCitationSchema).optional(),
  costDollars: z
    .object({
      total: z.number().nullable().optional(),
    })
    .optional(),
});

export type ExaCitation = z.infer<typeof ExaCitationSchema>;

export interface ExaAnswerResult {
  summary: string;
  citations: AnswerCitation[];
  costUsd: number | null;
  raw: z.infer<typeof ExaAnswerResponseSchema>;
}

export interface AnswerCitation {
  id?: string;
  title: string | null;
  url: string;
  author: string | null;
  publishedDate: string | null;
}

export interface RunExaAnswerOptions {
  text?: boolean;
  systemPrompt?: string;
}

export interface ExaStructuredIntelResult {
  entries: StructuredIntelEntriesPayload['entries'];
}

type StructuredIntelCitation = StructuredIntelEntriesPayload['entries'][number]['citations'] extends (
  infer Item
)[]
  ? Item
  : { title?: string; url: string; confidence?: number };

let cachedClient: Exa | null = null;

function getClient(): Exa {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error('EXA_API_KEY is not set. Add it to your environment to enable web search.');
  }
  cachedClient = new Exa(apiKey);
  return cachedClient;
}

const DEFAULT_SYSTEM_PROMPT =
  'You are an aviation research assistant. Provide concise, factual responses with clear sourcing.';

export async function runExaAnswer(
  query: string,
  { text = false, systemPrompt }: RunExaAnswerOptions = {},
): Promise<ExaAnswerResult> {
  const client = getClient();
  let response: AnswerResponse;
  try {
    response = await client.answer(query, {
      text,
      systemPrompt: systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
    });
  } catch (error) {
    throw new Error(`EXA answer request failed: ${extractErrorMessage(error)}`);
  }

  const parsed = ExaAnswerResponseSchema.parse(response);
  const summary = typeof parsed.answer === 'string'
    ? parsed.answer
    : JSON.stringify(parsed.answer ?? {});

  return {
    summary: summary.trim() || 'No answer returned.',
    citations: mapAnswerCitations(parsed.citations),
    costUsd: parsed.costDollars?.total ?? null,
    raw: parsed,
  };
}

const STRUCTURED_INTEL_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    entries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          field: { type: 'string' },
          summary: { type: 'string' },
          value: {},
          confidence: { type: 'number' },
          citations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url: { type: 'string', format: 'uri' },
                confidence: { type: 'number' },
              },
            },
          },
        },
        required: ['category', 'field', 'summary'],
        additionalProperties: true,
      },
      maxItems: 6,
    },
  },
  required: ['entries'],
  additionalProperties: false,
} as const;

const STRUCTURED_INTEL_PROMPT =
  'Return up to six aviation intel facts as JSON. Focus on FBO services, runways, fees, fleet, and operations. Each fact needs meaningful summary text.';

export async function runExaStructuredAnswer(query: string): Promise<ExaStructuredIntelResult> {
  const client = getClient();
  let response: AnswerResponse;
  try {
    response = await client.answer(query, {
      text: true,
      systemPrompt: STRUCTURED_INTEL_PROMPT,
      outputSchema: STRUCTURED_INTEL_OUTPUT_SCHEMA,
    });
  } catch (error) {
    throw new Error(`EXA structured answer failed: ${extractErrorMessage(error)}`);
  }

  if (!response.answer || typeof response.answer !== 'object') {
    return { entries: [] };
  }

  const parsed = StructuredIntelEntriesSchema.safeParse(response.answer);
  if (!parsed.success) {
    throw new Error('Structured EXA response failed validation');
  }

  const fallbackCitations = mapAnswerCitations(response.citations);
  const entries = parsed.data.entries.map((entry) => ({
    ...entry,
    citations: entry.citations?.length
      ? entry.citations
      : fallbackCitations.slice(0, 3).map(convertAnswerCitationToSchema),
  }));

  return { entries };
}

type CitationLike = {
  id?: string | null;
  url: string;
  title?: string | null;
  author?: string | null;
  publishedDate?: string | null;
};

function mapAnswerCitations(
  citations?: Array<CitationLike | SearchResult<Record<string, unknown>>>
): AnswerCitation[] {
  return (citations ?? []).map((citation) => {
    const raw = citation as CitationLike;
    return {
      id: raw.id ?? undefined,
      title: raw.title ?? null,
      url: citation.url,
      author: raw.author ?? null,
      publishedDate: raw.publishedDate ?? null,
    } satisfies AnswerCitation;
  });
}

function convertAnswerCitationToSchema(citation: AnswerCitation): StructuredIntelCitation {
  return {
    title: citation.title ?? undefined,
    url: citation.url,
  };
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}
