import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { decodeEntities } from "@/lib/utils";

/**
 * Resolve the right URL for a featured-content node based on its WPGraphQL
 * type name. The Featured Content ACF field accepts multiple post types
 * (sermons, articles, blog, magazine, conference media) so the card link
 * has to dispatch by __typename.
 */
function urlForNode(node) {
  switch (node.__typename) {
    case 'Sermon':              return ROUTES.SermonDetail(node.slug);
    case 'SpurgeonArticle':     return ROUTES.Article(node.slug);
    case 'SpurgeonBlog':        return ROUTES.BlogPost(node.slug);
    case 'MagazineArticle':     return ROUTES.MagazineArticle(node.slug);
    case 'ConferenceMediaItem': return ROUTES.ConferenceMediaItem(node.slug);
    default:                    return `/${node.slug || ''}`;
  }
}

/**
 * Eyebrow label per type. Always reflects the post type, never the sermon
 * collection — collection (e.g. "Metropolitan Tabernacle Pulpit") is shown
 * elsewhere on the sermon detail page.
 */
function labelForNode(node /*, collectionName */) {
  switch (node.__typename) {
    case 'Sermon':              return 'Sermon';
    case 'SpurgeonArticle':     return 'Article';
    case 'SpurgeonBlog':        return 'Blog';
    case 'MagazineArticle':     return 'Sword & Trowel';
    case 'ConferenceMediaItem': return 'Conference';
    default:                    return 'Featured';
  }
}

/**
 * Pull the most-relevant per-type metadata (year + scripture reference) so
 * the card body is consistent regardless of which post type was picked.
 */
function metaForNode(node) {
  switch (node.__typename) {
    case 'Sermon': {
      const f = node.sermonFields || {};
      return { year: f.year, scriptureReference: f.scriptureReference, notableQuote: f.notableQuote };
    }
    case 'SpurgeonArticle': {
      const f = node.spurgeonArticleFields || {};
      const y = (f.originalPublishDate || '').slice(0, 4);
      return { year: y || null, scriptureReference: f.scriptureReference, notableQuote: null };
    }
    case 'SpurgeonBlog': {
      const f = node.spurgeonBlogFields || {};
      const y = (f.originalPublishDate || '').slice(0, 4);
      return { year: y || null, scriptureReference: f.scriptureReference, notableQuote: null };
    }
    case 'MagazineArticle': {
      const f = node.magazineArticleFields || {};
      return { year: f.issue || null, scriptureReference: f.scriptureReference, notableQuote: null };
    }
    case 'ConferenceMediaItem': {
      const f = node.conferenceMediaFields || {};
      return { year: f.year, scriptureReference: f.scriptureReference, notableQuote: f.speaker ? `— ${f.speaker}` : null };
    }
    default: return { year: null, scriptureReference: null, notableQuote: null };
  }
}

/**
 * Receives `sermons` as a prop from getStaticProps. When the WordPress backend
 * is unreachable or empty, sermons will be [] and an empty state renders.
 * Despite the name, sermons may be a mixed list of sermons/articles/blog/
 * magazine/conference items — see the Featured Content ACF field on the
 * home page in wp-admin.
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
            {sermons.map((node, index) => {
              const collectionName = node.sermonCollections?.nodes?.[0]?.name;
              const meta = metaForNode(node);
              const label = labelForNode(node, collectionName);
              const href = urlForNode(node);
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <Link href={href} className="group block">
                    <div className="bg-card border border-border rounded-xl p-6 h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-sans font-medium text-accent uppercase tracking-wider">
                          {label}
                        </span>
                        {meta.year && (
                          <>
                            <span className="text-border">·</span>
                            <span className="text-xs font-sans text-muted-foreground">
                              {meta.year}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {decodeEntities(node.title)}
                      </h3>
                      {meta.scriptureReference && (
                        <p className="text-sm font-sans text-primary/70 mb-3">
                          {meta.scriptureReference}
                        </p>
                      )}
                      {node.excerpt && (
                        <div
                          className="text-sm font-sans text-muted-foreground leading-relaxed line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: node.excerpt }} />
                      )}
                      {meta.notableQuote && (
                        <blockquote className="mt-4 pl-4 border-l-2 border-accent/30 text-sm font-serif italic text-muted-foreground line-clamp-2">
                          "{decodeEntities(meta.notableQuote)}"
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
