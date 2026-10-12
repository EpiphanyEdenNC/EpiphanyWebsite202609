import siteData from '../../content/site/site.json';
import homeData from '../../content/site/home.json';

export const site = siteData;
export const home = homeData;

export function getEvents() {
  const modules = import.meta.glob('../../content/events/*.json', { eager: true });
  return Object.entries(modules)
    .map(([filePath, mod]: any) => ({
      ...mod.default,
      routeSlug: filePath.split('/').pop()?.replace(/\.json$/, '') || mod.default.slug,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  }).format(new Date(date));
}
