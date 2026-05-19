import React, { useState, useEffect, useCallback } from "react";
import type { GetStaticProps } from "next";
import { gql } from "@apollo/client";
import { useRouter } from "next/router";
import MagazineHero from "@/components/magazine/MagazineHero";
import EditionSelector from "@/components/magazine/EditionSelector";
import MagazineCategories from "@/components/magazine/MagazineCategories";
import ArticleGrid from "@/components/magazine/ArticleGrid";
import FooterSection from "@/components/home/FooterSection";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { algolia, ALGOLIA_INDEX } from "@/lib/algolia";
import { apolloClient } from "@/lib/apollo-client";
import PageHead from "@/components/PageHead";

/**
 * Reshape a magazine_article Algolia hit into the flat shape ArticleGrid
 * expects. Field names mirror the original Base44 entity shape so the
 * existing ArticleGrid / EditionSelector / MagazineCategories components
 * don't need to know about WordPress or Algolia internals.
 */
function reshapeAlgolia(hit: any) {
  // Slug = last path segment of the WP permalink.
  const slug = (() => {
    try {
      const path = new URL(hit.permalink).pathname.replace(/\/$/, '');
      const parts = path.split('/').filter(Boolean);
      return parts[parts.length - 1] || '';
    } catch { return ''; }
  })();
  return {
    id: hit.objectID,
    databaseId: hit.post_id,
    slug,
    title: hit.post_title,
    excerpt: hit.post_excerpt || '',
    category: hit.category || '',
    author: hit.author || '',
    issue: hit.issue || '',
    cover_image_url: hit.cover_image_url || '',
    scripture_reference: hit.scripture_reference || '',
    book_title: hit.book_title || '',
    book_author: hit.book_author || '',
  };
}

// Tiny standalone query for the dynamic Categories tabs. Fetched once at
// build time (via getStaticProps) and passed as a prop, so the SSR HTML
// already includes the tab list — no client round-trip needed for labels.
// Editors can add/rename terms in wp-admin; ISR refreshes them.
const GET_MAGAZINE_CATEGORY_TERMS = gql`
  query GetMagazineCategoryTerms {
    magazineCategories(first: 50) {
      nodes { slug name }
    }
  }
`;

interface CategoryTerm {
  slug: string;
  name: string;
}

interface SwordAndTrowelProps {
  shared: SharedPageData;
  categoryTerms: CategoryTerm[];
}

export default function SwordAndTrowel({ shared, categoryTerms }: SwordAndTrowelProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeEdition, setActiveEdition] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  // Per-category counts. Keys are taxonomy slugs ("spurgeon_article" etc.).
  // Values reflect "how many magazine articles would this tab show, given
  // the current edition + query but ignoring the current category" — i.e.
  // disjunctive faceting on the category dimension.
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  // Total hits ignoring category filter — used as the "All" tab count.
  const [totalForAll, setTotalForAll] = useState(0);
  const [loading, setLoading] = useState(false);

  // Hydrate filters from URL on mount (so menu links like
  // /sword-and-trowel?category=book_review work).
  useEffect(() => {
    if (!router.isReady) return;
    const c = (router.query.category as string) || "all";
    setActiveCategory(c);
  }, [router.isReady, router.query.category]);

  // categoryTerms comes from getStaticProps (server-side fetched), so they
  // appear in the initial HTML and are immediately ready for hydration.

  /**
   * Run an Algolia search scoped to magazine_article. Two requests:
   *   1. Main — full filters → returns the visible hits.
   *   2. Disjunctive on `category` — drops the category filter and asks for
   *      the `category` facet → returns counts each category would show.
   * The post_type lock is unconditional on both so this page can never
   * accidentally surface non-magazine content.
   */
  const runSearch = useCallback(
    async (q: string, edition: string | null, category: string) => {
      if (!algolia) return;
      setLoading(true);

      const baseFilters: string[][] = [["post_type:magazine_article"]];
      if (edition) baseFilters.push([`issue:${edition}`]);

      const mainFilters = [...baseFilters];
      if (category && category !== "all") mainFilters.push([`category:${category}`]);

      try {
        const { results } = await algolia.search({
          requests: [
            // Main: visible hits.
            {
              indexName: ALGOLIA_INDEX,
              query: q,
              hitsPerPage: 200,
              facetFilters: mainFilters,
            },
            // Category facet (disjunctive): same filters minus the category
            // selection. nbHits here is the "All" count.
            {
              indexName: ALGOLIA_INDEX,
              query: q,
              hitsPerPage: 0,
              facets: ["category"],
              facetFilters: baseFilters,
            },
          ],
        });
        const main: any = results[0];
        const cat: any = results[1];
        setHits(((main?.hits || []) as any[]).map(reshapeAlgolia));
        setCategoryCounts((cat?.facets?.category || {}) as Record<string, number>);
        setTotalForAll(cat?.nbHits || 0);
      } catch (err) {
        console.error("[Sword and Trowel search failed]", err);
        setHits([]);
        setCategoryCounts({});
        setTotalForAll(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // The original UX rule: a free-text search clears the edition filter (so
  // results aren't accidentally narrow). Preserve that here.
  const resolvedEdition = searchQuery ? null : activeEdition;

  useEffect(() => {
    runSearch(searchQuery, resolvedEdition, activeCategory);
  }, [runSearch, searchQuery, resolvedEdition, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <PageHead
        title="The Sword and the Trowel"
        description="Charles Spurgeon's monthly magazine (1865–1892) — sermons, book reviews, news, and reflections from the Metropolitan Tabernacle and the wider work of the Pastors' College."
        type="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Periodical",
          name: "The Sword and the Trowel",
          founder: { "@type": "Person", name: "C. H. Spurgeon" },
          datePublished: "1865",
          dateModified: "1892",
        }}
      />
      <MagazineHero />
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 mb-6">
        <div className="rounded-3xl overflow-hidden border border-border shadow-md">
          <div className="bg-card px-6 pt-6 pb-4 border-b border-border/50 flex justify-center">
            <div className="relative flex items-center bg-muted border border-border rounded-full overflow-hidden transition-all duration-300 focus-within:border-primary/40 w-full md:w-1/2">
              <svg className="ml-5 w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, authors, topics..."
                className="flex-1 bg-transparent py-3 px-4 text-foreground placeholder:text-muted-foreground outline-none font-sans text-sm" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-4 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm">
                  Clear
                </button>
              )}
            </div>
          </div>
          <EditionSelector
            activeEdition={resolvedEdition}
            onEditionChange={(ed: string | null) => { setActiveEdition(ed); setActiveCategory("all"); }} />
          <MagazineCategories
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            terms={categoryTerms}
            counts={categoryCounts}
            allCount={totalForAll} />
        </div>
      </div>
      <ArticleGrid articles={hits} isLoading={loading} />
      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<SwordAndTrowelProps> = async () => {
  const shared = await getSharedPageData();
  let categoryTerms: CategoryTerm[] = [];
  try {
    const { data } = await apolloClient.query({ query: GET_MAGAZINE_CATEGORY_TERMS });
    categoryTerms = ((data as any)?.magazineCategories?.nodes || [])
      .map((t: any) => ({ slug: t.slug, name: t.name }));
  } catch (err: any) {
    console.error('[GetMagazineCategoryTerms failed]', err?.message);
  }
  return { props: { shared, categoryTerms }, revalidate: 1800 };
};
