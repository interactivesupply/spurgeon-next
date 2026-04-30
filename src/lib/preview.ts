import { apolloClient } from './apollo-client';
import { GET_PREVIEW_TARGET } from './queries';

/**
 * Map the `book` ACF value (underscored, e.g. "all_of_grace") to a frontend
 * slug (dashed). Mirrors the seeded spurgeon_book slugs.
 */
const BOOK_SLUG_FROM_FILTER: Record<string, string> = {
  all_of_grace: 'all-of-grace',
  lectures_to_my_students: 'lectures-to-my-students',
  around_the_wicket_gate: 'around-the-wicket-gate',
  an_all_round_ministry: 'an-all-round-ministry',
  autobiography: 'autobiography',
};

function flat(value: any) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Resolve a WordPress post (by databaseId) to the frontend URL where its
 * preview should land. Returns null if the post type isn't one we've wired
 * through preview yet.
 */
export async function resolvePreviewTarget(databaseId: string | number): Promise<{
  postType: string;
  path: string;
} | null> {
  const { data } = await apolloClient.query({
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
    case 'book_chapter': {
      const bookFilter = flat(node?.bookChapterFields?.book);
      const bookSlug = bookFilter ? BOOK_SLUG_FROM_FILTER[bookFilter] || '' : '';
      return { postType, path: bookSlug ? `/books/${bookSlug}` : '/books' };
    }
    case 'devotional_entry': {
      const devo = flat(node?.devotionalEntryFields?.devotional);
      return { postType, path: devo === 'faiths_check_book' ? '/books/faiths-check-book' : '/books/morning-and-evening' };
    }
    case 'treasury_entry':
      return { postType, path: '/books/treasury-of-david' };
    case 'tour_stop':
      return { postType, path: '/library/digital-tour' };
    case 'spurgeon_book':
      return { postType, path: `/books/${slug}` };
    default:
      return null;
  }
}
