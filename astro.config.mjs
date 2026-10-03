import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

const siteUrl =
  process.env.SITE_URL || 'https://epiphanyeden.org';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  adapter: netlify({
    devFeatures: {
      edgeFunctions: false,
    },
  }),
  trailingSlash: 'never',
  integrations: [tina(), sitemap({
    filter: (page) => !/^\/(admin|tina-island)(\/|$)/.test(new URL(page).pathname)
      && !['/contact', '/404'].includes(new URL(page).pathname.replace(/\/+$/, '')),
  })],
  vite: {
    plugins: [tinaAdminDevRedirect()],
    ssr: {
      noExternal: ['@tinacms/astro', '@tinacms/bridge'],
    },
  },
});
