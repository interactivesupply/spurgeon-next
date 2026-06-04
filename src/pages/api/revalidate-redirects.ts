import type { NextApiRequest, NextApiResponse } from 'next';

const SECRET = process.env.HEADLESS_404_SECRET;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers['x-revalidate-secret'] ?? req.query.secret;
  if (!SECRET || token !== SECRET) return res.status(401).json({ error: 'Unauthorized' });

  // Setting expiry to 0 causes the middleware to treat the cache as stale.
  // The next incoming page request will trigger a background refresh.
  global.__redirectExpiry = 0;

  return res.status(200).json({ revalidated: true });
}
