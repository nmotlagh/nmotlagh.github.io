import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { parseDateValue } from '../utils/dates';

export async function GET(context) {
  const newsItems = await getCollection('news');
  const site = context.site ?? 'https://nmotlagh.github.io';
  const sorted = newsItems.sort(
    (a, b) => parseDateValue(b.data.date).getTime() - parseDateValue(a.data.date).getTime(),
  );

  return rss({
    title: 'Nick Kashani Motlagh · News',
    description: 'Latest publications, releases, and artifacts from Nick Kashani Motlagh.',
    site,
    items: sorted.map((item) => ({
      title: item.data.title,
      pubDate: parseDateValue(item.data.date),
      link: item.data.link ?? new URL(`news/#${item.id}`, site).href,
    })),
  });
}
