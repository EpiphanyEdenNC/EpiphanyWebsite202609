import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, content) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.endsWith('\n') ? content : content + '\n', 'utf8');
  console.log(`updated ${p}`);
};

for (const required of ['package.json', 'astro.config.mjs', 'tina/config.ts']) {
  if (!fs.existsSync(path.join(root, required))) {
    throw new Error(`Run this script from the Epiphany website repository root. Missing ${required}.`);
  }
}

// 1) Dependencies. npm install after this script will update package-lock.json.
const pkg = JSON.parse(read('package.json'));
pkg.dependencies ??= {};
pkg.dependencies['@astrojs/netlify'] = '^8.2.6';
pkg.dependencies['@tinacms/astro'] = '^0.7.0';
write('package.json', JSON.stringify(pkg, null, 2));

// 2) Astro: keep public pages static, add the Netlify adapter for Tina's one on-demand island route.
write('astro.config.mjs', `import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

const siteUrl =
  process.env.SITE_URL ||
  process.env.URL ||
  'http://localhost:4321';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  adapter: netlify(),
  trailingSlash: 'never',
  integrations: [tina()],
  vite: {
    plugins: [tinaAdminDevRedirect()],
    ssr: {
      noExternal: ['@tinacms/astro', '@tinacms/bridge'],
    },
  },
});`);

// 3) Tina collection routing/global settings.
let tinaConfig = read('tina/config.ts');

function collectionSegment(source, name) {
  const marker = `name: "${name}"`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Could not find Tina collection: ${name}`);
  const next = source.indexOf('\n      {', start + marker.length);
  const end = next >= 0 ? next : source.indexOf('\n    ]', start);
  if (end < 0) throw new Error(`Could not find end of Tina collection: ${name}`);
  return { start, end, text: source.slice(start, end) };
}

function updateCollection(source, name, updater) {
  const seg = collectionSegment(source, name);
  const nextText = updater(seg.text);
  return source.slice(0, seg.start) + nextText + source.slice(seg.end);
}

tinaConfig = updateCollection(tinaConfig, 'site', (segment) => {
  const oldUi = 'ui: { allowedActions: { create: false, delete: false } },';
  if (!segment.includes(oldUi)) throw new Error('Site Settings UI block has changed; migration stopped safely.');
  return segment.replace(oldUi, `ui: {
          global: true,
          allowedActions: { create: false, delete: false },
        },`);
});

tinaConfig = updateCollection(tinaConfig, 'home', (segment) => {
  const oldUi = 'ui: { allowedActions: { create: false, delete: false } },';
  if (!segment.includes(oldUi)) throw new Error('Homepage UI block has changed; migration stopped safely.');
  return segment.replace(oldUi, `ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },`);
});

tinaConfig = updateCollection(tinaConfig, 'page', (segment) => {
  const oldUi = 'ui: { allowedActions: { create: false, delete: false } },';
  if (!segment.includes(oldUi)) throw new Error('Pages UI block has changed; migration stopped safely.');
  return segment.replace(oldUi, `ui: {
          router: ({ document }) => \`/\${document._sys.filename}\`,
          allowedActions: { create: false, delete: false },
        },`);
});

tinaConfig = updateCollection(tinaConfig, 'event', (segment) => {
  if (segment.includes('router: ({ document })')) return segment;
  const formatLine = 'format: "json",';
  if (!segment.includes(formatLine)) throw new Error('Event collection format line has changed; migration stopped safely.');
  return segment.replace(formatLine, `${formatLine}
        ui: {
          router: ({ document }) => \`/events/\${document._sys.filename}\`,
          filename: {
            readonly: true,
            slugify: (values) =>
              values?.slug ||
              values?.title?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
              "event",
          },
        },`);
});

write('tina/config.ts', tinaConfig);

// 4) Tina data loaders.
write('src/lib/tina-data.ts', `import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../tina/__generated__/client';

export const getHomeTina = () =>
  requestWithMetadata(client.queries.home({ relativePath: 'home.json' }), {
    priority: 'primary',
  });

export const getPageTina = (slug: string) =>
  requestWithMetadata(client.queries.page({ relativePath: \`\${slug}.json\` }), {
    priority: 'primary',
  });

export const getEventTina = (slug: string) =>
  requestWithMetadata(client.queries.event({ relativePath: \`\${slug}.json\` }), {
    priority: 'primary',
  });`);

// 5) Editable-island registry and endpoint.
write('src/lib/islands.ts', `import type { IslandRegistry } from '@tinacms/astro/experimental';
import HomeBody from '../components/islands/HomeBody.astro';
import ContentBody from '../components/islands/ContentBody.astro';
import EventBody from '../components/islands/EventBody.astro';
import { getEventTina, getHomeTina, getPageTina } from './tina-data';

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
  event: {
    fetch: (_request, params) => getEventTina(params.get('slug') ?? ''),
    component: EventBody,
    wrapper: { tag: 'div' },
    propsFromData: (result: any) => ({ data: result.data?.event }),
  },
};`);

