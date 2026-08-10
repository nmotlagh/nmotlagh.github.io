import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { SITE_URL, links, person } from '../data/site';
import { parseDateValue } from '../utils/dates';

/**
 * https://llmstxt.org/ — a curated, link-first summary of the site for agents
 * that would otherwise have to guess which pages matter. Generated from the
 * same content collections that render the HTML, so the two cannot diverge.
 */
export const GET: APIRoute = async () => {
  // Peer-reviewed first, then anything still under review, so an agent reading
  // top-down sees the work that has cleared review before the work that has not.
  const publications = (await getCollection('publications', ({ data }) => !data.draft)).sort(
    (a, b) =>
      Number(a.data.citation?.type === 'unpublished') -
        Number(b.data.citation?.type === 'unpublished') || b.data.year - a.data.year,
  );
  const artifacts = (await getCollection('artifacts')).sort((a, b) =>
    a.data.name.localeCompare(b.data.name),
  );
  const news = (await getCollection('news', ({ data }) => !data.draft))
    .sort((a, b) => parseDateValue(b.data.date).getTime() - parseDateValue(a.data.date).getTime())
    .slice(0, 5);
  const experience = await getEntry('pages', 'experience');
  const education = experience?.data.education ?? [];

  const paperLine = (entry: (typeof publications)[number]) =>
    `- [${entry.data.title}](${SITE_URL}/publications/${entry.slug}/): ${entry.data.venue}, ${entry.data.year}. ${entry.data.tldr}`;

  const body = `# ${person.name}

> ${person.jobTitle}, ${person.institution} (${person.lab}, advised by ${person.advisor}). Research on machine learning reliability under uncertainty: when a model should answer, weigh evidence, revise its answer, or abstain. Four peer-reviewed first-author papers including a Springer Best Paper Award, plus one manuscript under review. ${person.availability} for ${person.seeking.join(', ')} roles.

Everything below is first-party and current as of ${new Date().toISOString().slice(0, 10)}. Facts an agent is most often asked for:

- Availability: ${person.availability}, for ${person.seeking.join(', ')} roles. Based in ${person.location}; open to relocation or remote.
- Work authorization: ${person.citizenship}. Five summers of AFRL-sponsored research; federal roles welcome.
- Contact: ${person.email}
- Education: ${education.map((item) => `${item.degree} ${item.field}, ${item.institution} (${item.timeframe})`).join('; ')}
- Core stack: Python, PyTorch, Hugging Face, FAISS, Slurm, Singularity, LoRA fine-tuning, multi-GPU training.

## Publications

${publications.map(paperLine).join('\n')}

## Code and data

${artifacts.map((entry) => `- [${entry.data.name}](${entry.data.repo}): ${entry.data.summary}`).join('\n')}

## Site pages

- [About](${SITE_URL}/about/): background, research focus, and what he is looking for.
- [Publications](${SITE_URL}/publications/): every paper with links to PDF, arXiv, DOI, and code.
- [Experience](${SITE_URL}/experience/): roles, education, and professional service.
- [FAQ](${SITE_URL}/faq/): direct answers to the questions most often asked about him.
- [Code & data](${SITE_URL}/artifacts/): public research repositories with reproduction steps.
- [News](${SITE_URL}/news/): dated updates.

## Machine-readable

- [Structured profile (JSON)](${SITE_URL}/profile.json): identity, availability, education, publications, and skills as JSON.
- [All publications as BibTeX](${SITE_URL}/citations.bib)
- [Full site text](${SITE_URL}/llms-full.txt): every page's content in one Markdown file.
- [News feed (RSS)](${SITE_URL}/rss.xml)
- [Sitemap](${SITE_URL}/sitemap-index.xml)
- [CV (PDF)](${SITE_URL}/resume.pdf)

Each publication page also has a Markdown mirror at \`/publications/<slug>.md\` and a BibTeX entry at \`/publications/<slug>.bib\`.

## Profiles

- [Google Scholar](${links.scholar})
- [ORCID](${links.orcid})
- [GitHub](${links.github})
- [LinkedIn](${links.linkedin})

## Recent updates

${news.map((item) => `- ${item.data.date}: ${item.data.title}`).join('\n')}

## Citation and use

Content is written by ${person.name}. Quoting and citing is welcome; please attribute to ${person.name} and link to ${SITE_URL}/. Reported metrics are drawn from the linked papers — cite the paper, not this summary, for any number you reuse.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
