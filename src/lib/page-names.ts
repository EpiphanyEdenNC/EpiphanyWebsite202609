export const builtInPageNames = new Set([
  'about', 'welcome', 'worship', 'connect', 'contact', 'serve', 'events',
  'give', 'pledge', 'text-signup',
]);
const reservedNames = new Set([
  'admin', 'tina-island', 'images', 'robots', 'robots.txt', 'sitemap',
  'sitemap-index', 'sitemap-0', 'favicon', 'index',
]);

export function validatePageName(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(value)) {
    return 'Use lowercase letters, numbers, single hyphens, and slashes between folders.';
  }
  const first = value.split('/')[0];
  if (reservedNames.has(first) || value.startsWith('events/')) {
    return 'This URL name is reserved for an existing website feature.';
  }
  return undefined;
}
