import type { NextApiRequest, NextApiResponse } from 'next';
import { apolloClient } from '@/lib/apollo-client';
import { GET_NODE_BY_DATABASE_ID, previewPathForPost } from '@/lib/preview';

/**
 * Live preview entrypoint. WordPress's "Preview" / "View Post" buttons on
 * draft CPT records redirect here with ?postId=X&postType=Y&secret=Z.
 *
 * Flow:
 *   1. Validate secret matches SPURGEON_PREVIEW_SECRET env var.
 *   2. Resolve the post's slug (and confirm post type) via WPGraphQL.
 *   3. Set Next.js preview cookie with { postId, postType }.
 *   4. Redirect to the post's frontend URL.
 *
 * Detail pages (/sermons/[slug], /sword-and-trowel/[slug], etc.) check
 * `context.preview` in their getStaticProps and, when true, fetch the
 * post by databaseId instead of slug — which serves the latest draft
 * via the authenticated GraphQL connection (basic auth currently runs as
 * an admin user, so drafts are visible).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId, postType, secret } = req.query;

  if (!secret || secret !== process.env.SPURGEON_PREVIEW_SECRET) {
    return res.status(401).send('Invalid preview secret');
  }
  if (!postId || !postType) {
    return res.status(400).send('Missing postId or postType');
  }

  let slug = '';
  let actualPostType = String(postType);
  try {
    const { data } = await apolloClient.query({
      query: GET_NODE_BY_DATABASE_ID,
      variables: { id: String(postId) },
    });
    const node = (data as any)?.contentNode;
    if (!node) {
      return res.status(404).send('Post not found in WordPress');
    }
    slug = node.slug || '';
    const resolvedType = node?.contentType?.node?.name;
    if (resolvedType) actualPostType = resolvedType;
  } catch (err: any) {
    console.error('[preview] post lookup failed', err?.message);
    return res.status(500).send('Failed to resolve post');
  }

  res.setPreviewData({ postId: String(postId), postType: actualPostType });

  const path = previewPathForPost(actualPostType, slug);
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  return res.redirect(307, path);
}
