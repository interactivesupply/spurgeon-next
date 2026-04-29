import type { NextApiRequest, NextApiResponse } from 'next';
import { mg, MAILGUN_DOMAIN, NOTIFY_TO, NOTIFY_FROM } from '@/lib/mailgun';

const DEVOTIONAL_LABELS: Record<string, string> = {
  morning_and_evening: 'Morning & Evening',
  faiths_check_book: "Faith's Check Book",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, devotional, period } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!MAILGUN_DOMAIN || !process.env.MAILGUN_API_KEY) {
    return res.status(503).json({ error: 'Mailgun not configured' });
  }

  const devotionalLabel = DEVOTIONAL_LABELS[devotional] || devotional || 'devotional';
  const periodLabel = period ? ` (${period})` : '';

  try {
    await Promise.all([
      mg.messages.create(MAILGUN_DOMAIN, {
        from: NOTIFY_FROM,
        to: [email],
        subject: `You're subscribed to ${devotionalLabel}`,
        text: `Thank you for subscribing! You'll receive the ${devotionalLabel}${periodLabel} devotional in your inbox each day.\n\n— The Spurgeon Center`,
      }),
      mg.messages.create(MAILGUN_DOMAIN, {
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject: `New devotional subscriber: ${devotionalLabel}`,
        text: `New devotional subscription:\n\nEmail: ${email}\nDevotional: ${devotionalLabel}${periodLabel}\n`,
      }),
    ]);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Send failed' });
  }
}
