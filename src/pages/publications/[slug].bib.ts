import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { toBibtex } from '../../utils/bibtex';

export async function getStaticPaths() {
  const publications = await getCollection('publications', ({ data }) => !data.draft);
  return publications.map((pub) => ({ params: { slug: pub.slug }, props: { pub } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { pub } = props as { pub: CollectionEntry<'publications'> };

  return new Response(`${toBibtex(pub)}\n`, {
    headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' },
  });
};
