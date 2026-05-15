import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

export const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
export const NOTIFY_TO = 'blinger+spurgeon@interactivesupply.com';
export const NOTIFY_FROM = `Spurgeon Library <noreply@${MAILGUN_DOMAIN}>`;

// Lazy-initialize the Mailgun client. Constructing it at module-load
// time throws "Parameter \"key\" is required" when MAILGUN_API_KEY is
// unset, which would 500 any API route that even imports this file
// (e.g. /api/subscribe-devotional). Call sites use `mg().messages.create(...)`.
let _client: ReturnType<typeof mailgun.client> | null = null;
export function mg(): ReturnType<typeof mailgun.client> {
  if (_client) return _client;
  const key = process.env.MAILGUN_API_KEY;
  if (!key) throw new Error('MAILGUN_API_KEY is not set');
  _client = mailgun.client({ username: 'api', key });
  return _client;
}
