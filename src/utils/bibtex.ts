import type { CollectionEntry } from 'astro:content';

/**
 * "N. Kashani Motlagh" -> "Kashani Motlagh, N."
 * First whitespace-separated token is the given name in every entry we store;
 * everything after it is the family name, which may contain spaces.
 */
const toBibName = (name: string) => {
  const [given, ...family] = name.trim().split(/\s+/);
  return family.length > 0 ? `${family.join(' ')}, ${given}` : given;
};

/** Escape the characters that would otherwise start a BibTeX command. */
const escapeBib = (value: string) => value.replace(/([&%$#_{}])/g, '\\$1');

/** Straight and curly quotes render wrong in LaTeX; use the ``…'' form. */
const latexQuotes = (value: string) =>
  value
    .replace(/[“”"]([^“”"]*)[“”"]/g, "``$1''")
    .replace(/[‘’]/g, "'")
    .replace(/—/g, '---')
    .replace(/–/g, '--');

export function toBibtex(entry: CollectionEntry<'publications'>): string {
  const { data } = entry;
  const citation = data.citation;
  const type = citation?.type ?? 'misc';
  const key = citation?.key ?? entry.slug.replace(/-/g, '');

  const fields: [string, string | undefined][] = [
    ['title', `{${latexQuotes(escapeBib(data.title))}}`],
    ['author', escapeBib(data.authors.map(toBibName).join(' and '))],
    ['year', String(data.year)],
    ['booktitle', citation?.booktitle && escapeBib(citation.booktitle)],
    ['journal', citation?.journal && escapeBib(citation.journal)],
    ['publisher', citation?.publisher && escapeBib(citation.publisher)],
    ['volume', citation?.volume],
    ['number', citation?.number],
    ['pages', citation?.pages],
    ['doi', data.doi],
    ['url', data.external ?? data.pdf ?? data.arxiv],
    ['note', citation?.note && escapeBib(citation.note)],
  ];

  const body = fields
    .filter((pair): pair is [string, string] => Boolean(pair[1]))
    .map(([name, value]) => `  ${name.padEnd(9)} = ${value.startsWith('{') ? value : `{${value}}`}`)
    .join(',\n');

  return `@${type}{${key},\n${body}\n}`;
}

export function toBibtexBundle(entries: CollectionEntry<'publications'>[]): string {
  const header = [
    '% BibTeX entries for the publications of Nick Kashani Motlagh',
    '% https://nmotlagh.github.io/publications/',
    '',
  ].join('\n');
  return `${header}\n${entries.map(toBibtex).join('\n\n')}\n`;
}
