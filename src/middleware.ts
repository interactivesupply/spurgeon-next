export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RedirectRule {
  url: string;
  action_data: string;
  action_code: number;
  regex: number;
}

// Store cache on `global` so it is shared between the middleware and the
// /api/revalidate-redirects route within the same Node.js process.
declare global {
  // eslint-disable-next-line no-var
  var __redirectRules: RedirectRule[];
  // eslint-disable-next-line no-var
  var __redirectExpiry: number;
  // eslint-disable-next-line no-var
  var __redirectRefreshing: boolean;
}
global.__redirectRules      ??= [];
global.__redirectExpiry     ??= 0;
global.__redirectRefreshing ??= false;

const CACHE_TTL_MS = 5 * 60 * 1000;

async function refreshCache() {
  if (global.__redirectRefreshing) return;
  global.__redirectRefreshing = true;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/spurgeon/v1/redirects`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      global.__redirectRules  = await res.json();
      global.__redirectExpiry = Date.now() + CACHE_TTL_MS;
    }
  } catch {
    // Keep serving stale cache on network error.
  } finally {
    global.__redirectRefreshing = false;
  }
}

async function getRedirects(): Promise<RedirectRule[]> {
  if (global.__redirectRules.length === 0) {
    await refreshCache();   // first request after startup — block once
  } else if (Date.now() >= global.__redirectExpiry) {
    refreshCache();         // stale — refresh in background, don't block
  }
  return global.__redirectRules;
}

interface MatchResult {
  dest: string;
  code: number;
}

function findMatch(rules: RedirectRule[], pathname: string): MatchResult | null {
  for (const rule of rules) {
    const src  = ('/' + rule.url.replace(/^\//, '')).replace(/\/$/, '') || '/';
    const path = pathname.replace(/\/$/, '') || '/';

    if (rule.regex) {
      try {
        // Strip any anchors the editor may have typed before we wrap them.
        const pattern = src.replace(/^\^/, '').replace(/\$$/, '');
        const match = new RegExp(`^${pattern}$`).exec(path);
        if (match) {
          // Substitute $1, $2 … capture group references in the destination.
          const dest = rule.action_data.replace(
            /\$(\d+)/g,
            (_, n) => match[parseInt(n)] ?? ''
          );
          return { dest, code: rule.action_code || 301 };
        }
      } catch { /* bad regex — skip */ }
    } else {
      if (src === path) return { dest: rule.action_data, code: rule.action_code || 301 };
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
