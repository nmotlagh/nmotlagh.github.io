import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { SITE_URL, absoluteUrl, faq, knowsAbout, links, person, plainText } from '../data/site';
import { caseStudies, moreWork, skillGroups } from '../data/editorial';
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
    reviewed: person.updated,
    canonical: `${SITE_URL}/`,
    name: person.name,
    formalName: person.formalName,
    headline: person.headline,
    summary: plain(about?.body?.trim().split('\n\n')[0] ?? ''),
    location: person.location,
    email: person.email,
    citizenship: person.citizenship,
    currentRole: {
      title: person.jobTitle,
      organization: person.employer,
      since: '2025-05',
    },
    availability: {
      status: person.availability,
      seeking: [...person.seeking],
      preferredLocations: [...person.targetLocations],
      willingToRelocate: true,
      workAuthorization: person.citizenship,
      sponsorshipRequired: false,
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
      status: entry.data.citation?.type === 'unpublished' ? 'unpublished' : 'peer-reviewed',
      award: entry.data.award,
      doi: entry.data.doi,
      url: `${SITE_URL}/publications/${entry.id}/`,
      markdown: `${SITE_URL}/publications/${entry.id}.md`,
      bibtex: `${SITE_URL}/publications/${entry.id}.bib`,
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
    selectedWork: caseStudies.map((study) => ({
      title: study.title,
      url: `${SITE_URL}/#${study.id}`,
      context: study.context,
      problem: study.problem,
      built: study.built.map((group) => ({ label: group.label, items: group.items.map(plainText) })),
      stack: study.stack,
      status: study.status,
      links: study.links.map((link) => ({ label: link.label, url: absoluteUrl(link.href) })),
    })),
    alsoPublic: moreWork.map((item) => ({
      title: item.title,
      context: item.context,
      summary: item.summary,
      stack: item.stack,
      links: item.links.map((link) => ({ label: link.label, url: absoluteUrl(link.href) })),
    })),
    skills: skillGroups.map((group) => ({
      area: group.label,
      items: group.items,
      evidence: group.proof,
      evidenceLinks: group.evidence.map((ev) => absoluteUrl(ev.href)),
    })),
    researchInterests: [...knowsAbout],
    news: news.map((item) => ({ date: item.data.date, title: item.data.title })),
    faq,
    resources: {
      cv: `${SITE_URL}/resume.pdf`,
      jsonResume: `${SITE_URL}/resume.json`,
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
