import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const SITE_NAME = "The Spurgeon Library";
const SITE_TAGLINE = "A Resource from Midwestern Seminary";
const DEFAULT_OG_IMAGE = "https://spurgeoncenter.wpenginepowered.com/wp-content/uploads/2026/04/3fc58e03b_logo-cs-horz-top2.png";
// The site's canonical public origin. Today it's the WP Engine preview URL
// while we're pre-cutover; this is the one knob to flip when the site
// moves behind spurgeon.org.
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://h0go8mx5tru23ntaefo7520nt.js.wpenginepowered.com";

export interface PageHeadProps {
  /** Page title. The site name suffix is appended automatically unless suppressSiteSuffix is true. */
  title: string;
  /** 140-160 char description for search results + social cards. */
  description?: string | null;
  /** OG image URL — falls back to the site logo. */
  image?: string | null;
  /**
   * Path used to build the canonical URL. Defaults to router.asPath. Pass
   * an explicit value when the canonical should be different from the
   * current URL (e.g. paginated lists pointing at page 1).
   */
  canonicalPath?: string;
  /** OG type — default "website", use "article" for content pages. */
  type?: "website" | "article" | "profile";
  /** Comma-separated robots directive (e.g. "noindex,nofollow"). Omit for default index,follow. */
  robots?: string;
  /** Twitter card type. Default summary_large_image. */
  twitterCard?: "summary" | "summary_large_image";
  /** Optional JSON-LD structured data — passed as a JS object, stringified into the script tag. */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  /** If true, render the title as-is without the " | Site Name" suffix. */
  suppressSiteSuffix?: boolean;
  /** Article-specific Open Graph metadata (used when type === "article"). */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

/**
 * Per-page <head> meta. Renders the title, description, canonical, Open
 * Graph + Twitter tags, robots directive, and optional JSON-LD structured
 * data. Every content template should mount this near the top of its
 * JSX so search engines and social previews see a populated head when
 * crawling the SSR'd HTML.
 *
 * The component intentionally does not handle favicons, theme color, or
 * other global tags — those should live in _document.tsx or _app.tsx
 * since they don't vary per page.
 */
export default function PageHead({
  title,
  description,
  image,
  canonicalPath,
  type = "website",
  robots,
  twitterCard = "summary_large_image",
  structuredData,
  suppressSiteSuffix,
  article,
}: PageHeadProps) {
  const router = useRouter();
  const path = canonicalPath ?? router?.asPath ?? "/";
  // Strip the query string + hash from the canonical — those shouldn't
  // create duplicate-URL variants.
  const cleanPath = path.split(/[?#]/)[0] || "/";
  const canonical = `${SITE_ORIGIN}${cleanPath}`;
  const fullTitle = suppressSiteSuffix ? title : `${title} | ${SITE_NAME}`;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const ldBlocks = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];

  return (
    <Head>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      {robots && <meta name="robots" content={robots} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.author && <meta property="article:author" content={article.author} />}
      {article?.section && <meta property="article:section" content={article.section} />}
      {article?.tags?.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {ldBlocks.map((block, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </Head>
  );
}

/**
 * Helper: turn a chunk of HTML into a search-result-friendly description.
 * Strips tags, collapses whitespace, decodes a small set of common HTML
 * entities, and truncates at ~155 chars at a word boundary.
 */
export function descriptionFromHtml(html: string | null | undefined, maxLen = 155): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}
