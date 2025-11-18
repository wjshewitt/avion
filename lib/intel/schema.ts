import { z } from 'zod';

export const StructuredIntelEntriesSchema = z.object({
  entries: z
    .array(
      z.object({
        category: z.string().min(1).max(64),
        field: z.string().min(1).max(64),
        summary: z.string().min(8).max(1500),
        value: z
          .union([
            z.string(),
            z.number(),
            z.boolean(),
            z.array(z.any()),
            z.record(z.string(), z.any()),
          ])
          .optional(),
        confidence: z.number().min(0).max(1).optional(),
        citations: z
          .array(
            z.object({
              title: z.string().optional(),
              url: z.string().url(),
              confidence: z.number().min(0).max(1).optional(),
            }),
          )
          .optional(),
      }),
    )
    .max(6),
});

export type StructuredIntelEntriesPayload = z.infer<typeof StructuredIntelEntriesSchema>;
