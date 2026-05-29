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
  // `collection` is emitted by spurgeon-algolia as either a single slug
  // (legacy records) or an array of slugs (current: leaf volume slug plus
  // derived series prefix). Treat both shapes uniformly downstream.
  collection?: string | string[];
  pdf_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  featured_image_url?: string;
  author?: string;
  issue?: string;
  category?: string;
  // Routing fields for deep-linking from search results.
  chapter_number?: number | string;          // autobiography + chaptered books
  month?: string;                            // morning_and_evening, faiths_check_book
  day?: number | string;
  period?: string;                           // morning_and_evening only
  psalm?: number | string;                   // treasury_entry
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
  collection: string[] | null;
  notable_quote: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  // Routing fields for deep-linking on search results
  chapter_number: number | null;             // autobiography reader → ?chapter=N
  month: string | null;                      // M&E and FCB readers → ?month=…
  day: number | null;                        // ?day=…
  period: string | null;                     // M&E reader → ?period=morning|evening
  psalm: number | null;                      // Treasury reader → ?psalm=…
  verse: number | null;                      // ?verse=…
  // permalink fallback (raw WP path)
  permalinkPath: string;
}

/**
 * Display label for each post type — used by SearchResultCard's badge,
 * search filters, and any other UI that surfaces the type. Single source
 * of truth so adding/renaming a CPT only needs one edit.
 */
/**
 * Render a sermon_collection slug as a human-readable label. Volume slugs
 * like "metropolitan-tabernacle-pulpit-volume-10" become "Metropolitan
 * Tabernacle Pulpit Volume 10"; series-prefix slugs collapse to their
 * series name. Anything in OVERRIDES wins; otherwise it's just title-case
 * on the hyphen-separated parts (good enough for everything in the
 * current taxonomy).
 */
const COLLECTION_LABEL_OVERRIDES: Record<string, string> = {
  other: 'Other Works',
};
export function prettyCollection(slug: string): string {
  if (COLLECTION_LABEL_OVERRIDES[slug]) return COLLECTION_LABEL_OVERRIDES[slug];
  return slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export const POST_TYPE_LABELS: Record<string, string> = {
  spurgeon_sermon: 'Sermon',
  magazine_article: 'Sword and Trowel',
  spurgeon_book: 'Book',
  all_of_grace: 'All of Grace',
  lectures_students: 'Lectures to My Students',
  around_wicket_gate: 'Around the Wicket Gate',
  all_round_ministry: 'An All-Round Ministry',
  autobiography: 'Autobiography',
  morning_and_evening: 'Morning and Evening',
  faiths_check_book: "Faith's Check Book",
  treasury_entry: 'Treasury of David',
  spurgeon_blog: 'Blog',
  spurgeon_article: 'Article',
  conference_media: 'Conference Media',
  puritan_catechism: 'A Puritan Catechism',
  commenting_books: 'Commenting and Commentaries',
  till_he_come: 'Till He Come',
  proverbs_sermons: 'Sermons on Proverbs',
  talks_to_farmers: 'Talks to Farmers',
  gleanings_sheaves: 'Gleanings among the Sheaves',
};

const POST_TYPE_TO_TYPE: Record<string, string> = {
  spurgeon_sermon: 'sermon',
  magazine_article: 'article',
  spurgeon_book: 'book',
  all_of_grace: 'book',
  lectures_students: 'book',
  around_wicket_gate: 'book',
  all_round_ministry: 'book',
  autobiography: 'book',
  morning_and_evening: 'devotional',
  faiths_check_book: 'devotional',
  treasury_entry: 'treasury',
  spurgeon_blog: 'blog',
  spurgeon_article: 'article',
  conference_media: 'conference_media',
};

/**
 * Append a query string to a base path, skipping any params whose value is
 * null/undefined. Keeps URLs clean when a hit doesn't have all the routing
 * fields populated (e.g. an autobiography chapter without a chapter_number).
 */
function withParams(path: string, params: Record<string, string | number | null | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

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
    type: POST_TYPE_TO_TYPE[hit.post_type] || hit.post_type,
    postType: hit.post_type,
    scripture_reference: hit.scripture_reference || null,
    topic: hit.topic || null,
    // Treat year=0 as "no year" — ACF number fields default to 0 when
    // unset, and 0 is meaningless for a Spurgeon-era publication date.
    // Also avoids React rendering the literal "0" when used as a JSX
    // child in a `&&` short-circuit.
    year: hit.year != null && Number(hit.year) > 0 ? Number(hit.year) : null,
    date_preached: hit.date_preached || null,
    sermon_number: hit.sermon_number || null,
    collection: Array.isArray(hit.collection)
      ? hit.collection
      : (hit.collection ? [hit.collection] : null),
    notable_quote: hit.notable_quote || null,
    video_url: hit.video_url || null,
    thumbnail_url: hit.thumbnail_url || hit.featured_image_url || null,
    chapter_number: hit.chapter_number != null ? Number(hit.chapter_number) : null,
    month: hit.month || null,
    day: hit.day != null ? Number(hit.day) : null,
    period: hit.period || null,
    psalm: hit.psalm != null ? Number(hit.psalm) : null,
    verse: hit.verse != null ? Number(hit.verse) : null,
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
    case 'spurgeon_book':
      return `/books/${hit.slug}`;
    // Per-book chapter CPTs — each routes to its book's reader page.
    // Chapters carry `chapter_number`, used by /books/<book>?chapter=N to
    // open directly to that chapter.
    case 'all_of_grace':
      return withParams('/books/all-of-grace', { chapter: hit.chapter_number });
    case 'lectures_students':
      return withParams('/books/lectures-to-my-students', { chapter: hit.chapter_number });
    case 'around_wicket_gate':
      return withParams('/books/around-the-wicket-gate', { chapter: hit.chapter_number });
    case 'all_round_ministry':
      return withParams('/books/an-all-round-ministry', { chapter: hit.chapter_number });
    case 'autobiography':
      return withParams('/books/autobiography', { chapter: hit.chapter_number });
    case 'puritan_catechism':
      return withParams('/books/puritan-catechism', { chapter: hit.chapter_number });
    case 'commenting_books':
      return withParams('/books/commenting-and-commentaries', { chapter: hit.chapter_number });
    case 'till_he_come':
      return withParams('/books/till-he-come', { chapter: hit.chapter_number });
    case 'proverbs_sermons':
      return withParams('/books/sermons-on-proverbs', { chapter: hit.chapter_number });
    case 'talks_to_farmers':
      return withParams('/books/talks-to-farmers', { chapter: hit.chapter_number });
    case 'gleanings_sheaves':
      return withParams('/books/gleanings-among-the-sheaves', { chapter: hit.chapter_number });
    case 'morning_and_evening':
      return withParams('/books/morning-and-evening', { month: hit.month, day: hit.day, period: hit.period });
    case 'faiths_check_book':
      return withParams('/books/faiths-check-book', { month: hit.month, day: hit.day });
    case 'treasury_entry':
      return withParams('/books/treasury-of-david', { psalm: hit.psalm, verse: hit.verse });
    case 'spurgeon_blog':
      return `/blog/${hit.slug}`;
    case 'spurgeon_article':
      return `/articles/${hit.slug}`;
    case 'conference_media':
      return `/conference-media/${hit.slug}`;
    default:
      return hit.permalinkPath || '/';
  }
}
