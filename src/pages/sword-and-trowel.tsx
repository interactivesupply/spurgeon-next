import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_MAGAZINE_ARTICLES } from "@/lib/queries";
import { Search, Newspaper } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";

export default function SwordAndTrowel() {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState("");

  const [fetchArticles, { data, loading }] = useLazyQuery(GET_MAGAZINE_ARTICLES);
  const articles: any[] = (data as any)?.magazineArticles?.nodes || [];

  useEffect(() => {
    fetchArticles({ variables: { search: submitted || null, first: 30 } });
  }, [submitted, fetchArticles]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-5 h-5 text-accent" />
            <span className="font-sans text-xs text-primary-foreground/40 uppercase tracking-widest">Magazine Archive</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            The Sword & Trowel
          </h1>
          <p className="font-sans text-primary-foreground/50 text-lg max-w-2xl leading-relaxed">
            Spurgeon's monthly magazine, published from 1865 to 1892 — articles, reviews, and ministry news from the Metropolitan Tabernacle.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(search.trim()); }}
          className="mb-10">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Sword & Trowel articles..."
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-full font-sans text-sm text-foreground outline-none focus:border-primary/50" />
          </div>
        </form>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Newspaper className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-serif text-lg text-foreground mb-2">No articles available yet</p>
            <p className="font-sans text-sm text-muted-foreground">
              Sword & Trowel content is being added to the library.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {a.magazineArticleFields?.issue && (
                    <span className="font-sans text-xs text-accent uppercase tracking-wider">
                      {a.magazineArticleFields.issue}
                    </span>
                  )}
                  {a.magazineArticleFields?.category && (
                    <span className="font-sans text-xs text-muted-foreground capitalize">
                      {a.magazineArticleFields.category.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{a.title}</h3>
                {a.magazineArticleFields?.author && (
                  <p className="font-sans text-sm text-muted-foreground italic mb-2">
                    by {a.magazineArticleFields.author}
                  </p>
                )}
                {a.excerpt && (
                  <div
                    className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: a.excerpt }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterSection />
    </div>
  );
}
