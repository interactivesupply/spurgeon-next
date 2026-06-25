import React, { useState, useEffect, useCallback } from "react";
import type { GetStaticProps } from "next";
import MagazineHero from "@/components/magazine/MagazineHero";
import YearSelector from "@/components/magazine/YearSelector";
import ArticleGrid from "@/components/magazine/ArticleGrid";
import FooterSection from "@/components/home/FooterSection";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { algolia, ALGOLIA_INDEX } from "@/lib/algolia";
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

interface CategoryTerm {
  slug: string;
  name: string;
}

interface SwordAndTrowelProps {
  shared: SharedPageData;
  categoryTerms: CategoryTerm[];
}

export default function SwordAndTrowel({ shared, categoryTerms }: SwordAndTrowelProps) {
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [hits, setHits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // issue field is stored as plain year strings ("1865", "1866" etc.)
  function buildIssueFilter(year: string | null): string[] | null {
    if (!year) return null;
    return [`issue:${year}`];
  }

  const runSearch = useCallback(
    async (year: string | null) => {
      if (!algolia) return;
      setLoading(true);

      const filters: string[][] = [["post_type:magazine_article"]];
      const issueFilter = buildIssueFilter(year);
      if (issueFilter) filters.push(issueFilter);

      try {
        const { results } = await algolia.search({
          requests: [
            {
              indexName: ALGOLIA_INDEX,
              query: "",
              hitsPerPage: 200,
              facetFilters: filters,
            },
          ],
        });
        const main: any = results[0];
        setHits(((main?.hits || []) as any[]).map(reshapeAlgolia));
      } catch (err) {
        console.error("[Sword and Trowel search failed]", err);
        setHits([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    runSearch(activeYear);
  }, [runSearch, activeYear]);

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
          <YearSelector
            activeYear={activeYear}
            onYearChange={setActiveYear}
          />
        </div>
      </div>
      <ArticleGrid articles={hits} isLoading={loading} />
      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<SwordAndTrowelProps> = async () => {
  const shared = await getSharedPageData();
  return { props: { shared, categoryTerms: [] }, revalidate: 1800 };
};
