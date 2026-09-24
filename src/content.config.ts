import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const hrefSchema = z.string().refine((value) => value.startsWith('/') || /^https?:\/\//.test(value), {
  error: 'Expected an absolute URL or a root-relative path.',
});

// Entry ids come from the file names (kebab-case), matching the legacy slugs,
// so every URL built from `entry.id` is unchanged. Files starting with `_` are
// skipped, as they were under the legacy collections API.
const markdownEntries = (collection: string) =>
  glob({ pattern: '**/[^_]*.{md,mdx}', base: `./src/content/${collection}` });
const jsonEntries = (collection: string) =>
  glob({ pattern: '**/[^_]*.json', base: `./src/content/${collection}` });

const pages = defineCollection({
  loader: markdownEntries('pages'),
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
    education: z
      .array(
        z.object({
          degree: z.string(),
          field: z.string(),
          institution: z.string(),
          location: z.string().optional(),
          timeframe: z.string(),
          /** ISO year the degree was or will be conferred. Drives JSON-LD. */
          completed: z.string(),
          notes: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    service: z
      .array(
        z.object({
          role: z.string(),
          venues: z.array(z.string()),
        }),
      )
      .optional(),
  }),
});

const publications = defineCollection({
  loader: markdownEntries('publications'),
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    year: z.number(),
    authors: z.array(z.string()),
    tldr: z.string().max(200),
    draft: z.boolean().optional().default(false),
    highlight: z.boolean().optional().default(false),
    award: z.string().optional(),
    metric: z.string().optional(),
    doi: z.string().optional(),
    datePublished: z.string().optional(),
    pdf: z.url().optional(),
    arxiv: z.url().optional(),
    code: z.url().optional(),
    data: z.url().optional(),
    slides: z.url().optional(),
    external: z.url().optional(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    highlights: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    /** Everything needed to emit a correct BibTeX entry. */
    citation: z
      .object({
        type: z.enum(['inproceedings', 'article', 'unpublished']),
        key: z.string(),
        booktitle: z.string().optional(),
        journal: z.string().optional(),
        publisher: z.string().optional(),
        volume: z.string().optional(),
        number: z.string().optional(),
        pages: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
  }),
});

const news = defineCollection({
  loader: jsonEntries('news'),
  schema: z.object({
    title: z.string(),
    date: z.string(), // ISO 8601
    draft: z.boolean().optional().default(false),
    link: hrefSchema.optional(),
  }),
});

const artifacts = defineCollection({
  loader: jsonEntries('artifacts'),
  schema: z.object({
    name: z.string(),
    repo: z.url(),
    summary: z.string(),
    stack: z.array(z.string()).optional(),
    reproduce: z.array(z.string()),
    tiesTo: z.array(z.string()).default([]),
  }),
});

export const collections = { pages, publications, news, artifacts };
