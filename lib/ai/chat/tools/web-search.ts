import { tool } from 'ai';
import { z } from 'zod';
import { runExaAnswer, runExaStructuredAnswer } from '@/lib/ai/chat/exa-client';
import type { StructuredIntelEntriesPayload } from '@/lib/intel/schema';
import { detectEntityFromQuery } from '@/lib/intel/entity-detection';
import { enqueueIntelCandidate } from '@/lib/intel/ingestion-queue';

const WebSearchInputSchema = z.object({
  query: z
    .string()
    .min(4, 'Query must be at least 4 characters long')
    .max(512, 'Query must be fewer than 512 characters')
    .describe('Search query to run when aviation data and internal knowledge are insufficient'),
  reason: z
    .string()
    .max(280, 'Reason must be fewer than 280 characters')
    .optional()
    .describe('Short explanation for why web search is required'),
  context: z
    .string()
    .max(1024, 'Context must be fewer than 1024 characters')
    .optional()
    .describe('Additional context to include in the search prompt'),
});

function formatCitations(citations: Array<{
  title?: string;
  url: string;
  author?: string | null;
  publishedDate?: string | null;
}>): string {
  if (citations.length === 0) return '';

  const formattedList = citations
    .map((citation, index) => {
      const title = citation.title || 'Untitled';
      const metadata: string[] = [];
      
      if (citation.author) metadata.push(citation.author);
      if (citation.publishedDate) metadata.push(citation.publishedDate);
      
      const metadataStr = metadata.length > 0 ? ` • ${metadata.join(' | ')}` : '';
      
      return `${index + 1}. [${title}](${citation.url})${metadataStr}`;
    })
    .join('\n');

  return `\n\n**Sources:**\n${formattedList}`;
}

export function buildWebSearchTool(userId?: string) {
  return tool({
    description:
      'Perform a live EXA web search for up-to-date facts when internal data or aviation tools cannot answer the question. Use only when absolutely necessary.',
    inputSchema: WebSearchInputSchema,
    execute: async ({ query, reason, context }) => {
      const composedQuery = context ? `${query}\n\nContext: ${context}` : query;
      console.log('🌐 Executing web_search', { query: composedQuery, reason });

      const result = await runExaAnswer(composedQuery.trim());
      let structuredEntries: StructuredIntelEntriesPayload['entries'] | undefined;
      try {
        const structured = await runExaStructuredAnswer(composedQuery.trim());
        structuredEntries = structured.entries.length > 0 ? structured.entries : undefined;
      } catch (error) {
        console.warn('⚠️ Structured EXA answer unavailable:', error);
      }
      const timestamp = new Date().toISOString();
      const formattedCitations = formatCitations(result.citations);

      void enqueueIntelCandidateSafe({
        query,
        composedQuery,
        reason,
        context,
        rawResult: result.raw ?? { summary: result.summary, citations: result.citations },
        userId,
        structuredEntries,
      });

      return {
        summary: result.summary,
        citations: formattedCitations,
        citationCount: result.citations.length,
        costUsd: result.costUsd,
        timestamp,
        _source: {
          type: 'tool',
          tool: 'web_search',
          timestamp,
          description: `EXA web search for "${query}"`,
          references: result.citations.map((citation, index) => ({
            label: citation.title || citation.url,
            url: citation.url,
            index: index + 1,
          })),
        },
      } as const;
    },
  });
}

function enqueueIntelCandidateSafe(params: {
  query: string;
  composedQuery: string;
  reason?: string;
  context?: string;
  rawResult: Record<string, any>;
  userId?: string;
  structuredEntries?: StructuredIntelEntriesPayload['entries'];
}) {
  try {
    const detection = detectEntityFromQuery(params.query);
    void enqueueIntelCandidate({
      query: params.query,
      composedQuery: params.composedQuery,
      reason: params.reason,
      context: params.context,
      rawResult: params.rawResult,
      structuredEntries: params.structuredEntries,
      detection,
      requestedBy: params.userId,
    });
  } catch (error) {
    console.warn('⚠️ Failed to enqueue EXA intel candidate:', error);
  }
}
