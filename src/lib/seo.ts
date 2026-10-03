import { site, home } from './content';

// Keep preview hosts and tracking parameters out of public SEO URLs.
export function canonicalUrl(path: string, origin: URL | string) {
  const pathname = new URL(path, origin).pathname.replace(/\/+$/, '') || '/';
  return new URL(pathname, origin).href;
}

export function absoluteImage(image: string | null | undefined, origin: URL | string) {
  if (!image) return undefined;
  try {
    const url = new URL(image, origin);
    return /^https?:$/.test(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

export function descriptionText(value: string | null | undefined) {
  const text = (value || site.seoDescription).replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;
  const shortened = text.slice(0, 157).replace(/\s+\S*$/, '');
  return `${shortened}…`;
}

export const defaultImage = home.heroImage;

export function churchSchema(origin: URL | string) {
  const url = canonicalUrl('/', origin);
  const sameAs = [...new Set([
    site.facebookUrl, site.youtubeUrl,
    ...site.footer.connectLinks.filter(link => /^(Facebook|Instagram|YouTube)$/i.test(link.label)).map(link => link.url),
  ].filter(link => /^https?:\/\//.test(link)))];
  return {
    '@context': 'https://schema.org', '@type': 'Church', '@id': `${url}#church`,
    name: site.churchName, url, description: site.seoDescription,
    telephone: site.phone, email: site.email,
    // Tina stores the full address as one editable field. Preserve it verbatim.
    address: site.address, sameAs,
  };
}

export function eventSchema(event: { title: string; date?: string | null; location?: string | null; summary?: string | null; image?: string | null }, url: string, origin: URL | string) {
  if (!event.date || !Number.isFinite(Date.parse(event.date))) return undefined;
  // Match the date displayed by formatDate; Tina's timestamp is not the event's start time.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(event.date));
  const part = (name: string) => parts.find(p => p.type === name)?.value;
  const location = event.location?.trim();
  return {
    '@context': 'https://schema.org', '@type': 'Event', '@id': `${url}#event`,
    name: event.title, url, startDate: `${part('year')}-${part('month')}-${part('day')}`,
    description: event.summary?.trim() || undefined,
    image: absoluteImage(event.image, origin),
    location: location ? (location.toLowerCase() === site.churchName.toLowerCase()
      ? { '@type': 'Place', name: site.churchName, address: site.address }
      : { '@type': 'Place', name: location }) : undefined,
    organizer: { '@type': 'Organization', '@id': `${canonicalUrl('/', origin)}#church`, name: site.churchName, url: canonicalUrl('/', origin) },
  };
}

// JSON-LD must not allow CMS text to terminate its script element.
export function serializeSchema(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
