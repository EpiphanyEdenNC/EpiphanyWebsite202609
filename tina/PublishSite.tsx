import React, { useState } from 'react';
import { useCMS } from 'tinacms';

const PublishIcon = () => <span aria-hidden="true">🚀</span>;

function PublishSiteScreen() {
  const cms = useCMS();
  const [status, setStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const publishSite = async () => {
    setStatus('publishing');
    setMessage('Starting website publish…');

    try {
      const response = await cms.api.tina.authProvider.fetchWithToken(
        '/.netlify/functions/publish-site',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || 'Unable to start the website publish.');
      }

      setStatus('success');
      setMessage(
        'Publish started successfully. Netlify is building the latest saved version of the website.'
      );
    } catch (error) {
      console.error('Website publish failed', error);
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start the website publish. Please try again.'
      );
    }
  };

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
        <h1 style={{ marginTop: 0, fontSize: '28px' }}>Publish Website</h1>

        <p style={{ fontSize: '16px', lineHeight: 1.6 }}>
          Your Tina saves are stored without immediately rebuilding the public website.
          When you are finished making changes, use this button to publish all saved
          changes to the live website.
        </p>

        <p style={{ fontSize: '16px', lineHeight: 1.6 }}>
          You can save as many times as needed before publishing.
        </p>

        <button
          type="button"
          onClick={publishSite}
          disabled={status === 'publishing'}
          style={{
            marginTop: '12px',
            padding: '12px 20px',
            border: 0,
            borderRadius: '8px',
            background: status === 'publishing' ? '#9ca3af' : '#2563eb',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: status === 'publishing' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'publishing' ? 'Publishing…' : 'Publish Website'}
        </button>

        {message ? (
          <div
            role="status"
            style={{
              marginTop: '20px',
              padding: '14px 16px',
              borderRadius: '8px',
              background:
                status === 'success'
                  ? '#ecfdf5'
                  : status === 'error'
                    ? '#fef2f2'
                    : '#eff6ff',
              color:
                status === 'success'
                  ? '#065f46'
                  : status === 'error'
                    ? '#991b1b'
                    : '#1e3a8a',
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const PublishSitePlugin = {
  __type: 'screen' as const,
  name: 'Publish Website',
  Icon: PublishIcon,
  layout: 'fullscreen' as const,
  Component: PublishSiteScreen,
};
