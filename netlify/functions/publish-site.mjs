export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json(
      { message: 'Method not allowed.' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return Response.json(
      { message: 'You must be signed in to Tina to publish the website.' },
      { status: 401 }
    );
  }

  const clientId = process.env.PUBLIC_TINA_CLIENT_ID;
  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;

  if (!clientId || !buildHookUrl) {
    console.error('Publish function is missing required environment variables.');
    return Response.json(
      { message: 'Website publishing has not been fully configured yet.' },
      { status: 500 }
    );
  }

  try {
    const userResponse = await fetch(
      `https://identity.tinajs.io/v2/apps/${encodeURIComponent(clientId)}/currentUser`,
      {
        method: 'GET',
        headers: {
          Authorization: authorization,
        },
      }
    );

    if (!userResponse.ok) {
      return Response.json(
        { message: 'Your Tina session could not be verified. Please sign in again.' },
        { status: 401 }
      );
    }

    const deployResponse = await fetch(buildHookUrl, {
      method: 'POST',
    });

    if (!deployResponse.ok) {
      const detail = await deployResponse.text().catch(() => '');
      console.error('Netlify build hook failed', deployResponse.status, detail);
      return Response.json(
        { message: 'Netlify could not start the website publish.' },
        { status: 502 }
      );
    }

    return Response.json(
      { message: 'Website publish started.' },
      { status: 202 }
    );
  } catch (error) {
    console.error('Publish function error', error);
    return Response.json(
      { message: 'Unable to start the website publish. Please try again.' },
      { status: 500 }
    );
  }
};
