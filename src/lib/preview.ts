import { apolloPreviewClient } from './apollo-client';
import { GET_PREVIEW_TARGET } from './queries';
import { BOOK_SLUG_BY_POST_TYPE } from './books';

/**
 * Resolve a WordPress post (by databaseId) to the frontend URL where its
 * preview should land. Returns null if the post type isn't one we've wired
 * through preview yet.
 */
export async function resolvePreviewTarget(databaseId: string | number): Promise<{
  postType: string;
  path: string;
} | null> {
  const { data } = await apolloPreviewClient().query({
    query: GET_PREVIEW_TARGET,
    variables: { id: String(databaseId) },
    fetchPolicy: 'no-cache',
  });
  const node: any = (data as any)?.contentNode;
  if (!node) return null;

  const postType = node?.contentType?.node?.name;
  const slug = node.slug || '';

  switch (postType) {
    case 'spurgeon_sermon':
      return { postType, path: `/sermons/${slug}` };
    case 'magazine_article':
      return { postType, path: `/sword-and-trowel/${slug}` };
    case 'all_of_grace':
    case 'lectures_students':
    case 'around_wicket_gate':
    case 'all_round_ministry':
    case 'autobiography': {
      // Per-book chapter CPTs — route to the book reader for that book.
      const bookSlug = BOOK_SLUG_BY_POST_TYPE[postType];
      return { postType, path: bookSlug ? `/books/${bookSlug}` : '/books' };
    }
    case 'morning_and_evening':
      return { postType, path: '/books/morning-and-evening' };
    case 'faiths_check_book':
      return { postType, path: '/books/faiths-check-book' };
    case 'treasury_entry':
      return { postType, path: '/books/treasury-of-david' };
    case 'tour_stop':
      return { postType, path: '/library/digital-tour' };
    case 'spurgeon_book':
      return { postType, path: `/books/${slug}` };
    case 'spurgeon_blog':
      return { postType, path: `/blog/${slug}` };
    case 'conference_media':
      return { postType, path: `/conference-media/${slug}` };
    default:
      return null;
  }
}
