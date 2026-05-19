# SEO Protection Plan — spurgeon.org Migration

**Audience:** John (and MBTS / Spurgeon Center stakeholders) — in response to Userback #7725393.
**Status:** Draft for review. Several decisions still need stakeholder input (flagged inline).
**Goal:** Preserve and ideally improve organic search traffic as content moves from the legacy `spurgeon.org` site (WordPress on WP Engine, install `spurgeonkc`) to the new headless site (Next.js front end backed by the `spurgeoncenter` WordPress install).

---

## 1. What we're protecting

Before designing the migration, we need a clear picture of what currently earns the traffic so we know which URLs absolutely cannot be lost.

**Inputs needed from the client:**

- Access (Viewer role is fine) to the current spurgeon.org **Google Search Console** property.
- Access to the current **Google Analytics** property (GA4 preferred; UA history if available).
- Any internal traffic dashboards or notes on "top-performing" pages.

**What we'll produce:**

- A ranked list of the top 200 URLs by organic clicks and impressions over the last 12 months. These get redirect coverage first.
- A query-level snapshot — top 200 ranking keywords with their landing pages — so we can validate after launch that those queries still resolve.
- A page-by-page baseline of title tags, meta descriptions, structured data, word count, and canonical URL. We'll diff against the new site post-launch.

---

## 2. URL mapping & 301 redirects

This is the single biggest lever. Every URL that has earned a link or a search position needs to either keep its slug or 301-redirect to the new equivalent.

**Approach:**

1. Extract the full list of indexed URLs from the legacy site (Search Console URL inspection, plus a Screaming Frog crawl).
2. For each legacy URL, map to a target on the new site:
   - **Same slug, same domain** (ideal) — no redirect needed.
   - **New slug, same domain** — 301 redirect from old → new.
   - **Removed content** — only if content truly cannot be migrated, 410 (gone) rather than 404. Document the reason.
