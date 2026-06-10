import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { parseDateValue } from '../utils/dates';

export async function GET(context) {
  const newsItems = await getCollection('news', ({ data }) => !data.draft);
  const site = context.site ?? 'https://nmotlagh.github.io';
  const sorted = newsItems.sort(
    (a, b) => parseDateValue(b.data.date).getTime() - parseDateValue(a.data.date).getTime(),
  );
  const resolveLink = (item) =>
    item.data.link
      ? item.data.link.startsWith('/')
        ? new URL(item.data.link, site).href
        : item.data.link
      : new URL(`news/#${item.id}`, site).href;

  return rss({
    title: 'Nick Kashani Motlagh · News',
    description: 'Latest publications, reports, code, and data from Nick Kashani Motlagh.',
    site,
    items: sorted.map((item) => ({
      title: item.data.title,
      pubDate: parseDateValue(item.data.date),
      link: resolveLink(item),
    })),
  });
}
