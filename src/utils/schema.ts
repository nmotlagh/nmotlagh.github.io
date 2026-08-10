import type { CollectionEntry } from 'astro:content';
import { SITE_URL, faq, knowsAbout, links, person } from '../data/site';

/**
 * Structured data is emitted as a single connected @graph rather than a pile of
 * standalone objects, so a consumer can resolve `author` or `about` to the one
 * Person node instead of guessing that repeated names refer to the same human.
 */

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type Json = Record<string, unknown>;

/** Drop undefined values so the emitted JSON-LD has no empty keys. */
const compact = <T extends Json>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null)) as T;

export const publicationUrl = (slug: string) => `${SITE_URL}/publications/${slug}/`;

export function websiteNode(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: person.name,
    inLanguage: 'en-US',
    publisher: { '@id': PERSON_ID },
    about: { '@id': PERSON_ID },
  };
}

export function personNode(educationEntries: EducationEntry[] = []): Json {
  return compact({
    '@type': 'Person',
    '@id': PERSON_ID,
    name: person.name,
    alternateName: person.formalName,
    givenName: person.givenName,
    familyName: person.familyName,
    url: `${SITE_URL}/`,
    jobTitle: person.jobTitle,
    description: person.headline,
    email: links.email,
    image: `${SITE_URL}/og-card.png`,
    nationality: { '@type': 'Country', name: 'United States' },
    homeLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Columbus',
        addressRegion: 'OH',
        addressCountry: 'US',
      },
    },
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: person.institution,
      url: person.institutionUrl,
    },
    alumniOf: educationEntries.map((entry) => ({
      '@type': 'CollegeOrUniversity',
      name: entry.institution,
    })),
    hasCredential: educationEntries.map((entry) =>
      compact({
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: entry.degree,
        educationalLevel: entry.degree,
        name: `${entry.degree} in ${entry.field}`,
        dateCreated: entry.completed,
        recognizedBy: { '@type': 'CollegeOrUniversity', name: entry.institution },
      }),
    ),
    award: ['Springer Best Paper Award, ISVC 2022'],
    knowsAbout: [...knowsAbout],
    knowsLanguage: 'en',
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'ORCID',
      value: links.orcid,
    },
    seeks: {
      '@type': 'Demand',
      name: `${person.seeking.join(', ')} roles`,
      availabilityStarts: person.availableFrom,
      areaServed: 'US',
    },
    sameAs: [links.github, links.linkedin, links.scholar, links.orcid],
  });
}

export interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  timeframe: string;
  completed: string;
}

export function publicationNode(entry: CollectionEntry<'publications'>): Json {
  const { data } = entry;
  const isUnpublished = data.citation?.type === 'unpublished';
  const doiUrl = data.doi ? `https://doi.org/${data.doi}` : undefined;
  const sameAs = [data.external, data.arxiv, doiUrl].filter(Boolean) as string[];
  const isBasedOn = [data.code, data.data].filter(Boolean).map((url) => ({
    '@type': 'SoftwareSourceCode',
    url,
  }));

  return compact({
    '@type': isUnpublished ? 'CreativeWork' : 'ScholarlyArticle',
    '@id': `${publicationUrl(entry.slug)}#article`,
    name: data.title,
    headline: data.title,
    url: publicationUrl(entry.slug),
    abstract: data.tldr,
    datePublished: isUnpublished ? undefined : (data.datePublished ?? String(data.year)),
    creativeWorkStatus: isUnpublished ? 'Under review' : undefined,
    inLanguage: 'en',
    keywords: data.tags?.join(', '),
    pagination: data.citation?.pages?.replace('--', '-'),
    isPartOf: data.citation?.journal
      ? compact({
          '@type': 'Periodical',
          name: data.citation.journal,
          volumeNumber: data.citation.volume,
        })
      : undefined,
    identifier: data.doi
      ? { '@type': 'PropertyValue', propertyID: 'DOI', value: data.doi }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    publisher: isUnpublished
      ? undefined
      : { '@type': 'Organization', name: data.citation?.publisher ?? data.venue },
    author: data.authors.map((name) =>
      name.includes(person.familyName)
        ? { '@id': PERSON_ID }
        : { '@type': 'Person', name },
    ),
    isBasedOn: isBasedOn.length > 0 ? isBasedOn : undefined,
    award: data.award,
  });
}

export function artifactNode(entry: CollectionEntry<'artifacts'>): Json {
  return compact({
    '@type': 'SoftwareSourceCode',
    '@id': `${entry.data.repo}#software`,
    name: entry.data.name,
    description: entry.data.summary,
    codeRepository: entry.data.repo,
    url: entry.data.repo,
    programmingLanguage: entry.data.stack?.filter((item) => item === 'Python'),
    keywords: entry.data.stack?.join(', '),
    author: { '@id': PERSON_ID },
  });
}

export function breadcrumbNode(trail: { name: string; url: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqNode(): Json {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq/#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** Wrap nodes into the single @graph document embedded on a page. */
export function graph(nodes: Json[]): Json {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}
