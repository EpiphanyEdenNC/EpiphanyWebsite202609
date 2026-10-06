import type { IslandRegistry } from '@tinacms/astro/experimental';
import HomeBody from '../components/islands/HomeBody.astro';
import ContentBody from '../components/islands/ContentBody.astro';
import EventBody from '../components/islands/EventBody.astro';
import { getAboutPageTina, getEventTina, getHomeTina, getPageTina } from './tina-data';

export const islands: IslandRegistry = {
  home: {
    fetch: () => getHomeTina(),
    component: HomeBody,
    wrapper: { tag: 'div' },
    propsFromData: (result: any) => ({ data: result.data?.home }),
  },
  page: {
    fetch: (_request, params) => getPageTina(params.get('slug') ?? 'welcome'),
    component: ContentBody,
    wrapper: { tag: 'div' },
    propsFromData: (result: any) => ({ data: result.data?.page }),
  },
  aboutPage: {
    fetch: (_request, params) => getAboutPageTina(params.get('slug') ?? ''),
    component: ContentBody,
    wrapper: { tag: 'div' },
    propsFromData: (result: any) => ({ data: result.data?.aboutPage }),
  },
  event: {
    fetch: (_request, params) => getEventTina(params.get('slug') ?? ''),
    component: EventBody,
    wrapper: { tag: 'div' },
    propsFromData: (result: any) => ({ data: result.data?.event }),
  },
};
