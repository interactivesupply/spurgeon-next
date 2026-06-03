import { createHash } from 'crypto';

const SERVER  = process.env.MAILCHIMP_SERVER || 'us2';
const TOKEN   = process.env.MAILCHIMP_ACCESS_TOKEN;
const LIST_ID = '27339a547a';

function subscriberHash(email: string) {
  return createHash('md5').update(email.toLowerCase()).digest('hex');
}

interface SubscribeOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  tag: string;
}

export async function subscribeToList({ email, firstName, lastName, tag }: SubscribeOptions) {
  if (!TOKEN) throw new Error('Mailchimp not configured');

  const base    = `https://${SERVER}.api.mailchimp.com/3.0`;
  const hash    = subscriberHash(email.trim());
  const headers = {
    Authorization:  `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  const memberRes = await fetch(`${base}/lists/${LIST_ID}/members/${hash}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      email_address: email.trim().toLowerCase(),
      status_if_new: 'pending',
      merge_fields: {
        FNAME: (firstName || '').trim(),
        LNAME: (lastName || '').trim(),
      },
    }),
  });

  if (!memberRes.ok) {
    const err: any = await memberRes.json().catch(() => ({}));
    throw new Error(err?.detail || 'Mailchimp subscribe failed');
  }

  await fetch(`${base}/lists/${LIST_ID}/members/${hash}/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tags: [{ name: tag, status: 'active' }] }),
  });
}
