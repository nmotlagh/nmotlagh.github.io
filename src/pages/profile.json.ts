import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { SITE_URL, faq, knowsAbout, links, person } from '../data/site';
import { skillGroups } from '../data/editorial';
import { parseDateValue } from '../utils/dates';

/** Strip the inline HTML and Markdown emphasis used in the source content. */
const plain = (value: string) =>
  value.replace(/<[^>]+>/g, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');

/**
 * A flat, stable JSON view of the profile. Cheaper for a tool-using agent to
 * consume than parsing HTML or JSON-LD out of a page.
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

  const profile = {
    $schema: 'https://schema.org/Person',
    generated: new Date().toISOString().slice(0, 10),
    canonical: `${SITE_URL}/`,
    name: person.name,
    formalName: person.formalName,
    headline: person.headline,
    summary: plain(about?.body.trim().split('\n\n')[0] ?? ''),
    location: person.location,
    email: person.email,
    citizenship: person.citizenship,
    currentRole: {
      title: 'Technical Analyst II',
      organization: 'DCS Corp (AFRL-sponsored)',
      since: '2025-05',
    },
    availability: {
      status: 'open to offers',
      availableFrom: person.availableFrom,
      seeking: [...person.seeking],
      remote: true,
      willingToRelocate: true,
      note: 'Best fit: LLM evaluation, calibration, retrieval-augmented systems, reliability infrastructure. U.S. federal roles welcome.',
    },
    links,
    education: (experience?.data.education ?? []).map((item) => ({
      degree: item.degree,
      field: item.field,
      institution: item.institution,
      location: item.location,
      timeframe: item.timeframe,
      completed: item.completed,
      notes: (item.notes ?? []).map(plain),
    })),
    experience: (experience?.data.items ?? []).map((item) => ({
      role: item.role,
      location: item.location,
      timeframe: item.timeframe,
      highlights: (item.bullets ?? []).map(plain),
    })),
    service: experience?.data.service ?? [],
    awards: [
      {
        name: 'Springer Best Paper Award',
        venue: 'ISVC 2022',
        for: 'Learning When to Say "I Don\'t Know"',
      },
    ],
    publications: publications.map((entry) => ({
      title: entry.data.title,
      authors: entry.data.authors,
      venue: entry.data.venue,
      year: entry.data.year,
      status: entry.data.citation?.type === 'unpublished' ? 'under review' : 'peer-reviewed',
      award: entry.data.award,
      doi: entry.data.doi,
      url: `${SITE_URL}/publications/${entry.slug}/`,
      markdown: `${SITE_URL}/publications/${entry.slug}.md`,
      bibtex: `${SITE_URL}/publications/${entry.slug}.bib`,
      pdf: entry.data.pdf,
      arxiv: entry.data.arxiv,
      code: entry.data.code,
      summary: entry.data.tldr,
      tags: entry.data.tags ?? [],
    })),
    repositories: artifacts.map((entry) => ({
      name: entry.data.name,
      url: entry.data.repo,
      summary: entry.data.summary,
      stack: entry.data.stack ?? [],
    })),
    skills: Object.fromEntries(skillGroups.map((group) => [group.label.toLowerCase(), group.items])),
    researchInterests: [...knowsAbout],
    news: news.map((item) => ({ date: item.data.date, title: item.data.title })),
    faq,
    resources: {
      cv: `${SITE_URL}/resume.pdf`,
      llms: `${SITE_URL}/llms.txt`,
      llmsFull: `${SITE_URL}/llms-full.txt`,
      bibtex: `${SITE_URL}/citations.bib`,
      rss: `${SITE_URL}/rss.xml`,
      sitemap: `${SITE_URL}/sitemap-index.xml`,
    },
  };

  return new Response(JSON.stringify(profile, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
