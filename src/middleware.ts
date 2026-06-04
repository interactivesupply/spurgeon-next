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

function findMatch(rules: RedirectRule[], pathname: string): RedirectRule | null {
  for (const rule of rules) {
    const src  = ('/' + rule.url.replace(/^\//, '')).replace(/\/$/, '') || '/';
    const path = pathname.replace(/\/$/, '') || '/';
    if (rule.regex) {
      try { if (new RegExp(`^${src}$`).test(path)) return rule; } catch { /* bad regex */ }
    } else {
      if (src === path) return rule;
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rules = await getRedirects();
  const match = findMatch(rules, pathname);
  if (!match) return NextResponse.next();

  const dest = match.action_data.startsWith('http')
    ? match.action_data
    : new URL(match.action_data, req.url).toString();

  return NextResponse.redirect(dest, { status: match.action_code || 301 });
}

export const config = {
  matcher: '/((?!_next/static|_next/image|api|favicon\\.ico).*)',
};
