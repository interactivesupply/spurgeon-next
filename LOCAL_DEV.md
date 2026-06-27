# Local Development Guide

How to set up and run this project locally. Day-to-day operations only — see `DEPLOYMENT.md` for production work.

---

## First-Time Setup

This is a **headless WordPress site**: a Next.js/Faust.js frontend (this repo) backed by a WordPress install (`spurgeoncenter`) that serves content via WPGraphQL. Both pieces need to be running locally.

### Prerequisites

- Your machine runs the Interactive Supply Docker stack (`~/src/docker`)
- Your SSH key is added to WP Engine (my.wpengine.com → SSH keys)
- Your GitHub account has been added as a collaborator on **both** this repo and [`interactivesupply/spurgeoncenter.wpengine`](https://github.com/interactivesupply/spurgeoncenter.wpengine)
- Node ≥ 18 via nvm (v22 recommended: `nvm install 22`)

### Run the setup script

From the Docker repo:

```bash
cd ~/src/docker/dev-conf/deployment
./wpengine-headless.sh spurgeoncenter git@github.com:interactivesupply/spurgeon-next.git
```

This script:
1. Rsyncs the WordPress files from production into `~/src/docker/sites/spurgeoncenter.wpengine`
2. Pulls and restores the production database into your local Docker MySQL
3. Wires up nginx, local DNS (`spurgeoncenter.wpenginepowered.com`), and SSL
4. Clones this repo to `~/src/headless/spurgeon-next` (if not already cloned)
5. Runs `npm install` on Node 22
6. Writes `.env.local` pointing the frontend at your local backend

**After the script completes**, connect the WP backend to the IS GitHub repo:

```bash
cd ~/src/docker/sites/spurgeoncenter.wpengine
git remote add origin git@github.com:interactivesupply/spurgeoncenter.wpengine.git
git fetch origin
git reset --hard origin/master
```

This replaces the rsync'd files with the git-tracked version, ensuring WP core, plugins, and themes stay in sync with what the team deploys.

**After the script completes**, copy the Faust secret key into `.env.local`:
1. Open `https://spurgeoncenter.wpenginepowered.com/wp-admin`
2. Go to **Settings → Faust**
3. Copy the **Secret Key**
4. Paste it into `~/src/headless/spurgeon-next/.env.local`:
   ```
   FAUST_SECRET_KEY=<paste here>
   ```

---

## Starting Everything Up After a Reboot

Two things need to be running for the local site to work:

### 1. Docker (WordPress backend)

```bash
cd ~/src/docker
./dev-conf/deployment/docker.sh start
```

The local WordPress admin is at `https://spurgeoncenter.wpenginepowered.com/wp-admin`.

### 2. Next.js dev server (frontend)

```bash
cd ~/src/headless/spurgeon-next
./dev.sh
```

Site is at **https://www.spurgeon.org** (Chrome) or **http://localhost:3000** (Brave/other).

If pages render stale data or you see weird module errors, clear the build cache:

```bash
pkill -f "next dev"
rm -rf .next
./dev.sh
```

---

## Common Tasks

### Keep the backend in sync with production

The WP backend (`spurgeoncenter`) is tracked in [`interactivesupply/spurgeoncenter.wpengine`](https://github.com/interactivesupply/spurgeoncenter.wpengine). When a teammate pushes a change (WP core update, plugin change, theme update), pull it locally:

```bash
git -C ~/src/docker/sites/spurgeoncenter.wpengine pull
```

To also refresh the database with the latest production content:

```bash
~/src/docker/dev-conf/deployment/website_helper_scripts.sh spurgeoncenter 1
```

Run both together at the start of any session where you need to be fully up to date:

```bash
git -C ~/src/docker/sites/spurgeoncenter.wpengine pull && \
  ~/src/docker/dev-conf/deployment/website_helper_scripts.sh spurgeoncenter 1
```

### Connect to the production WordPress via SSH

```bash
ssh spurgeoncenter@spurgeoncenter.ssh.wpengine.net
```

WordPress files are at `/sites/spurgeoncenter/`. Run `wp` commands there.

### Run a GraphQL query against the local backend

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ sermons(first: 3) { nodes { title slug } } }"}' \
  https://spurgeoncenter.wpenginepowered.com/graphql | python3 -m json.tool
```

The Next.js app proxies GraphQL through `/api/graphql` (see `src/pages/api/graphql.ts`) so the browser never makes cross-origin requests.

### Re-export from Base44 and re-import into WordPress

Only needed when content has changed in Base44 since the last migration.

```bash
# Export from Base44
cd /path/to/spurgeon-wp/scripts
BASE44_APP_ID=<id> BASE44_ADMIN_TOKEN=<token> node export-base44.mjs

# Upload + import via SSH
tar -cf - export/ | ssh spurgeoncenter@spurgeoncenter.ssh.wpengine.net \
  'cd /sites/spurgeoncenter && rm -rf _spurgeon-import && mkdir _spurgeon-import && cd _spurgeon-import && tar -xf - && cd /sites/spurgeoncenter && for ent in sermons devotionals treasury articles chapters; do wp spurgeon import $ent --file=/sites/spurgeoncenter/_spurgeon-import/export/$ent.json; done; rm -rf /sites/spurgeoncenter/_spurgeon-import'
```

The importer skips items whose `_base44_id` already exists, so it's safe to re-run.

---

## Environment Variables (`.env.local`)

`.env.local` is gitignored. After first-time setup it contains:

```
NEXT_PUBLIC_WORDPRESS_URL=https://spurgeoncenter.wpenginepowered.com
NEXT_PUBLIC_FAUST_WORDPRESS_URL=https://spurgeoncenter.wpenginepowered.com
FAUST_SECRET_KEY=<from local wp-admin → Settings → Faust>
NODE_TLS_REJECT_UNAUTHORIZED=0
```

`NODE_TLS_REJECT_UNAUTHORIZED=0` is required because the local backend uses a self-signed mkcert certificate. Do not set this in production.

`MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and Algolia keys are not needed locally — subscribe forms return 503 and search is disabled until those are set (they're configured as Atlas env vars in production).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Pages 404 across the board | Next.js dev server not running | `./dev.sh` |
| `ECONNREFUSED` or GraphQL errors | Docker not running / backend down | `cd ~/src/docker && ./dev-conf/deployment/docker.sh start` |
| Stale data after editing in WP | Apollo / Next.js cache | Restart dev server: `pkill -f "next dev" && rm -rf .next && ./dev.sh` |
| `Error: self-signed certificate` | `NODE_TLS_REJECT_UNAUTHORIZED` not set | Confirm `.env.local` has `NODE_TLS_REJECT_UNAUTHORIZED=0` |
| GraphQL errors about `metaQuery` | wp-graphql-meta-query plugin disabled | Reactivate in local `wp-admin → Plugins` |
| `Internal server error` from `spurgeonSearch` | spurgeon-graphql plugin disabled | Reactivate in local `wp-admin → Plugins` |
| `Cannot find module 'node:fs'` on npm install | Node version too old (< 18) | `nvm use 22` then `npm install` again |
| WP version mismatch / missing plugins | Local backend files out of date | `git -C ~/src/docker/sites/spurgeoncenter.wpengine pull` |
