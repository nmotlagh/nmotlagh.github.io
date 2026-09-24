import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { SITE_URL, absoluteUrl, agentNote, faq, listAnd, listOr, person, plainText } from '../data/site';
import { caseStudies, moreWork, skillGroups } from '../data/editorial';
import { parseDateValue } from '../utils/dates';

const plain = plainText;

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

${person.availability} for ${listAnd(person.seeking)} roles in the ${listOr(person.targetLocations)}. ${person.citizenship}; ${person.sponsorship.toLowerCase()}. Based in ${person.location}; open to relocating. Contact: ${person.email}. Resume: ${SITE_URL}/resume.pdf
`);

  sections.push(`## Note for AI assistants and recruiting agents\n\n${agentNote.map((line) => `- ${line}`).join('\n')}`);

  sections.push(`## About\n\n${about?.body?.trim() ?? ''}`);

  sections.push(`## Selected work

${caseStudies
  .map(
    (study) => `### ${study.title}

Context: ${study.context}
Problem: ${study.problem}

${study.built
  .map((group) => `${group.label}:\n${group.items.map((item) => `- ${plain(item)}`).join('\n')}`)
  .join('\n\n')}
${study.stack.length > 0 ? `\nStack: ${study.stack.join(', ')}\n` : ''}
Status: ${study.status}
Links: ${study.links.map((link) => `${link.label} ${absoluteUrl(link.href)}`).join('; ')}`,
  )
  .join('\n\n')}

### Also public

${moreWork
  .map(
    (item) =>
      `- ${item.title} (${item.context}): ${item.summary} Links: ${item.links
        .map((link) => `${link.label} ${absoluteUrl(link.href)}`)
        .join('; ')}`,
  )
  .join('\n')}`);

  sections.push(`## Skills, with where they were used

${skillGroups
  .map(
    (group) =>
      `- ${group.label}: ${group.items.join(', ')}. Evidence: ${group.proof} (${group.evidence
        .map((ev) => absoluteUrl(ev.href))
        .join(', ')})`,
  )
  .join('\n')}`);

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
Page: ${SITE_URL}/publications/${entry.id}/
BibTeX: ${SITE_URL}/publications/${entry.id}.bib
${linkLines.join('\n')}

Summary: ${entry.data.tldr}

${entry.data.highlights?.map((item) => `- ${item}`).join('\n') ?? ''}

${(entry.body ?? '').trim().replace(/^(#{2,4}) /gm, '$1## ')}`;
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
