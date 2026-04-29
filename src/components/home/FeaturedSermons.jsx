import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

/**
 * Receives `sermons` as a prop from getStaticProps. When the WordPress backend
 * is unreachable or empty, sermons will be [] and an empty state renders.
 */
export default function FeaturedSermons({ sermons = [] }) {
  return (
    <section className="py-24 md:py-36 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
              From the Pulpit
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              Featured Sermons
            </h2>
          </div>
          <Link
            href={ROUTES.Search}
            className="mt-6 md:mt-0 flex items-center gap-2 text-primary font-sans text-sm font-medium hover:text-accent transition-colors group">
            Browse all sermons
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {sermons.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans">
              Sermons will appear here as they are added to the library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermons.map((sermon, index) => {
              const fields = sermon.sermonFields || {};
              const collectionName = sermon.sermonCollections?.nodes?.[0]?.name;
              return (
                <motion.div
                  key={sermon.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <Link href={ROUTES.SermonDetail(sermon.slug)} className="group block">
                    <div className="bg-card border border-border rounded-xl p-6 h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-sans font-medium text-accent uppercase tracking-wider">
                          {collectionName || "Sermon"}
                        </span>
                        {fields.year && (
                          <>
                            <span className="text-border">·</span>
                            <span className="text-xs font-sans text-muted-foreground">
                              {fields.year}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {sermon.title}
                      </h3>
                      {fields.scriptureReference && (
                        <p className="text-sm font-sans text-primary/70 mb-3">
                          {fields.scriptureReference}
                        </p>
                      )}
                      {sermon.excerpt && (
                        <div
                          className="text-sm font-sans text-muted-foreground leading-relaxed line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: sermon.excerpt }} />
                      )}
                      {fields.notableQuote && (
                        <blockquote className="mt-4 pl-4 border-l-2 border-accent/30 text-sm font-serif italic text-muted-foreground line-clamp-2">
                          "{fields.notableQuote}"
                        </blockquote>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
