import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { algolia, ALGOLIA_INDEX, reshapeHit, type ReshapedHit } from "@/lib/algolia";
import { Search as SearchIcon, BookOpen, X } from "lucide-react";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResultCard from "@/components/search/SearchResultCard";
import FooterSection from "@/components/home/FooterSection";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";

const TYPE_TO_POST_TYPES: Record<string, string[]> = {
  sermon: ["spurgeon_sermon"],
  article: ["magazine_article"],
  blog: ["magazine_article"],
  lecture: ["magazine_article"],
  book: ["book_chapter"],
  conference_media: ["magazine_article"],
};

const SPURGEON_POST_TYPES = ["spurgeon_sermon", "book_chapter"];
const CENTER_POST_TYPES = ["magazine_article"];

const META_TO_POST_TYPES: Record<string, string[] | null> = {
  all: null,
  spurgeon: SPURGEON_POST_TYPES,
  center: CENTER_POST_TYPES,
};

interface FilterState {
  types: string[];
  collections: string[];
  scriptures: string[];
  topics: string[];
  years: string[];
}

const EMPTY_FILTERS: FilterState = {
  types: [],
  collections: [],
  scriptures: [],
  topics: [],
  years: [],
};

interface SearchPageProps {
  shared: SharedPageData;
}

export default function SearchPage({ shared }: SearchPageProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [meta, setMeta] = useState<"all" | "spurgeon" | "center">("all");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [hits, setHits] = useState<ReshapedHit[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(
    async (q: string, m: "all" | "spurgeon" | "center", f: FilterState) => {
      if (!algolia) {
        console.warn('Algolia client not initialized — check NEXT_PUBLIC_ALGOLIA_* env vars');
        return;
      }
      setLoading(true);

      // Build facetFilters: each top-level array is AND, inner arrays are OR.
      const facetFilters: string[][] = [];

      // Meta tab → post_type OR group
      const metaPostTypes = META_TO_POST_TYPES[m];
      const filterPostTypes = f.types.flatMap((t) => TYPE_TO_POST_TYPES[t] || []);
      // Intersect type filter with meta if both set; otherwise use whichever is set.
      const effectivePostTypes = filterPostTypes.length
        ? (metaPostTypes
            ? filterPostTypes.filter((pt) => metaPostTypes.includes(pt))
            : filterPostTypes)
        : metaPostTypes;
      if (effectivePostTypes && effectivePostTypes.length) {
        facetFilters.push(effectivePostTypes.map((pt) => `post_type:${pt}`));
      }

      if (f.collections.length) {
        facetFilters.push(f.collections.map((c) => `collection:${c}`));
      }
      if (f.years.length) {
        facetFilters.push(f.years.map((y) => `year:${y}`));
      }
      if (f.topics.length) {
        // Topics are searchable + filterOnly; use facet filter for exact match.
        facetFilters.push(f.topics.map((t) => `topic:${t}`));
      }

      // Scripture (Bible book): index doesn't have a structured "book" field —
      // use a scoped query string addition so Algolia ranks scripture matches.
      let q2 = q;
      if (f.scriptures.length) {
        q2 = [q, ...f.scriptures].filter(Boolean).join(' ');
      }

      try {
        const { results } = await algolia.search({
          requests: [
            {
              indexName: ALGOLIA_INDEX,
              query: q2,
              hitsPerPage: 50,
              ...(facetFilters.length ? { facetFilters } : {}),
            },
          ],
        });
        const result: any = results[0];
        const reshaped = (result?.hits || []).map(reshapeHit);
        setHits(reshaped);
      } catch (err) {
        console.error('[Algolia search failed]', err);
        setHits([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Hydrate state from URL on mount and whenever query params change. The
  // mega menu drops users onto URLs like /search?type=sermon&collection=metropolitan_tabernacle_pulpit;
  // each segment maps to a SearchFilters multi-select.
  useEffect(() => {
    if (!router.isReady) return;
    const q = (router.query.q as string) || "";
    const t = (router.query.type as string) || "";
    const c = (router.query.collection as string) || "";
    const topic = (router.query.topic as string) || "";
    const year = (router.query.year as string) || "";

    setSearchInput(q);
    setQuery(q);

    let initialMeta: "all" | "spurgeon" | "center" = "all";
    if (t === "sermon" || t === "book") initialMeta = "spurgeon";
    else if (t === "article" || t === "blog" || t === "lecture" || t === "conference_media") initialMeta = "center";
    setMeta(initialMeta);

    const initialFilters: FilterState = {
      types: t ? [t] : [],
      collections: c ? [c] : [],
      scriptures: [],
      topics: topic ? [topic] : [],
      years: year ? [year] : [],
    };
    setFilters(initialFilters);
    runSearch(q, initialMeta, initialFilters);
  }, [
    router.isReady,
    router.query.q,
    router.query.type,
    router.query.collection,
    router.query.topic,
    router.query.year,
    runSearch,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
    runSearch(searchInput, meta, filters);
    router.replace(
      { pathname: '/search', query: searchInput ? { q: searchInput } : {} },
      undefined,
      { shallow: true },
    );
  };

  const switchMeta = (newMeta: "all" | "spurgeon" | "center") => {
    setMeta(newMeta);
    const reset = { ...filters, types: [] };
    setFilters(reset);
    runSearch(query, newMeta, reset);
  };

  const updateFilters = (next: FilterState) => {
    setFilters(next);
    runSearch(query, meta, next);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href={ROUTES.Home}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans text-sm mb-6">
            <BookOpen className="w-4 h-4" />
            Spurgeon.org
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Search the Library
          </h1>

          <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
            {[
              { value: "all", label: "All" },
              { value: "spurgeon", label: "Spurgeon's Works" },
              { value: "center", label: "The Center's Resources" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => switchMeta(tab.value as any)}
                className={`px-4 py-1.5 rounded-md font-sans text-sm font-medium transition-all ${
                  meta === tab.value
                    ? "bg-card shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, scripture, topic, or keyword..."
              className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-24 font-sans text-base text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setQuery("");
                  runSearch("", meta, filters);
                  router.replace({ pathname: '/search' }, undefined, { shallow: true });
                }}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-sans text-sm font-medium hover:bg-primary/90 transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <SearchFilters
          filters={filters}
          onFilterChange={updateFilters}
          resultCount={loading ? null : hits.length}
          meta={meta} />

        {loading ? (
          <div className="space-y-4 mt-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : hits.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-foreground mb-2">
              {query || filters.types.length > 0 ? "No results found" : "Begin your search"}
            </h3>
            <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto">
              {query || filters.types.length > 0
                ? "Try adjusting your search terms or filters."
                : "Search through Spurgeon's sermons, articles, books, and lectures by title, scripture reference, topic, or keyword."}
            </p>
          </div>
        ) : (
          <div className="mt-2">
            {hits.map((hit) => (
              <SearchResultCard key={hit.id} sermon={hit as any} />
            ))}
          </div>
        )}

        <p className="font-sans text-xs text-muted-foreground/60 text-right mt-6">
          Powered by Algolia
        </p>
      </div>

      <FooterSection settings={shared?.footer} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<SearchPageProps> = async () => {
  const shared = await getSharedPageData();
  return { props: { shared }, revalidate: 3600 };
};
