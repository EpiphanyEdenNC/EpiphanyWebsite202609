const reservedPageNames = new Set([
  'about', 'welcome', 'worship', 'connect', 'contact', 'serve', 'events',
  'give', 'pledge', 'text-signup', 'admin', 'tina-island', 'images',
  'robots', 'sitemap', 'sitemap-index', 'sitemap-0', 'favicon', 'index',
]);

export function validatePageName(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return 'Use lowercase letters, numbers, and single hyphens only.';
  }
  if (reservedPageNames.has(value) || value.startsWith('about-')) {
    return 'This URL name is reserved for an existing page or website feature.';
  }
  return undefined;
}
