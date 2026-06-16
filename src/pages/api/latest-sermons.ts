import type { NextApiRequest, NextApiResponse } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';

const QUERY = gql`
  query LatestSermonsForHome {
    sermons(first: 10, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        excerpt
        sermonFields {
          scriptureReference
          year
        }
      }
    }
  }
`;

type SermonNode = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  sermonFields: {
    scriptureReference: string | null;
    year: number | null;
  } | null;
};

type SermonsQueryResult = {
  sermons: {
    nodes: SermonNode[];
  };
};

/**
 * Returns the 10 most recent published sermons, matching the shape used by
 * the homepage WeeklyPulpit component.
 *
 * This endpoint is fetched client-side as a fallback when the ISR-baked
 * latestSermons prop is empty — i.e., when the static page was generated
 * before sermons were imported into WordPress. Once ISR catches up and the
 * page is regenerated with sermons in the props, this fetch is skipped.
 *
 * GET /api/latest-sermons
 * → SermonNode[]
 */
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<SermonNode[]>,
) {
  try {
    const { data } = await apolloClient.query<SermonsQueryResult>({ query: QUERY });
    const nodes: SermonNode[] = data?.sermons?.nodes ?? [];

    // Sermons don't change by the minute; a 5-minute CDN cache reduces WP
    // query load while still serving fresh content after new imports.
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    return res.status(200).json(nodes);
  } catch (err: any) {
    console.error('[latest-sermons] WPGraphQL error:', err?.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json([]);
  }
}
