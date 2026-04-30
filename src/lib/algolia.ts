import { algoliasearch } from 'algoliasearch';

/**
 * Algolia client. Uses the search-only API key, which is read-only and
 * safe to expose in client JS bundles.
 */
const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';

export const algolia = APP_ID && SEARCH_KEY ? algoliasearch(APP_ID, SEARCH_KEY) : null;

export const ALGOLIA_INDEX =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX || 'dev_spurgeoncenter_searchable_posts';

/**
 * Reshape an Algolia hit from wp-search-with-algolia into the shape that
 * SearchResultCard expects. Currently only post_title / post_excerpt /
 * post_type / permalink are indexed by default; ACF fields like
 * scripture_reference, year, etc. require additional plugin configuration
 * and will be undefined until then.
 */
export interface AlgoliaHit {
  post_id: number;
  post_type: string;
  post_title: string;
  post_excerpt?: string;
  permalink: string;
  objectID: string;
  _highlightResult?: any;
  _snippetResult?: any;
  taxonomies?: any;

  // ACF fields injected by the spurgeon-algolia WP plugin
  scripture_reference?: string;
  topic?: string;
  year?: number | string;
  date_preached?: string;
  sermon_number?: string;
  notable_quote?: string;
  collection?: string;
  pdf_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  author?: string;
  issue?: string;
  category?: string;
  book?: string;
  chapter_number?: number | string;
  devotional?: string;
  month?: string;
  day?: number | string;
  period?: string;
  psalm?: number | string;
  verse?: number | string;
}

export interface ReshapedHit {
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  excerpt: string | null;
  type: string;
  postType: string;
  scripture_reference: string | null;
  topic: string | null;
  year: number | null;
  date_preached: string | null;
  sermon_number: string | null;
  collection: string | null;
  notable_quote: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  // book chapter routing
  book: string | null;
  // devotional routing
  devotional: string | null;
  // permalink fallback (raw WP path)
  permalinkPath: string;
}

const POST_TYPE_TO_TYPE: Record<string, string> = {
  spurgeon_sermon: 'sermon',
  magazine_article: 'article',
  book_chapter: 'book',
  devotional_entry: 'devotional',
  treasury_entry: 'treasury',
};

function extractPath(permalink: string): string {
  try {
    const u = new URL(permalink);
    return u.pathname.replace(/\/$/, '') || '/';
  } catch {
    return permalink;
  }
}

function extractSlug(permalink: string): string {
  const path = extractPath(permalink);
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

export function reshapeHit(hit: AlgoliaHit): ReshapedHit {
  return {
    id: hit.objectID,
    databaseId: hit.post_id,
    slug: extractSlug(hit.permalink),
    title: hit.post_title,
    excerpt: hit.post_excerpt || null,
    type: POST_TYPE_TO_TYPE[hit.post_type] || 'sermon',
    postType: hit.post_type,
    scripture_reference: hit.scripture_reference || null,
    topic: hit.topic || null,
    year: hit.year != null ? Number(hit.year) : null,
    date_preached: hit.date_preached || null,
    sermon_number: hit.sermon_number || null,
    collection: hit.collection || null,
    notable_quote: hit.notable_quote || null,
    video_url: hit.video_url || null,
    thumbnail_url: hit.thumbnail_url || null,
    book: hit.book || null,
    devotional: hit.devotional || null,
    permalinkPath: extractPath(hit.permalink),
  };
}

/**
 * Resolve the right Next.js URL for a search hit based on its post type.
 * Sermons → /sermons/[slug]
 * Magazine articles → /sword-and-trowel/[slug]
 * Book chapters → /books/[book] (the book reader page; we don't have per-chapter URLs)
 * Devotional entries → /books/morning-and-evening or /books/faiths-check-book
 * Treasury entries → /books/treasury-of-david
 * Anything else → fall back to the WP permalink path so the user lands somewhere.
 */
export function urlForHit(hit: ReshapedHit): string {
  switch (hit.postType) {
    case 'spurgeon_sermon':
      return `/sermons/${hit.slug}`;
    case 'magazine_article':
      return `/sword-and-trowel/${hit.slug}`;
    case 'book_chapter':
      // ACF stores book slug with underscores ("all_of_grace"); URLs use dashes.
      return hit.book ? `/books/${hit.book.replace(/_/g, '-')}` : '/books';
    case 'devotional_entry':
      return hit.devotional === 'faiths_check_book'
        ? '/books/faiths-check-book'
        : '/books/morning-and-evening';
    case 'treasury_entry':
      return '/books/treasury-of-david';
    default:
      return hit.permalinkPath || '/';
  }
}
