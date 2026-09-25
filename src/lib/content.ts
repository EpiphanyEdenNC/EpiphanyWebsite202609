import siteData from '../../content/site/site.json';
import homeData from '../../content/site/home.json';

export const site = siteData;
export const home = homeData;

export function getPage(slug: string) {
  const modules = import.meta.glob('../../content/pages/*.json', { eager: true });
  const key = Object.keys(modules).find((path) => path.endsWith(`/${slug}.json`));
  if (!key) throw new Error(`Page content not found: ${slug}`);
  return (modules[key] as { default: any }).default;
}

export function getEvents() {
  const modules = import.meta.glob('../../content/events/*.json', { eager: true });
  return Object.entries(modules)
    .map(([filePath, mod]: any) => ({
      ...mod.default,
      routeSlug: filePath.split('/').pop()?.replace(/\.json$/, '') || mod.default.slug,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getMinistries() {
  const modules = import.meta.glob('../../content/ministries/*.json', { eager: true });
  return Object.values(modules)
    .map((mod: any) => mod.default)
    .sort((a: any, b: any) => (a.sortOrder || 999) - (b.sortOrder || 999));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  }).format(new Date(date));
}
