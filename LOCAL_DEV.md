# Local Development Cheat Sheet

Quick commands for working on this project locally. Day-to-day operations, not deployment — see `DEPLOYMENT.md` for production work.

---

## Starting Everything Up After a Reboot

Three things need to be running for the local site to be usable: the Next.js dev server, the WordPress install (always running on WP Engine — no local action needed), and optionally the public Cloudflare tunnel.

### 1. Next.js dev server

```bash
cd /Volumes/ext/docker_data/sites/spurgeon-next
npm run dev
```

Site is at `http://localhost:3000`.

If pages render stale data or you see weird module errors, clear the build cache:

```bash
pkill -f "next dev"
rm -rf .next
npm run dev
```

### 2. Cloudflare Tunnel (public URL at https://spurgeon-bcl.isclabs.ai)

The tunnel is **not** auto-started. Run it manually whenever you want the public URL live:

```bash
cloudflared tunnel run spurgeon-bcl &
```

The `&` puts it in the background of your current shell. It stays up until either:
- You close that terminal
- You reboot
- You explicitly kill it: `pkill cloudflared`

Verify it's up:

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://spurgeon-bcl.isclabs.ai/
```

Should print `HTTP 200`. If it prints `530`, the tunnel isn't running; restart it.

> **Future improvement**: the launchd service `com.cloudflare.cloudflared` was installed but isn't pointed at our config. To make the tunnel auto-start on boot, fix the service per the instructions in `DEPLOYMENT.md` (or just keep running it manually).

---

## Common Local-Dev Tasks

### Connect to the WordPress install via SSH

```bash
ssh spurgeoncenter@spurgeoncenter.ssh.wpengine.net
```

Once in, the WordPress install is at `/sites/spurgeoncenter/`. Run `wp` commands there.

### Run a GraphQL query against the WordPress install

```bash
curl -s -u demo:spurgeoncenter -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ sermons(first: 3) { nodes { title slug } } }"}' \
  https://spurgeoncenter.wpengine.com/graphql | python3 -m json.tool
```

The local Next.js app calls WordPress through `/api/graphql` (a same-origin proxy) so credentials never leak into the browser. See `src/lib/apollo-client.ts` and `src/pages/api/graphql.ts`.

### Re-export from Base44 and re-import into WordPress

(Only when content has changed in Base44 since the last migration.)

```bash
# Export from Base44
cd /Volumes/ext/docker_data/sites/spurgeon-wp/scripts
BASE44_APP_ID=<id> BASE44_ADMIN_TOKEN=<token> node export-base44.mjs

# Upload + import in one SSH session
tar -cf - export/ | ssh spurgeoncenter@spurgeoncenter.ssh.wpengine.net \
  'cd /sites/spurgeoncenter && rm -rf _spurgeon-import && mkdir _spurgeon-import && cd _spurgeon-import && tar -xf - && cd /sites/spurgeoncenter && for ent in sermons devotionals treasury articles chapters; do wp spurgeon import $ent --file=/sites/spurgeoncenter/_spurgeon-import/export/$ent.json; done; rm -rf /sites/spurgeoncenter/_spurgeon-import'
```

The importer skips items whose `_base44_id` already exists, so it's safe to re-run.

---

## Environment Files

`.env.local` (gitignored) contains:

```
NEXT_PUBLIC_WORDPRESS_URL=https://spurgeoncenter.wpengine.com
WORDPRESS_BASIC_AUTH_USER=demo
WORDPRESS_BASIC_AUTH_PASSWORD=spurgeoncenter
```

The basic auth credentials are temporary — once WP Engine support disables HTTP Basic Auth on the install, they can be removed.

`MAILGUN_API_KEY` and `MAILGUN_DOMAIN` are not set locally. Subscribe forms will return a 503 from `/api/subscribe` and `/api/subscribe-devotional` until those are populated (will be set in production via Atlas env vars).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Pages 404 across the board | Next.js dev server not running | `npm run dev` |
| `https://spurgeon-bcl.isclabs.ai` returns 530 | Tunnel process died | `cloudflared tunnel run spurgeon-bcl &` |
| Stale data after editing in WP | Apollo / Next.js cache | Restart dev server (kill + `rm -rf .next` + restart) |
| GraphQL errors about `metaQuery` | wp-graphql-meta-query plugin disabled | Reactivate it in `wp-admin → Plugins` |
| `Internal server error` from `spurgeonSearch` | spurgeon-graphql plugin disabled | Reactivate it in `wp-admin → Plugins` |