write('src/pages/tina-island/[name].ts', `import type { APIRoute } from 'astro';
import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { islands } from '../../lib/islands';

export const prerender = false;
export const ALL: APIRoute = experimental_createIslandRoute(islands);`);

// Keep event URLs tied to their JSON filenames, which is what Tina's visual router uses.
let contentLib = read('src/lib/content.ts');
const oldEvents = `export function getEvents() {
  const modules = import.meta.glob('../../content/events/*.json', { eager: true });
  return Object.values(modules)
    .map((mod: any) => mod.default)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}`;
const newEvents = `export function getEvents() {
  const modules = import.meta.glob('../../content/events/*.json', { eager: true });
  return Object.entries(modules)
    .map(([filePath, mod]: any) => ({
      ...mod.default,
      routeSlug: filePath.split('/').pop()?.replace(/\\.json$/, '') || mod.default.slug,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}`;
if (!contentLib.includes(oldEvents)) throw new Error('getEvents() has changed; migration stopped safely.');
contentLib = contentLib.replace(oldEvents, newEvents);
write('src/lib/content.ts', contentLib);

// 6) Visual rendering components.
write('src/components/islands/HomeBody.astro', `---
import { tinaField } from '@tinacms/astro/tina-field';
import { site, getEvents, formatDate } from '../../lib/content';
const { data: home } = Astro.props;
const events = getEvents().filter((event) => event.featured).slice(0, 3);
const heroStyle = home?.heroImage ? \`background-image:url('\${home.heroImage}')\` : undefined;
const safe = (url: string) => url && url !== '#';
---
{home && (
  <>
    <section
      class:list={["hero", home.heroImage && "has-image"]}
      style={heroStyle}
      data-tina-field={tinaField(home, 'heroImage')}
    >
      <div class="container hero-inner">
        <p class="eyebrow" data-tina-field={tinaField(home, 'eyebrow')}>{home.eyebrow}</p>
        <h1 class="display" data-tina-field={tinaField(home, 'headline')}>{home.headline}</h1>
        <p class="lede" data-tina-field={tinaField(home, 'subheadline')}>{home.subheadline}</p>
        <div class="actions">
          <a class="button" href={home.primaryButtonUrl} data-tina-field={tinaField(home, 'primaryButtonLabel')}>{home.primaryButtonLabel}</a>
          <a class="button secondary" href={home.secondaryButtonUrl} data-tina-field={tinaField(home, 'secondaryButtonLabel')}>{home.secondaryButtonLabel}</a>
        </div>
      </div>
    </section>

    <div class="container quick-strip" aria-label="Quick information">
      <div class="quick-strip-inner">
        <a class="quick" href="/worship"><small>Sunday</small><strong>Worship at {site.sundayTime}</strong></a>
        <a class="quick" href="/welcome"><small>New here?</small><strong>Plan your first visit</strong></a>
        <a class="quick" href="/events"><small>This week</small><strong>See what is happening</strong></a>
      </div>
    </div>

    <section class="section">
      <div class="container grid-2">
        <div>
          <p class="eyebrow">WELCOME</p>
          <h2 class="h2" data-tina-field={tinaField(home, 'welcomeHeading')}>{home.welcomeHeading}</h2>
        </div>
        <div>
          <p class="lede" data-tina-field={tinaField(home, 'welcomeText')}>{home.welcomeText}</p>
          <div class="actions"><a class="button secondary" href="/welcome">Plan Your Visit</a></div>
        </div>
      </div>
    </section>

    <section class="section compact">
      <div class="container grid-2">
        <div class="feature-block">
          <p class="eyebrow" style="color:#f0c6b5">WORSHIP</p>
          <h2 class="h2" data-tina-field={tinaField(home, 'serviceHeading')}>{home.serviceHeading}</h2>
          <p class="lede" data-tina-field={tinaField(home, 'serviceText')}>{home.serviceText}</p>
          <div class="actions"><a class="button light" href={home.serviceButtonUrl} data-tina-field={tinaField(home, 'serviceButtonLabel')}>{home.serviceButtonLabel}</a></div>
        </div>
        <div class="feature-block clay">
          <p class="eyebrow" style="color:#f6e0d7">OUTREACH</p>
          <h2 class="h2" data-tina-field={tinaField(home, 'outreachHeading')}>{home.outreachHeading}</h2>
          <p class="lede" data-tina-field={tinaField(home, 'outreachText')}>{home.outreachText}</p>
          <div class="actions"><a class="button ghost-light" href={home.outreachButtonUrl} data-tina-field={tinaField(home, 'outreachButtonLabel')}>{home.outreachButtonLabel}</a></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="events-head">
          <div>
            <p class="eyebrow">UPCOMING</p>
            <h2 class="h2">What's happening</h2>
          </div>
          <a href="/events">View all events →</a>
        </div>
        <div class="cards">
          {events.map((event) => (
            <article class="event-card">
              {event.image && <img class="event-card-image" src={event.image} alt={event.title} loading="lazy" />}
              <div class="grow">
                <div class="event-date">{formatDate(event.date)}</div>
                <h3>{event.title}</h3>
                <p class="meta">{event.time}{event.location ? \` · \${event.location}\` : ''}</p>
                <p>{event.summary}</p>
              </div>
              <a href={\`/events/\${event.routeSlug}\`}>Event details →</a>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section class="section closing">
      <div class="container grid-2">
        <div><h2 class="h2" data-tina-field={tinaField(home, 'closingHeading')}>{home.closingHeading}</h2></div>
        <div>
          <p class="lede" data-tina-field={tinaField(home, 'closingText')}>{home.closingText}</p>
          <div class="actions">
            <a class="button light" href="/contact">Contact Us</a>
            {safe(site.youtubeUrl) && <a class="button ghost-light" href={site.youtubeUrl}>Watch on YouTube</a>}
          </div>
        </div>
      </div>
    </section>
  </>
)}`);

