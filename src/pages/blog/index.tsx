import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";
import { useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Search, ArrowRight, Calendar, BookOpen } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { GET_BLOG_ENTRIES } from "@/lib/queries";
import { decodeEntities } from "@/lib/utils";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import FooterSection from "@/components/home/FooterSection";

interface BlogProps {
  shared: SharedPageData;
}

export default function BlogIndex({ shared }: BlogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading } = useQuery(GET_BLOG_ENTRIES, {
    variables: { first: 500, search: null },
  });

  const entries = (data as any)?.spurgeonBlogs?.nodes || [];

  const filtered = useMemo(() => {
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter((e: any) =>
      e.title?.toLowerCase().includes(q) ||
      e.excerpt?.toLowerCase().includes(q) ||
      e.spurgeonBlogFields?.author?.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-primary-foreground/40 mb-4">From The Spurgeon Library</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">Blog</h1>
          <p className="font-sans text-base text-primary-foreground/60 max-w-2xl">
            Reflections, articles, and stories from the Spurgeon Library team — exploring the life, ministry, and ongoing
            relevance of Charles Haddon Spurgeon.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 mb-10">
        <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-4 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, authors, topics…"
            className="flex-1 bg-transparent outline-none font-sans text-sm text-foreground placeholder:text-muted-foreground" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="font-sans text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-serif text-lg text-foreground">No posts match that search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((entry: any, idx: number) => {
              const f = entry.spurgeonBlogFields || {};
              const dateLabel = entry.date
                ? format(new Date(entry.date), "MMMM d, yyyy")
                : "";
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.4) }}>
                  <Link
                    href={ROUTES.BlogPost(entry.slug)}
                    className="group block h-full">
                    <article className="h-full bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col">
                      {f.featuredImageUrl && (
                        <div className="aspect-[16/9] overflow-hidden bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={f.featuredImageUrl}
                            alt={entry.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-xs font-sans text-muted-foreground mb-3">
                          {dateLabel && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {dateLabel}
                            </span>
                          )}
                          {f.author && (
                            <span className="truncate">{f.author}</span>
                          )}
                        </div>
                        <h2 className="font-serif text-xl font-semibold text-foreground mb-3 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {decodeEntities(entry.title)}
                        </h2>
                        {entry.excerpt && (
                          <div
                            className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4"
                            dangerouslySetInnerHTML={{ __html: entry.excerpt }} />
                        )}
                        <div className="mt-auto inline-flex items-center gap-1.5 text-sm font-sans font-medium text-primary group-hover:text-accent transition-colors">
                          Read post
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<BlogProps> = async () => {
  const shared = await getSharedPageData();
  return { props: { shared }, revalidate: 1800 };
};
