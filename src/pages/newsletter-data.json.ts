import type { APIRoute } from 'astro';
import newsletterSettings from '../../content/site/newsletter.json';
import { home, getEvents, site } from '../lib/content';

export const prerender = true;
export const GET: APIRoute = () => new Response(JSON.stringify({
  church: site.churchName || 'Church of the Epiphany',
  service: home.sundayService,
  newsletterSettings,
  events: getEvents().map((e: any) => ({
    id: e.routeSlug, title: e.title, date: e.date, time: e.time,
    location: e.location, summary: e.summary, image: e.image,
    url: '/events/' + encodeURIComponent(e.routeSlug),
  })),
}), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' } });