3. Implement redirects in WordPress (via the `spurgeon-importer` plugin's existing redirect-map machinery, or Redirection plugin, or an Nginx/WP Engine rule). The new headless front end's `next.config.js` already supports a `redirects()` array we can populate from a generated JSON file.
4. **Crucial**: redirects must be 301 (permanent), not 302 (temporary). 302s do not pass link equity.

**Coverage rule of thumb:** any URL with ≥1 backlink or ≥5 impressions/month gets an explicit redirect target. The long tail can fall through to a smart 404 page (see §7).

**Decision needed from stakeholders:** Is the *domain* changing? If we're staying on `spurgeon.org` and just swapping the back-end, the picture is straightforward. If the URL the new site lives at is different (e.g. a new subdomain or a new TLD), the redirect strategy expands to a temporary cross-domain hop and Search Console's Change of Address tool (§8).

---

## 3. URL structure on the new site

The new site already uses different URL shapes than the legacy spurgeonkc install (e.g. legacy mixes `/sermons/`, `/devotionals/`, `/treasury/` under one CPT vs. the new site's per-content-type routes). We need to either:

- **Match legacy slugs where possible** (preserves backlinks naturally, no redirects needed).
- **Document the new shape and redirect aggressively** (acceptable, but more risk of slipping through).

For high-value pages (Treasury of David, Morning & Evening, the Spurgeon Sermons archive index, etc.) we should lean toward "match legacy slugs." For lower-traffic pages, redirects are fine.

**Decision needed:** Hand the redirect map to me once the legacy URL list is exported and I'll diff it against current routes to flag any gaps.

---

## 4. On-page SEO parity

Every page on the new site needs at least:

- A unique, descriptive **`<title>` tag** (50–60 chars).
- A unique **meta description** (140–160 chars) — not auto-generated from body text in most cases; needs editorial attention.
- **Canonical URL** pointing to itself, no trailing-slash mismatches.
- **Open Graph + Twitter Card** tags for social sharing (already implemented for most templates; needs an audit).
- **Structured data** (`Article`, `Person`, `Book` schemas where applicable) — major win for rich results.

**Current state of the new site:**

- Most page templates have a `<title>` and basic meta. There are gaps on the search results page, some book reader pages, and a few of the editorial pages where content was added piecemeal.
- Structured data is minimal — would be a fast follow.

**Action items:**

- Audit every template with Lighthouse + Ahrefs / Semrush "Site Audit" once on staging.
- Backfill missing meta descriptions via WordPress ACF fields (already wired on most CPTs).
- Add `Article` schema to sermon, blog, and article templates.

---

## 5. Sitemap & robots

- **Generate XML sitemaps** for every public content type: sermons, devotionals, books, treasury entries, articles, blog, autobiography, lectures, library tour stops, S&T issues. Either via a Next.js sitemap route or via a build-time generator that crawls the GraphQL endpoint.
- **Submit the new sitemap** to Google Search Console and Bing Webmaster Tools on the day of cutover.
- **Keep the legacy sitemap submitted** for ~30 days post-cutover so Google can crawl the redirects and update its index.
- **`robots.txt`** stays permissive on the new site. The legacy `robots.txt` is unchanged until we're confident the migration is settled — we don't want to noindex content that Google might still be re-discovering through redirects.

---

## 6. Performance & Core Web Vitals

Page speed is a real ranking factor. The new headless stack should outperform the legacy WP theme on most pages — but only if we keep an eye on it.

- Run Lighthouse on the top 20 templates and capture LCP / CLS / INP scores.
- Run the same templates on the legacy site for direct comparison.
- Set up Search Console's Core Web Vitals report to track the new site.
- Watch the per-page CDN cache hit rate (WP Engine / Vercel logs) for the first two weeks — cache misses on dynamic routes can erase the speed advantage.

---

## 7. The 404 / 410 strategy

Inevitably some URLs will fall through the redirect map. A custom 404 page should:

- Acknowledge the URL is missing.
- Offer a search box (we just added inline Algolia autocomplete — perfect for this).
- Suggest the nearest CPT landing pages (Sermons, Books, Library).
- Return HTTP `404` (not 200) so Google knows to drop the URL.

Pages that are *intentionally* removed (e.g. defunct event pages) should return `410 Gone` so Google deindexes them faster.

---

## 8. Search Console transition

- If domain stays the same: just verify the new site (Domain property, DNS TXT record). Old data carries over.
- If domain changes: verify both, then use the **Change of Address** tool. This signals Google explicitly that traffic should move.
- Monitor the **Index Coverage** and **Performance** reports daily for the first 2 weeks. Look for spikes in 4xx, drops in impressions, query-mix shifts.

---

## 9. Backlink outreach (optional but high-value)

For the top 50 backlink sources to `spurgeon.org`, we can email the linking sites and ask them to update to new URLs directly. 301s carry equity, but a direct link is strictly stronger and is often a quick win on resources like seminary curricula, denomination archives, and Wikipedia-adjacent pages.

---

## 10. Phased rollout timeline

Suggested ordering (each phase gates the next):

| Phase | Work | Duration |
|---|---|---|
| 1 | Inventory: GSC + Analytics access, top-URL list, baseline crawl | ~1 week |
| 2 | URL mapping spreadsheet, redirect implementation on staging | ~2 weeks |
| 3 | On-page SEO audit + meta description backfill on staging | ~2 weeks (in parallel with phase 2) |
| 4 | Sitemap generation, structured data, performance pass | ~1 week |
| 5 | Soft-launch cutover (DNS swap or path-based proxy), monitoring | week of cutover |
| 6 | Post-launch watch: GSC, Analytics, redirect coverage | 4–6 weeks |
| 7 | Cleanup: drop unused legacy redirects, archive old sitemap | month 3 |

---

## 11. What we are NOT doing (and why)

- **Bulk reindex requests in Search Console.** Google handles this automatically; manual requests above ~10 URLs/day are throttled and don't help.
- **`hreflang` tags.** No translations on either site, so not relevant.
- **AMP.** Discontinued by Google as a ranking signal; not worth the build cost.
- **Aggressive `noindex` on the legacy site at cutover.** We want Google to crawl the legacy URLs *to discover the redirects*. Only after most of the index has shifted (4–6 weeks) do we add `noindex` on the legacy installation, and only if we're keeping it online at all.

---

## 12. Stakeholder asks (summary)

Before we can execute, we need from John / the MBTS team:

1. **Search Console + Analytics access** to spurgeon.org (Viewer is fine).
2. **Confirmation on the cutover domain strategy** (same domain, subdomain, new TLD?).
3. **A target cutover date** so we can scope phases 1–4 against it.
4. **Editorial owner for meta descriptions** — someone who can review/approve the ~200 most important page descriptions, since these need a human voice. About 5–10 hours of editorial work spread over a couple weeks.
5. **Approval to start the URL inventory now**, ahead of the broader project plan, since that crawl is the longest pole.

---

*Owner:* Brad Linger (Interactive Supply).
*Last updated:* 2026-05-19.
