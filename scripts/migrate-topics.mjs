#!/usr/bin/env node
/**
 * One-shot migration: pull the `mere_resource_topic` taxonomy from the
 * legacy spurgeon.org WordPress install and re-create it on the new
 * spurgeoncenter.wpengine.com install under the `topic` taxonomy (on
 * spurgeon_sermon posts).
 *
 * Run with:  node --env-file=.env.local scripts/migrate-topics.mjs
 *
 * Idempotent: if a term or assignment already exists on the new site it's
 * left alone. Safe to re-run.
 *
 * Requires NEXT_PUBLIC_WORDPRESS_URL, WP_PREVIEW_USER, WP_PREVIEW_APP_PASSWORD
 * in the environment (already wired via the npm --env-file flag).
 */

const OLD = 'https://www.spurgeon.org';
const NEW = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const AUTH = 'Basic ' + Buffer.from(
  (process.env.WP_PREVIEW_USER || '') + ':' + (process.env.WP_PREVIEW_APP_PASSWORD || '')
).toString('base64');

if (!NEW || !process.env.WP_PREVIEW_USER) {
  console.error('Missing NEXT_PUBLIC_WORDPRESS_URL or WP_PREVIEW_USER');
  process.exit(1);
}

async function getJson(url, opts = {}) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* leave as text */ }
  if (!r.ok) {
    const err = new Error(`${r.status} ${url}: ${text.slice(0, 200)}`);
    err.status = r.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function paginate(url) {
  const out = [];
  let page = 1;
  while (true) {
    const sep = url.includes('?') ? '&' : '?';
    const r = await fetch(`${url}${sep}per_page=100&page=${page}`);
    if (!r.ok) {
      if (r.status === 400 && page > 1) break; // off the end
      throw new Error(`${r.status} ${url}?page=${page}: ${await r.text()}`);
    }
    const batch = await r.json();
    out.push(...batch);
    const totalPages = parseInt(r.headers.get('x-wp-totalpages') || '1', 10);
    if (page >= totalPages) break;
    page += 1;
  }
  return out;
}

console.log('▶ Pulling old-site topic terms…');
const oldTerms = await paginate(`${OLD}/wp-json/wp/v2/mere_resource_topic`);
console.log(`  found ${oldTerms.length} terms`);

console.log('▶ Loading existing new-site topic terms…');
// hide_empty defaults to true in WP REST. The taxonomy starts out with terms
// that have no posts yet, so we must opt in to see them. (Also a WP-side
// quirk: passing ?page=1 with default hide_empty returns zero results even
// for non-empty taxonomies — easiest to just always opt out.)
const existingNewTerms = await getJson(`${NEW}/wp-json/wp/v2/topic?per_page=100&hide_empty=false`);
const newTermBySlug = new Map(existingNewTerms.map(t => [t.slug, t]));
console.log(`  found ${existingNewTerms.length} already present`);

// Phase 1 — create any missing terms on new site
console.log('\n▶ Creating missing terms on new site…');
let createdTerms = 0;
const newIdByOldId = new Map();
for (const oldT of oldTerms) {
  let newT = newTermBySlug.get(oldT.slug);
  if (!newT) {
    try {
      newT = await getJson(`${NEW}/wp-json/wp/v2/topic`, {
        method: 'POST',
        headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: oldT.name,
          slug: oldT.slug,
          description: oldT.description || '',
        }),
      });
      newTermBySlug.set(newT.slug, newT);
      createdTerms += 1;
      console.log(`   + ${newT.name} (id ${newT.id})`);
    } catch (err) {
      console.error(`   ! failed creating "${oldT.name}":`, err.message);
      continue;
    }
  }
  newIdByOldId.set(oldT.id, newT.id);
}
console.log(`  created ${createdTerms}; ${oldTerms.length - createdTerms} already present`);

// Phase 2 — find old posts with topics, map to new posts, assign terms.
console.log('\n▶ Collecting old posts with topic assignments…');
const oldPostsById = new Map();
for (const oldT of oldTerms) {
  // We could batch this, but per-term pulls naturally page through what each
  // term touches. 50 terms × tiny payload — fine.
  const posts = await paginate(
    `${OLD}/wp-json/wp/v2/mere_resource?mere_resource_topic=${oldT.id}&_fields=id,slug,title,mere_resource_topic,link`
  );
  for (const p of posts) {
    if (!oldPostsById.has(p.id)) oldPostsById.set(p.id, p);
  }
}
console.log(`  ${oldPostsById.size} distinct old posts have topic assignments`);

console.log('\n▶ Matching old posts to new sermons/blog by slug + assigning…');
// CPTs that the new `topic` taxonomy is registered on. Order matters:
// sermons first, since most of the old mere_resource posts landed there.
const TOPIC_CPTS = ['spurgeon_sermon', 'spurgeon_blog'];
let matched = 0, missing = 0, assigned = 0;
for (const oldP of oldPostsById.values()) {
  let newP = null;
  let newCpt = null;
  for (const cpt of TOPIC_CPTS) {
    // context=edit (auth) returns canonical taxonomy term IDs and is not
    // served from WP Engine's public cache, so we always see fresh data
    // after the previous run's writes.
    const r = await getJson(
      `${NEW}/wp-json/wp/v2/${cpt}?slug=${encodeURIComponent(oldP.slug)}&context=edit&_fields=id,slug,title,topic`,
      { headers: { Authorization: AUTH } }
    );
    if (r && r.length) { newP = r[0]; newCpt = cpt; break; }
  }
  if (!newP) {
    console.log(`   ? no match for "${oldP.slug}"`);
    missing += 1;
    continue;
  }
  matched += 1;
  // Map the old term IDs → new term IDs
  const desiredNewTermIds = (oldP.mere_resource_topic || [])
    .map(id => newIdByOldId.get(id))
    .filter(Boolean);
  const existing = new Set(newP.topic || []);
  const merged = [...new Set([...existing, ...desiredNewTermIds])];
  // No-op if nothing new
  if (merged.length === existing.size) {
    console.log(`   = ${newP.slug}: already has ${existing.size} topic(s); no change`);
    continue;
  }
  await getJson(`${NEW}/wp-json/wp/v2/${newCpt}/${newP.id}`, {
    method: 'POST',
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: merged }),
  });
  console.log(`   ✓ [${newCpt}] ${newP.slug}: +${merged.length - existing.size} topic(s) → ${merged.length} total`);
  assigned += 1;
}

console.log(`\nDone. matched=${matched}, missing=${missing}, posts updated=${assigned}, terms created=${createdTerms}.`);
console.log('Next: run `wp algolia reindex` over SSH to push topic data into Algolia.');
