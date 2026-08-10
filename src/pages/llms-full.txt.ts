import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { SITE_URL, faq, person } from '../data/site';
import { researchResults } from '../data/editorial';
import { parseDateValue } from '../utils/dates';

/** Strip inline HTML that the site uses for emphasis inside content strings. */
const plain = (value: string) => value.replace(/<[^>]+>/g, '');

/**
 * The whole site as one Markdown document. An agent that wants the full picture
 * can read this instead of crawling a dozen pages.
 */
export const GET: APIRoute = async () => {
  const about = await getEntry('pages', 'about');
  const experience = await getEntry('pages', 'experience');
  const publications = (await getCollection('publications', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.year - a.data.year,
  );
  const artifacts = (await getCollection('artifacts')).sort((a, b) =>
    a.data.name.localeCompare(b.data.name),
  );
  const news = (await getCollection('news', ({ data }) => !data.draft)).sort(
    (a, b) => parseDateValue(b.data.date).getTime() - parseDateValue(a.data.date).getTime(),
  );

  const sections: string[] = [];

  sections.push(`# ${person.name} — full site text

Source: ${SITE_URL}/ · Generated ${new Date().toISOString().slice(0, 10)}
`);

  sections.push(`## About\n\n${about?.body.trim() ?? ''}`);

  sections.push(`## Research

${researchResults
  .map(
    (result) => `### ${result.index}. ${result.title} (${result.actionLabel})

Question: ${result.question}
Venue: ${result.venue}

Problem: ${result.problem}

Approach: ${result.built}

Headline result: ${result.headline} — ${result.headlineLabel}

${
      result.chart
        ? `${result.chart.bars
            .map((bar) => `- ${bar.label}: ${bar.display} (${result.chart!.axisLabel})`)
            .join('\n')}

${result.chart.caption}

`
        : ''
    }${result.detail}`,
  )
  .join('\n\n')}`);

  sections.push(`## Publications

${publications
  .map((entry) => {
    const linkLines = [
      entry.data.doi && `DOI: https://doi.org/${entry.data.doi}`,
      entry.data.pdf && `PDF: ${entry.data.pdf}`,
      entry.data.arxiv && `arXiv: ${entry.data.arxiv}`,
      entry.data.code && `Code: ${entry.data.code}`,
      entry.data.external && `Publisher page: ${entry.data.external}`,
    ].filter(Boolean);

    return `### ${entry.data.title}

Authors: ${entry.data.authors.join(', ')}
Venue: ${entry.data.venue} (${entry.data.year})${entry.data.award ? `\nAward: ${entry.data.award}` : ''}
Page: ${SITE_URL}/publications/${entry.slug}/
BibTeX: ${SITE_URL}/publications/${entry.slug}.bib
${linkLines.join('\n')}

Summary: ${entry.data.tldr}

${entry.data.highlights?.map((item) => `- ${item}`).join('\n') ?? ''}

${entry.body.trim()}`;
  })
  .join('\n\n---\n\n')}`);

  const education = experience?.data.education ?? [];
  const service = experience?.data.service ?? [];
  const roles = experience?.data.items ?? [];

  sections.push(`## Education

${education
  .map(
    (item) =>
      `### ${item.degree} in ${item.field}\n\n${item.institution}${item.location ? `, ${item.location}` : ''} · ${item.timeframe}\n${(item.notes ?? []).map((note) => `- ${plain(note)}`).join('\n')}`,
  )
  .join('\n\n')}`);

  sections.push(`## Experience

${roles
  .map(
    (item) =>
      `### ${item.role}\n\n${item.location ? `${item.location} · ` : ''}${item.timeframe}\n${(item.bullets ?? []).map((bullet) => `- ${plain(bullet)}`).join('\n')}`,
  )
  .join('\n\n')}`);

  if (service.length > 0) {
    sections.push(`## Professional service

${service.map((item) => `- ${item.role}: ${item.venues.join(', ')}`).join('\n')}`);
  }

  sections.push(`## Code and data

${artifacts
  .map(
    (entry) =>
      `### ${entry.data.name}\n\n${entry.data.repo}\n\n${entry.data.summary}\n\nStack: ${(entry.data.stack ?? []).join(', ')}\n\nWhat the repository does:\n${entry.data.reproduce.map((step) => `- ${step}`).join('\n')}`,
  )
  .join('\n\n')}`);

  sections.push(`## Frequently asked questions

${faq.map((item) => `### ${item.question}\n\n${item.answer}`).join('\n\n')}`);

  sections.push(`## News

${news.map((item) => `- ${item.data.date}: ${item.data.title}`).join('\n')}`);

  return new Response(`${sections.join('\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
