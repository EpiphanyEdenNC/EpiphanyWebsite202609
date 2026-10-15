import React, { useEffect } from 'react';

function NewsletterScreen() {
  useEffect(() => { window.location.assign('/newsletter-builder'); }, []);
  return <div style={{ padding: 32 }}><h1>Weekly Newsletter</h1><p>Opening the newsletter builder…</p><a href="/newsletter-builder">Open Newsletter Builder</a></div>;
}

export const WeeklyNewsletterPlugin = {
  __type: 'screen' as const,
  name: 'Weekly Newsletter',
  Icon: () => <span aria-hidden="true">✉️</span>,
  layout: 'fullscreen' as const,
  navCategory: 'Site' as const,
  Component: NewsletterScreen,
};
