import type { NextApiRequest, NextApiResponse } from 'next';
import { subscribeToList } from '@/lib/mailchimp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, lastName, email } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email is required' });

  try {
    await subscribeToList({ email, firstName, lastName, tag: 'Spurgeon Library News' });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    const status = err.message === 'Mailchimp not configured' ? 503 : 502;
    return res.status(status).json({ error: err.message });
  }
}
