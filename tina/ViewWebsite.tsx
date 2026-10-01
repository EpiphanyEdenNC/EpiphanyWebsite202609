import React, { useEffect } from 'react';

const ViewWebsiteIcon = () => <span aria-hidden="true">🏠</span>;

function ViewWebsiteScreen() {
  useEffect(() => {
    window.location.assign('/');
  }, []);

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '48px auto',
        padding: '0 24px',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: '28px' }}>View Website</h1>
        <p style={{ fontSize: '16px', lineHeight: 1.6 }}>
          Returning to the website…
        </p>
      </div>
    </div>
  );
}

export const ViewWebsitePlugin = {
  __type: 'screen' as const,
  name: 'View Website',
  Icon: ViewWebsiteIcon,
  layout: 'fullscreen' as const,
  navCategory: 'Site' as const,
  Component: ViewWebsiteScreen,
};