write('src/components/islands/ContentBody.astro', `---
import { tinaField } from '@tinacms/astro/tina-field';
const { data: page } = Astro.props;
---
{page && (
  <>
    <section class="page-hero">
      <div class="container">
        {page.eyebrow && <p class="eyebrow" data-tina-field={tinaField(page, 'eyebrow')}>{page.eyebrow}</p>}
        <h1 class="h1" data-tina-field={tinaField(page, 'title')}>{page.title}</h1>
        {page.intro && <p class="lede" data-tina-field={tinaField(page, 'intro')}>{page.intro}</p>}
      </div>
    </section>
    <section class="section compact">
      <div class="container page-sections">
        {(page.sections || []).map((section) => (
          <article class="page-section" id={section.anchor || undefined} data-tina-field={tinaField(section)}>
            <h2 data-tina-field={tinaField(section, 'heading')}>{section.heading}</h2>
            <p data-tina-field={tinaField(section, 'text')}>{section.text}</p>
          </article>
        ))}
      </div>
    </section>
  </>
)}`);

write('src/components/islands/EventBody.astro', `---
import { tinaField } from '@tinacms/astro/tina-field';
import { formatDate } from '../../lib/content';
const { data: event } = Astro.props;
---
{event && (
  <>
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow">EVENT</p>
        <h1 class="h1" data-tina-field={tinaField(event, 'title')}>{event.title}</h1>
        <p class="lede" data-tina-field={tinaField(event, 'summary')}>{event.summary}</p>
      </div>
    </section>
    <section class="section compact">
      <div class="container">
        {event.image && (
          <img class="event-detail-image" src={event.image} alt={event.title} data-tina-field={tinaField(event, 'image')} />
        )}
        <div class="grid-2" style="align-items:start">
          <div>
            <p class="eyebrow">WHEN & WHERE</p>
            <h2 class="h2" data-tina-field={tinaField(event, 'date')}>{formatDate(event.date)}</h2>
            <p class="lede"><span data-tina-field={tinaField(event, 'time')}>{event.time}</span><br /><span data-tina-field={tinaField(event, 'location')}>{event.location}</span></p>
          </div>
          <div>
            <p class="lede" style="white-space:pre-line" data-tina-field={tinaField(event, 'details')}>{event.details}</p>
            {event.buttonLabel && event.buttonUrl && (
              <div class="actions">
                <a class="button" href={event.buttonUrl} data-tina-field={tinaField(event, 'buttonLabel')}>{event.buttonLabel}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  </>
)}`);

// 7) Wire pages to the visual islands.
write('src/pages/index.astro', `---
import BaseLayout from '../layouts/BaseLayout.astro';
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import HomeBody from '../components/islands/HomeBody.astro';
import { getHomeTina } from '../lib/tina-data';
import { islands } from '../lib/islands';

const result = await getHomeTina();
const home = result.data?.home;
if (!home) return new Response('Homepage content not found', { status: 404 });
---
<BaseLayout>
  <TinaIsland name="home" wrapper={islands.home.wrapper} primary>
    <HomeBody data={home} />
  </TinaIsland>
</BaseLayout>`);

