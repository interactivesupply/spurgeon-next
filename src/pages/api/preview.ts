import type { NextApiRequest, NextApiResponse } from 'next';
import { resolvePreviewTarget } from '@/lib/preview';

/**
 * Live preview entrypoint. WordPress's "Preview" / "View Post" buttons on
 * draft CPT records redirect here with ?postId=X&postType=Y&secret=Z.
 *
 * Flow:
 *   1. Validate secret matches SPURGEON_PREVIEW_SECRET env var.
 *   2. Look up the post via WPGraphQL by databaseId. The lookup includes
 *      the routing-relevant fields per post type (e.g. book chapter's book
 *      ACF for figuring out which /books/<slug> to redirect to).
 *   3. Set Next.js preview cookie with { postId, postType }.
 *   4. Redirect to the post's frontend URL.
 *
 * Detail pages check `context.preview` in their getStaticProps and, when
 * true, fetch the post by databaseId with asPreview: true to get draft
 * content via the authenticated GraphQL connection.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId, secret } = req.query;

  if (!secret || secret !== process.env.SPURGEON_PREVIEW_SECRET) {
    return res.status(401).send('Invalid preview secret');
  }
  if (!postId) {
    return res.status(400).send('Missing postId');
  }

  let target: { postType: string; path: string } | null = null;
  try {
    target = await resolvePreviewTarget(String(postId));
  } catch (err: any) {
    console.error('[preview] post lookup failed', err?.message);
    return res.status(500).send('Failed to resolve post');
  }
  if (!target) {
    return res.status(404).send('Post not found or post type does not support preview');
  }

  res.setPreviewData({ postId: String(postId), postType: target.postType });
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  return res.redirect(307, target.path);
}
