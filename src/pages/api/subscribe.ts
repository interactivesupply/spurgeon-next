import type { NextApiRequest, NextApiResponse } from 'next';
import { mg, MAILGUN_DOMAIN, NOTIFY_TO, NOTIFY_FROM } from '@/lib/mailgun';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!MAILGUN_DOMAIN || !process.env.MAILGUN_API_KEY) {
    return res.status(503).json({ error: 'Mailgun not configured' });
  }

  try {
    await mg().messages.create(MAILGUN_DOMAIN, {
      from: NOTIFY_FROM,
      to: [NOTIFY_TO],
      subject: 'New Spurgeon Center subscriber',
      text: `New subscriber:\n\nName: ${firstName || ''} ${lastName || ''}\nEmail: ${email}\n`,
    });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Send failed' });
  }
}
