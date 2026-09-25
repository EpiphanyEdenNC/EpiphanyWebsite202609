import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

const siteUrl =
  process.env.SITE_URL || process.env.URL || 'http://localhost:4321';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  adapter: netlify({
    devFeatures: {
      edgeFunctions: false,
    },
  }),
  trailingSlash: 'never',
  integrations: [tina()],
  vite: {
    plugins: [tinaAdminDevRedirect()],
    ssr: {
      noExternal: ['@tinacms/astro', '@tinacms/bridge'],
    },
  },
});
