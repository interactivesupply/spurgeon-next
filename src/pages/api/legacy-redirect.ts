import type { NextApiRequest, NextApiResponse } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { FIND_SERMON_BY_BASE44_ID } from '@/lib/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.redirect(302, '/search');
  }

  try {
    const { data } = await apolloClient.query({
      query: FIND_SERMON_BY_BASE44_ID,
      variables: { base44Id: id },
    });
    const slug = (data as any)?.sermons?.nodes?.[0]?.slug;
    if (slug) {
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
      return res.redirect(301, `/sermons/${slug}`);
    }
  } catch {
    // fall through to search
  }

  return res.redirect(302, '/search');
}
