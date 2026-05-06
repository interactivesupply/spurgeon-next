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

// ── Tab → CPT mapping. Single source of truth for what shows in each tab.
// "Spurgeon's Works" = his own writings; "Center's Resources" = modern
// editorial / Library content. Tour stops and library staff are excluded
// from search entirely.
const SPURGEON_POST_TYPES = [
  "spurgeon_sermon",
  "spurgeon_book",
  "all_of_grace",
  "lectures_students",
  "around_wicket_gate",
  "all_round_ministry",
  "autobiography",
  "morning_and_evening",
  "faiths_check_book",
  "treasury_entry",
  // Sword and Trowel was Spurgeon's own magazine (1865-1892) — counts as
  // his works, not modern Center editorial.
  "magazine_article",
  "puritan_catechism",
  "commenting_books",
  "till_he_come",
  "proverbs_sermons",
  "talks_to_farmers",
  "gleanings_sheaves",
];
const CENTER_POST_TYPES = [
  "spurgeon_blog",
  "spurgeon_article",
  "conference_media",
];
const TAB_TO_POST_TYPES: Record<"all" | "spurgeon" | "center", string[] | null> = {
  all: [...SPURGEON_POST_TYPES, ...CENTER_POST_TYPES],
  spurgeon: SPURGEON_POST_TYPES,
  center: CENTER_POST_TYPES,
};

// Display labels for post types. Used both in the type-facet dropdown and
// for old `?type=...` query-param compatibility.
const POST_TYPE_LABELS: Record<string, string> = {
  spurgeon_sermon: "Sermons",
  spurgeon_book: "Books",
  all_of_grace: "All of Grace",
  lectures_students: "Lectures to My Students",
  around_wicket_gate: "Around the Wicket Gate",
  all_round_ministry: "An All-Round Ministry",
  autobiography: "Autobiography",
  morning_and_evening: "Morning and Evening",
  faiths_check_book: "Faith's Check Book",
  treasury_entry: "Treasury of David",
  spurgeon_blog: "Blog",
  spurgeon_article: "Article",
  magazine_article: "Sword and Trowel",
  conference_media: "Conference Media",
  puritan_catechism: "A Puritan Catechism",
  commenting_books: "Commenting and Commentaries",
  till_he_come: "Till He Come",
  proverbs_sermons: "Sermons on Proverbs",
  talks_to_farmers: "Talks to Farmers",
  gleanings_sheaves: "Gleanings among the Sheaves",
};

// Backward-compat: legacy URL params like ?type=sermon used a different
// taxonomy. Map them into the actual post_type values.
const LEGACY_TYPE_PARAM: Record<string, string> = {
  sermon: "spurgeon_sermon",
  article: "magazine_article",
  blog: "spurgeon_blog",
  lecture: "conference_media", // lectures used to be magazine_article; now conference media
  book: "spurgeon_book",
  conference_media: "conference_media",
};

interface FilterState {
  postTypes: string[];
  collections: string[];
  topics: string[];
  years: string[];
}

interface FacetValue {
  value: string;
  count: number;
  label?: string;
}

interface FacetData {
  post_type: FacetValue[];
  collection: FacetValue[];
  topic: FacetValue[];
  year: FacetValue[];
}

const EMPTY_FILTERS: FilterState = {
  postTypes: [],
  collections: [],
  topics: [],
  years: [],
};

const EMPTY_FACETS: FacetData = {
  post_type: [],
  collection: [],
  topic: [],
  year: [],
};

interface SearchPageProps {
  shared: SharedPageData;
}

/**
 * Build facetFilters from a FilterState, optionally excluding one facet
 * (the one whose dropdown values we want to compute). This is how
 * disjunctive faceting works: the post_type facet's count list reflects
 * "what types are available given my OTHER filters", which means we exclude
 * the post_type filter itself when querying for those counts.
 */
