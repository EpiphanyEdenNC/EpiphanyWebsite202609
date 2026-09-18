import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.org',
  output: 'static',
  trailingSlash: 'never'
});
