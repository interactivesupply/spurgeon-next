/**
 * Canonical Bible book list, in Protestant canonical order, split into
 * Old / New Testaments. Used by the Scripture browse pages and the
 * Scripture filter dropdown to render books in a familiar order rather
 * than alphabetical / count-sorted.
 *
 * Book names match the strings used in the `taxonomies_hierarchical.
 * scripture_chapter.lvl0` Algolia facet, so they're suitable for direct
 * comparison against facet values.
 */

export const OLD_TESTAMENT: readonly string[] = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
];

export const NEW_TESTAMENT: readonly string[] = [
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

export const BIBLE_BOOKS: readonly string[] = [...OLD_TESTAMENT, ...NEW_TESTAMENT];

const BOOK_RANK = Object.fromEntries(BIBLE_BOOKS.map((b, i) => [b, i] as const));

/**
 * Stable canonical order for a Bible book. Books not in the canon
 * sort to the end (alphabetically by their text value).
 */
export function bookRank(name: string): number {
  const r = BOOK_RANK[name];
  return r === undefined ? Number.MAX_SAFE_INTEGER : r;
}

/** URL slug for a book name. "1 Corinthians" -> "1-corinthians". */
export function bookSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

const SLUG_TO_BOOK = Object.fromEntries(BIBLE_BOOKS.map((b) => [bookSlug(b), b] as const));

/** Reverse of bookSlug; returns the canonical book name or null. */
export function bookFromSlug(slug: string): string | null {
  return SLUG_TO_BOOK[slug.toLowerCase()] || null;
}

/**
 * Parse "Book 10" or "Book Chapter" form (the shape of
 * taxonomies_hierarchical.scripture_chapter.lvl1 facet values) into
 * its numeric chapter component. Returns null if the chapter portion
 * isn't a plain integer.
 */
export function chapterNumberFromCombo(combo: string): number | null {
  const m = combo.match(/\b(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : null;
}