function buildFacetFilters(
  f: FilterState,
  scopedTypes: string[] | null,
  exclude?: keyof FacetData
): string[][] {
  const filters: string[][] = [];

  // post_type: the active tab AND the user's selection.
  if (exclude !== "post_type") {
    const userSelected = f.postTypes;
    let effective: string[] = scopedTypes || [];
    if (userSelected.length) {
      // Intersect tab-scope with user selection. If scopedTypes is null
      // (the "all" tab), fall through to the user-selected list directly.
      effective = scopedTypes
        ? userSelected.filter((t) => scopedTypes.includes(t))
        : userSelected;
    }
    if (effective.length) {
      filters.push(effective.map((t) => `post_type:${t}`));
    }
  } else if (scopedTypes) {
    // Even when computing the post_type facet, restrict to the tab scope.
    filters.push(scopedTypes.map((t) => `post_type:${t}`));
  }

  if (exclude !== "collection" && f.collections.length) {
    filters.push(f.collections.map((c) => `collection:${c}`));
  }
  if (exclude !== "topic" && f.topics.length) {
    filters.push(f.topics.map((t) => `topic:${t}`));
  }
  if (exclude !== "year" && f.years.length) {
    filters.push(f.years.map((y) => `year:${y}`));
  }

  return filters;
}

const HITS_PER_PAGE = 50;

