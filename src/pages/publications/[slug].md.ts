import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { SITE_URL } from '../../data/site';
import { toBibtex } from '../../utils/bibtex';

export async function getStaticPaths() {
  const publications = await getCollection('publications', ({ data }) => !data.draft);
  return publications.map((pub) => ({ params: { slug: pub.slug }, props: { pub } }));
}

/** Markdown mirror of a paper page — the same content without the page chrome. */
export const GET: APIRoute = async ({ props }) => {
  const { pub } = props as { pub: CollectionEntry<'publications'> };
  const { data } = pub;

  const linkLines = [
    data.doi && `- DOI: <https://doi.org/${data.doi}>`,
    data.pdf && `- PDF: <${data.pdf}>`,
    data.arxiv && `- arXiv: <${data.arxiv}>`,
    data.code && `- Code: <${data.code}>`,
    data.data && `- Data: <${data.data}>`,
    data.external && `- Publisher page: <${data.external}>`,
  ].filter(Boolean);

  const body = `# ${data.title}

**Authors:** ${data.authors.join(', ')}
**Venue:** ${data.venue} (${data.year})${data.award ? `\n**Award:** ${data.award}` : ''}
**Canonical page:** <${SITE_URL}/publications/${pub.slug}/>

> ${data.tldr}

## Links

${linkLines.join('\n')}

${
  data.highlights && data.highlights.length > 0
    ? `## Highlights\n\n${data.highlights.map((item) => `- ${item}`).join('\n')}\n`
    : ''
}
## Summary

${pub.body.trim()}

## BibTeX

\`\`\`bibtex
${toBibtex(pub)}
\`\`\`
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
