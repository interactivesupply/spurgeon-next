import type { NextApiRequest, NextApiResponse } from 'next';

const WP_BASE = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const SECRET  = process.env.HEADLESS_404_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Fail silently if not configured — never block the user on a logging call.
  if (!SECRET || !WP_BASE) return res.status(200).end();

  const { url, referrer, agent } = req.body || {};

  try {
    await fetch(`${WP_BASE}/wp-json/spurgeon/v1/log-404`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-404-Secret': SECRET,
      },
      body: JSON.stringify({ url, referrer, agent }),
    });
  } catch {
    // Logging failure should never surface to the user.
  }

  return res.status(200).end();
}
