import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
  schema: z.object({
    title: z.string(),
    updated: z.string().optional(),
    intro: z.string().optional(),
    items: z
      .array(
        z.object({
          role: z.string(),
          location: z.string().optional(),
          timeframe: z.string(),
          bullets: z.array(z.string()).optional(),
          organization: z.string().optional(),
          summary: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

const publications = defineCollection({
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    year: z.number(),
    authors: z.array(z.string()),
    tldr: z.string().max(200),
    highlight: z.boolean().optional().default(false),
    award: z.string().optional(),
    metric: z.string().optional(),
    doi: z.string().optional(),
    datePublished: z.string().optional(),
    pdf: z.string().url().optional(),
    arxiv: z.string().url().optional(),
    code: z.string().url().optional(),
    data: z.string().url().optional(),
    slides: z.string().url().optional(),
    external: z.string().url().optional(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    highlights: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const news = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    date: z.string(), // ISO 8601
    link: z.string().url().optional(),
  }),
});

const artifacts = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    repo: z.string().url(),
    summary: z.string(),
    reproduce: z.array(z.string()),
    tiesTo: z.array(z.string()).default([]),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().max(200),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { pages, publications, news, artifacts, blog };
