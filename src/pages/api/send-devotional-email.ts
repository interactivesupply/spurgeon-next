import type { NextApiRequest, NextApiResponse } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_DEVOTIONAL_ENTRY, GET_FCB_ENTRY } from '@/lib/queries';
import { sendDevotionalCampaign } from '@/lib/mailchimp';

const CRON_SECRET = process.env.CRON_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spurgeon.org';

function getCTDateParts(): { month: string; day: string; year: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).formatToParts(new Date());
  return {
    month: parts.find(p => p.type === 'month')!.value,
    day:   parts.find(p => p.type === 'day')!.value,
    year:  parts.find(p => p.type === 'year')!.value,
  };
}

function buildEmailHtml(opts: {
  title: string;
  scripture: string;
  content: string;
  date: string;
  devotionalName: string;
}): string {
  const host = SITE_URL.replace(/\/$/, '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3ee;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ee;">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background-color:#1a1209;padding:32px 40px;text-align:center;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#c4a55a;">The Spurgeon Library</p>
        <h1 style="margin:10px 0 0;font-family:Georgia,serif;font-size:22px;color:#ffffff;font-weight:normal;">${opts.devotionalName}</h1>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.5);">${opts.date}</p>
      </td></tr>
      <tr><td style="background-color:#faf7f0;padding:20px 40px;border-bottom:1px solid #e8e0d0;">
        <p style="margin:0;font-family:Georgia,serif;font-size:16px;font-style:italic;color:#5c4a2a;line-height:1.7;">&ldquo;${opts.scripture}&rdquo;</p>
      </td></tr>
      <tr><td style="padding:32px 40px 8px;">
        <h2 style="margin:0;font-family:Georgia,serif;font-size:20px;color:#1a1209;font-weight:normal;">${opts.title}</h2>
      </td></tr>
      <tr><td style="padding:16px 40px 40px;">
        <div style="font-family:Georgia,serif;font-size:16px;line-height:1.8;color:#3a3028;">${opts.content}</div>
      </td></tr>
      <tr><td style="background-color:#f5f3ee;padding:24px 40px;border-top:1px solid #e8e0d0;text-align:center;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#8a7a6a;">
          You're receiving this because you subscribed at
          <a href="${host}" style="color:#5c4a2a;text-decoration:none;">${host.replace('https://', '')}</a>.
        </p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8a7a6a;">
          <a href="*|UNSUB|*" style="color:#5c4a2a;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

type DevotionalType = 'morning_and_evening' | 'faiths_check_book';
type Period = 'morning' | 'evening';

const TAGS: Record<DevotionalType, string> = {
  morning_and_evening: 'Spurgeon Library - Morning and Evening',
  faiths_check_book:   "Spurgeon Library - Faith's Check Book",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers['authorization'];
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const devotional = req.body?.devotional as DevotionalType;
  const period = (req.body?.period as Period) ?? 'morning';
  const testEmail = typeof req.body?.testEmail === 'string' ? req.body.testEmail : undefined;

  if (!devotional || !TAGS[devotional]) {
    return res.status(400).json({ error: 'devotional must be morning_and_evening or faiths_check_book' });
  }

  const { month, day, year } = getCTDateParts();
  const dateLabel = `${month} ${day}, ${year}`;

  try {
    let title: string;
    let scripture: string;
    let content: string;
    let devotionalName: string;
    let subject: string;

    if (devotional === 'morning_and_evening') {
      const { data } = await apolloClient.query({
        query: GET_DEVOTIONAL_ENTRY,
        variables: { month, day, period },
      });
      const entry = (data as any)?.morningAndEveningEntries?.nodes?.[0];
      if (!entry) return res.status(404).json({ error: `No M&E ${period} entry for ${dateLabel}` });

      title         = entry.title;
      scripture     = entry.morningAndEveningFields?.scripture ?? '';
      content       = entry.content ?? '';
      devotionalName = period === 'morning' ? 'Morning and Evening — Morning' : 'Morning and Evening — Evening';
      subject       = `${period === 'morning' ? 'Morning' : 'Evening'} Devotional — ${month} ${day}`;
    } else {
      const { data } = await apolloClient.query({
        query: GET_FCB_ENTRY,
        variables: { month, day },
      });
      const entry = (data as any)?.faithsCheckBookEntries?.nodes?.[0];
      if (!entry) return res.status(404).json({ error: `No Faith's Check-Book entry for ${dateLabel}` });

      title         = entry.title;
      scripture     = entry.faithsCheckBookFields?.scripture ?? '';
      content       = entry.content ?? '';
      devotionalName = "Faith's Check-Book";
      subject       = `Faith's Check-Book — ${month} ${day}`;
    }

    const html = buildEmailHtml({ title, scripture, content, date: dateLabel, devotionalName });

    await sendDevotionalCampaign({ subject, html, tag: TAGS[devotional], testEmail });

    return res.status(200).json({ success: true, subject, date: dateLabel, test: !!testEmail });
  } catch (err: any) {
    console.error('[send-devotional-email]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
