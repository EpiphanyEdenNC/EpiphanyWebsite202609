// Use the same church-local calendar date as the visible event date.
export function eventDateKey(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function refreshEventLists(root, now = new Date()) {
  const today = eventDateKey(now);
  root.querySelectorAll('[data-event-list]').forEach((list) => {
    const limit = Number(list.getAttribute('data-event-limit')) || Infinity;
    let shown = 0;
    list.querySelectorAll('[data-event-date]').forEach((card) => {
      const date = card.getAttribute('data-event-date') || '';
      const visible = date >= today && shown < limit;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
  });
}
