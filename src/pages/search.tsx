import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useLazyQuery } from "@apollo/client/react";
import { SPURGEON_SEARCH } from "@/lib/queries";
import { Search as SearchIcon, BookOpen } from "lucide-react";
import SearchResultCard from "@/components/search/SearchResultCard";
import FooterSection from "@/components/home/FooterSection";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const [runSearch, { data, loading }] = useLazyQuery(SPURGEON_SEARCH);

  // Hydrate from URL on mount
  useEffect(() => {
    if (!router.isReady) return;
    const q = (router.query.q as string) || "";
    const type = router.query.type as string;
    setQuery(q);
    setSubmitted(q);
    runSearch({
      variables: {
        search: q || null,
        contentTypes: type === 'sermon' ? ['spurgeon_sermon'] : null,
        first: 50,
      },
    });
  }, [router.isReady, router.query.q, router.query.type, runSearch]);

  const results: any[] = ((data as any)?.spurgeonSearch || []).map((r: any) => ({
    id: r.databaseId,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    type: r.sermonFields ? 'sermon' : (r.magazineArticleFields ? 'article' : 'sermon'),
    scripture_reference: r.sermonFields?.scriptureReference || r.magazineArticleFields?.scriptureReference,
    topic: r.sermonFields?.topic,
    year: r.sermonFields?.year,
    date_preached: r.sermonFields?.datePreached,
    sermon_number: r.sermonFields?.sermonNumber,
    video_url: r.sermonFields?.videoUrl,
    thumbnail_url: r.sermonFields?.thumbnailUrl,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query);
    runSearch({ variables: { search: query || null, first: 50 } });
    router.replace({ pathname: '/search', query: query ? { q: query } : {} }, undefined, { shallow: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
            Search the Library
          </h1>
          <p className="font-sans text-primary-foreground/50 text-base max-w-xl mb-8">
            Search across thousands of sermons, articles, and writings from the Prince of Preachers.
          </p>
          <form onSubmit={handleSubmit} className="relative max-w-2xl">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sermons, scriptures, topics..."
              className="w-full pl-14 pr-32 py-4 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full font-sans text-base text-primary-foreground placeholder:text-primary-foreground/30 outline-none focus:border-accent/50" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary text-primary-foreground rounded-full font-sans text-sm font-medium hover:bg-primary/90 transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            {submitted ? (
              <>
                <p className="font-serif text-lg text-foreground mb-2">No results for "{submitted}"</p>
                <p className="font-sans text-sm text-muted-foreground">
                  Try a different search term, or check that the WordPress backend is connected.
                </p>
              </>
            ) : (
              <p className="font-sans text-muted-foreground">Enter a search above to begin.</p>
            )}
          </div>
        ) : (
          <>
            <p className="font-sans text-sm text-muted-foreground mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''}
              {submitted && ` for "${submitted}"`}
            </p>
            <div>
              {results.map((r) => (
                <SearchResultCard key={r.id} sermon={r} />
              ))}
            </div>
          </>
        )}
      </div>

      <FooterSection />
    </div>
  );
}
