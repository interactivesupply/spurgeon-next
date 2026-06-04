import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RedirectRule {
  url: string;
  action_data: string;
  action_code: number;
  regex: number;
}

// Module-level cache — persists across requests within the same Node.js process.
let cachedRules: RedirectRule[] = [];
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // re-fetch at most once every 5 minutes

async function getRedirects(): Promise<RedirectRule[]> {
  if (Date.now() < cacheExpiry && cachedRules.length > 0) return cachedRules;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/spurgeon/v1/redirects`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      cachedRules = await res.json();
      cacheExpiry = Date.now() + CACHE_TTL_MS;
    }
  } catch {
    // Network error — serve stale cache rather than breaking every request.
  }
  return cachedRules;
}

function findMatch(rules: RedirectRule[], pathname: string): RedirectRule | null {
  for (const rule of rules) {
    // Normalise: ensure leading slash, strip trailing slash.
    const src = ('/' + rule.url.replace(/^\//, '')).replace(/\/$/, '') || '/';
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
  // Run on all routes except Next.js internals, static assets, and API routes.
  matcher: '/((?!_next/static|_next/image|api|favicon\\.ico).*)',
};
