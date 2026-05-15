import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Decode the HTML entities WordPress emits for smart punctuation. WordPress
 * stores text with entities like &#8217; (’), &#8220;/&#8221; (“ ”), &#8212;
 * (—) and so on. dangerouslySetInnerHTML decodes these via the browser's HTML
 * parser; React children rendered as {value} do not, so curly quotes show up
 * literally as &#8217; in the UI. Use this anywhere a WP text field
 * (title, excerpt, etc.) is interpolated as plain text.
 */
const NUMERIC_ENTITY = /&#(x?[0-9a-fA-F]+);/g;
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

export function decodeEntities(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(NUMERIC_ENTITY, (_, code) => {
      const cp = code.startsWith('x') || code.startsWith('X')
        ? parseInt(code.slice(1), 16)
        : parseInt(code, 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : _;
    })
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}

/**
 * Strip HTML tags AND decode entities. Useful for line-clamped previews
 * (search results, card excerpts) where structure adds nothing but punctuation
 * needs to render correctly.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return '';
  return decodeEntities(input.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

/**
 * Strip a leading heading tag from imported body HTML when its text content
 * matches the post's title (and any immediately-following empty paragraphs).
 * Spurgeon sermon imports embed `<h2>Title</h2>` at the top of post_content,
 * which renders as a duplicate of the page title shown above (Userback
 * #7655929). Keeps any opening wrapper <div> intact.
 */
export function stripDuplicatedTitle(html: string | null | undefined, title: string | null | undefined): string {
  if (!html || !title) return html || '';
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(
    new RegExp(
      `((?:<div[^>]*>\\s*)?)\\s*<h[1-5][^>]*>\\s*${escaped}\\s*</h[1-5]>\\s*(?:<p[^>]*>(?:\\s|&nbsp;|<br\\s*/?>)*</p>\\s*)*`,
      'i'
    ),
    '$1'
  );
}
