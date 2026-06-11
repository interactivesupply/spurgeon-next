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

  const mergeFields = {
    ...(firstName?.trim() && { FNAME: firstName.trim() }),
    ...(lastName?.trim()  && { LNAME: lastName.trim() }),
  };

  let memberRes = await fetch(`${base}/lists/${LIST_ID}/members/${hash}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      email_address: email.trim().toLowerCase(),
      status_if_new: 'pending',
      merge_fields: mergeFields,
    }),
  });

  // Existing members can have stale invalid values in dropdown fields (e.g.
  // STATE="OK") from old MBTS data imports. Mailchimp validates all dropdown
  // fields on every write, so those records block any PUT/PATCH. Clear STATE
  // and retry as a PATCH — which skips status_if_new (member already exists).
  if (!memberRes.ok) {
    const errBody: any = await memberRes.json().catch(() => ({}));
    if (errBody?.detail?.toLowerCase().includes('merge fields')) {
      memberRes = await fetch(`${base}/lists/${LIST_ID}/members/${hash}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          merge_fields: { ...mergeFields, STATE: '' },
        }),
      });
    }
    if (!memberRes.ok) {
      const err: any = await memberRes.json().catch(() => ({}));
      throw new Error(err?.detail || errBody?.detail || 'Mailchimp subscribe failed');
    }
  }

  await fetch(`${base}/lists/${LIST_ID}/members/${hash}/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tags: [{ name: tag, status: 'active' }] }),
  });
}
