/**
 * Per-book CPT configuration. Each chaptered book has its own WordPress
 * CPT, and the reader page at /books/[book] dispatches the right GraphQL
 * query based on the URL slug.
 *
 * The post_type identifiers are short (≤20 chars per WP's limit), but the
 * GraphQL field names use the full descriptive form so queries read clearly.
 */
export interface BookCptConfig {
  postType: string;
  graphqlPlural: string;
  graphqlSingle: string;
  /** Display name for badges, breadcrumbs, search labels */
  displayName: string;
}

export const BOOK_CPT_BY_SLUG: Record<string, BookCptConfig> = {
  'all-of-grace': {
    postType: 'all_of_grace',
    graphqlPlural: 'allOfGraceChapters',
    graphqlSingle: 'allOfGraceChapter',
    displayName: 'All of Grace',
  },
  'lectures-to-my-students': {
    postType: 'lectures_students',
    graphqlPlural: 'lecturesToMyStudentsChapters',
    graphqlSingle: 'lecturesToMyStudentsChapter',
    displayName: 'Lectures to My Students',
  },
  'around-the-wicket-gate': {
    postType: 'around_wicket_gate',
    graphqlPlural: 'aroundTheWicketGateChapters',
    graphqlSingle: 'aroundTheWicketGateChapter',
    displayName: 'Around the Wicket Gate',
  },
  'an-all-round-ministry': {
    postType: 'all_round_ministry',
    graphqlPlural: 'anAllRoundMinistryChapters',
    graphqlSingle: 'anAllRoundMinistryChapter',
    displayName: 'An All-Round Ministry',
  },
  'autobiography': {
    postType: 'autobiography',
    graphqlPlural: 'autobiographyChapters',
    graphqlSingle: 'autobiographyChapter',
    displayName: 'Autobiography',
  },
  'puritan-catechism': {
    postType: 'puritan_catechism',
    graphqlPlural: 'puritanCatechismSections',
    graphqlSingle: 'puritanCatechismSection',
    displayName: 'A Puritan Catechism',
  },
  'commenting-and-commentaries': {
    postType: 'commenting_books',
    graphqlPlural: 'commentingChapters',
    graphqlSingle: 'commentingChapter',
    displayName: 'Commenting and Commentaries',
  },
  'till-he-come': {
    postType: 'till_he_come',
    graphqlPlural: 'tillHeComeMeditations',
    graphqlSingle: 'tillHeComeMeditation',
    displayName: 'Till He Come',
  },
  'sermons-on-proverbs': {
    postType: 'proverbs_sermons',
    graphqlPlural: 'proverbsSermons',
    graphqlSingle: 'proverbsSermon',
    displayName: 'Sermons on Proverbs',
  },
  'talks-to-farmers': {
    postType: 'talks_to_farmers',
    graphqlPlural: 'talksToFarmersChapters',
    graphqlSingle: 'talksToFarmersChapter',
    displayName: 'Talks to Farmers',
  },
  'gleanings-among-the-sheaves': {
    postType: 'gleanings_sheaves',
    graphqlPlural: 'gleaningsSections',
    graphqlSingle: 'gleaningsSection',
    displayName: 'Gleanings among the Sheaves',
  },
};

/** Reverse lookup: post_type → URL slug. */
export const BOOK_SLUG_BY_POST_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(BOOK_CPT_BY_SLUG).map(([slug, cfg]) => [cfg.postType, slug])
);

/** All book post_types that contain chapters. */
export const BOOK_CHAPTER_POST_TYPES = Object.values(BOOK_CPT_BY_SLUG).map(c => c.postType);

import { gql, type DocumentNode } from '@apollo/client';

/**
 * Build a "fetch all chapters of a book" GraphQL query for the given CPT.
 * Each per-book CPT has the same shape (title, content, chapter_number from
 * the shared `bookChapterFields` ACF group), so the query template only varies
 * by the WPGraphQL plural field name.
 *
 * Cached so each book's query DocumentNode is reused across renders.
 */
const _chaptersQueryCache: Record<string, DocumentNode> = {};
export function chaptersQueryFor(cfg: BookCptConfig): DocumentNode {
  if (_chaptersQueryCache[cfg.graphqlPlural]) {
    return _chaptersQueryCache[cfg.graphqlPlural];
  }
  const q = gql`
    query Get${cfg.graphqlPlural} {
      ${cfg.graphqlPlural}(first: 200, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
        nodes {
          databaseId
          title
          slug
          content
          bookChapterFields { chapterNumber }
        }
      }
    }
  `;
  _chaptersQueryCache[cfg.graphqlPlural] = q;
  return q;
}

/**
 * Build a "preview-by-databaseId" GraphQL query for the given CPT — used by
 * /api/preview to fetch the latest autosaved revision when an editor clicks
 * Preview on a draft chapter.
 */
const _byIdQueryCache: Record<string, DocumentNode> = {};
export function chapterByIdQueryFor(cfg: BookCptConfig): DocumentNode {
  if (_byIdQueryCache[cfg.graphqlSingle]) {
    return _byIdQueryCache[cfg.graphqlSingle];
  }
  const q = gql`
    query Get${cfg.graphqlSingle}ById($id: ID!) {
      ${cfg.graphqlSingle}(id: $id, idType: DATABASE_ID, asPreview: true) {
        databaseId
        title
        slug
        content
        bookChapterFields { chapterNumber }
      }
    }
  `;
  _byIdQueryCache[cfg.graphqlSingle] = q;
  return q;
}
