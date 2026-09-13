// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://nandoabad.dev',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      // English is served under an explicit /en/ prefix.
      prefixDefaultLocale: true,
      // The root redirect is handled by src/pages/index.astro instead.
      redirectToDefaultLocale: false,
    },
  },
  markdown: {
    // Shiki inlines a themed background and syntax colours on <pre>, which
    // overrides the neutral code styling in global.css and introduces a
    // palette. Revisit with a neutral theme once the palette is decided.
    syntaxHighlight: false,
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
