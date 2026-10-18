import { timingSafeEqual } from 'node:crypto';

function authorized(provided, expected) {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
const response = (statusCode, body) => ({
  statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
function safeUrl(path, origin) {
  try {
    const u = new URL(String(path || ''), origin);
    return u.protocol === 'https:' ? u.href : '';
  } catch { return ''; }
}
function formatEventDate(value) {
  if (!value) return '';
  const raw = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(raw + 'T12:00:00Z') : new Date(raw);
  if (!Number.isFinite(date.getTime())) return raw;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', month: 'long', day: 'numeric', year: 'numeric',
  }).format(date);
}
function line(s) { return escapeHtml(s).replace(/\r?\n/g, '<br>'); }
function render(data, origin) {
  const button = (label, href) => href ? `<p style="margin:14px 0"><a href="${escapeHtml(href)}" style="color:#245b60;text-decoration:underline">${escapeHtml(label)} →</a></p>` : '';
  const service = data.includeService && data.service ? data.service : null;
  const events = Array.isArray(data.events) ? data.events.slice(0, 30) : [];
  const rows = [];
  rows.push(`<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#283735;font-size:16px;line-height:1.6"><div style="background:#f4f0e8;padding:26px;text-align:center"><h1 style="margin:0;color:#27443f">Upcoming Events at Epiphany</h1><div>Worship · Fellowship · Outreach</div></div><div style="padding:22px">`);
  if (data.intro) rows.push(`<p style="white-space:normal">${line(data.intro)}</p>`);
  if (service) {
    rows.push('<h2 style="color:#27443f">Sunday Worship</h2>');
    rows.push(`<p><strong>${escapeHtml(service.heading || 'Sunday Service')}</strong><br>${escapeHtml(service.date)} · ${escapeHtml(service.time)}<br>${line(service.sundayName || '')}<br>${escapeHtml(service.priestName || '')}</p>`);
    if (service.additionalInfo) rows.push(`<p>${line(service.additionalInfo)}</p>`);
    for (const b of (service.buttons || []).slice(0, 8)) rows.push(button(b.label || 'Service information', safeUrl(b.url || b.linkUrl, origin)));
  }
  if (events.length) {
    rows.push('<h2 style="color:#27443f">Upcoming Events</h2>');
    for (const e of events) {
      rows.push(`<div style="border-top:1px solid #ddd;padding:12px 0"><h3 style="margin:0;color:#27443f">${escapeHtml(e.title)}</h3><p style="margin:5px 0">${escapeHtml(formatEventDate(e.date))} ${escapeHtml(e.time || '')} ${escapeHtml(e.location || '')}</p><p>${escapeHtml(e.summary || '')}</p>${button('Event details', safeUrl(e.url, origin))}</div>`);
    }
  }
  if (data.announcement) rows.push(`<h2 style="color:#27443f">News & Announcements</h2><p>${line(data.announcement)}</p>`);
  rows.push(`<div style="background:#f4f0e8;padding:18px;text-align:center;margin-top:22px"><strong>Church of the Epiphany</strong><br>Eden, North Carolina${button('Visit Our Website', origin + '/')}</div></div></div>`);
  return rows.join('');
}
export async function handler(event) {
  if (event.httpMethod !== 'POST') return response(405, { error: 'Method not allowed' });
  const { MAILCHIMP_API_KEY: apiKey, MAILCHIMP_AUDIENCE_ID: listId, MAILCHIMP_REPLY_TO: replyTo, NEWSLETTER_EDITOR_PASSWORD: password } = process.env;
  if (!apiKey || !listId || !replyTo || !password) return response(503, { error: 'Newsletter integration is not configured in Netlify.' });
  if (!authorized(event.headers['x-newsletter-password'], password)) return response(401, { error: 'Incorrect newsletter password.' });
  let data;
  try { data = JSON.parse(event.body || '{}'); } catch { return response(400, { error: 'Invalid request.' }); }
  if (!data || typeof data !== 'object' || !Array.isArray(data.events)) return response(400, { error: 'Invalid newsletter.' });
  const dc = apiKey.split('-').pop();
  if (!/^[a-z0-9]+$/i.test(dc || '')) return response(503, { error: 'Mailchimp API key format is invalid.' });
  const origin = (process.env.NEWSLETTER_SITE_URL || 'https://epiphanyeden.org').replace(/\/$/, '');
  const apiBase = `https://${dc}.api.mailchimp.com/3.0`;
  const headers = { Authorization: 'Basic ' + Buffer.from('newsletter:' + apiKey).toString('base64'), 'Content-Type': 'application/json' };
  const send = async (path, method, body) => {
    const r = await fetch(apiBase + path, { method, headers, body: JSON.stringify(body) });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.detail || json.title || `Mailchimp returned ${r.status}`);
    return json;
  };
  try {
    const subject = String(data.subject || 'Upcoming Events at Epiphany').trim().slice(0, 150);
    // Resolve the existing church tag by its exact name, not a saved segment ID.
    const tagName = 'MainMailingList';
    const tagsRes = await fetch(apiBase + '/lists/' + encodeURIComponent(listId) + '/tag-search?name=' + encodeURIComponent(tagName), { headers: { Authorization: headers.Authorization } });
    const tagsData = await tagsRes.json().catch(() => ({}));
    if (!tagsRes.ok) throw new Error(tagsData.detail || 'Unable to find Mailchimp tags.');
    const exactTags = (tagsData.tags || []).filter(t => t.name === tagName);
    if (exactTags.length !== 1 || !Number.isSafeInteger(exactTags[0].id)) {
      return response(422, { error: 'Recipient tag MainMailingList was not found uniquely. No campaign was created.' });
    }
    const tagId = exactTags[0].id;
    const campaign = await send('/campaigns', 'POST', {
      type: 'regular', recipients: { list_id: listId, segment_opts: { match: 'all', conditions: [{ condition_type: 'StaticSegment', field: 'static_segment', op: 'static_is', value: tagId }] } },
      settings: { subject_line: subject, title: subject + ' (website draft)', from_name: process.env.MAILCHIMP_FROM_NAME || 'Church of the Epiphany', reply_to: replyTo },
    });
    try {
      await send('/campaigns/' + encodeURIComponent(campaign.id) + '/content', 'PUT', { html: render(data, origin) });
    } catch (err) {
      return response(502, { error: 'Campaign was created, but adding its content failed. Check Mailchimp drafts before retrying: ' + err.message });
    }
    return response(200, { id: campaign.id, url: `https://admin.mailchimp.com/campaigns/` });
  } catch (err) {
    return response(502, { error: 'Mailchimp error: ' + err.message });
  }
}
