import type { NextApiRequest, NextApiResponse } from 'next';

const WP_GRAPHQL = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

// Proxy client-side GraphQL requests to the WP backend so the browser
// never makes a cross-origin request (WP Engine doesn't send CORS headers).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const wpRes = await fetch(WP_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });

  const data = await wpRes.json();
  return res.status(wpRes.status).json(data);
}
