import React, { useState, useMemo, useEffect } from "react";
import type { GetStaticProps } from "next";
import { useQuery } from "@apollo/client/react";
import { GET_MAGAZINE_ARTICLES } from "@/lib/queries";
import { useRouter } from "next/router";
import MagazineHero from "@/components/magazine/MagazineHero";
import EditionSelector from "@/components/magazine/EditionSelector";
import MagazineCategories from "@/components/magazine/MagazineCategories";
import ArticleGrid from "@/components/magazine/ArticleGrid";
import FooterSection from "@/components/home/FooterSection";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";

// Flatten ACF select fields (which arrive as arrays from WPGraphQL-for-ACF)
function flat(value: any) {
  return Array.isArray(value) ? value[0] : value;
}

// Reshape a magazineArticles GraphQL node into the flat shape ArticleGrid
// expects. Mirrors the original Base44 entity shape, so the existing
// ArticleGrid / EditionSelector / MagazineCategories components don't need
// to know about the WordPress field structure.
function reshape(node: any) {
  const f = node.magazineArticleFields || {};
  return {
    id: node.id,
    databaseId: node.databaseId,
    slug: node.slug,
    title: node.title,
    excerpt: node.excerpt,
    category: flat(f.category),
    author: f.author,
    issue: f.issue,
    cover_image_url: f.coverImageUrl,
    scripture_reference: f.scriptureReference,
    book_title: f.bookTitle,
    book_author: f.bookAuthor,
  };
}

interface SwordAndTrowelProps {
  shared: SharedPageData;
}

export default function SwordAndTrowel({ shared }: SwordAndTrowelProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeEdition, setActiveEdition] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Hydrate filters from URL on mount (so menu links like
  // /sword-and-trowel?category=book_review work).
  useEffect(() => {
    if (!router.isReady) return;
    const c = (router.query.category as string) || "all";
    setActiveCategory(c);
  }, [router.isReady, router.query.category]);

  // Fetch all articles up front and filter client-side. Volume is small;
  // EditionSelector iterates 1865→present and works best with the full list.
  const { data, loading } = useQuery(GET_MAGAZINE_ARTICLES, {
    variables: { first: 500, search: null },
  });
  const articles = useMemo(
    () => ((data as any)?.magazineArticles?.nodes || []).map(reshape),
    [data]
  );

  const resolvedEdition = searchQuery ? null : activeEdition;

  const filtered = useMemo(() => {
    let result = articles;
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter((a: any) =>
        a.title?.toLowerCase().includes(lowerQ) ||
        a.author?.toLowerCase().includes(lowerQ) ||
        a.excerpt?.toLowerCase().includes(lowerQ) ||
        a.issue?.toLowerCase().includes(lowerQ)
      );
    } else {
      if (resolvedEdition) result = result.filter((a: any) => a.issue === resolvedEdition);
      if (activeCategory !== "all") result = result.filter((a: any) => a.category === activeCategory);
    }
    return result;
  }, [articles, resolvedEdition, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
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
          <MagazineCategories activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>
      </div>
      <ArticleGrid articles={filtered} isLoading={loading} />
      <FooterSection settings={shared?.footer} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<SwordAndTrowelProps> = async () => {
  const shared = await getSharedPageData();
  return { props: { shared }, revalidate: 1800 };
};
