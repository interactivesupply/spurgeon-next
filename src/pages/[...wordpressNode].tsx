import type { GetStaticProps, GetStaticPaths } from 'next';

/**
 * Faust.js catch-all for WordPress-native pages and preview routes.
 * CPT-specific pages (sermons, books, etc.) take precedence over this catch-all
 * because Next.js prefers more specific file-system routes.
 *
 * For now this returns 404 for any unmatched path. When Faust.js preview mode
 * is wired up, this will use getNextStaticProps from @faustwp/core.
 */
export default function WordPressPage() {
  return null;
}

export const getStaticProps: GetStaticProps = async () => {
  return { notFound: true };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // fallback: false — this catch-all always returns notFound: true, so
  // 'blocking' adds no value and risks routing ambiguity in the Atlas runtime
  // (on-demand rendering fires for every unrecognised path before 404ing).
  return { paths: [], fallback: false };
};
