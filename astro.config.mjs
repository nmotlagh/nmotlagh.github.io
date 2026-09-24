// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nmotlagh.github.io',
  integrations: [
    mdx(),
    sitemap(),
  ],
  prefetch: { prefetchAll: true },
  // Astro 7 defaults to JSX-style whitespace stripping ('jsx'), which drops the
  // spaces between adjacent inline elements. Keep the HTML-aware compression the
  // site was written against.
  compressHTML: true,
  vite: {
    build: {
      // Astro 7's compiler rewrites scoped styles in newer syntax, e.g.
      // `@media (width>=900px)`, which Safari reads only from 16.4. Lower it
      // for Vite's pre-v7 `modules` browser baseline, and keep esbuild (the
      // CSS minifier Astro 5 used) so the stylesheets match the Astro 5 build.
      cssMinify: 'esbuild',
      cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14'],
    },
  },
});
