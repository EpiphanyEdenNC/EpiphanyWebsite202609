import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../tina/__generated__/client';

export const getHomeTina = () =>
  requestWithMetadata(client.queries.home({ relativePath: 'home.json' }), {
    priority: 'primary',
  });

export const getPageTina = (slug: string) =>
  requestWithMetadata(client.queries.page({ relativePath: `${slug}.json` }), {
    priority: 'primary',
  });

export const getAboutPageTina = (slug: string) =>
  requestWithMetadata(client.queries.aboutPage({ relativePath: `${slug}.json` }), {
    priority: 'primary',
  });

export const getEventTina = (slug: string) =>
  requestWithMetadata(client.queries.event({ relativePath: `${slug}.json` }), {
    priority: 'primary',
  });

export const getCustomPageTina = (slug: string) =>
  requestWithMetadata(client.queries.customPage({ relativePath: `${slug}.json` }), {
    priority: 'primary',
  });
