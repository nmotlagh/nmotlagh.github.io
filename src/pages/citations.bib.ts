import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { toBibtexBundle } from '../utils/bibtex';

export const GET: APIRoute = async () => {
  const publications = (await getCollection('publications', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.year - a.data.year,
  );

  return new Response(toBibtexBundle(publications), {
    headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' },
  });
};
