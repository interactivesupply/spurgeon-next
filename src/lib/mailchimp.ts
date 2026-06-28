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

export interface DevotionalCampaignOptions {
  subject: string;
  previewText?: string;
  html: string;
  tag: string;
  /** When set, sends a Mailchimp test email to this address instead of the full subscriber list. The draft campaign is deleted afterwards. */
  testEmail?: string;
}

export async function sendDevotionalCampaign({ subject, previewText, html, tag, testEmail }: DevotionalCampaignOptions) {
  if (!TOKEN) throw new Error('Mailchimp not configured');

  const base = `https://${SERVER}.api.mailchimp.com/3.0`;
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Tags in Mailchimp are stored as static segments — find by name.
  const segsRes = await fetch(`${base}/lists/${LIST_ID}/segments?type=static&count=1000`, { headers });
  if (!segsRes.ok) throw new Error('Failed to fetch Mailchimp segments');
  const segsData: any = await segsRes.json();
  const segment = segsData.segments?.find((s: any) => s.name === tag);
  if (!segment) throw new Error(`No Mailchimp segment found for tag: "${tag}"`);

  // Create campaign targeting the tag segment.
  const campRes = await fetch(`${base}/campaigns`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'regular',
      recipients: {
        list_id: LIST_ID,
        segment_opts: { saved_segment_id: segment.id },
      },
      settings: {
        subject_line: subject,
        preview_text: previewText ?? '',
        from_name: 'Spurgeon Library',
        reply_to: 'spurgeon@mbts.edu',
      },
    }),
  });
  if (!campRes.ok) {
    const err: any = await campRes.json().catch(() => ({}));
    throw new Error(err?.detail || 'Failed to create Mailchimp campaign');
  }
  const campaign: any = await campRes.json();

  const contentRes = await fetch(`${base}/campaigns/${campaign.id}/content`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ html }),
  });
  if (!contentRes.ok) {
    const err: any = await contentRes.json().catch(() => ({}));
    throw new Error(err?.detail || 'Failed to set campaign content');
  }

  if (testEmail) {
    // Accept one or more addresses (comma/whitespace separated). Strip stray
    // surrounding quotes — hosting env UIs (e.g. WP Engine Atlas) don't unquote
    // values, so a TEST_EMAIL_OVERRIDE saved as "x@y.com" arrives with literal
    // quotes and Mailchimp rejects it as an invalid email.
    const testEmails = testEmail
      .split(',')
      .map(e => e.trim().replace(/^["']+|["']+$/g, ''))
      .filter(Boolean);
    if (testEmails.length === 0) throw new Error('No valid test email address provided');

    // Send a preview to the test address only; delete the draft when done.
    const testRes = await fetch(`${base}/campaigns/${campaign.id}/actions/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ test_emails: testEmails, send_type: 'html' }),
    });
    await fetch(`${base}/campaigns/${campaign.id}`, { method: 'DELETE', headers });
    if (!testRes.ok) {
      const err: any = await testRes.json().catch(() => ({}));
      const fields = Array.isArray(err?.errors)
        ? ` (${err.errors.map((e: any) => `${e.field}: ${e.message}`).join('; ')})`
        : '';
      throw new Error(`${err?.detail || 'Failed to send test email'}${fields}`);
    }
    return;
  }

  const sendRes = await fetch(`${base}/campaigns/${campaign.id}/actions/send`, {
    method: 'POST',
    headers,
  });
  if (!sendRes.ok) {
    const err: any = await sendRes.json().catch(() => ({}));
    throw new Error(err?.detail || 'Failed to send campaign');
  }
}
