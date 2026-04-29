# Spurgeon Headless WordPress — Deployment Runbook

This is the end-to-end deployment guide for taking the Spurgeon project from
its current state (working frontend scaffold, working backend code) to a live
production site at spurgeon.org.

The two repositories involved:

| Path | What it is |
|---|---|
| `spurgeon-wp/` | WordPress plugins + Base44 export script |
| `spurgeon-next/` | Next.js frontend (this repo) |

---

## Phase 0 — Procurement (do this first)

Before any deployment work begins, secure these accounts and credentials. Owner
column is the role responsible — note that one person may own multiple.

| Item | Owner | Cost | Why |
|---|---|---|---|
| WP Engine account with **Atlas** add-on | DevOps | $30+/month | Hosts both WordPress backend and Next.js frontend |
| ACF Pro license | DevOps | $249/year | Required for the field groups; ACF Free won't work |
| Mailgun account + verified sending domain | DevOps | Free tier OK to start | Transactional email for subscription forms |
| Base44 admin token | Project owner | — | One-time export of existing content |
| GitHub repos for `spurgeon-wp/` and `spurgeon-next/` | DevOps | Free | Atlas pulls frontend builds from GitHub |
| Domain DNS access for spurgeon.org | DevOps | — | Point the production domain at Atlas |

**Procurement checklist before proceeding:**

- [ ] WP Engine Atlas account active, sandbox/dev environment provisioned
- [ ] ACF Pro license key in hand
- [ ] Mailgun API key + verified sending domain (e.g. `mg.spurgeon.org`)
- [ ] Base44 `BASE44_APP_ID` + `BASE44_ADMIN_TOKEN` from current site
- [ ] `spurgeon-wp` and `spurgeon-next` pushed to GitHub
- [ ] DNS access confirmed for `spurgeon.org`

---

## Phase 1 — WordPress Backend on WP Engine

### 1.1 Provision the WordPress install

In WP Engine portal:

