import { gql } from '@apollo/client';

/**
 * Build the frontend URL for a post given its post type + slug. Used by the
 * /api/preview route to redirect to the right detail page after setting the
 * preview cookie.
 */
export function previewPathForPost(postType: string, slug: string): string {
  switch (postType) {
    case 'spurgeon_sermon':
      return `/sermons/${slug}`;
    case 'magazine_article':
      return `/sword-and-trowel/${slug}`;
    case 'book_chapter':
      return `/books`;
    case 'devotional_entry':
      return `/books/morning-and-evening`;
    case 'treasury_entry':
      return `/books/treasury-of-david`;
    case 'tour_stop':
      return `/library/digital-tour`;
    case 'spurgeon_book':
      return `/books/${slug}`;
    default:
      return '/';
  }
}

/**
 * Look up post type + slug from a databaseId. Used by /api/preview when only
 * the WordPress numeric post ID is known. Issues a single GraphQL request
 * via the contentNode union, which works for any registered CPT.
 */
export const GET_NODE_BY_DATABASE_ID = gql`
  query GetNodeByDatabaseId($id: ID!) {
    contentNode(id: $id, idType: DATABASE_ID) {
      databaseId
      slug
      ... on ContentNode {
        contentType {
          node { name }
        }
      }
    }
  }
`;

/**
 * Generic single-node lookup by databaseId for use during preview rendering
 * (so getStaticProps can fetch a draft post by ID rather than slug). Returns
 * the union ContentNode; callers narrow with type-conditional fragments as
 * needed.
 */
export const GET_PREVIEW_NODE = gql`
  query GetPreviewNode($id: ID!) {
    contentNode(id: $id, idType: DATABASE_ID) {
      databaseId
      slug
      status
      ... on Sermon {
        title
        content
        excerpt
        sermonFields {
          sermonNumber
          scriptureReference
          topic
          year
          datePreached
          notableQuote
          pdfUrl
          videoUrl
          thumbnailUrl
        }
        sermonCollections {
          nodes { slug name }
        }
      }
      ... on MagazineArticle {
        title
        content
        excerpt
        magazineArticleFields {
          author
          issue
          category
          coverImageUrl
          scriptureReference
          bookTitle
          bookAuthor
        }
      }
    }
  }
`;
