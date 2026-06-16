import type { NextApiRequest, NextApiResponse } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_DEVOTIONAL_ENTRY } from '@/lib/queries';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type DevotionalPayload = {
  title: string | null;
  text: string | null;
  scripture: string | null;
} | null;

type DevotionalQueryResult = {
  morningAndEveningEntries: {
    nodes: Array<{
      title: string | null;
      content: string | null;
      morningAndEveningFields: {
        scripture: string | null;
      } | null;
    }>;
  } | null;
};

/**
 * Returns this morning's Morning & Evening devotional for the requested date.
 *
 * The caller passes ?month=June&day=16 computed in the browser's local timezone
 * so the content always matches the date label shown in the UI, even when the
 * home page ISR cache was generated on a different calendar day.
 *
 * Falls back to the server's current UTC date when no params are provided.
 *
 * GET /api/today-devotional?month=June&day=16
 * → { title, text, scripture } | null
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DevotionalPayload>,
) {
  const now = new Date();
  const month =
    typeof req.query.month === 'string' ? req.query.month : MONTHS[now.getMonth()];
  const day =
    typeof req.query.day === 'string' ? req.query.day : String(now.getDate());

  try {
    const { data } = await apolloClient.query<DevotionalQueryResult>({
      query: GET_DEVOTIONAL_ENTRY,
      variables: { month, day, period: 'morning' },
    });
    const node = data?.morningAndEveningEntries?.nodes?.[0] ?? null;

    if (!node) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(null);
    }

    // Devotionals change once a day; a 5-minute CDN cache is safe and keeps
    // WP query volume low on high-traffic days.
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    return res.status(200).json({
      title: node.title ?? null,
      text: node.content ?? null,
      scripture: node.morningAndEveningFields?.scripture ?? null,
    });
  } catch (err: any) {
    console.error('[today-devotional] WPGraphQL error:', err?.message);
    // Return null rather than 500 — the component falls back to the ISR prop
    // or placeholder, which is always better than a visible error state.
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(null);
  }
}
