#!/usr/bin/env node
/**
 * Build the legacy spurgeon.org → new headless URL redirect map.
 *
 * Regenerate after a content migration. Expects the inputs listed below
 * (default location: /tmp/spurgeon-migration/, override with WP_REDIRECT_DATA_DIR).
 *
 * Inputs:
 *   mere_resource-{1,2,3}.urls.txt   — legacy URL list from sitemap
 *   page-1.urls.txt                  — legacy page URLs from sitemap
 *   legacy-posts.tsv                 — ID, post_name, rtype (mere_resource only)
 *   legacy-titles.tsv                — ID, title (mere_resource only)
 *   new-posts.tsv                    — ID, post_name, post_type, source_url
 *   new-titles.tsv                   — ID, title
 *
 * How to refresh the inputs:
 *   # legacy sitemap → URL lists
 *   curl -s https://www.spurgeon.org/wp-sitemap.xml | ...
 *   # legacy WP-CLI dumps (run via ssh spurgeonkc@spurgeonkc.ssh.wpengine.net)
 *   wp db query "SELECT p.ID,p.post_name,(... mere_resource_type ...) FROM wp_posts p
 *                WHERE p.post_type='mere_resource' AND p.post_status='publish' LIMIT 5000"
 *   # new WP-CLI dumps (run via ssh spurgeoncenter@spurgeoncenter.ssh.wpengine.net)
 *   wp db query "SELECT p.ID,p.post_name,p.post_type,(source_url meta) FROM wp_posts p
 *                WHERE p.post_status='publish' AND p.post_type IN (... CPT list ...)"
 *
 * Output:
 *   wp-legacy-redirects.js           — array of { source, destination, permanent: true }
 *   docs/redirect-mapping-report.md  — coverage / debugging report
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DIR = process.env.WP_REDIRECT_DATA_DIR || '/tmp/spurgeon-migration';
const OUT_REDIRECTS = path.join(REPO_ROOT, 'wp-legacy-redirects.js');
const OUT_REPORT = path.join(REPO_ROOT, 'docs/redirect-mapping-report.md');

// ---------- helpers ----------
function readTsv(file) {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
  return raw.split('\n').filter(Boolean).map(l => l.split('\t'));
}
function normalizeTitle(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    // strip smart quotes and common HTML entities
    .replace(/[‘’‚‛′‵]/g, "'")
    .replace(/[“”„‟″‶]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/â€™|â€˜|â€š|â€›/g, "'")
    .replace(/â€œ|â€|â€š|â€ž/g, '"')
    .replace(/â€“|â€”/g, '-')
    .replace(/&#8217;|&#8216;|&rsquo;|&lsquo;|&apos;/gi, "'")
    .replace(/&#8220;|&#8221;|&rdquo;|&ldquo;|&quot;/gi, '"')
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/gi, '-')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z0-9#]+;/gi, '') // drop other entities
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// ---------- load data ----------
const legacyPosts = readTsv('legacy-posts.tsv');     // ID, post_name, rtype
const legacyTitles = readTsv('legacy-titles.tsv');   // ID, title
const newPosts = readTsv('new-posts.tsv');           // ID, post_name, post_type, source_url
const newTitles = readTsv('new-titles.tsv');         // ID, title

const legacyTitleById = new Map(legacyTitles.map(([id, title]) => [id, title]));
const newTitleById = new Map(newTitles.map(([id, title]) => [id, title]));

// legacy: slug → { id, rtype, title }
const legacyBySlug = new Map();
for (const [id, slug, rtype] of legacyPosts) {
  if (!slug) continue;
  legacyBySlug.set(slug, { id, rtype: rtype || '', title: legacyTitleById.get(id) || '' });
}

// new: slug → array of { id, postType, sourceUrl, title }
const newBySlug = new Map();
const newByTitle = new Map(); // normalized title → array
const newBySourceUrl = new Map();
for (const [id, slug, postType, sourceUrl] of newPosts) {
  if (!slug) continue;
  const title = newTitleById.get(id) || '';
  const rec = { id, slug, postType, sourceUrl: sourceUrl || '', title };
  if (!newBySlug.has(slug)) newBySlug.set(slug, []);
  newBySlug.get(slug).push(rec);
  const tk = normalizeTitle(title);
  if (tk) {
    if (!newByTitle.has(tk)) newByTitle.set(tk, []);
    newByTitle.get(tk).push(rec);
  }
  if (sourceUrl) {
    // normalize: strip trailing slash, lowercase, drop www
    const key = sourceUrl.replace(/\/$/, '').toLowerCase();
    newBySourceUrl.set(key, rec);
  }
}

// ---------- destination URL builder ----------
const POST_TYPE_PREFIX = {
  spurgeon_sermon: '/sermons/',
  spurgeon_blog: '/blog/',
  spurgeon_article: '/articles/',
  magazine_article: '/sword-and-trowel/',
  conference_media: '/conference-media/',
  spurgeon_book: '/books/',
};
// Book-chapter post types redirect to the parent book reader page.
const BOOK_CHAPTER_TO_BOOK_SLUG = {
  autobiography: 'autobiography',
  all_of_grace: 'all-of-grace',
  lectures_students: 'lectures-to-my-students',
  around_wicket_gate: 'around-the-wicket-gate',
  all_round_ministry: 'an-all-round-ministry',
  puritan_catechism: 'puritan-catechism',
  commenting_books: 'commenting-and-commentaries',
  till_he_come: 'till-he-come',
  proverbs_sermons: 'sermons-on-proverbs',
  talks_to_farmers: 'talks-to-farmers',
  gleanings_sheaves: 'gleanings-among-the-sheaves',
};
// These devotional CPTs use the /devotionals/<slug> runtime resolver.
const DEVOTIONAL_POST_TYPES = new Set(['morning_and_evening', 'faiths_check_book']);
const TREASURY_POST_TYPE = 'treasury_entry';
const TOUR_POST_TYPE = 'tour_stop';

function destinationFor(rec) {
  if (POST_TYPE_PREFIX[rec.postType]) {
    return POST_TYPE_PREFIX[rec.postType] + rec.slug;
  }
  if (BOOK_CHAPTER_TO_BOOK_SLUG[rec.postType]) {
    return '/books/' + BOOK_CHAPTER_TO_BOOK_SLUG[rec.postType];
  }
  if (DEVOTIONAL_POST_TYPES.has(rec.postType)) {
    return '/devotionals/' + rec.slug;
  }
  if (rec.postType === TREASURY_POST_TYPE) {
    return '/books/treasury-of-david';
  }
  if (rec.postType === TOUR_POST_TYPE) {
    return '/library/digital-tour';
  }
  return null;
}

// ---------- read legacy URL list ----------
const legacyUrls = [];
for (const f of ['mere_resource-1.urls.txt', 'mere_resource-2.urls.txt', 'mere_resource-3.urls.txt']) {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (t) legacyUrls.push(t);
  }
}

// ---------- match each URL ----------
const redirects = [];
const seenSources = new Set();
const unmatched = [];
const ambiguous = [];
const sameSrcDst = [];
const stats = { total: 0, bySrcCategory: {}, byMatchMode: {}, byDestPostType: {} };

for (const url of legacyUrls) {
  stats.total++;
  // Source path: drop scheme + host, keep leading slash, ensure trailing slash
  let urlObj;
  try { urlObj = new URL(url); } catch { continue; }
  const sourcePath = urlObj.pathname; // e.g. /resource-library/sermons/foo/

  // Identify the legacy URL "category" segment between /resource-library/ and the slug
  const m = sourcePath.match(/^\/resource-library\/([^/]+)\/([^/]+)\/?$/);
  if (!m) {
    unmatched.push({ url, reason: 'unrecognized URL shape' });
    continue;
  }
  // Skip URLs whose path contains characters that Next.js's redirect parser
  // won't accept (literal % outside a valid percent-escape). These come from
  // posts that lost their resource_type taxonomy in the legacy DB; the
  // sitemap renders them with a literal `%mere_resource_type%` token.
  if (sourcePath.includes('%') && !/(%[0-9A-Fa-f]{2})/.test(sourcePath)) {
    unmatched.push({ url, reason: 'unencodable path (literal %)' });
    continue;
  }
  const safeDecode = s => { try { return decodeURIComponent(s); } catch { return s; } };
  const urlCategory = safeDecode(m[1]);
  const urlSlug = safeDecode(m[2]);
  stats.bySrcCategory[urlCategory] = (stats.bySrcCategory[urlCategory] || 0) + 1;

  // ---------- match strategies, in order of confidence ----------
  let match = null;
  let matchMode = null;
  let _booksCatchallDest = null;

  // 1) source_url meta exact match (the gold standard, but very rare)
  const srcKey = url.replace(/\/$/, '').toLowerCase();
  if (newBySourceUrl.has(srcKey)) {
    match = newBySourceUrl.get(srcKey);
    matchMode = 'source_url';
  }

  // 2) Legacy slug → new slug exact match. Disambiguate by URL category if there are
  //    multiple candidates across post types.
  if (!match) {
    const candidates = newBySlug.get(urlSlug) || [];
    if (candidates.length === 1) {
      // Single candidate — accept if its post type is plausible for the legacy URL category.
      const cand = candidates[0];
      if (isPostTypeCompatible(urlCategory, cand.postType)) {
        match = cand;
        matchMode = 'slug-unique';
      }
    } else if (candidates.length > 1) {
      // Prefer the candidate whose post type matches the legacy URL category.
      const filtered = candidates.filter(c => isPostTypeCompatible(urlCategory, c.postType));
      if (filtered.length === 1) {
        match = filtered[0];
        matchMode = 'slug+category';
      } else if (filtered.length > 1) {
        ambiguous.push({ url, candidates: filtered.map(c => `${c.postType}/${c.slug}`) });
      }
    }
  }

  // 3) Numeric-suffix duplicate (e.g. christ-crucified-2 with no christ-crucified
  //    on legacy). WordPress appends `-N` when a slug collides, but only one of
  //    the two carried over to the new install. Safe ONLY if the bare slug
  //    doesn't ALSO exist on legacy (otherwise the new post could correspond
  //    to either legacy post — skip).
  if (!match) {
    const numericSuffix = urlSlug.match(/^(.+?)-(\d+)$/);
    if (numericSuffix) {
      const bareSlug = numericSuffix[1];
      const candidates = (newBySlug.get(bareSlug) || []).filter(c =>
        isPostTypeCompatible(urlCategory, c.postType)
      );
      const legacyHasBareSlug = legacyBySlug.has(bareSlug);
      if (candidates.length === 1 && !legacyHasBareSlug) {
        match = candidates[0];
        matchMode = 'slug-numeric-suffix';
      }
    }
  }

  // 4) Title match — for blog-entries, articles, and lectures where slug
  //    rewrites are common (importer regenerated slugs from titles).
  //    Be strict: require unique normalized-title match AND compatible post type.
  if (!match && (urlCategory === 'blog-entries' || urlCategory === 'articles' || urlCategory === 'lectures')) {
    const legacyRec = legacyBySlug.get(urlSlug);
    if (legacyRec?.title) {
      const tk = normalizeTitle(legacyRec.title);
      const titleCandidates = (newByTitle.get(tk) || []).filter(c =>
        isPostTypeCompatible(urlCategory, c.postType)
      );
      if (titleCandidates.length === 1) {
        match = titleCandidates[0];
        matchMode = 'title';
      } else if (titleCandidates.length > 1) {
        ambiguous.push({ url, candidates: titleCandidates.map(c => `${c.postType}/${c.slug}`) });
      }
    }
  }

  // 5) Books category catch-all. The legacy site lumped autobiography chapters,
  //    Morning-by-Morning / Evening-by-Evening monthly indexes, Sword & Trowel
  //    back-issues, and several other book chunks under /resource-library/books/.
  //    For autobiography fragments (roman-numeral prefix or volume titles) we
  //    redirect to the autobiography reader. For M/E-by-M/E indexes we send to
  //    /books/morning-and-evening.
  if (!match && urlCategory === 'books') {
    const ROMAN_PREFIX = /^([ivxlcdm]+)-/i;
    const dest = (() => {
      if (/^the-autobiography-of-c-h-spurgeon-volume-[ivxlcdm]+$/i.test(urlSlug)) {
        return '/books/autobiography';
      }
      if (ROMAN_PREFIX.test(urlSlug)) {
        // Verify the prefix is actually a roman numeral (i, ii, iii, iv ... up to ~c)
        const prefix = urlSlug.match(ROMAN_PREFIX)[1].toLowerCase();
        if (/^(?:[ivxlcdm]+)$/.test(prefix) && prefix.length <= 8) {
          return '/books/autobiography';
        }
      }
      if (/^(morning-by-morning|evening-by-evening)(-[a-z]+)?$/i.test(urlSlug)) {
        return '/books/morning-and-evening';
      }
      // Autobiography chapter whose slug was prefixed with `vol1-`/`vol2-`/etc.
      // on the new install. Check whether vol{N}-<slug> exists for some N.
      for (const v of ['vol1-', 'vol2-', 'vol3-', 'vol4-']) {
        const candidate = (newBySlug.get(v + urlSlug) || []).find(
          c => c.postType === 'autobiography'
        );
        if (candidate) return '/books/autobiography';
      }
      // Autobiography chapter whose TITLE starts with a roman numeral (e.g.
      // 'XIX. "The Boy-Preachers of the Fens"'). The slug doesn't carry the
      // numeral but the title does — it's still an autobiography chapter.
      const legacyRec = legacyBySlug.get(urlSlug);
      if (legacyRec?.title && /^([IVXLCDM]+)\.\s/.test(legacyRec.title)) {
        return '/books/autobiography';
      }
      return null;
    })();
    if (dest) {
      // Synthesize a pseudo-record so downstream code emits the redirect.
      match = { postType: '_books_catchall', slug: urlSlug };
      matchMode = 'books-catchall';
      // Inject dest directly:
      _booksCatchallDest = dest;
    }
  }

  if (!match) {
    unmatched.push({ url, reason: matchMode || 'no candidate' });
    continue;
  }

  let dest;
  if (match.postType === '_books_catchall') {
    dest = _booksCatchallDest;
  } else {
    dest = destinationFor(match);
  }
  if (!dest) {
    unmatched.push({ url, reason: `no destination rule for ${match.postType}` });
    continue;
  }

  // Skip identity redirects
  if (dest === sourcePath || dest + '/' === sourcePath) {
    sameSrcDst.push({ url, dest });
    continue;
  }
  if (seenSources.has(sourcePath)) continue;
  seenSources.add(sourcePath);

  stats.byMatchMode[matchMode] = (stats.byMatchMode[matchMode] || 0) + 1;
  stats.byDestPostType[match.postType] = (stats.byDestPostType[match.postType] || 0) + 1;
  redirects.push({ source: sourcePath, destination: dest, permanent: true });
}

function isPostTypeCompatible(urlCategory, postType) {
  switch (urlCategory) {
    case 'sermons':
      return postType === 'spurgeon_sermon';
    case 'blog-entries':
      return postType === 'spurgeon_blog' || postType === 'spurgeon_article';
    case 'articles':
      return postType === 'spurgeon_article' || postType === 'spurgeon_blog';
    case 'lectures':
      return postType === 'conference_media';
    case 'tour':
      return postType === 'tour_stop';
    case 'books':
      return (
        postType === 'magazine_article' ||
        postType === 'spurgeon_book' ||
        BOOK_CHAPTER_TO_BOOK_SLUG[postType] != null ||
        DEVOTIONAL_POST_TYPES.has(postType) ||
        postType === TREASURY_POST_TYPE
      );
    case '%mere_resource_type%':
    case 'sermon-number':
      // Sermons that lost their type taxonomy; treat like sermons.
      return postType === 'spurgeon_sermon';
    default:
      return false;
  }
}

// ---------- write redirects file ----------
// Sort by source path so the file diffs are stable.
redirects.sort((a, b) => a.source.localeCompare(b.source));

const header = `// Auto-generated by scripts/build-wp-legacy-redirects.mjs from the
// spurgeon.org WordPress sitemap on ${new Date().toISOString().slice(0, 10)}.
// Maps legacy /resource-library/... URLs onto the new headless URL shapes.
// Regenerate after content migrations — do not hand-edit.

module.exports = [
`;
const footer = `];\n`;
const body = redirects
  .map(r => `  { source: ${JSON.stringify(r.source)}, destination: ${JSON.stringify(r.destination)}, permanent: true },`)
  .join('\n');
fs.writeFileSync(OUT_REDIRECTS, header + body + '\n' + footer, 'utf8');

// ---------- write report ----------
function sortedEntries(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}
const sample20 = redirects.slice(0, 20).map(r => `- \`${r.source}\` → \`${r.destination}\``).join('\n');
const sampleUnmatched = unmatched.slice(0, 10).map(u => `- \`${u.url}\`  _(${u.reason})_`).join('\n');
const report = `# spurgeon.org → spurgeon-next redirect mapping report

Generated ${new Date().toISOString().slice(0, 10)} from the wp-sitemap on spurgeon.org
plus WP-CLI dumps from spurgeonkc (legacy) and spurgeoncenter (new).

## Counts

| Bucket | Count |
|---|---|
| Legacy URLs in sitemap | ${stats.total} |
| Redirects emitted | ${redirects.length} |
| Unmappable (skipped) | ${unmatched.length} |
| Ambiguous (skipped) | ${ambiguous.length} |
| Identity (skipped — source === destination) | ${sameSrcDst.length} |

## Legacy URL category breakdown (from sitemap)

| Category | Count |
|---|---|
${sortedEntries(stats.bySrcCategory).map(([k, v]) => `| \`${k}\` | ${v} |`).join('\n')}

## Match mode breakdown (how each redirect was determined)

| Mode | Count |
|---|---|
${sortedEntries(stats.byMatchMode).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## Destination post type breakdown

| Post type | Count |
|---|---|
${sortedEntries(stats.byDestPostType).map(([k, v]) => `| \`${k}\` | ${v} |`).join('\n')}

## 20 random redirects to spot-check

${sample20}

## 10 sample URLs we couldn't map

Reasons include: no matching slug on new install, multiple ambiguous candidates,
or destination CPT has no per-post URL (e.g. orphaned book chapter without a known parent).

${sampleUnmatched}

## Notes

- We deliberately favour precision over recall. Better to leave a URL 404 than to redirect it wrong.
- Devotional CPTs (\`morning_and_evening\`, \`faiths_check_book\`) redirect to \`/devotionals/<slug>\`, which is a runtime resolver that 302s to the book reader with the right month/day query params.
- Tour stops all redirect to the single \`/library/digital-tour\` page (the new site has no per-stop URL).
- Book-chapter CPTs (autobiography, all_of_grace, etc.) redirect to the parent book reader at \`/books/<book-slug>\`. Chapter granularity is lost in these redirects.
`;
fs.mkdirSync(path.dirname(OUT_REPORT), { recursive: true });
fs.writeFileSync(OUT_REPORT, report, 'utf8');

console.log(`Wrote ${redirects.length} redirects to ${OUT_REDIRECTS}`);
console.log(`Wrote report to ${OUT_REPORT}`);
console.log(`Total: ${stats.total}, matched: ${redirects.length}, unmapped: ${unmatched.length}, ambiguous: ${ambiguous.length}, identity-skipped: ${sameSrcDst.length}`);
