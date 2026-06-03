import type { NextApiRequest, NextApiResponse } from 'next';

const MC_BASE = 'https://mbts.us2.list-manage.com/subscribe/post';
const MC_U = '4bfccf87f1ae2e87932e5c764';
const MC_ID = '27339a547a';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const body = new URLSearchParams({
    u: MC_U,
    id: MC_ID,
    EMAIL: email.trim(),
    FNAME: (firstName || '').trim(),
    LNAME: (lastName || '').trim(),
  });

  try {
    const mcRes = await fetch(`${MC_BASE}?u=${MC_U}&id=${MC_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (mcRes.ok) return res.status(200).json({ success: true });
    return res.status(502).json({ error: 'Mailchimp request failed' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Subscribe failed' });
  }
}
