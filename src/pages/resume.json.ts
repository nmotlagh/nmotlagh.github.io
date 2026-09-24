import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { SITE_URL, absoluteUrl, links, listAnd, listOr, person, plainText } from '../data/site';
import { caseStudies, moreWork, skillGroups } from '../data/editorial';

/**
 * The profile in the open JSON Resume format (https://jsonresume.org/schema),
 * for tools and agents that parse resumes rather than pages. Built from the
 * same content collections as the HTML, so the two cannot drift apart.
 */

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

/** "Aug 2021" -> "2021-08", "2020" -> "2020", "Present" -> undefined. */
const isoDate = (part: string | undefined) => {
  if (!part) return undefined;
  const month = part.match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (month && MONTHS[month[1].toLowerCase()]) return `${month[2]}-${MONTHS[month[1].toLowerCase()]}`;
  const year = part.match(/\d{4}/);
  return year ? year[0] : undefined;
};

/** Split a timeframe like "May 2025 — Present" or "Summers 2022–2024" into ISO start/end. */
const dates = (timeframe: string) => {
  const [start, end] = timeframe.split(/\s*[—–-]\s*/);
  const startDate = isoDate(start);
  // A single year ("Summer 2019") is both start and end; "Present" leaves the end open.
  const endDate = end === undefined ? startDate : isoDate(end);
  return { startDate, ...(endDate ? { endDate } : {}) };
};

const plain = (value: string) => plainText(value).replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');

export const GET: APIRoute = async () => {
  const about = await getEntry('pages', 'about');
  const experience = await getEntry('pages', 'experience');
  const publications = (await getCollection('publications', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.year - a.data.year,
  );

  const resume = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: person.name,
      label: 'Machine learning researcher and engineer',
      email: person.email,
      url: `${SITE_URL}/`,
      summary: `${plain(about?.body.trim().split('\n\n')[0] ?? '')} ${person.availability} for ${listAnd(person.seeking)} roles in the ${listOr(person.targetLocations)}. ${person.citizenship}; ${person.sponsorship.toLowerCase()}.`,
      location: { city: 'Columbus', region: 'Ohio', countryCode: 'US' },
      profiles: [
        { network: 'GitHub', username: 'nmotlagh', url: links.github },
        { network: 'LinkedIn', username: 'nicholas-kashani-motlagh', url: links.linkedin },
        { network: 'Google Scholar', url: links.scholar },
        { network: 'ORCID', username: '0000-0001-6229-6212', url: links.orcid },
      ],
    },
    work: (experience?.data.items ?? []).map((item) => {
      const [role, org] = item.role.split(/\s+—\s+/);
      // Teaching roles name the course after the dash; the employer is in the location.
      const teaching = /Teaching Associate/.test(role) && org !== undefined;
      return {
        name: teaching ? (item.location ?? '').split(' · ')[0] : (org ?? item.location),
        position: teaching ? `${role}, ${org}` : role,
        location: item.location,
        ...dates(item.timeframe),
        highlights: (item.bullets ?? []).map(plain),
      };
    }),
    education: (experience?.data.education ?? []).map((item) => {
      const gpa = (item.notes ?? []).join(' ').match(/GPA (\d\.\d+)/);
      return {
        institution: item.institution,
        area: item.field,
        studyType: item.degree,
        ...dates(item.timeframe),
        ...(gpa ? { score: gpa[1] } : {}),
      };
    }),
    awards: [
      {
        title: 'Springer Best Paper Award',
        date: '2022',
        awarder: 'International Symposium on Visual Computing (ISVC 2022)',
        summary: 'For "Learning When to Say \'I Don\'t Know\'".',
      },
    ],
    publications: publications.map((entry) => ({
      name: entry.data.title,
      publisher: entry.data.venue,
      releaseDate: String(entry.data.year),
      url: `${SITE_URL}/publications/${entry.slug}/`,
      summary:
        entry.data.citation?.type === 'unpublished'
          ? `Unpublished manuscript. ${entry.data.tldr}`
          : entry.data.tldr,
    })),
    skills: skillGroups.map((group) => ({ name: group.label, keywords: [...group.items] })),
    projects: [
      ...caseStudies.map((study) => ({
        name: study.title,
        description: `${study.problem} Status: ${study.status}`,
        highlights: study.built.flatMap((group) => group.items.map(plain)),
        keywords: study.stack,
        url: absoluteUrl(study.links[0]?.href ?? `#${study.id}`),
      })),
      ...moreWork.map((item) => ({
        name: item.title,
        description: item.summary,
        keywords: item.stack,
        url: absoluteUrl(item.links[0]?.href ?? '/'),
      })),
    ],
    meta: {
      canonical: `${SITE_URL}/resume.json`,
      version: 'v1.0.0',
      lastModified: person.updated,
    },
  };

  return new Response(JSON.stringify(resume, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
