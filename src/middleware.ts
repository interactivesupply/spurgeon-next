import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RedirectRule {
  url: string;
  action_data: string;
  action_code: number;
  regex: number;
}

// Cache redirect rules on `globalThis` so they persist across requests within a
// worker isolate. On Cloudflare (Edge runtime) this is a per-isolate, best-effort
// cache rather than a single shared Node.js process; the CACHE_TTL_MS fallback
// below keeps rules fresh even when the /api/revalidate-redirects webhook does
// not reach the same isolate.
declare global {
  // eslint-disable-next-line no-var
  var __redirectRules: RedirectRule[];
  // eslint-disable-next-line no-var
  var __redirectExpiry: number;
  // eslint-disable-next-line no-var
  var __redirectRefreshing: boolean;
}
globalThis.__redirectRules      ??= [];
globalThis.__redirectExpiry     ??= 0;
globalThis.__redirectRefreshing ??= false;

const CACHE_TTL_MS = 5 * 60 * 1000;

async function refreshCache() {
  if (globalThis.__redirectRefreshing) return;
  globalThis.__redirectRefreshing = true;
  try {
    // Timestamp param busts WP Engine's CDN cache so we always get fresh rules.
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/spurgeon/v1/redirects?_=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const raw = await res.json();
      // WordPress returns numeric columns as strings; coerce to numbers.
      globalThis.__redirectRules = raw.map((r: any) => ({
        ...r,
        action_code: Number(r.action_code) || 301,
        regex:       Number(r.regex),
      }));
      globalThis.__redirectExpiry = Date.now() + CACHE_TTL_MS;
    }
  } catch {
    // Keep serving stale cache on network error.
  } finally {
    globalThis.__redirectRefreshing = false;
  }
}

async function getRedirects(): Promise<RedirectRule[]> {
  if (globalThis.__redirectRules.length === 0) {
    await refreshCache();   // first request after startup — block once
  } else if (Date.now() >= globalThis.__redirectExpiry) {
    refreshCache();         // stale — refresh in background, don't block
  }
  return globalThis.__redirectRules;
}

interface MatchResult {
  dest: string;
  code: number;
}

function findMatch(rules: RedirectRule[], pathname: string): MatchResult | null {
  for (const rule of rules) {
    const path = pathname.replace(/\/$/, '') || '/';

    if (rule.regex) {
      try {
        // Strip ^ / $ anchors the editor may have added, then normalize the
        // pattern to always start with / before we wrap it in our own anchors.
        let pattern = rule.url
          .replace(/^\^/, '')
          .replace(/\$$/, '')
          .replace(/\/$/, '') || '/';
        if (!pattern.startsWith('/')) pattern = '/' + pattern;
        const match = new RegExp(`^${pattern}$`).exec(path);
        if (match) {
          const dest = rule.action_data.replace(
            /\$(\d+)/g,
            (_, n) => match[parseInt(n)] ?? ''
          );
          return { dest, code: rule.action_code || 301 };
        }
      } catch { /* bad regex — skip */ }
    } else {
      const src = ('/' + rule.url.replace(/^\//, '')).replace(/\/$/, '') || '/';
      if (src === path) return { dest: rule.action_data, code: rule.action_code || 301 };
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Transparently proxy WordPress uploads so files served from the WP backend
  // remain under the public domain without exposing the backend URL.
  if (pathname.startsWith('/wp-content/')) {
    const upstream = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}${pathname}`;
    const asset = await fetch(upstream);
    if (asset.ok) {
      return new NextResponse(asset.body, {
        status: 200,
        headers: {
          'Content-Type':  asset.headers.get('Content-Type')  || 'application/octet-stream',
          'Cache-Control': asset.headers.get('Cache-Control') || 'public, max-age=31536000, immutable',
          'Content-Length': asset.headers.get('Content-Length') || '',
        },
      });
    }
    // Asset not found on WP — fall through to Next.js 404.
    return NextResponse.next();
  }

  const rules = await getRedirects();
  const match = findMatch(rules, pathname);
  if (!match) return NextResponse.next();

  const dest = match.dest.startsWith('http')
    ? match.dest
    : new URL(match.dest, req.url).toString();

  return NextResponse.redirect(dest, { status: match.code });
}

export const config = {
  matcher: '/((?!_next/static|_next/image|api|favicon\\.ico).*)',
};