export default function SearchPage({ shared }: SearchPageProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [meta, setMeta] = useState<"all" | "spurgeon" | "center">("all");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [hits, setHits] = useState<ReshapedHit[]>([]);
  const [facets, setFacets] = useState<FacetData>(EMPTY_FACETS);
  const [loading, setLoading] = useState(false);
  // Pagination — Algolia uses 0-indexed pages.
  const [page, setPage] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const runSearch = useCallback(
    async (q: string, m: "all" | "spurgeon" | "center", f: FilterState) => {
      if (!algolia) {
        console.warn("Algolia client not initialized");
        return;
      }
      setLoading(true);
      setPage(0);

      const scopedTypes = TAB_TO_POST_TYPES[m];

      // Disjunctive faceting: one main query (with all filters) for the hits,
      // plus N "facet queries" (one per facet, with that facet's filter
      // excluded) so each dropdown's value list reflects what's available
      // given the other filters. All sent in one Algolia request.
      const facetFields: (keyof FacetData)[] = [
        "post_type",
        "collection",
        "topic",
        "year",
      ];

      const requests = [
        // Main: hits + counts for facets that are NOT currently filtering
        {
          indexName: ALGOLIA_INDEX,
          query: q,
          hitsPerPage: HITS_PER_PAGE,
          page: 0,
          facets: facetFields as string[],
          facetFilters: buildFacetFilters(f, scopedTypes),
        },
        // One per facet — excluded from its own filter so its count list
        // shows all values that would match if you toggled that facet alone.
        ...facetFields.map((field) => ({
          indexName: ALGOLIA_INDEX,
          query: q,
          hitsPerPage: 0,
          facets: [field as string],
          facetFilters: buildFacetFilters(f, scopedTypes, field),
        })),
      ];

      try {
        const { results } = await algolia.search({ requests });
        const main: any = results[0];
        // De-dupe by post_id: oversized records (Treasury, S&T) stay chunked
        // server-side and Algolia returns multiple chunks of the same post.
        // Show each post once in the results list.
        const seen = new Set<number>();
        const reshaped = (main?.hits || [])
          .map(reshapeHit)
          .filter((h: ReshapedHit) => {
            if (seen.has(h.databaseId)) return false;
            seen.add(h.databaseId);
            return true;
          });
        setHits(reshaped);
        setTotalHits(main?.nbHits || 0);

        // Build the disjunctive facet data from the per-facet results.
        const next: FacetData = { post_type: [], collection: [], topic: [], year: [] };
        facetFields.forEach((field, i) => {
          const r: any = results[i + 1];
          const counts = (r?.facets?.[field] || {}) as Record<string, number>;
          next[field] = Object.entries(counts)
            .map(([value, count]) => ({
              value,
              count,
              label: field === "post_type" ? POST_TYPE_LABELS[value] || value : undefined,
            }))
            .sort((a, b) => b.count - a.count);
        });
        setFacets(next);
      } catch (err) {
        console.error("[Algolia search failed]", err);
        setHits([]);
        setTotalHits(0);
        setFacets(EMPTY_FACETS);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch and append the next page of hits. Reuses the current query/meta/
   * filters; skips the facet round-trips since they're invariant under
   * pagination.
   */
  const loadMore = useCallback(async () => {
    if (!algolia || loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    const scopedTypes = TAB_TO_POST_TYPES[meta];
    try {
      const { results } = await algolia.search({
        requests: [
          {
            indexName: ALGOLIA_INDEX,
            query,
            hitsPerPage: HITS_PER_PAGE,
            page: nextPage,
            facetFilters: buildFacetFilters(filters, scopedTypes),
          },
        ],
      });
      const main: any = results[0];
      // De-dupe by post_id (chunks of oversized posts) and against already-shown hits.
      const seen = new Set<number>(hits.map((h) => h.databaseId));
      const newHits = (main?.hits || [])
        .map(reshapeHit)
        .filter((h: ReshapedHit) => {
          if (seen.has(h.databaseId)) return false;
          seen.add(h.databaseId);
          return true;
        });
      setHits((prev) => [...prev, ...newHits]);
      setPage(nextPage);
      // Refresh totalHits in case the index changed under us; usually a no-op.
      if (main?.nbHits != null) setTotalHits(main.nbHits);
    } catch (err) {
      console.error("[Algolia loadMore failed]", err);
    } finally {
      setLoadingMore(false);
    }
  }, [algolia, loadingMore, page, meta, query, filters, hits]);

  // Hydrate state from URL on mount and whenever query params change. The
  // mega menu drops users onto URLs like /search?type=sermon&collection=...
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

    // Map legacy ?type= values to actual post_type strings.
    const mappedType = LEGACY_TYPE_PARAM[t] || (t || "");

    let initialMeta: "all" | "spurgeon" | "center" = "all";
    if (SPURGEON_POST_TYPES.includes(mappedType)) initialMeta = "spurgeon";
    else if (CENTER_POST_TYPES.includes(mappedType)) initialMeta = "center";
    setMeta(initialMeta);

    const initialFilters: FilterState = {
      postTypes: mappedType ? [mappedType] : [],
      collections: c ? [c] : [],
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
      { pathname: "/search", query: searchInput ? { q: searchInput } : {} },
      undefined,
      { shallow: true }
    );
  };

  const switchMeta = (newMeta: "all" | "spurgeon" | "center") => {
    setMeta(newMeta);
    // Clear post-type selection when switching tabs, since the available
    // types differ. Other filters carry over (collection/topic/year are
    // tab-agnostic).
    const reset = { ...filters, postTypes: [] };
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
                  router.replace({ pathname: "/search" }, undefined, { shallow: true });
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
          resultCount={loading ? null : totalHits}
          loadedCount={hits.length}
          facets={facets} />

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
              {query || filters.postTypes.length > 0 ? "No results found" : "Begin your search"}
            </h3>
            <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto">
              {query || filters.postTypes.length > 0
                ? "Try adjusting your search terms or filters."
                : "Search through Spurgeon's sermons, articles, books, and lectures by title, scripture reference, topic, or keyword."}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-2">
              {hits.map((hit) => (
                <SearchResultCard key={hit.id} sermon={hit as any} />
              ))}
            </div>
            {hits.length < totalHits && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm font-medium transition-colors">
                  {loadingMore ? "Loading…" : `Load more results (${totalHits - hits.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        <p className="font-sans text-xs text-muted-foreground/60 text-right mt-6">
          Powered by Algolia
        </p>
      </div>

      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<SearchPageProps> = async () => {
  const shared = await getSharedPageData();
  return { props: { shared }, revalidate: 3600 };
};