1. Create a new **Standard WordPress install** (not an Atlas frontend yet — that's separate).
   Name it `spurgeon-prod` (or `spurgeon-staging` to start, recommended).
2. Note the temporary URL: `<install-name>.wpengine.com`.
3. Set **Permalinks → Post name** in `wp-admin → Settings → Permalinks`.

### 1.2 Install required external plugins

In `wp-admin → Plugins`:

- **WPGraphQL** (1.x) — from the WordPress.org plugin directory
- **WPGraphQL for ACF** (0.6.x+) — from [GitHub releases](https://github.com/wp-graphql/wpgraphql-acf)
- **Advanced Custom Fields Pro** (6.x) — upload the .zip from advancedcustomfields.com, enter license key

Activate all three before proceeding.

### 1.3 Install the custom plugins

Upload these from `spurgeon-wp/plugins/` in this order, activating each:

1. **`spurgeon-cpts`** — registers CPTs and the sermon collection taxonomy. On
   activation it seeds three collection terms and flushes rewrite rules.
2. **`spurgeon-acf-fields`** — registers all ACF field groups. Verify in
   `wp-admin → ACF → Field Groups` that all five appear and each has
   *Show in GraphQL* enabled.
3. **`spurgeon-graphql`** — adds the `spurgeonSearch` root field. Verify by
   visiting `https://<install>.wpengine.com/graphql` and running:
   ```graphql
   { __schema { queryType { fields { name } } } }
   ```
   You should see `spurgeonSearch` in the list.
4. **`spurgeon-importer`** — adds WP-CLI commands. Verify with
   `wp spurgeon import sermons --help` over SSH/WP-CLI.

### 1.4 Add database indexes

Over WP-CLI (WP Engine SSH gateway):

```bash
wp db query "ALTER TABLE wp_postmeta ADD INDEX spurgeon_meta_key_val (meta_key(191), meta_value(100));"
```

Without this, `spurgeonSearch` and devotional/treasury queries scan the full
postmeta table on every request.

### 1.5 Configure WPGraphQL

In `wp-admin → GraphQL → Settings`:

- **Public Introspection**: Enabled (Faust.js needs this in production)
- **Debug Mode**: Disabled (production only — leave enabled in staging)

### 1.6 Configure CORS

The Atlas frontend will live on a different domain than the WordPress install.
Add to `wp-content/mu-plugins/spurgeon-cors.php`:

```php
<?php
add_action('init', function() {
    if (!headers_sent() && strpos($_SERVER['REQUEST_URI'], '/graphql') !== false) {
        $allowed = [
            'https://spurgeon.org',
            'https://www.spurgeon.org',
            'https://<atlas-app>.wpenginepowered.com',
        ];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (in_array($origin, $allowed)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
            header("Access-Control-Allow-Headers: Content-Type, Authorization");
            header("Vary: Origin");
        }
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
        }
    }
});
```

---

## Phase 2 — Content Migration

### 2.1 Export from Base44

On a local machine (or Atlas build container):

```bash
cd spurgeon-wp/scripts
npm install
BASE44_APP_ID=<id> \
BASE44_ADMIN_TOKEN=<token> \
node export-base44.mjs
```

This writes `export/sermons.json`, `export/devotionals.json`,
`export/treasury.json`, `export/articles.json`, `export/chapters.json`.

Verify counts roughly match what's in the live Base44 app.

### 2.2 Upload exports to the WordPress host

```bash
# Compress
tar -czf spurgeon-export.tar.gz export/
# Upload via WP Engine SFTP or rsync to /tmp/ on the install
scp spurgeon-export.tar.gz <wpe-user>@<install>.ssh.wpengine.net:/tmp/
ssh <wpe-user>@<install>.ssh.wpengine.net 'cd /tmp && tar -xzf spurgeon-export.tar.gz'
```

### 2.3 Import (in this order)

```bash
ssh <wpe-user>@<install>.ssh.wpengine.net
cd /sites/<install-name>

wp spurgeon import sermons     --file=/tmp/export/sermons.json
wp spurgeon import devotionals --file=/tmp/export/devotionals.json
wp spurgeon import treasury    --file=/tmp/export/treasury.json
wp spurgeon import articles    --file=/tmp/export/articles.json
wp spurgeon import chapters    --file=/tmp/export/chapters.json
```

Each command is idempotent — items with an existing `_base44_id` post meta are
skipped. Safe to re-run if any individual import fails partway through.

### 2.4 Generate the redirect map

After sermons are imported:

```bash
wp spurgeon export-redirects > /tmp/legacy-redirects.js
```

Download `legacy-redirects.js` and commit it to the **`spurgeon-next`** repo at
the project root. It's loaded by `next.config.js` via:

```js
let legacySermonRedirects = [];
try { legacySermonRedirects = require('./legacy-redirects.js'); } catch (_) {}
```

Without this file, the legacy `/SermonDetail?id=UUID` URLs still work but route
through `/api/legacy-redirect` (one extra hop). With the file, they get
single-hop 301s at the edge.

### 2.5 Verify content via GraphQL

Visit `https://<install>.wpengine.com/graphiql` (or the GraphiQL plugin in
admin) and run:

```graphql
{
  sermons(first: 3) {
    nodes { title slug sermonFields { scriptureReference } }
  }
  devotionalEntries(first: 1, where: {
    metaQuery: { metaArray: [
      { key: "devotional", value: "morning_and_evening", compare: EQUAL_TO }
      { key: "month", value: "January", compare: EQUAL_TO }
      { key: "day", value: 1, compare: EQUAL_TO, type: NUMERIC }
    ], relation: AND }
  }) { nodes { title } }
}
```

Both should return data. If `sermonFields` is null, the WPGraphQL for ACF
plugin isn't picking up the field group — check that `show_in_graphql` is set
in the ACF field group definition.

---

## Phase 3 — Frontend on Atlas

### 3.1 Connect the Atlas application

In WP Engine Atlas portal:

1. **Create Application** → connect the `spurgeon-next` GitHub repo
2. **Branch**: `main` (or `production`)
3. **Framework**: Next.js (auto-detected)
4. **Build command**: `npm run build`
5. **Install command**: `npm install`
6. **Output directory**: `.next` (auto-detected)
7. **Node version**: 20.x

### 3.2 Set environment variables

In Atlas portal → **Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_WORDPRESS_URL` | `https://spurgeon-prod.wpengine.com` | The WP install URL from Phase 1 |
| `NEXT_PUBLIC_FAUST_WORDPRESS_URL` | (same as above) | |
| `FAUST_SECRET_KEY` | Generate from `wp-admin → GraphQL → Faust.js` settings | |
| `MAILGUN_API_KEY` | From Mailgun dashboard | Server-only |
| `MAILGUN_DOMAIN` | e.g. `mg.spurgeon.org` | Verified domain |
| `NEXT_PUBLIC_GA_ID` | (optional) GA4 measurement ID | If using analytics |

### 3.3 First build

Trigger a build from the Atlas portal. Watch the build log:

- `npm install` completes — should match local `package-lock.json` exactly
- `next build` completes — should show all routes (~14 pages)
- Static generation runs — `/`, `/about`, `/books`, etc. should prerender
- `/sermons/[slug]` and `/books/[book]` use ISR (won't prerender at build time)

The build will succeed even if WordPress is unreachable (data fetches fall back
to empty states), but the home page won't have devotional/sermon data without
WP.

### 3.4 Smoke-test the Atlas URL

Atlas gives you a temporary `<app>.wpenginepowered.com` URL. Hit:

- `/` — full home page with devotional, sermons populated
- `/sermons/<a-known-slug>` — full sermon detail with content
- `/search?q=grace` — search results
- `/books/morning-and-evening` — today's entry loads
- `/api/subscribe` (POST with test payload) — Mailgun email arrives
- `/SermonDetail?id=<a-base44-uuid>` — 301s to `/sermons/<slug>`

---

## Phase 4 — DNS Cutover

Once Phase 3 smoke tests pass:

### 4.1 Set up the production domain in Atlas

1. Atlas portal → Application → **Domains** → add `spurgeon.org` and `www.spurgeon.org`
2. Atlas provides DNS records (CNAME or A records) — copy them

### 4.2 Update DNS

At the registrar / DNS provider:

1. Set `spurgeon.org` and `www.spurgeon.org` to the Atlas-provided records
2. TTL: drop to 300s an hour before cutover, restore to default after

### 4.3 Verify

- `https://spurgeon.org` resolves to the Atlas frontend
- SSL certificate is issued by Atlas (Let's Encrypt, automatic)
- All pages load
- Search works
- A devotional loads

---

## Phase 5 — Post-launch

### 5.1 Image migration (within 30 days)

Currently `thumbnail_url` and `cover_image_url` ACF fields contain
`media.base44.com` URLs. Base44 may eventually take down that CDN. Write and
run a `wp spurgeon migrate-images` WP-CLI command (not yet in
`spurgeon-importer.php` — needs to be added) that downloads each image with
`media_sideload_image()` and replaces the ACF URL field with the WP media
library URL.

Then remove `media.base44.com` from `next.config.js` `images.remotePatterns`.

### 5.2 Performance baseline

Run Lighthouse against the production URL. Expected scores:

- Performance: 85+ (mobile), 95+ (desktop)
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

If sermon detail pages score badly on mobile, the `revalidate: 3600` on `getStaticProps`
should be tuned — sermons shouldn't change often, so longer is fine.

### 5.3 Remove placeholder fallbacks

Once WordPress is verified producing real data, you may want to remove the
placeholder devotional + article in `WeeklyPulpit.jsx` (`PLACEHOLDER_DEVOTIONAL`
and `PLACEHOLDER_ARTICLE` constants). They were added to make the site work
locally without WordPress; in production with WP connected they're dead code.

---

## Rollback Plan

If a deploy goes wrong:

- **Frontend rollback**: Atlas keeps every build. Portal → Application →
  Deployments → click any prior successful deploy → "Promote to current".
  Takes ~30 seconds.
- **WordPress rollback**: WP Engine takes daily backups. Portal → Backups →
  restore. Takes 5–10 minutes.
- **DNS rollback**: Restore the previous DNS record at the registrar. Hardest
  to undo — propagation can take up to 48 hours depending on TTL.

For DNS specifically: do not cut over until you've smoke-tested the Atlas URL
thoroughly.

---

## Owner Cheat Sheet

When something breaks, who do you call?

| Symptom | Likely cause | Fix |
|---|---|---|
| Home page loads but no devotional | WPGraphQL meta_query filter not finding entries | Check `wp-admin → Devotional Entries`, verify ACF fields populated |
| Sermon detail returns 404 | Slug mismatch or sermon not yet imported | Check `wp-admin → Sermons`, look at the post slug |
| Search returns nothing | `spurgeonSearch` resolver not registered | Verify `spurgeon-graphql` plugin is active |
| Subscribe form fails | Mailgun env vars missing or domain not verified | Atlas → Env Vars; Mailgun → Domains |
| `/SermonDetail?id=...` doesn't redirect | `_base44_id` post meta missing | Re-run `wp spurgeon import sermons` |
| Build fails on Atlas with WP error | WP Engine install down or 5xx | Don't fix in Atlas — fix WP first; retry build |

---

## Checklist Summary

Use this as a one-page tracker:

- [ ] **Procurement complete** (Phase 0)
- [ ] **WordPress backend live** with all plugins, GraphQL working (Phase 1)
- [ ] **Content imported** and verified via GraphQL (Phase 2)
- [ ] **Redirect map generated** and committed (Phase 2.4)
- [ ] **Atlas frontend deployed** with env vars, smoke tests passing (Phase 3)
- [ ] **DNS cut over** to spurgeon.org (Phase 4)
- [ ] **Lighthouse baseline** captured (Phase 5)
- [ ] **Image migration** scheduled within 30 days
