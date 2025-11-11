import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const newsItems = await getCollection('news');
  const site = context.site ?? 'https://nmotlagh.github.io';
  const sorted = newsItems.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );

  return rss({
    title: 'Nick Kashani Motlagh · News',
    description: 'Latest publications, releases, and artifacts from Nick Kashani Motlagh.',
    site,
    items: sorted.map((item) => ({
      title: item.data.title,
      pubDate: new Date(item.data.date),
      link: item.data.link ?? `${site}news/`,
    })),
  });
}