write('src/layouts/ContentPage.astro', `---
import BaseLayout from './BaseLayout.astro';
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import ContentBody from '../components/islands/ContentBody.astro';
import { getPageTina } from '../lib/tina-data';
import { islands } from '../lib/islands';

interface Props { slug: string; }
const { slug } = Astro.props;
const result = await getPageTina(slug);
const page = result.data?.page;
if (!page) throw new Error(\`Page content not found: \${slug}\`);
---
<BaseLayout title={page.title} description={page.intro || undefined}>
  <TinaIsland name="page" wrapper={islands.page.wrapper} params={{ slug }} primary>
    <ContentBody data={page} />
  </TinaIsland>
  <slot />
</BaseLayout>`);

for (const slug of ['welcome', 'connect']) {
  write(`src/pages/${slug}.astro`, `---\nimport ContentPage from '../layouts/ContentPage.astro';\n---\n<ContentPage slug="${slug}" />`);
}

write('src/pages/worship.astro', `---
import ContentPage from '../layouts/ContentPage.astro';
import { site } from '../lib/content';
const safe = (url: string) => url && url !== '#';
---
<ContentPage slug="worship">
  <section class="section compact" style="padding-top:0">
    <div class="container">
      <div class="actions">
        {safe(site.facebookUrl) && <a class="button" href={site.facebookUrl}>Watch on Facebook</a>}
        {safe(site.youtubeUrl) && <a class="button secondary" href={site.youtubeUrl}>Watch on YouTube</a>}
      </div>
    </div>
  </section>
</ContentPage>`);

write('src/pages/serve.astro', `---
import ContentPage from '../layouts/ContentPage.astro';
import { getMinistries } from '../lib/content';
const ministries = getMinistries().filter((m) => m.featured);
---
<ContentPage slug="serve">
  <section class="section compact" style="padding-top:0">
    <div class="container">
      <div class="ministry-grid">
        {ministries.map((ministry) => (
          <article class="ministry">
            <h3>{ministry.title}</h3>
            <p><strong>{ministry.summary}</strong></p>
            <p>{ministry.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
</ContentPage>`);

write('src/pages/give.astro', `---
import ContentPage from '../layouts/ContentPage.astro';
import { site } from '../lib/content';
const safe = site.givingUrl && site.givingUrl !== '#';
---
<ContentPage slug="give">
  {safe && <section class="section compact" style="padding-top:0"><div class="container"><a class="button" href={site.givingUrl}>Give Online</a></div></section>}
</ContentPage>`);

write('src/pages/contact.astro', `---
import ContentPage from '../layouts/ContentPage.astro';
import { site } from '../lib/content';
---
<ContentPage slug="contact">
  <section class="section compact" style="padding-top:0">
    <div class="container cards">
      <div class="card"><h3>Sunday</h3><p>Worship at {site.sundayTime}</p></div>
      <div class="card"><h3>Location</h3><p>{site.address}</p></div>
      <div class="card"><h3>Contact</h3><p>{site.email || 'Add the church email in Site Settings.'}</p></div>
    </div>
  </section>
</ContentPage>`);

write('src/pages/events/[slug].astro', `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TinaIsland from '@tinacms/astro/TinaIsland.astro';
import EventBody from '../../components/islands/EventBody.astro';
import { getEvents } from '../../lib/content';
import { getEventTina } from '../../lib/tina-data';
import { islands } from '../../lib/islands';

export function getStaticPaths() {
  return getEvents().map((event) => ({ params: { slug: event.routeSlug } }));
}

const { slug } = Astro.params;
if (!slug) return new Response('Event not found', { status: 404 });
const result = await getEventTina(slug);
const event = result.data?.event;
if (!event) return new Response('Event not found', { status: 404 });
---
<BaseLayout title={event.title} description={event.summary || undefined}>
  <TinaIsland name="event" wrapper={islands.event.wrapper} params={{ slug }} primary>
    <EventBody data={event} />
  </TinaIsland>
</BaseLayout>`);

// Keep the events index links aligned with the filename-based route.
if (fs.existsSync(path.join(root, 'src/pages/events/index.astro'))) {
  let eventsIndex = read('src/pages/events/index.astro');
  eventsIndex = eventsIndex.replace('href={`/events/${event.slug}`}', 'href={`/events/${event.routeSlug}`}');
  write('src/pages/events/index.astro', eventsIndex);
}

// 8) Make the normal editor link enter visual editing at the homepage.
if (fs.existsSync(path.join(root, 'src/components/Footer.astro'))) {
  let footer = read('src/components/Footer.astro');
  footer = footer.replace('href="/admin/index.html"', 'href="/admin/index.html#/~/"');
  write('src/components/Footer.astro', footer);
}

console.log('\nVisual-editing source changes are in place.');
console.log('Next run: npm install');
console.log('Then run: npm run dev');
console.log('Open: http://localhost:4321/admin/index.html#/~/');
