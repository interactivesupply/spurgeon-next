import type { NextApiRequest, NextApiResponse } from 'next';
import { subscribeToList } from '@/lib/mailchimp';

const TAGS: Record<string, string> = {
  morning_and_evening: 'Spurgeon Library - Morning and Evening',
  faiths_check_book:   'Spurgeon Library - Faith\'s Check Book',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, devotional } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email is required' });

  const tag = TAGS[devotional] ?? 'Spurgeon Library News';

  try {
    await subscribeToList({ email, tag });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    const status = err.message === 'Mailchimp not configured' ? 503 : 502;
    return res.status(status).json({ error: err.message });
  }
}
