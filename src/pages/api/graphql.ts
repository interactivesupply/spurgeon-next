import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Server-side GraphQL proxy. Browser-side Apollo client posts here; we
 * forward to the WordPress GraphQL endpoint with basic auth attached on
 * the server, where the credentials live in env vars and never reach the
 * browser. Avoids the cross-origin preflight issue caused by nginx-level
 * basic auth on the WP install.
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';
  if (!wpUrl) {
    return res.status(500).json({ error: 'NEXT_PUBLIC_WORDPRESS_URL not set' });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const user = process.env.WORDPRESS_BASIC_AUTH_USER;
  const pass = process.env.WORDPRESS_BASIC_AUTH_PASSWORD;
  if (user && pass) {
    headers.Authorization = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
  }

  try {
    const upstream = await fetch(`${wpUrl}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err: any) {
    return res.status(502).json({ error: err?.message || 'Upstream error' });
  }
}
