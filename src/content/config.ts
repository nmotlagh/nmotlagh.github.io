import { defineCollection, z } from 'astro:content';

export const collections = {
  pages: defineCollection({
    schema: z.object({
      title: z.string(),
      updated: z.string().optional(),
      items: z
        .array(
          z.object({
            role: z.string(),
            organization: z.string(),
            timeframe: z.string(),
            summary: z.string(),
          }),
        )
        .optional(),
    }),
  }),
  publications: defineCollection({
    schema: z.object({
      title: z.string(),
      venue: z.string().optional(),
      year: z.number(),
      authors: z.array(z.string()),
      doi: z.string().optional(),
      pdf: z.string().optional(),
      external: z.string().optional(),
    }),
  }),
};

